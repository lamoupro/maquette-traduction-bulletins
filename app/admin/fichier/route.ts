import { NextResponse } from 'next/server';
import { estConnecte } from '@/lib/auth';
import { lienTemporaire } from '@/lib/stockage';

export const runtime = 'nodejs';

/* Redirige vers un lien signé, valable une heure. Le fichier n'est jamais
   servi depuis une adresse publique : sans session d'administration, aucun
   accès n'est possible. */
export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const cle = new URL(requete.url).searchParams.get('cle') ?? '';
  // On n'accepte que les clés du dossier des commandes, sans remontée de chemin.
  if (!cle.startsWith('commandes/') || cle.includes('..')) {
    return NextResponse.json({ erreur: 'Clé invalide.' }, { status: 400 });
  }

  // ?dl=1 force l'enregistrement ; sans ce paramètre, le document s'ouvre
  // dans le navigateur, ce qui reste le geste le plus rapide pour vérifier.
  const telecharger = new URL(requete.url).searchParams.get('dl') === '1';
  const nom = cle.split('/').pop() || 'document';

  try {
    return NextResponse.redirect(await lienTemporaire(cle, 3600, telecharger ? nom : undefined));
  } catch {
    return NextResponse.json({ erreur: 'Fichier introuvable.' }, { status: 404 });
  }
}
