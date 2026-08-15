import { NextResponse } from 'next/server';
import { estConnecte } from '@/lib/auth';
import { lireFiche, listerCommandes } from '@/lib/stockage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Export des conversions pour Google Ads, sans cookie ni bannière.

   Le principe : quand un visiteur arrive d'une annonce, Google ajoute un
   identifiant de clic à l'adresse. On le garde sur son appareil, on
   l'attache à la commande au dépôt, et on le renvoie à Google une fois le
   paiement encaissé — depuis le serveur, en différé.

   Aucun traceur n'est déposé, rien n'est transmis à un tiers pendant la
   visite. La mesure est même plus fiable qu'une balise : ni bloqueur de
   publicité, ni navigateur restrictif ne peuvent l'empêcher.

   Le fichier produit se dépose dans Google Ads :
   Objectifs → Conversions → Importer → Importer les conversions hors
   connexion. */

const NOM_CONVERSION = 'Commande protranslayte';

/** Google attend « aaaa-MM-jj hh:mm:ss », dans le fuseau déclaré en tête. */
function horodatage(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  // Paris = UTC+2 en été, UTC+1 en hiver. On déclare le décalage explicitement
  // plutôt que de dépendre du fuseau du serveur, qui est en UTC chez Vercel.
  const dec = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(d);
  const v = (t: string) => dec.find((x) => x.type === t)?.value ?? '00';
  return `${v('year')}-${v('month')}-${v('day')} ${v('hour')}:${v('minute')}:${p(Number(v('second')))}`;
}

export async function GET() {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const objets = await listerCommandes();
  const lignes: string[] = [];

  for (const o of objets.filter((x) => x.cle.endsWith('/commande.json'))) {
    try {
      const f = await lireFiche(o.cle);
      // Seules les commandes payées et venues d'une annonce nous intéressent.
      if (f.statut !== 'payee' || !f.clic) continue;
      const montant = f.stripe?.montantEncaisse ?? f.montant ?? 0;
      lignes.push(
        [
          f.clic,
          NOM_CONVERSION,
          horodatage(f.payeLe ?? f.recuLe),
          String(montant).replace(',', '.'),
          'EUR',
        ].join(','),
      );
    } catch {
      /* fiche illisible : on l'ignore plutôt que de casser l'export */
    }
  }

  const csv = [
    'Parameters:TimeZone=Europe/Paris',
    'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency',
    ...lignes,
  ].join('\n');

  const jour = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="conversions-protranslayte-${jour}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
