import { Resend } from 'resend';
import { lireFiche } from '@/lib/stockage';
import { type Candidat, avancement } from '@/lib/portail-demo';

/* Les rappels envoyés à l'étudiant — pour de vrai, depuis le serveur.

   Ce qui a changé, et pourquoi. Le portail ouvrait la messagerie de la
   personne avec un texte tout prêt, à elle de taper le destinataire. C'était
   simple et ça ne demandait aucune donnée — mais ça reportait le travail sur
   quelqu'un, et surtout ça supposait qu'elle connaisse l'adresse de
   l'étudiant. Elle est chez NOUS depuis le début : on la recueille avant le
   paiement, et c'est à elle qu'on livre les traductions.

   Le message part donc de contact@protranslayte.com. Ce n'est pas un détail
   de plomberie : l'étudiant a déjà reçu ses traductions de cette adresse,
   il la reconnaît, et un rappel venu d'ailleurs finirait en indésirable. */

const EXPEDITEUR = process.env.EMAIL_EXPEDITEUR ?? 'Protranslayte <contact@protranslayte.com>';
const INTERNE = (process.env.EMAIL_INTERNE ?? 'contact@protranslayte.com,lamoupro@gmail.com')
  .split(',')
  .map((a) => a.trim())
  .filter(Boolean);

type FicheCommande = { client?: { email?: string; prenom?: string } };

/* L'adresse de l'étudiant, retrouvée dans SES commandes.

   On essaie chaque référence du dossier, de la plus récente à la plus
   ancienne : un dossier commandé en deux fois a deux fiches, et rien ne
   garantit que la première soit encore lisible. */
export async function emailEtudiant(c: Candidat): Promise<string | null> {
  const references = [...new Set(c.livraisons.flatMap((l) => l.commandes).reverse())];
  for (const ref of references) {
    try {
      const fiche = (await lireFiche(ref)) as FicheCommande | null;
      const email = fiche?.client?.email?.trim();
      if (email) return email;
    } catch {
      // Référence sans fiche lisible : on essaie la suivante.
    }
  }
  return null;
}

/** Ce qui manque, en une liste numérotée — la même dans l'e-mail et le SMS. */
export function listeManquante(c: Candidat) {
  return avancement(c)
    .manquantes.map((m, i) => `${i + 1}. ${m.requirement}`)
    .join('\n');
}

function corps(c: Candidat, organisation: string) {
  const manquantes = avancement(c).manquantes;
  const lignes = listeManquante(c);
  return {
    sujet: `${organisation} — ${manquantes.length} document${manquantes.length > 1 ? 's' : ''} still needed`,
    texte:
      `Hi ${c.prenom},\n\n` +
      `${organisation} still needs ${manquantes.length} document` +
      `${manquantes.length > 1 ? 's' : ''} to complete your academic file:\n\n` +
      `${lignes}\n\n` +
      `Once you send them, the certified English translations are produced and delivered for you.\n\n` +
      `Reference: ${c.reference}\n\n` +
      `— Protranslayte, on behalf of ${organisation}`,
  };
}

/* ---------- L'e-mail, envoyé pour de bon ---------- */

export async function envoyerRelanceEmail(
  c: Candidat,
  organisation: string,
): Promise<{ ok: true; adresse: string } | { ok: false; motif: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, motif: "L'envoi d'e-mails n'est pas configuré." };

  const adresse = await emailEtudiant(c);
  if (!adresse) {
    return {
      ok: false,
      motif: "Aucune adresse trouvée pour cet étudiant dans ses commandes.",
    };
  }

  const { sujet, texte } = corps(c, organisation);
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EXPEDITEUR,
    to: adresse,
    subject: sujet,
    text: texte,
    /* Une réponse de l'étudiant doit atterrir chez nous, pas dans le vide :
       c'est nous qui recevrons ses documents. */
    replyTo: INTERNE[0],
  });
  if (error) return { ok: false, motif: error.message };
  return { ok: true, adresse };
}

/* ---------- Le SMS, qui part de toi ---------- */

/* On n'envoie pas de SMS : il n'y a ni passerelle ni numéro d'étudiant en
   base — une commande recueille une adresse, jamais un téléphone. Ce que fait
   cette fonction est donc exactement ce qu'elle annonce : elle prépare le
   message et te l'envoie, pour que tu n'aies plus qu'à le faire partir. */
export async function signalerSmsAEnvoyer(c: Candidat, organisation: string, demandePar: string) {
  if (!process.env.RESEND_API_KEY) return { ok: false as const, motif: "L'envoi d'e-mails n'est pas configuré." };

  const adresse = await emailEtudiant(c);
  const { texte } = corps(c, organisation);

  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EXPEDITEUR,
    to: INTERNE,
    subject: `SMS à envoyer — ${c.prenom} ${c.nom} (${organisation})`,
    text:
      `${demandePar} a demandé un rappel par SMS depuis le portail ${organisation}.\n\n` +
      `Étudiant : ${c.prenom} ${c.nom}\n` +
      `Adresse connue : ${adresse ?? '— aucune —'}\n` +
      `Référence : ${c.reference}\n\n` +
      `--- Message à envoyer ---\n\n${texte}\n`,
  });
  if (error) return { ok: false as const, motif: error.message };
  return { ok: true as const };
}
