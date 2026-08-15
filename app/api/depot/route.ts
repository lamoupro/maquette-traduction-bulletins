import { NextResponse } from 'next/server';
import {
  deposer,
  ecrireFiche,
  lireFiche,
  nomSur,
  stockageConfigure,
  supprimer,
} from '@/lib/stockage';
import { reference, referenceValide, refusFichiers } from '@/lib/commande';

export const runtime = 'nodejs';

/* Dépôt des documents, avant toute décision d'achat.

   Motif : Apple Pay exige que sa feuille s'ouvre dans le geste même du
   doigt. Impossible d'y glisser un téléversement d'une à deux secondes —
   Safari refuserait. Les fichiers partent donc pendant que le visiteur
   saisit son adresse, et le paiement n'a plus qu'à les référencer.

   Conséquence assumée : il existera des dossiers déposés jamais payés. Ils
   portent le statut « depose », n'apparaissent jamais comme des commandes,
   et la purge des trente jours les emporte comme les autres. */

export async function POST(requete: Request) {
  let donnees: FormData;
  try {
    donnees = await requete.formData();
  } catch {
    return NextResponse.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }

  const fichiers = donnees.getAll('fichiers').filter((f): f is File => f instanceof File);
  const refus = refusFichiers(fichiers);
  if (refus) return NextResponse.json({ erreur: refus }, { status: 400 });

  if (!stockageConfigure()) {
    console.error('[depot] stockage non configuré');
    return NextResponse.json(
      { erreur: 'Le dépôt est momentanément indisponible. Réessayez dans quelques minutes.' },
      { status: 503 },
    );
  }

  /* Le visiteur peut ajouter des documents en plusieurs fois. On réutilise
     alors la même référence et on remplace intégralement son contenu :
     créer un dépôt par sélection laisserait les premiers fichiers orphelins,
     stockés et facturés par personne. */
  const ancienne = String(donnees.get('reference') ?? '').trim();
  let ref = reference();
  let aPurger: string[] = [];

  if (referenceValide(ancienne)) {
    try {
      const fiche = await lireFiche(`commandes/${ancienne}/commande.json`);
      // Un dossier déjà payé ou en cours de paiement ne se réécrit pas.
      if (fiche.statut === 'depose') {
        ref = ancienne;
        aPurger = fiche.cles ?? [];
      }
    } catch {
      /* référence inconnue : on repart sur un dépôt neuf */
    }
  }

  try {
    const cles: string[] = [];
    for (const [i, f] of fichiers.entries()) {
      const cle = `commandes/${ref}/${String(i + 1).padStart(2, '0')}-${nomSur(f.name)}`;
      await deposer(cle, Buffer.from(await f.arrayBuffer()), f.type);
      cles.push(cle);
    }
    await ecrireFiche(ref, {
      reference: ref,
      recuLe: new Date().toISOString(),
      statut: 'depose',
      fichiers: fichiers.map((f) => ({ nom: f.name, taille: f.size, type: f.type })),
      cles,
    });

    // Les anciens fichiers ne partent qu'une fois les nouveaux en place : en
    // cas d'échec au milieu, mieux vaut un doublon qu'un dossier vide.
    for (const vieille of aPurger) {
      if (!cles.includes(vieille)) await supprimer(vieille).catch(() => {});
    }
  } catch (e) {
    console.error('[depot] échec du stockage', e);
    return NextResponse.json(
      { erreur: "Nous n'avons pas pu enregistrer vos documents. Réessayez." },
      { status: 500 },
    );
  }

  return NextResponse.json({ reference: ref, nombre: fichiers.length });
}
