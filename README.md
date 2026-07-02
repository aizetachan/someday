# Cartas al Futuro 📮

Plataforma para escribir cartas que se entregan en el futuro — a tu futuro yo
o a otra persona. Escribir es sellar un sobre; esperar es parte del regalo;
abrir es una pequeña ceremonia.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Firebase (Auth + Firestore + Cloud Functions v2) · Resend.

## Estructura

```
src/
  app/
    (marketing)/        Landing + privacidad + términos
    (app)/              Shell autenticado: escribir, cartas, ajustes
    abrir/[id]/         Ceremonia de apertura (pública con openToken)
    api/letters/open/   Endpoint de apertura (Admin SDK)
    auth/               Login y registro
  components/           editor / letters / opening / ui
  lib/                  firebase, firestore (capa tipada), dates, types
  hooks/                useAuth, useLetters, useDraft (autosave)
functions/
  src/
    deliverLetters.ts   Cron de entrega (cada 15 min, lock transaccional)
    reminders.ts        Aviso 24h antes (diario 09:00 Europe/Madrid)
    triggers.ts         Email de bienvenida + confirmación de sellado
    deleteAccount.ts    Derecho al olvido (GDPR)
    emails/             Plantillas React Email
firestore.rules         Reglas de seguridad
firestore.indexes.json  Índices compuestos
```

## Puesta en marcha

### 1. Firebase

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com)
   (región Firestore: `eur3` o `europe-west1`).
2. Activa **Authentication** → Email/Password y Google.
3. Activa **Cloud Firestore**.
4. Crea una app web y copia la configuración.
5. Instala la CLI y vincula el proyecto:

```bash
npm i -g firebase-tools
firebase login
firebase use --add          # crea .firebaserc con tu project id
```

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena las `NEXT_PUBLIC_FIREBASE_*` con la config de tu app web.

Para el endpoint de apertura (`/api/letters/open`) necesitas credenciales de
Admin: descarga una cuenta de servicio (Configuración → Cuentas de servicio →
Generar clave privada) y pégala en una línea en `FIREBASE_SERVICE_ACCOUNT`,
o exporta `GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/fichero.json`.

### 3. Resend

1. Crea una cuenta en [resend.com](https://resend.com) y verifica tu dominio
   (SPF + DKIM + DMARC — crítico: estos emails llegan meses o años después,
   cuida la reputación del dominio desde el día 1).
2. Guarda el secreto para las functions:

```bash
firebase functions:secrets:set RESEND_API_KEY
```

3. Configura los parámetros de las functions (te los pedirá al desplegar, o
   crea `functions/.env.<project-id>`):

```
APP_URL=https://tu-dominio.app
EMAIL_FROM="Cartas <hola@tu-dominio.app>"
```

### 4. Desplegar reglas, índices y functions

```bash
firebase deploy --only firestore:rules,firestore:indexes
cd functions && npm install && cd ..
firebase deploy --only functions
```

### 5. App

```bash
npm install
npm run dev          # desarrollo
npm run build        # producción (Vercel o Firebase App Hosting)
```

En Vercel, añade todas las variables de `.env.local` al proyecto.

## Probar el ciclo completo

La entrega es el corazón del sistema: pruébala antes de pulir nada.

1. Regístrate y escribe una carta.
2. En Firestore, edita a mano `deliveryDate` de la carta sellada a hace 5
   minutos.
3. Espera al siguiente tick del cron (≤15 min) o ejecútalo desde la consola
   de Cloud Scheduler ("Forzar ejecución").
4. Debe llegar el email de entrega con el enlace `/abrir/{id}?t={token}` —
   sin el contenido de la carta en el email.
5. Abre el enlace, mantén pulsado el sello, lee la carta. El estado pasa a
   `opened` y queda relegible para siempre.

## Decisiones de producto (v1)

- Una carta **sellada es inmutable**: ni se lee ni se edita, tampoco por su
  autor. Solo se puede cancelar (sin leerla) hasta 24h antes de la entrega.
- El email de entrega **nunca contiene el cuerpo**: solo el enlace de
  apertura. La carta se abre en la plataforma.
- Mínimo +7 días, máximo +25 años. Fechas a las 00:00 en la zona horaria del
  autor.
- El borrador se escribe **antes** de registrarse (localStorage); el registro
  llega al sellar.
- Si el autor borra su cuenta, las cartas selladas a otras personas se
  entregan igualmente, con la autoría anonimizada.
