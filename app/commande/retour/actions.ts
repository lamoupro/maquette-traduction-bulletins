'use server';

import { deposer, lireOctets, stockageConfigure } from '@/lib/stockage';
import { stripe, stripeConfigure } from '@/lib/stripe';
import { referenceValide } from '@/lib/commande';
import { type InfosNcaa, ncaaIdValide } from '@/lib/ncaa';

/* L'étape qui suit le paiement : le NCAA ID, la date de naissance, le
   téléphone.

   POURQUOI APRÈS, ET PAS AVANT. Le parcours d'achat n'a pas bougé d'une
   ligne : chaque champ ajouté avant le paiement est un client qui abandonne,
   et ces trois-là ne servent qu'aux athlètes — une minorité des commandes.
   Après paiement, la personne est déjà cliente : lui demander trois champs
   ne coûte plus rien, et ce qu'on lui rend en échange est considérable.

   CE QUI AUTORISE L'ÉCRITURE. Jamais la référence envoyée par le navigateur :
   elle est courte et devinable, et quiconque en essaierait quelques-unes
   écrirait dans le dossier d'un autre. On repart de l'identifiant de session
   Stripe, qu'on revérifie auprès de Stripe — payée, et c'est elle qui nous
   donne la référence. */

export type ResultatNcaa = { ok?: true; erreur?: string } | undefined;

/* Rangé À CÔTÉ de la fiche de commande, pas dedans. Le webhook Stripe
   réécrit la fiche entière quand le paiement se confirme : y glisser ces
   champs, c'est accepter qu'ils disparaissent un jour sans laisser de trace. */
const cleNcaa = (reference: string) => `commandes/${reference}/ncaa.json`;

export async function lireNcaa(reference: string): Promise<InfosNcaa | null> {
  if (!stockageConfigure()) return null;
  try {
    const octets = await lireOctets(cleNcaa(reference));
    return JSON.parse(octets.toString('utf8')) as InfosNcaa;
  } catch {
    return null;
  }
}

export async function enregistrerNcaa(
  sessionId: string,
  donnees: { id: string; naissance: string; telephone: string },
): Promise<ResultatNcaa> {
  if (!stripeConfigure() || !stockageConfigure()) {
    return { erreur: "L'enregistrement n'est pas disponible pour le moment." };
  }

  let reference: string | null = null;
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== 'paid') return { erreur: 'Paiement non confirmé.' };
    reference = s.metadata?.reference ?? s.client_reference_id ?? null;
  } catch {
    return { erreur: 'Session de paiement introuvable.' };
  }
  if (!reference || !referenceValide(reference)) return { erreur: 'Commande introuvable.' };

  const id = donnees.id.replace(/\s/g, '');
  if (!ncaaIdValide(id)) {
    return { erreur: 'Le NCAA ID ne contient que des chiffres (6 à 14).' };
  }

  const infos: InfosNcaa = {
    id,
    naissance: donnees.naissance || undefined,
    telephone: donnees.telephone.trim() || undefined,
    enregistreLe: new Date().toISOString(),
  };

  await deposer(
    cleNcaa(reference),
    Buffer.from(JSON.stringify(infos, null, 2), 'utf8'),
    'application/json',
  );
  return { ok: true };
}
