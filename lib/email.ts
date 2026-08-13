import { Resend } from 'resend';

/* Envoi des e-mails transactionnels.

   Les bulletins sont joints à la notification INTERNE uniquement, jamais au
   message du client. C'est un choix de confort assumé : les documents
   arrivent directement dans la boîte, prêts à être transmis au traducteur,
   sans passer par l'administration.

   Contrepartie à garder en tête : une copie des données scolaires — souvent
   celles de mineurs — subsiste alors dans les boîtes de réception, hors de
   la suppression automatique à 30 jours du stockage. La politique de
   confidentialité le mentionne explicitement. Purger ces boîtes de temps en
   temps fait donc partie de l'hygiène du service. */

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

/* Au-delà de cette taille cumulée, on n'attache rien : la plupart des
   serveurs refusent les messages de plus de 20 à 25 Mo, et un envoi rejeté
   serait pire qu'un envoi sans pièce jointe. On bascule alors sur le lien. */
const LIMITE_PIECES_JOINTES = 15 * 1024 * 1024;

export type PieceJointe = { nom: string; contenu: Buffer };

export type Commande = {
  reference: string;
  client: { email: string; prenom: string; nom: string };
  langues: { source: string; cible: string };
  quantite: number;
  montant: number;
  remarque?: string;
};

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
  const corps =
    ligne(`Bonjour ${echapper(c.client.prenom)},`) +
    ligne(
      `Nous avons bien reçu votre demande de traduction assermentée. Un traducteur assermenté la prend en charge.`,
    ) +
    `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;border-top:1px dashed #DDE4EE;border-bottom:1px dashed #DDE4EE;">
       <tr><td style="padding:12px 0;font-size:0.9rem;color:#55647C;">Référence</td>
           <td style="padding:12px 0;font-size:0.9rem;text-align:right;font-weight:700;">${echapper(c.reference)}</td></tr>
       <tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">Documents</td>
           <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;">${c.quantite} · ${echapper(c.langues.source)} → ${echapper(c.langues.cible)}</td></tr>
       <tr><td style="padding:0 0 12px;font-size:0.9rem;color:#55647C;">Montant</td>
           <td style="padding:0 0 12px;font-size:0.9rem;text-align:right;font-weight:700;">${c.montant} €</td></tr>
     </table>` +
    ligne(
      `<strong>Livraison sous 24 à 48 h ouvrées.</strong> Vous recevrez le document certifié à cette même adresse.`,
    ) +
    ligne(
      `<span style="color:#55647C;font-size:0.86rem;">Une question ? Répondez simplement à ce message en rappelant votre référence.</span>`,
    );

  return {
    subject: `Votre demande ${c.reference} est enregistrée`,
    html: gabarit('Votre demande est bien enregistrée', corps),
  };
}

/** Notification interne : documents joints quand la taille le permet. */
function messageInterne(c: Commande, nbFichiers: number, joints: boolean) {
  const corps =
    ligne(
      `<strong>${c.quantite} document${c.quantite > 1 ? 's' : ''}</strong> — ${echapper(c.langues.source)} → ${echapper(c.langues.cible)} — <strong>${c.montant} €</strong>`,
    ) +
    ligne(
      `${echapper(c.client.prenom)} ${echapper(c.client.nom)} — <a href="mailto:${echapper(c.client.email)}" style="color:#1359B8;">${echapper(c.client.email)}</a>`,
    ) +
    (c.remarque
      ? `<p style="margin:12px 0;padding:10px 12px;background:#F5F8FC;border-radius:6px;font-size:0.9rem;">${echapper(c.remarque)}</p>`
      : '') +
    ligne(
      joints
        ? `${nbFichiers} fichier${nbFichiers > 1 ? 's' : ''} <strong>joint${nbFichiers > 1 ? 's' : ''} à ce message</strong>.`
        : `${nbFichiers} fichier${nbFichiers > 1 ? 's' : ''} déposé${nbFichiers > 1 ? 's' : ''} — trop volumineux pour être joints, à récupérer depuis l'administration.`,
    ) +
    `<p style="margin:18px 0 0;">
       <a href="${SITE}/admin" style="display:inline-block;background:#1359B8;color:#fff;text-decoration:none;padding:12px 20px;border-radius:5px;font-weight:600;font-size:0.94rem;">
         Ouvrir l'administration
       </a>
     </p>`;

  return {
    subject: `Commande ${c.reference} — ${c.quantite} doc. — ${c.montant} €`,
    html: gabarit(`Nouvelle commande ${echapper(c.reference)}`, corps),
  };
}

/** Envoie les deux messages. N'interrompt jamais la commande en cas d'échec :
    le dossier est déjà enregistré, un e-mail perdu se rattrape. */
export async function envoyerEmails(c: Commande, pieces: PieceJointe[]) {
  if (!emailConfigure()) {
    console.warn('[email] RESEND_API_KEY absente, aucun envoi');
    return { client: false, interne: false };
  }

  const poids = pieces.reduce((t, p) => t + p.contenu.length, 0);
  const joints = pieces.length > 0 && poids <= LIMITE_PIECES_JOINTES;
  if (!joints && pieces.length > 0) {
    console.warn(`[email] ${Math.round(poids / 1024 / 1024)} Mo de pièces, envoi sans attache`);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resultats = await Promise.allSettled([
    resend.emails.send({ from: EXPEDITEUR, to: c.client.email, ...messageClient(c) }),
    resend.emails.send({
      from: EXPEDITEUR,
      to: INTERNE,
      replyTo: c.client.email,
      ...messageInterne(c, pieces.length, joints),
      ...(joints
        ? { attachments: pieces.map((p) => ({ filename: p.nom, content: p.contenu })) }
        : {}),
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
