'use client';

import { useEffect } from 'react';
import { effacerEnAttente } from '@/lib/memoire';

/* Efface la commande mémorisée une fois le paiement abouti.

   Sans ça, le visiteur qui revient sur l'accueil se verrait proposer de
   « reprendre » une commande déjà réglée — et pourrait la payer deux fois.
   Le brouillon, lui, est conservé : il fait gagner du temps au client qui
   revient, et ne présente aucun risque. */

export default function NettoyerCommande() {
  useEffect(() => {
    effacerEnAttente();
  }, []);
  return null;
}
