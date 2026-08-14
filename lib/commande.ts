import { MAX_DOCS, PRIX_ENVOI, PRIX_OFFRE } from './data';

/* Règles partagées entre le dépôt, le paiement par carte et le paiement
   express. Les avoir en un seul endroit évite qu'une des trois routes
   dérive et accepte ce que les deux autres refusent. */

export const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo par fichier
const TYPES_OK = ['application/pdf', 'image/'];

export const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const cpValide = (v: string) => /^\d{5}$/.test(v.trim());

/** Référence lisible : PT-AAMMJJ-XXXX */
export function reference() {
  const d = new Date();
  const jour = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alea = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PT-${jour}-${alea}`;
}

/** Vérifie un lot de fichiers. Renvoie le motif du refus, ou null. */
export function refusFichiers(fichiers: File[]): string | null {
  if (fichiers.length === 0) return 'Aucun document reçu.';
  if (fichiers.length > MAX_DOCS) return `Maximum ${MAX_DOCS} documents par commande.`;
  for (const f of fichiers) {
    if (f.size > TAILLE_MAX) return `« ${f.name} » dépasse 10 Mo.`;
    if (!TYPES_OK.some((t) => f.type.startsWith(t))) {
      return `« ${f.name} » n'est ni un PDF ni une image.`;
    }
  }
  return null;
}

/* Le montant est toujours recalculé côté serveur. Le navigateur peut
   proposer un prix, il ne le décide jamais. */
export function montantDe(quantite: number, envoiPostal: boolean) {
  const q = Math.max(1, Math.min(MAX_DOCS, quantite || 1));
  return { quantite: q, montant: q * PRIX_OFFRE + (envoiPostal ? PRIX_ENVOI : 0) };
}

/** Une référence est-elle bien formée ? Garde-fou avant toute lecture. */
export const referenceValide = (v: string) => /^PT-\d{6}-[A-Z0-9]{4}$/.test(v);
