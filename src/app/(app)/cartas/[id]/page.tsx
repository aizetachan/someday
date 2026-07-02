'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EnvelopeClosed } from '@/components/letters/EnvelopeClosed';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { cancelLetter, subscribeLetter } from '@/lib/firestore';
import { countdownLabel, formatDateEs, humanDistance } from '@/lib/dates';
import { LIMITS, type Letter } from '@/lib/types';

export default function LetterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [letter, setLetter] = useState<Letter | null | undefined>(undefined);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    return subscribeLetter(id, setLetter);
  }, [id]);

  if (letter === undefined) return <Spinner label="Buscando la carta…" />;
  if (letter === null) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center text-ink-soft">
        Esta carta no existe o no es tuya.
      </div>
    );
  }

  const delivery = letter.deliveryDate?.toDate();
  const created = letter.createdAt?.toDate();
  const inTransit = letter.status === 'sealed' || letter.status === 'delivering';
  const readable = letter.status === 'delivered' || letter.status === 'opened';
  const cancellable =
    letter.status === 'sealed' &&
    delivery &&
    delivery.getTime() - Date.now() > LIMITS.cancelWindowHours * 3_600_000;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <Link
        href="/cartas"
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> Mis cartas
      </Link>

      <div className="mt-10 flex flex-col items-center text-center">
        {inTransit && (
          <>
            <EnvelopeClosed width={260} />
            <h1 className="mt-8 font-serif text-2xl text-ink">Carta sellada</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Para{' '}
              {letter.recipientType === 'self' ? 'tu futuro yo' : letter.recipientName}.
              {created && <> Escrita el {formatDateEs(created)}.</>} Su contenido
              permanece cerrado — también para ti — hasta el día de la entrega.
            </p>
            {delivery && (
              <p className="mt-6 font-mono text-sm text-gold">
                Se entrega el {formatDateEs(delivery)} · {countdownLabel(delivery)}
              </p>
            )}
            {cancellable && (
              <Button
                variant="danger"
                size="sm"
                className="mt-10"
                onClick={() => setCancelModal(true)}
              >
                Cancelar esta carta
              </Button>
            )}
          </>
        )}

        {readable && (
          <>
            <EnvelopeClosed width={260} sealed={letter.status !== 'opened'} />
            <h1 className="mt-8 font-serif text-2xl text-ink">
              {letter.status === 'opened' ? letter.subject || 'Carta abierta' : 'Ha llegado una carta'}
            </h1>
            {created && delivery && (
              <p className="mt-2 text-sm text-ink-soft">
                Viajó {humanDistance(created, delivery)}.
              </p>
            )}
            <Link
              href={`/abrir/${letter.id}?t=${letter.openToken}`}
              className="mt-8 rounded-[4px] bg-seal px-7 py-3.5 text-base font-medium text-paper hover:bg-seal-hover"
            >
              {letter.status === 'opened' ? 'Releer la carta' : 'Abrir la carta'}
            </Link>
          </>
        )}

        {letter.status === 'failed' && (
          <>
            <h1 className="font-serif text-2xl text-error">Error de entrega</h1>
            <p className="mt-3 max-w-md text-sm text-ink-soft">
              No pudimos entregar esta carta tras varios intentos. Escríbenos y
              lo resolvemos: la carta sigue guardada, intacta.
            </p>
          </>
        )}

        {letter.status === 'cancelled' && (
          <>
            <h1 className="font-serif text-2xl text-ink-soft">Carta cancelada</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Esta carta no se entregará. Su contenido quedó sellado para siempre.
            </p>
          </>
        )}

        {letter.status === 'draft' && (
          <>
            <h1 className="font-serif text-2xl text-ink">Borrador</h1>
            <p className="mt-3 text-sm text-ink-soft">
              Esta carta aún no está sellada.
            </p>
            <Link
              href="/escribir"
              className="mt-6 text-sm font-medium text-seal underline-offset-4 hover:underline"
            >
              Continuar escribiendo →
            </Link>
          </>
        )}
      </div>

      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="¿Cancelar esta carta?"
      >
        <p className="text-sm leading-relaxed text-ink-soft">
          La carta no se entregará nunca y su contenido quedará sellado para
          siempre. No se puede deshacer.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            disabled={cancelling}
            onClick={async () => {
              setCancelling(true);
              try {
                await cancelLetter(letter.id);
                setCancelModal(false);
                router.push('/cartas');
              } finally {
                setCancelling(false);
              }
            }}
          >
            {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
          </Button>
          <Button variant="ghost" onClick={() => setCancelModal(false)}>
            No, que siga su viaje
          </Button>
        </div>
      </Modal>
    </div>
  );
}
