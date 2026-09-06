import type { Metadata } from 'next';
import Accueil from '@/components/Accueil';
import { textes } from '@/lib/traductions';

/* Le français vit À LA RACINE, sans préfixe de langue.

   C'est le site qui tourne et qui est référencé sur Google.fr depuis août. Le
   déplacer sous /fr casserait ses adresses et son référencement pour un gain
   de symétrie. Les trois autres langues sont sous app/[langue]. */

export const metadata: Metadata = {
  title: textes('fr').meta.titre,
  description: textes('fr').meta.description,
};

export default function Page() {
  return <Accueil langue="fr" />;
}
