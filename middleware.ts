import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_LANGUE, LANGUE_RACINE, LANGUES, langueChoisie } from '@/lib/langues';
import { orgDuSousDomaine } from '@/lib/agence/host';

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

  /* Un sous-domaine de client — trackhouse.protranslayte.com — porte
     l'organisation dans son HÔTE, pas dans son chemin. On la reporte dans le
     chemin ICI, en interne, pour que tout le reste du code (pages, routes,
     lib/agence/acces.ts…) continue de la lire comme il l'a toujours fait,
     sous /agence/[org]/… Rien de ce qui vient après ce bloc ne sait qu'un
     sous-domaine a existé.

     Le garde-fou `!pathname.startsWith('/agence/')` évite de doubler le
     préfixe si l'adresse longue est redemandée depuis le sous-domaine lui-même
     — ce qui arrive après une redirection construite avec l'hôte réel plutôt
     qu'avec l'adresse courte (voir lib/agence/host.ts, adresseAgence). */
  const orgSlug = orgDuSousDomaine(requete.headers.get('host'));
  if (orgSlug && !pathname.startsWith('/agence/')) {
    const cible = requete.nextUrl.clone();
    cible.pathname = `/agence/${orgSlug}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(cible);
  }

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
