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

  try {
    return NextResponse.redirect(await lienTemporaire(cle));
  } catch {
    return NextResponse.json({ erreur: 'Fichier introuvable.' }, { status: 404 });
  }
}
