import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_LANGUE, LANGUE_RACINE, LANGUES, langueChoisie } from '@/lib/langues';

/* Aiguillage de la langue, au premier passage seulement.

   Le point important est ce que ce fichier NE fait PAS : il ne sert jamais
   deux langues sur la même adresse. Chaque langue a la sienne — le français à
   la racine, les autres sous /en, /es, /pt.

   Sans quoi Google, qui explore depuis les États-Unis, ne verrait jamais que
   l'anglais, et les pages françaises disparaîtraient de Google.fr. C'est
   l'activité qui tourne aujourd'hui : on ne la sacrifie pas pour un confort
   d'affichage.

   Le rôle du middleware se réduit donc à une redirection, une seule fois,
   quand quelqu'un arrive à la racine sans avoir jamais choisi. Ensuite son
   cookie décide.

   Il pose aussi `x-langue` sur chaque requête : c'est ainsi que le gabarit
   racine sait quoi mettre dans l'attribut `lang` du document, information que
   Next ne lui donne pas autrement. */

const PREFIXES = LANGUES.filter((l) => l !== LANGUE_RACINE);

export function middleware(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  const prefixe = PREFIXES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (prefixe) {
    const r = NextResponse.next();
    r.headers.set('x-langue', prefixe);
    return r;
  }

  /* Seule la page d'accueil redirige. Ailleurs, on ne déplace personne : une
     adresse partagée doit mener où elle dit, et une redirection surprise au
     milieu d'un parcours de paiement serait pire que tout. */
  if (pathname === '/') {
    const voulue = langueChoisie({
      memorisee: requete.cookies.get(COOKIE_LANGUE)?.value,
      accept: requete.headers.get('accept-language'),
      pays: requete.headers.get('x-vercel-ip-country'),
    });
    // `null` = aucun signal : on reste sur la racine française, on ne devine pas.
    if (voulue && voulue !== LANGUE_RACINE) {
      return NextResponse.redirect(new URL(`/${voulue}`, requete.url));
    }
  }

  const r = NextResponse.next();
  r.headers.set('x-langue', LANGUE_RACINE);
  return r;
}

export const config = {
  /* On écarte les fichiers, l'API et l'administration : rien à aiguiller, et
     une redirection y ferait des dégâts. */
  matcher: ['/((?!api|admin|portal|_next|.*\\..*).*)'],
};
