import { Resend } from 'resend';
import { deviseParCode, montantLisible } from './devises';
import { nomLangueDoc } from './langues';

/* Deux langues d'e-mail, pas quatre.

   L'anglais pour tout le monde SAUF le site français. Les clients qui
   commandent en français le font pour l'administration française, pas pour une
   université américaine : leur écrire en anglais serait une régression sur
   l'activité qui tourne. Tous les autres — espagnol, portugais, anglais —
   partent aux États-Unis et lisent l'anglais.

   La langue est celle du site où la commande a été passée, enregistrée au
   dépôt. Un Brésilien qui a lu un site en portugais et reçoit une confirmation
   en français doute d'avoir commandé au bon endroit. */
type LangueMail = 'fr' | 'en';
const langueMail = (c: Commande): LangueMail => (c.langue === 'fr' ? 'fr' : 'en');

const MOTS = {
  fr: {
    sujetRecu: (r: string) => `Votre demande ${r} est enregistrée`,
    titreRecu: 'Votre demande est bien enregistrée',
    bonjour: (p: string) => `Bonjour ${p},`,
    recu: 'Nous avons bien reçu votre demande de traduction. Elle est prise en charge.',
    reference: 'Référence',
    aTraduire: 'À traduire',
    envoi: 'Envoi papier',
    montant: 'Montant',
    page: (n: number) => `${n} page${n > 1 ? 's' : ''}`,
    livraison:
      '<strong>Livraison sous 24 à 48 h ouvrées.</strong> Vous recevrez le document certifié à cette même adresse.',
    papier:
      "L'exemplaire papier tamponné et signé part par courrier suivi dans les 48 h qui suivent la traduction. Vous n'avez pas à l'attendre pour utiliser la version numérique.",
    question: 'Une question ? Répondez simplement à ce message en rappelant votre référence.',
    sujetPret: (r: string) => `Votre traduction ${r} est prête`,
    titrePret: 'Votre traduction est prête',
    pret: 'Votre traduction certifiée est terminée. Vous la trouverez en pièce jointe de ce message.',
    pretLourd:
      "Votre traduction certifiée est terminée. Elle vous parvient dans un message séparé, son poids dépassant la limite d'envoi.",
    traduit: 'Traduit',
    enregistrez: (d: string) =>
      `<strong>Enregistrez vos fichiers dès maintenant.</strong><br>Vos documents — originaux comme traductions — sont conservés chez nous jusqu'au <strong>${d}</strong>, puis supprimés définitivement. Passé cette date, nous ne pourrons plus vous les renvoyer.`,
    certificat:
      "La traduction est accompagnée d'un <em>certificate of translation accuracy</em>, le format attendu par les universités américaines.",
    locale: 'fr-FR',
  },
  en: {
    sujetRecu: (r: string) => `Your request ${r} has been received`,
    titreRecu: 'Your request has been received',
    bonjour: (p: string) => `Hi ${p},`,
    recu: 'We have received your translation request and it is now being handled.',
    reference: 'Reference',
    aTraduire: 'To translate',
    envoi: 'Postal copy',
    montant: 'Amount',
    page: (n: number) => `${n} page${n > 1 ? 's' : ''}`,
    livraison:
      '<strong>Delivered within 24 to 48 business hours.</strong> The certified document will arrive at this same address.',
    papier:
      'The stamped paper copy is posted by tracked mail within 48 hours of the translation. You do not need to wait for it to use the digital version.',
    question: 'A question? Just reply to this message and quote your reference.',
    sujetPret: (r: string) => `Your translation ${r} is ready`,
    titrePret: 'Your translation is ready',
    pret: 'Your certified translation is complete. You will find it attached to this message.',
    pretLourd:
      'Your certified translation is complete. It is coming in a separate message, as it exceeds the attachment limit.',
    traduit: 'Translated',
    enregistrez: (d: string) =>
      `<strong>Save your files now.</strong><br>Your documents — originals and translations alike — are kept until <strong>${d}</strong>, then permanently deleted. After that date we will no longer be able to send them to you.`,
    certificat:
      'The translation comes with a <em>certificate of translation accuracy</em>, the format US universities expect.',
    locale: 'en-US',
  },
} as const;

/* Envoi des e-mails transactionnels.

   Aucun bulletin n'est joint : la notification interne renvoie vers la page
   d'administration, où l'accès est authentifié et les liens expirent. Faire
   transiter des données personnelles de mineurs par un service tiers
   ajouterait une exposition inutile. */

const EXPEDITEUR = process.env.EMAIL_EXPEDITEUR ?? 'Protranslayte <contact@protranslayte.com>';
/* Destinataires de la notification interne. Deux adresses volontairement :
   la boîte professionnelle, qui fait foi, et l'adresse personnelle, consultée
   depuis le téléphone. Si l'une tombe en panne ou part en indésirable, la
   commande n'est pas manquée pour autant.

   Surchargeable par EMAIL_INTERNE, une ou plusieurs adresses séparées par
   des virgules. */
const INTERNE = (process.env.EMAIL_INTERNE ?? 'contact@protranslayte.com,lamoupro@gmail.com')
  .split(',')
  .map((a) => a.trim())
  .filter(Boolean);
const SITE = process.env.SITE_URL ?? 'https://protranslayte.com';

export const emailConfigure = () => Boolean(process.env.RESEND_API_KEY);

export type Commande = {
  reference: string;
  client: { email: string; prenom: string; nom: string };
  langues: { source: string; cible: string };
  pages: number;
  montant: number;
  devise?: string;
  /** Langue du site où la commande a été passée. */
  langue?: string;
  envoiPostal?: boolean;
  adressePostale?: { adresse: string; codePostal: string; ville: string } | null;
  remarque?: string;
};

/* Le montant s'écrit dans la devise de la commande. Un client facturé en
   dollars qui reçoit une confirmation en euros doute de tout le reste. */
const somme = (c: Commande) => montantLisible(c.montant, deviseParCode(c.devise));

const echapper = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const gabarit = (titre: string, corps: string) => `<!doctype html>
<html lang="fr"><body style="margin:0;background:#F5F8FC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#10233C;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #DDE4EE;border-radius:10px;">
        <tr><td style="padding:26px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
            <tr>
              <td style="padding-right:9px;vertical-align:middle;">
                <img src="${SITE}/logo-mail.png" width="28" height="28" alt=""
                     style="display:block;border-radius:6px;">
              </td>
              <td style="vertical-align:middle;font-size:1.2rem;font-weight:800;letter-spacing:-0.02em;">
                <span style="color:#10233C;">Pro</span><span style="color:#1359B8;">translayte</span>
              </td>
            </tr>
          </table>
          <h1 style="margin:0 0 14px;font-size:1.15rem;line-height:1.3;">${titre}</h1>
          ${corps}
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:0.74rem;color:#55647C;text-align:center;">
        Protranslayte — traduction assermentée de bulletins de notes
      </p>
    </td></tr>
  </table>
</body></html>`;

const ligne = (t: string) =>
  `<p style="margin:0 0 10px;font-size:0.94rem;line-height:1.55;">${t}</p>`;

/** Confirmation envoyée au client dès l'enregistrement de sa commande. */
function messageClient(c: Commande) {
  const m = MOTS[langueMail(c)];
  const langues = `${nomLangueDoc(c.langues.source, langueMail(c))} → ${nomLangueDoc(c.langues.cible, langueMail(c))}`;

  const corps =
    ligne(m.bonjour(echapper(c.client.prenom))) +
    ligne(m.recu) +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-top:1px dashed #DDE4EE;border-bottom:1px dashed #DDE4EE;">
       <tr><td style="padding:12px 0;font-size:0.9rem;color:#55647C;">${m.reference}</td>
           <td style="padding:12px 0;font-size:0.9rem;text-align:right;font-weight:700;">${echapper(c.reference)}</td></tr>
       <tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">${m.aTraduire}</td>
           <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;">${m.page(c.pages)} · ${echapper(langues)}</td></tr>
       ${
         c.envoiPostal && c.adressePostale
           ? `<tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">${m.envoi}</td>
                  <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;">${echapper(c.adressePostale.adresse)}<br>${echapper(c.adressePostale.codePostal)} ${echapper(c.adressePostale.ville)}</td></tr>`
           : ''
       }
       <tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">${m.montant}</td>
           <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;font-weight:700;">${somme(c)}</td></tr>
     </table>` +
    ligne(m.livraison) +
    (c.envoiPostal ? ligne(m.papier) : '') +
    ligne(`<span style="color:#55647C;font-size:0.86rem;">${m.question}</span>`);

  return { subject: m.sujetRecu(c.reference), html: gabarit(m.titreRecu, corps) };
}

/** Notification interne : jamais de pièce jointe, uniquement un lien. */
function messageInterne(c: Commande, nbFichiers: number) {
  const corps =
    ligne(
      `<strong>${c.pages} page${c.pages > 1 ? 's' : ''}</strong> — ${echapper(nomLangueDoc(c.langues.source, 'fr'))} → ${echapper(nomLangueDoc(c.langues.cible, 'fr'))} — <strong>${somme(c)}</strong>`,
    ) +
    ligne(
      `${echapper(c.client.prenom)} ${echapper(c.client.nom)} — <a href="mailto:${echapper(c.client.email)}" style="color:#1359B8;">${echapper(c.client.email)}</a>`,
    ) +
    (c.envoiPostal && c.adressePostale
      ? `<p style="margin:12px 0;padding:10px 12px;background:#E8F0FC;border-left:3px solid #1359B8;border-radius:0 6px 6px 0;font-size:0.9rem;">
           <strong>Envoi papier à expédier</strong><br>
           ${echapper(c.client.prenom)} ${echapper(c.client.nom)}<br>
           ${echapper(c.adressePostale.adresse)}<br>
           ${echapper(c.adressePostale.codePostal)} ${echapper(c.adressePostale.ville)}
         </p>`
      : '') +
    (c.remarque
      ? `<p style="margin:12px 0;padding:10px 12px;background:#F5F8FC;border-radius:6px;font-size:0.9rem;">${echapper(c.remarque)}</p>`
      : '') +
    ligne(`${nbFichiers} fichier${nbFichiers > 1 ? 's' : ''} déposé${nbFichiers > 1 ? 's' : ''}.`) +
    `<p style="margin:18px 0 0;">
       <a href="${SITE}/admin" style="display:inline-block;background:#1359B8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:5px;font-weight:600;font-size:0.94rem;">
         Ouvrir l'administration
       </a>
     </p>`;

  return {
    subject: `${c.envoiPostal ? '📮 ' : ''}Commande ${c.reference} — ${c.pages} page${c.pages > 1 ? 's' : ''} — ${somme(c)}`,
    html: gabarit(`Nouvelle commande ${echapper(c.reference)}`, corps),
  };
}

/** Envoie les deux messages. N'interrompt jamais la commande en cas d'échec :
    le dossier est déjà enregistré, un e-mail perdu se rattrape. */
export async function envoyerEmails(c: Commande, nbFichiers: number) {
  if (!emailConfigure()) {
    console.warn('[email] RESEND_API_KEY absente, aucun envoi');
    return { client: false, interne: false };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resultats = await Promise.allSettled([
    resend.emails.send({ from: EXPEDITEUR, to: c.client.email, ...messageClient(c) }),
    resend.emails.send({
      from: EXPEDITEUR,
      to: INTERNE,
      replyTo: c.client.email,
      ...messageInterne(c, nbFichiers),
    }),
  ]);

  resultats.forEach((r, i) => {
    const quoi = i === 0 ? 'client' : 'interne';
    if (r.status === 'rejected') console.error(`[email] échec ${quoi}`, r.reason);
    else if (r.value.error) console.error(`[email] refus ${quoi}`, r.value.error);
  });

  return {
    client: resultats[0].status === 'fulfilled' && !resultats[0].value.error,
    interne: resultats[1].status === 'fulfilled' && !resultats[1].value.error,
  };
}

/* ---------- Livraison de la traduction terminée ----------

   Les traductions partent en pièce jointe, contrairement à la notification
   interne. Ce sont les documents du client lui-même, adressés à lui seul, et
   sans compte sur le site il n'existe aucun autre chemin pour les lui remettre.

   Le message rappelle la date de suppression en clair : les fichiers ne sont
   conservés que le temps annoncé dans les CGV, et un client qui ne les a pas
   enregistrés n'a plus aucun recours passé ce délai. */

/** Limite prudente : Resend refuse au-delà d'une quarantaine de méga-octets. */
const PIECES_JOINTES_MAX = 20 * 1024 * 1024;

function messageLivraison(c: Commande, jusquAu: Date, jointes: boolean) {
  const m = MOTS[langueMail(c)];
  const date = jusquAu.toLocaleDateString(m.locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const langues = `${nomLangueDoc(c.langues.source, langueMail(c))} → ${nomLangueDoc(c.langues.cible, langueMail(c))}`;

  const corps =
    ligne(m.bonjour(echapper(c.client.prenom))) +
    ligne(jointes ? m.pret : m.pretLourd) +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-top:1px dashed #DDE4EE;border-bottom:1px dashed #DDE4EE;">
       <tr><td style="padding:12px 0;font-size:0.9rem;color:#55647C;">${m.reference}</td>
           <td style="padding:12px 0;font-size:0.9rem;text-align:right;font-weight:700;">${echapper(c.reference)}</td></tr>
       <tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">${m.traduit}</td>
           <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;">${m.page(c.pages)} · ${echapper(langues)}</td></tr>
     </table>` +
    `<p style="margin:0 0 10px;padding:12px 14px;background:#FBF2E2;border-left:3px solid #8A5A00;border-radius:0 6px 6px 0;font-size:0.94rem;line-height:1.55;">
       ${m.enregistrez(date)}
     </p>` +
    ligne(m.certificat) +
    (c.envoiPostal ? ligne(m.papier) : '') +
    ligne(`<span style="color:#55647C;font-size:0.86rem;">${m.question}</span>`);

  return { subject: m.sujetPret(c.reference), html: gabarit(m.titrePret, corps) };
}

/**
 * Livre les traductions au client.
 *
 * Renvoie l'état de l'envoi plutôt que de lever : un e-mail perdu se rattrape
 * à la main, alors qu'une exception ici ferait échouer une livraison dont les
 * fichiers sont déjà déposés.
 */
export async function envoyerLivraison(
  c: Commande,
  pieces: { nom: string; contenu: Buffer }[],
  jusquAu: Date,
) {
  if (!emailConfigure()) {
    console.warn('[email] RESEND_API_KEY absente, livraison non notifiée');
    return { envoye: false, jointes: false, motif: 'configuration' as const };
  }

  const poids = pieces.reduce((n, p) => n + p.contenu.length, 0);
  const jointes = poids > 0 && poids <= PIECES_JOINTES_MAX;
  if (poids > PIECES_JOINTES_MAX) {
    console.warn(`[email] ${c.reference} : ${Math.round(poids / 1e6)} Mo, trop lourd pour l'envoi`);
  }

  try {
    const r = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: EXPEDITEUR,
      to: c.client.email,
      replyTo: INTERNE[0],
      ...messageLivraison(c, jusquAu, jointes),
      ...(jointes
        ? { attachments: pieces.map((p) => ({ filename: p.nom, content: p.contenu })) }
        : {}),
    });
    if (r.error) {
      console.error('[email] refus livraison', r.error);
      return { envoye: false, jointes, motif: 'refus' as const };
    }
    return { envoye: true, jointes, motif: null };
  } catch (e) {
    console.error('[email] échec livraison', e);
    return { envoye: false, jointes, motif: 'echec' as const };
  }
}
