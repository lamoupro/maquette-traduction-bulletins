import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { Resend as ClientResend } from 'resend';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from './db/client';
import { accounts, authenticators, sessions, users, verificationTokens } from './db/schema';
import { organisation } from './organisations';
import { domaineCookieAgence } from './host';
import { appareilLisible } from './appareil';

/* L'authentification RÉELLE du portail agence.

   Elle ne touche à RIEN de lib/portail-demo.ts ni de app/portal/ : ce sont
   deux systèmes séparés qui ne se croisent jamais. Celui-ci vit dans
   app/agence/, s'appuie sur une vraie base (voir lib/agence/db/), et sert de
   vrais utilisateurs. L'autre reste la maquette de démarchage, à clé unique,
   qui continue de tourner sans changement.

   ---------- Ce que ce fichier décide, et ce qu'il NE décide PAS ----------

   Il décide QUI se connecte : une identité Google, Microsoft ou une adresse
   qui a prouvé tenir sa boîte en cliquant un lien. C'est le rôle d'Auth.js,
   et rien ici ne réinvente la vérification d'un jeton OAuth — la bibliothèque
   le fait, elle est faite pour ça.

   Il NE décide PAS À QUOI cette identité donne accès. Une connexion Google
   réussie ne dit qu'une chose : cette personne possède cette adresse. Ça ne
   dit pas qu'elle appartient à Trackhouse, ni à quel titre. Cette
   vérification est un second temps, après le retour sur notre domaine — voir
   lib/agence/acces.ts — et elle ne considère JAMAIS le domaine de l'adresse
   comme une preuve suffisante : il faut une appartenance ACTIVE, ou une
   invitation qui l'atteste. Un domaine dit seulement « cette adresse existe
   dans cette entreprise », jamais « cette personne peut voir ces dossiers ». */

const EXPEDITEUR = process.env.EMAIL_EXPEDITEUR ?? 'Protranslayte <contact@protranslayte.com>';

/* ---------- Un domaine, plusieurs hôtes ----------

   trackhouse.protranslayte.com, demain un autre sous-domaine pour un autre
   client — mais Google et Microsoft ne connaissent qu'UNE adresse de retour :
   protranslayte.com. C'est la seule qu'on ait enregistrée dans leurs consoles,
   et c'est volontaire : y ajouter une entrée par client referait, à chaque
   nouveau client, exactement la démarche qu'un sous-domaine était censé
   éviter.

   Auth.js lit `AUTH_URL` pour ça — jamais l'hôte réel de la requête — dès que
   la variable existe (vérifié dans next-auth/lib/env.js : elle remplace
   l'origine, rien d'autre). On la fixe ICI, en code, plutôt que de compter
   sur une variable posée à la main sur Vercel : le jour où quelqu'un
   provisionne un nouvel environnement de production et l'oublie, l'échange
   OAuth se briserait silencieusement — une redirection vers le mauvais hôte
   que Google refuserait sans un message clair.

   Ce que ce choix implique EN AVAL, et qui n'est pas ici : le cookie de
   session doit être lisible sur tous les sous-domaines (`domaineCookieAgence`
   plus bas), et la redirection finale doit avoir le droit de quitter
   protranslayte.com pour revenir vers celui du client (`callbacks.redirect`) —
   sans quoi l'utilisateur, après avoir prouvé son identité, resterait coincé
   sur l'apex au lieu de revenir sur l'adresse de son organisation. */
if (!process.env.AUTH_URL && process.env.VERCEL_ENV === 'production') {
  process.env.AUTH_URL = 'https://protranslayte.com';
}

const adaptateurBase = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
  authenticatorsTable: authenticators,
});

/* L'adaptateur, avec une seule chose en plus : le nom de l'appareil.

   Une session ouverte par Google, Microsoft ou un lien magique passe par
   l'adaptateur, qui ne connaît que l'utilisateur — pas la requête. On note
   donc l'appareil juste après la création, depuis les en-têtes de la requête
   en cours. La session par passkey, elle, est posée à la main et note déjà le
   sien (voir lib/agence/session.ts).

   Si ça échoue, la session reste valable : savoir depuis quel navigateur
   quelqu'un s'est connecté est un confort, pas une condition d'accès. */
const adaptateur: typeof adaptateurBase = {
  ...adaptateurBase,
  async createSession(donnees) {
    const session = await adaptateurBase.createSession!(donnees);
    try {
      const nom = appareilLisible((await headers()).get('user-agent'));
      if (nom) {
        await db
          .update(sessions)
          .set({ userAgent: nom })
          .where(eq(sessions.sessionToken, session.sessionToken));
      }
    } catch {
      // hors contexte de requête : rien à noter, rien à casser
    }
    return session;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: adaptateur,

  /* Sous /api/agence-auth, et pas /api/auth par défaut : ce nom générique
     aurait pu laisser croire qu'il couvre aussi /admin ou la démo. Il ne
     couvre qu'un seul système, et son adresse le dit. */
  basePath: '/api/agence-auth',
  /* Nécessaire derrière le proxy de Vercel : sans ça, Auth.js refuse de
     construire les URL de redirection en production. Sans effet en local. */
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      /* Fonctionne nativement avec un Google Workspace à domaine personnalisé
         (nom@track-house.com) comme avec un compte grand public : Google
         distingue les deux en interne, notre code n'a rien à faire de
         spécial. Ce qui compte, c'est la vérification ci-dessous. */
      authorization: { params: { prompt: 'select_account' } },
      /* Google est le SEUL des trois fournisseurs à retourner un booléen
         explicite de vérification. On le fait valoir : une adresse Google
         non vérifiée ne prouve rien de plus qu'une adresse tapée au clavier. */
      profile: (profile) => ({
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
    }),

    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      /* Sans émetteur précisé, Microsoft accepte tout compte personnel ou
         professionnel confondus. `common` couvre les deux — un compte
         professionnel Trackhouse comme un compte personnel — la vérification
         du domaine et de l'appartenance fait le tri ensuite, à l'endroit qui
         a accès à notre base. */
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER ?? 'https://login.microsoftonline.com/common/v2.0',
    }),

    /* Le lien de connexion, solution de secours — jamais un mot de passe. Le
       même principe que la démonstration l'explique déjà : cliquer le lien
       prouve qu'on tient la boîte, et cette boîte est déjà protégée par
       l'authentification propre à l'entreprise qui l'héberge. */
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: EXPEDITEUR,
      /* Dix minutes, pas les vingt-quatre heures par défaut d'Auth.js : un
         lien qui traîne un jour entier dans une boîte est un lien qu'on a
         eu le temps d'oublier avoir demandé. */
      maxAge: 10 * 60,
      async sendVerificationRequest({ identifier: adresse, url, provider }) {
        if (!process.env.RESEND_API_KEY) {
          console.warn('[agence-auth] RESEND_API_KEY absente, lien non envoyé :', url);
          return;
        }
        // Construit ICI, jamais au chargement du module : `new Resend()` lève
        // sans clé, et ce module est importé à la construction du site, bien
        // avant que la moindre variable d'environnement de production existe.
        const resendClient = new ClientResend(process.env.RESEND_API_KEY);
        const org = await organisation({ parEmail: adresse });
        const nomOrg = org?.nom ?? 'your organisation';

        /* ---------- Pourquoi on n'envoie PAS l'adresse d'Auth.js telle quelle ----------

           Le jeton est à usage unique, et il est consommé par la PREMIÈRE
           visite — pas par le premier humain. Or un lien qui circule est visité
           par des machines avant de l'être par quelqu'un : WhatsApp le charge
           pour fabriquer son aperçu, Outlook le fait passer par Safe Links,
           les antivirus de messagerie le dépouillent. Quand la personne clique
           enfin, le jeton est déjà mort, et elle reçoit une erreur alors
           qu'elle n'a rien fait de travers. Constaté en test réel, en
           transférant un lien par WhatsApp vers un ordinateur.

           On envoie donc l'adresse d'un écran à NOUS, qui ne consomme rien en
           se chargeant et porte un bouton. Un aspirateur de lien récupère du
           HTML et repart ; seul un vrai clic déclenche l'échange du jeton.
           Le lien reste à usage unique, ce qui est exactement ce qu'on veut :
           le problème n'était pas sa sévérité, mais qui le déclenchait. */
        const ouvrir = new URL('/agence/connexion/ouvrir', url);
        ouvrir.searchParams.set('u', url);
        if (org) ouvrir.searchParams.set('o', org.slug);
        const lien = ouvrir.toString();
        const { error } = await resendClient.emails.send({
          from: provider.from!,
          to: adresse,
          subject: `Sign in to the ${nomOrg} document portal`,
          /* La consigne d'ouvrir dans le navigateur par défaut n'est pas
             cosmétique : Outlook et Gmail ouvrent ce lien dans leur PROPRE
             navigateur intégré, dont les cookies ne sont pas ceux de Safari
             ou Chrome. La session s'y ouvre bien, mais devient invisible dès
             qu'on quitte l'appli — on dirait alors que se reconnecter n'a
             servi à rien. Le lien lui-même reste protégé (dix minutes, usage
             unique) : c'est sans risque de l'ouvrir ailleurs que dans l'appli
             qui l'a reçu. */
          text: `Open this link to sign in to the ${nomOrg} document portal:\n\n${lien}\n\nTip: open it in Safari or Chrome rather than inside your mail app's built-in browser — that way you'll stay signed in for 30 days instead of only until you close the mail app.\n\nThis link expires in 10 minutes and can be used once. If you didn't request it, ignore this message.`,
          html: `<p>Open this link to sign in to the <strong>${nomOrg}</strong> document portal:</p><p><a href="${lien}">${lien}</a></p><p style="color:#666;font-size:13px">Tip: open it in Safari or Chrome rather than inside your mail app's built-in browser — that way you'll stay signed in for 30 days instead of only until you close the mail app.</p><p style="color:#666;font-size:13px">This link expires in 10 minutes and can be used once. If you didn't request it, ignore this message.</p>`,
        });
        if (error) throw new Error(`Resend: ${error.message}`);
      },
    }),
  ],

  session: {
    /* En base, jamais en jeton auto-porteur : c'est ce qui permet de couper
       une session à la requête suivante quand un compte est retiré d'une
       organisation, plutôt que d'attendre son expiration naturelle. */
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    /* Renouvelée dès qu'un quart de sa durée s'est écoulé : une session
       active ne demande jamais de reconnexion, une session abandonnée finit
       tout de même par expirer. */
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: '/agence/connexion',
    error: '/agence/connexion',
  },

  /* Le cookie de session doit survivre au changement d'hôte : l'échange OAuth
     se termine sur protranslayte.com (voir plus haut), mais l'utilisateur
     doit rester connecté une fois renvoyé sur trackhouse.protranslayte.com.
     Un cookie « .protranslayte.com » — avec le point — se lit sur les deux ;
     sans lui, la connexion réussirait puis semblerait n'avoir jamais eu lieu.

     `domaineCookieAgence()` ne vaut cette valeur qu'en production : en local
     ou sur un déploiement de prévisualisation Vercel, un domaine pointé ne
     s'appliquerait à aucun hôte réel, et Auth.js retombe alors sur son
     comportement par défaut, exact pour l'hôte de la requête. */
  cookies: {
    sessionToken: { options: { domain: domaineCookieAgence() } },
  },

  callbacks: {
    /* ICI : uniquement « qui es-tu », jamais « qu'as-tu le droit de voir ».
       Voir la note en tête de fichier. */
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // La seule vérification qui appartient à cet endroit : Google
        // affirme-t-il lui-même que l'adresse est vérifiée ?
        if (!(profile as { email_verified?: boolean } | undefined)?.email_verified) {
          return false;
        }
      }
      if (!user.email) return false;
      return true;
    },

    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },

    /* Autorise la redirection finale à QUITTER protranslayte.com pour
       revenir vers le sous-domaine d'où la connexion est partie —
       trackhouse.protranslayte.com, par exemple. Par défaut, Auth.js refuse
       toute redirection qui ne pointe pas exactement vers `AUTH_URL`, pour se
       protéger des redirections ouvertes ; ici cette protection resterait
       stricte au point de renvoyer tout le monde sur l'apex après connexion,
       ce que `app/agence/[org]/actions.ts` ne demande justement pas — voir sa
       note sur `adresseAgence`.

       On élargit donc la liste blanche à UN SEUL domaine : le nôtre, apex et
       sous-domaines confondus. Rien d'extérieur à protranslayte.com n'est
       jamais accepté — la protection contre les redirections ouvertes reste
       entière, seulement reformulée à l'échelle du domaine plutôt que de
       l'hôte exact. */
    async redirect({ url, baseUrl }) {
      try {
        const cible = new URL(url, baseUrl);
        if (cible.hostname === 'protranslayte.com' || cible.hostname.endsWith('.protranslayte.com')) {
          return cible.toString();
        }
      } catch {
        // URL invalide : on retombe sur le comportement par défaut plus bas.
      }
      return baseUrl;
    },
  },
});
