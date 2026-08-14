import { NextResponse } from 'next/server';
import { deposer, ecrireFiche, nomSur, stockageConfigure } from '@/lib/stockage';
import { reference, refusFichiers } from '@/lib/commande';

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

  const ref = reference();

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
  } catch (e) {
    console.error('[depot] échec du stockage', e);
    return NextResponse.json(
      { erreur: "Nous n'avons pas pu enregistrer vos documents. Réessayez." },
      { status: 500 },
    );
  }

  return NextResponse.json({ reference: ref, nombre: fichiers.length });
}
