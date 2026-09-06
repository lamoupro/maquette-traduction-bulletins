import { ecrireFiche, lireFiche } from './stockage';
import { cpValide, emailValide, montantDe, referenceValide } from './commande';
import { deviseDuPays, deviseParCode } from './devises';

/* Rattache des coordonnées à un dépôt existant, et calcule le montant dû.

   Partagé par les deux chemins de paiement — carte et Apple Pay — pour
   qu'ils ne puissent pas diverger sur ce qui est exigé ni sur le prix. */

export type Coordonnees = {
  reference: string;
  email: string;
  prenom: string;
  nom: string;
  source: string;
  cible: string;
  remarque: string;
  envoiPostal: boolean;
  adresse: string;
  codePostal: string;
  ville: string;
  identiteRequise: boolean;
};

export type Refus = { erreur: string; statut: number };

export async function preparer(c: Coordonnees) {
  if (!referenceValide(c.reference)) {
    return { refus: { erreur: 'Référence de dossier invalide.', statut: 400 } as Refus };
  }
  if (!emailValide(c.email)) {
    return { refus: { erreur: 'Adresse e-mail invalide.', statut: 400 } as Refus };
  }
  if (c.identiteRequise && (!c.prenom || !c.nom)) {
    return { refus: { erreur: 'Coordonnées incomplètes.', statut: 400 } as Refus };
  }
  if (c.envoiPostal && (!c.adresse || !cpValide(c.codePostal) || !c.ville)) {
    return { refus: { erreur: 'Adresse postale incomplète.', statut: 400 } as Refus };
  }

  let depot;
  try {
    depot = await lireFiche(`commandes/${c.reference}/commande.json`);
  } catch {
    return { refus: { erreur: 'Dossier introuvable. Redéposez vos documents.', statut: 404 } as Refus };
  }

  // Un dossier déjà payé — ou déjà livré — ne doit jamais repartir en paiement.
  if (depot.statut === 'payee' || depot.statut === 'livree') {
    return { refus: { erreur: 'Cette commande est déjà réglée.', statut: 409 } as Refus };
  }

  /* Le nombre de pages vient du dépôt, jamais de la requête : c'est le
     serveur qui les a comptées dans les fichiers, le navigateur n'a pas
     voix au chapitre sur le prix. */
  /* La devise vient du dépôt, jamais de la requête en cours : c'est le pays
     d'où les documents ont été envoyés qui fait foi, pas celui d'où l'on paie.

     On résout par le PAYS et non par le seul code : plusieurs pays partagent
     l'euro, et un seul d'entre eux — la France — ouvre l'envoi postal. Chercher
     « la première devise en EUR » aurait proposé à un client marocain un
     courrier suivi qui ne dessert que la France métropolitaine. */
  const devise = depot.pays ? deviseDuPays(depot.pays) : deviseParCode(depot.devise);
  const { pages, montant } = montantDe(
    depot.pages ?? depot.fichiers?.length ?? 1,
    c.envoiPostal,
    devise,
  );

  const commande = {
    ...depot,
    statut: 'en_attente_paiement' as const,
    client: { email: c.email, prenom: c.prenom, nom: c.nom },
    langues: { source: c.source, cible: c.cible },
    pages,
    montant,
    devise: devise.code,
    langue: depot.langue ?? 'fr',
    envoiPostal: c.envoiPostal && Boolean(devise.envoi),
    adressePostale: c.envoiPostal
      ? { adresse: c.adresse, codePostal: c.codePostal, ville: c.ville }
      : null,
    remarque: c.remarque,
  };

  await ecrireFiche(c.reference, commande);
  return { commande, pages, montant, devise };
}
