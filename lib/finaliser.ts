import { ecrireFiche, lireFiche } from './stockage';
import { cpValide, emailValide, montantDe, referenceValide } from './commande';

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
  quantite: number;
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

  // Un dossier déjà payé ne doit jamais repartir en paiement.
  if (depot.statut === 'payee') {
    return { refus: { erreur: 'Cette commande est déjà réglée.', statut: 409 } as Refus };
  }

  // La quantité ne peut pas dépasser ce qui a réellement été déposé.
  const deposes = depot.fichiers?.length ?? 1;
  const { quantite, montant } = montantDe(Math.max(c.quantite, deposes), c.envoiPostal);

  const commande = {
    ...depot,
    statut: 'en_attente_paiement' as const,
    client: { email: c.email, prenom: c.prenom, nom: c.nom },
    langues: { source: c.source, cible: c.cible },
    quantite,
    montant,
    envoiPostal: c.envoiPostal,
    adressePostale: c.envoiPostal
      ? { adresse: c.adresse, codePostal: c.codePostal, ville: c.ville }
      : null,
    remarque: c.remarque,
  };

  await ecrireFiche(c.reference, commande);
  return { commande, quantite, montant };
}
