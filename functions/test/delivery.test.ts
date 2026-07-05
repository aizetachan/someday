/**
 * Tests del pipeline de entrega — la pieza más crítica del producto.
 *
 * Corren contra el emulador real de Firestore (transacciones y queries de
 * verdad). Solo se simulan los efectos externos: Resend (sendEmail) y la
 * cola de Cloud Tasks (enqueue).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './setup';
import { clearFirestore } from './setup';
import {
  Timestamp,
  getFirestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getLetter, getUser, hoursFromNow, seedLetter, seedUser } from './helpers';

const { sendEmailMock, enqueueMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  enqueueMock: vi.fn(),
}));

vi.mock('../src/mail', () => ({ sendEmail: sendEmailMock }));
vi.mock('firebase-admin/functions', () => ({
  getFunctions: () => ({ taskQueue: () => ({ enqueue: enqueueMock }) }),
}));

import { deliverLetters, deliverOne } from '../src/deliverLetters';
import { deliverLetterAt } from '../src/tasksDelivery';

async function snapshotOf(id: string): Promise<QueryDocumentSnapshot> {
  const snap = await getFirestore().collection('letters').doc(id).get();
  return snap as QueryDocumentSnapshot;
}

/** Ejecuta el handler del cron como lo haría Cloud Scheduler. */
async function runCron(): Promise<void> {
  await deliverLetters.run({
    scheduleTime: new Date().toISOString(),
    jobName: 'test',
  });
}

/** Ejecuta el handler de Cloud Tasks como lo haría la cola. */
async function runTask(letterId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await deliverLetterAt.run({ data: { letterId } } as any);
}

beforeEach(async () => {
  await clearFirestore();
  vi.clearAllMocks();
  sendEmailMock.mockResolvedValue(undefined);
  enqueueMock.mockResolvedValue(undefined);
});

describe('deliverOne — entrega de una carta', () => {
  it('entrega una carta vencida a uno mismo y actualiza estado y stats', async () => {
    await seedUser('autor');
    await seedLetter('carta1');

    await deliverOne(await snapshotOf('carta1'));

    const letter = await getLetter('carta1');
    expect(letter.status).toBe('delivered');
    expect(letter.deliveredAt).toBeInstanceOf(Timestamp);
    expect(letter.deliveringSince).toBeUndefined();

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    const email = sendEmailMock.mock.calls[0][0];
    expect(email.to).toBe('autor@example.com');
    expect(email.subject).toContain('Tu yo del pasado');
    expect(email.replyTo).toBeUndefined(); // self: sin override de reply-to

    const user = await getUser('autor');
    expect(user?.stats).toMatchObject({ lettersDelivered: 1, lettersPending: 0 });
  });

  it('carta a otra persona: email al destinatario con reply-to al autor', async () => {
    await seedUser('autor');
    await seedLetter('carta1', {
      recipientType: 'other',
      recipientName: 'Chatiti',
      recipientEmail: 'chatiti@example.com',
    });

    await deliverOne(await snapshotOf('carta1'));

    expect((await getLetter('carta1')).status).toBe('delivered');
    const email = sendEmailMock.mock.calls[0][0];
    expect(email.to).toBe('chatiti@example.com');
    expect(email.subject).toContain('Chatiti');
    expect(email.replyTo).toBe('autor@example.com');
  });

  it('dos entregas solapadas de la misma carta → un solo email (lock optimista)', async () => {
    await seedUser('autor');
    await seedLetter('carta1');

    const [s1, s2] = [await snapshotOf('carta1'), await snapshotOf('carta1')];
    await Promise.all([deliverOne(s1), deliverOne(s2)]);

    expect((await getLetter('carta1')).status).toBe('delivered');
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it('no toca una carta que ya no está sellada', async () => {
    await seedLetter('carta1', { status: 'delivered' });

    await deliverOne(await snapshotOf('carta1'));

    expect((await getLetter('carta1')).status).toBe('delivered');
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it('fallo transitorio: vuelve a sealed y quema un intento', async () => {
    await seedLetter('carta1');
    sendEmailMock.mockRejectedValueOnce(new Error('Resend: rate_limit 429'));

    await deliverOne(await snapshotOf('carta1'));

    const letter = await getLetter('carta1');
    expect(letter.status).toBe('sealed'); // el próximo tick reintenta
    expect(letter.deliveryAttempts).toBe(1);
    expect(letter.lastDeliveryError).toContain('rate_limit');
    expect(letter.deliveringSince).toBeUndefined();
  });

  it('error de configuración: reintenta sin quemar intentos', async () => {
    await seedLetter('carta1', { deliveryAttempts: 2 });
    sendEmailMock.mockRejectedValueOnce(
      new Error('Resend: validation_error You can only send testing emails...'),
    );

    await deliverOne(await snapshotOf('carta1'));

    const letter = await getLetter('carta1');
    expect(letter.status).toBe('sealed');
    expect(letter.deliveryAttempts).toBe(2); // sin cambio: no es culpa de la carta
  });

  it('al agotar los intentos pasa a failed y avisa al autor', async () => {
    await seedUser('autor');
    await seedLetter('carta1', {
      deliveryAttempts: 4,
      recipientType: 'other',
      recipientEmail: 'chatiti@example.com',
    });
    sendEmailMock.mockRejectedValueOnce(new Error('SMTP boom'));

    await deliverOne(await snapshotOf('carta1'));

    const letter = await getLetter('carta1');
    expect(letter.status).toBe('failed');
    expect(letter.deliveryAttempts).toBe(5);

    // Segundo email: el aviso de fallo al autor
    expect(sendEmailMock).toHaveBeenCalledTimes(2);
    const aviso = sendEmailMock.mock.calls[1][0];
    expect(aviso.to).toBe('autor@example.com');
    expect(aviso.subject).toContain('No pudimos entregar');
  });
});

describe('deliverLetters — cron (red de seguridad)', () => {
  it('entrega solo lo vencido; borradores y futuras quedan intactos', async () => {
    await seedUser('autor');
    await seedLetter('vencida');
    await seedLetter('futura', { deliveryDate: hoursFromNow(2) });
    await seedLetter('borrador', { status: 'draft' });
    await seedLetter('entregada', { status: 'delivered' });

    await runCron();

    expect((await getLetter('vencida')).status).toBe('delivered');
    expect((await getLetter('futura')).status).toBe('sealed');
    expect((await getLetter('borrador')).status).toBe('draft');
    expect((await getLetter('entregada')).status).toBe('delivered');
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it('programa la entrega exacta de las cartas dentro del horizonte de 25h', async () => {
    await seedLetter('pronto', { deliveryDate: hoursFromNow(2) });
    await seedLetter('lejana', { deliveryDate: hoursFromNow(30) });
    await seedLetter('yaProgramada', {
      deliveryDate: hoursFromNow(3),
      taskScheduled: true,
    });

    await runCron();

    expect(enqueueMock).toHaveBeenCalledTimes(1);
    expect(enqueueMock.mock.calls[0][0]).toEqual({ letterId: 'pronto' });
    expect((await getLetter('pronto')).taskScheduled).toBe(true);
    expect((await getLetter('lejana')).taskScheduled).toBeUndefined();
  });

  it('si programar la tarea falla, el cron sigue y la carta queda para el siguiente tick', async () => {
    await seedLetter('pronto', { deliveryDate: hoursFromNow(2) });
    enqueueMock.mockRejectedValue(new Error('IAM actAs denied'));

    await expect(runCron()).resolves.toBeUndefined();

    const letter = await getLetter('pronto');
    expect(letter.status).toBe('sealed');
    expect(letter.taskScheduled).toBeUndefined(); // se reintentará programar
  });

  it('recupera cartas atascadas en delivering más de 1h y las entrega', async () => {
    await seedUser('autor');
    await seedLetter('atascada', {
      status: 'delivering',
      deliveringSince: hoursFromNow(-2),
    });
    await seedLetter('enCurso', {
      status: 'delivering',
      deliveringSince: hoursFromNow(-0.2),
    });

    await runCron();

    // La atascada vuelve a sealed y, al estar vencida, se entrega en el mismo tick
    expect((await getLetter('atascada')).status).toBe('delivered');
    // Una entrega reciente en curso no se toca (podría estar enviándose ahora)
    expect((await getLetter('enCurso')).status).toBe('delivering');
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });
});

describe('deliverLetterAt — entrega a la hora exacta (Cloud Tasks)', () => {
  it('entrega la carta cuando la tarea dispara', async () => {
    await seedUser('autor');
    await seedLetter('carta1');

    await runTask('carta1');

    expect((await getLetter('carta1')).status).toBe('delivered');
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it('es un no-op si el cron ya la entregó (idempotencia cron + tarea)', async () => {
    await seedUser('autor');
    await seedLetter('carta1');

    await runCron(); // el cron llega primero
    await runTask('carta1'); // la tarea dispara después

    expect((await getLetter('carta1')).status).toBe('delivered');
    expect(sendEmailMock).toHaveBeenCalledTimes(1); // un único email
  });

  it('no revienta con un id inexistente', async () => {
    await expect(runTask('no-existe')).resolves.toBeUndefined();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
