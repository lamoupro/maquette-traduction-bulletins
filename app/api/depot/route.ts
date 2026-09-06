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
import { compterPages } from '@/lib/pages';
import { reconnaitre, refusDeType } from '@/lib/signature';
import { MAX_PAGES } from '@/lib/data';
import { deviseDuPays } from '@/lib/devises';

export const runtime = 'nodejs';

/* Dépôt des documents, avant toute décision d'achat.

   Deux raisons à ce découpage :

   — Apple Pay exige que sa feuille s'ouvre dans le geste même du doigt.
     Impossible d'y glisser un téléversement d'une à deux secondes.
   — Le prix se compte en pages, et seul le serveur peut les compter. Le
     dépôt est donc aussi le moment où le montant devient connu.

   Conséquence assumée : il existera des dossiers déposés jamais payés. Ils
   portent le statut « depose » et la purge des trente jours les emporte. */

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

  /* Lecture du nombre de pages avant tout stockage : inutile d'écrire des
     fichiers qu'on va refuser. Un PDF illisible est rejeté nommément plutôt
     que compté pour une page — sinon un document de vingt pages passerait à
     25 €, et l'erreur ne se verrait qu'à la livraison. */
  const contenus: { fichier: File; octets: Buffer; pages: number; mime: string }[] = [];
  for (const f of fichiers) {
    const octets = Buffer.from(await f.arrayBuffer());

    /* Le type réel, lu dans les octets déjà en mémoire : aucune lecture
       supplémentaire, le coût ne dépend pas de la taille du fichier. Le type
       annoncé par le navigateur ne sert plus que de premier tri dans
       refusFichiers ; à partir d'ici, c'est celui-ci qui fait foi — y compris
       pour compter les pages et pour l'étiquette posée sur le stockage. */
    const reel = reconnaitre(octets);
    if (!reel) {
      return NextResponse.json({ erreur: refusDeType(f.name) }, { status: 400 });
    }

    const pages = await compterPages(octets, reel.mime);
    if (pages === null) {
      return NextResponse.json(
        {
          erreur: `Nous n'arrivons pas à lire « ${f.name} ». Réenregistrez-le en PDF, ou photographiez chaque page.`,
        },
        { status: 400 },
      );
    }
    contenus.push({ fichier: f, octets, pages, mime: reel.mime });
  }

  const total = contenus.reduce((n, c) => n + c.pages, 0);
  if (total > MAX_PAGES) {
    return NextResponse.json(
      {
        erreur: `Votre dossier compte ${total} pages, au-delà des ${MAX_PAGES} traitées automatiquement. Écrivez-nous à contact@protranslayte.com, nous le prenons en charge.`,
      },
      { status: 400 },
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
    for (const [i, c] of contenus.entries()) {
      const cle = `commandes/${ref}/${String(i + 1).padStart(2, '0')}-${nomSur(c.fichier.name)}`;
      await deposer(cle, c.octets, c.mime);
      cles.push(cle);
    }

    /* Identifiant de clic publicitaire, s'il y en a un. Conservé avec la
       commande pour renvoyer la conversion à Google une fois le paiement
       confirmé — sans cookie déposé chez le visiteur. */
    const clic = String(donnees.get('clic') ?? '').trim().slice(0, 200) || null;

    /* La devise est arrêtée ICI, une fois pour toutes, d'après le pays d'où
       part la requête. Vercel le pose sur chaque appel ; en développement il
       est absent, et on retombe sur le dollar. Tout le reste du parcours —
       affichage, session Stripe, e-mails — relira cette valeur au lieu de la
       recalculer, pour qu'un prix vu ne puisse jamais différer d'un prix payé. */
    const pays = requete.headers.get('x-vercel-ip-country');
    const devise = deviseDuPays(pays);

    await ecrireFiche(ref, {
      reference: ref,
      recuLe: new Date().toISOString(),
      statut: 'depose',
      clic,
      pays,
      devise: devise.code,
      // Langue du site où la commande a été passée : elle décide de la langue
      // des e-mails, rien d'autre.
      langue: (String(donnees.get('langue') ?? '').trim() || 'fr').slice(0, 5),
      pages: total,
      fichiers: contenus.map((c) => ({
        nom: c.fichier.name,
        taille: c.fichier.size,
        type: c.mime,
        pages: c.pages,
      })),
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

  return NextResponse.json({
    reference: ref,
    nombre: contenus.length,
    pages: total,
    devise: deviseDuPays(requete.headers.get('x-vercel-ip-country')),
    detail: contenus.map((c) => ({ nom: c.fichier.name, pages: c.pages })),
  });
}
