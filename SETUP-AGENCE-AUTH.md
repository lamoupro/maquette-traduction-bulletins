# Mise en service de l'authentification réelle — `/agence`

Ce document couvre uniquement ce que **toi** dois faire : créer les comptes,
récupérer les identifiants, les poser en variables d'environnement. Le code
est écrit et vérifié (types + build) mais ne peut pas se tester en vrai tant
qu'aucune de ces étapes n'est faite.

Rien ici ne touche à `/portal` (la démonstration) ni à `lib/portail-demo.ts`.
Les deux systèmes sont indépendants — voir la note en tête de
`lib/agence/auth.ts`.

---

## 1. La base de données — Vercel Postgres (Neon)

1. Tableau de bord Vercel → ton projet **protranslayte** → onglet **Storage**
   → **Create Database** → **Postgres** (propulsé par Neon).
2. Une fois créée, Vercel l'attache automatiquement au projet et pose tout
   seul les variables `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, etc., pour
   les environnements Production, Preview et Development.
3. En local : `vercel env pull .env.local` (depuis la racine du projet) pour
   récupérer ces variables sur ta machine. Sans le CLI Vercel connecté,
   copie-les à la main depuis l'onglet **Storage → .env.local** du tableau
   de bord.
4. Applique le schéma :

   ```bash
   npm run db:generate   # écrit le SQL dans lib/agence/db/migrations/
   npm run db:migrate    # l'applique à la base
   ```

5. Crée l'organisation Trackhouse (une seule fois) :

   ```bash
   npm run agence:seed
   ```

6. Invite la première personne chez Trackhouse, une fois que tu as son
   adresse — il n'y a pas encore d'écran d'administration, seulement ce
   script :

   ```bash
   npm run agence:inviter -- trackhouse jean@track-house.com owner
   ```

   Rôles disponibles : `owner`, `admin`, `agent`, `viewer` (voir
   `lib/agence/roles.ts`). Elle se connecte ensuite sur
   `/agence/trackhouse/sign-in` avec cette même adresse, par n'importe laquelle
   des quatre méthodes — l'invitation se consomme à la première réussite.

---

## 2. Connexion Google

1. [console.cloud.google.com](https://console.cloud.google.com) → crée un
   projet (ou réutilise un projet existant) → **APIs & Services** →
   **OAuth consent screen**.
   - Type : **External** (Trackhouse n'est pas dans ton organisation Google).
   - Renseigne le nom de l'app (« Protranslayte »), l'e-mail de support, le
     logo si tu veux.
   - Scopes : `email`, `profile`, `openid` (les seuls demandés par défaut,
     rien à ajouter).
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Type d'application : **Web application**.
   - **Authorized redirect URIs** — exactement ces deux adresses :
     - `https://protranslayte.com/api/agence-auth/callback/google`
     - `http://localhost:3000/api/agence-auth/callback/google` (pour tester
       en local)
3. Copie le **Client ID** et le **Client secret**, pose-les :

   ```
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```

4. Tant que l'écran de consentement reste en mode **Testing**, seules les
   adresses que tu ajoutes explicitement comme « Test users » peuvent se
   connecter. Passe-le en **Production** (bouton **Publish App**) quand tu es
   prêt à laisser n'importe quelle adresse Google/Workspace s'y présenter —
   ça n'accorde toujours rien tant qu'elle n'est pas invitée côté
   `lib/agence/acces.ts`, c'est juste ce qui permet à l'écran Google de
   s'afficher pour elle.

---

## 3. Connexion Microsoft (Entra ID)

1. [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID** →
   **App registrations** → **New registration**.
   - **Supported account types** : *Accounts in any organizational directory
     and personal Microsoft accounts* — c'est ce qui laisse un compte
     Workspace `@track-house.com` se connecter aussi bien qu'un compte
     personnel ; le tri se fait ensuite côté base, pas côté Microsoft.
   - **Redirect URI** (type **Web**) — exactement ces deux adresses :
     - `https://protranslayte.com/api/agence-auth/callback/microsoft-entra-id`
     - `http://localhost:3000/api/agence-auth/callback/microsoft-entra-id`
2. Une fois créée : note l'**Application (client) ID**.
3. **Certificates & secrets → New client secret** — note la **valeur** tout
   de suite, elle ne se réaffiche plus jamais ensuite.
4. Pose :

   ```
   AUTH_MICROSOFT_ENTRA_ID_ID=...
   AUTH_MICROSOFT_ENTRA_ID_SECRET=...
   ```

   (`AUTH_MICROSOFT_ENTRA_ID_ISSUER` n'est pas nécessaire — le code utilise
   `common` par défaut, qui accepte tenant professionnel et compte personnel
   confondus.)

---

## 4. Le lien magique (secours)

Rien à créer : le projet a déjà `resend` en dépendance et `RESEND_API_KEY`
sert déjà à l'envoi des traductions. Si cette variable est déjà posée en
production, cette méthode fonctionne sans rien faire de plus.

---

## 5. Le secret de session

```bash
npx auth secret
```

Copie la valeur générée dans `AUTH_SECRET`. Sers-toi en localement et en
production — une valeur différente entre les deux invaliderait toutes les
sessions à chaque déploiement.

---

## 6. Variables d'environnement — récapitulatif

À poser sur Vercel (Production **et** Preview) et dans `.env.local` :

```
POSTGRES_URL=...                          # posée automatiquement par l'étape 1
POSTGRES_URL_NON_POOLING=...              # idem

AUTH_SECRET=...                           # étape 5
AUTH_GOOGLE_ID=...                        # étape 2
AUTH_GOOGLE_SECRET=...
AUTH_MICROSOFT_ENTRA_ID_ID=...            # étape 3
AUTH_MICROSOFT_ENTRA_ID_SECRET=...

RESEND_API_KEY=...                        # déjà en place si les traductions partent déjà par e-mail
EMAIL_EXPEDITEUR=Protranslayte <contact@protranslayte.com>   # optionnelle, cette valeur est déjà le défaut
```

---

## 7. Vérifier que ça marche

```bash
npm run dev
open http://localhost:3000/agence/trackhouse/sign-in
```

- Les quatre méthodes doivent s'afficher (Google, Microsoft, passkey si ton
  navigateur le permet, lien magique).
- Une connexion Google ou Microsoft réussie mais dont l'adresse n'a **pas**
  été invitée doit revenir sur cet écran avec le message *"We confirmed your
  identity, but your account isn't linked to Trackhouse yet."* — c'est
  attendu et volontaire tant que personne n'a été invité (étape 1.6).
- Une fois invité, la connexion mène à `/agence/trackhouse`, propose de créer
  une passkey, et liste les appareils connectés.

---

## Ce qui n'est PAS fait, volontairement

- **Aucun écran d'administration** pour inviter/gérer les membres — seuls
  les deux scripts (`agence:seed`, `agence:inviter`) existent. C'est la
  suite logique une fois l'authentification elle-même éprouvée.
- **Aucune migration des sportifs et des documents réels** vers cette base :
  `/agence/[org]` est un tableau de bord minimal qui prouve que la connexion
  fonctionne, pas encore le portail final. `lib/portail-demo.ts` continue de
  nourrir `/portal` sans changement.
- **Le rôle n'est encore vérifié nulle part** au-delà de son affichage : les
  fonctions de `lib/agence/roles.ts` existent et sont prêtes, mais rien ne
  les appelle encore puisqu'il n'y a pas encore d'action à restreindre par
  rôle sur ce tableau de bord minimal.
