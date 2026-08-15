'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import PaiementStripe from './PaiementStripe';
import { effacerEnAttente, lireEnAttente, type EnAttente } from '@/lib/memoire';

const eur = (n: number) =>
  `${n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })} €`;

export default function PagePaiement() {
  const router = useRouter();
  const [etat, setEtat] = useState<EnAttente | null | 'chargement'>('chargement');

  useEffect(() => {
    setEtat(lireEnAttente());
  }, []);

  if (etat === 'chargement') {
    return (
      <main className="paiement-page">
        <p className="paiement-attente">Chargement du paiement…</p>
      </main>
    );
  }

  // Plus rien en mémoire : session expirée, autre appareil, ou stockage vidé.
  if (!etat) {
    return (
      <>
        <EnTete />
        <main className="paiement-page">
          <div className="paiement-carte">
            <h1>Nous n’avons pas retrouvé votre commande</h1>
            <p>
              Le paiement a peut-être expiré, ou vous avez changé d’appareil. Vos documents ne sont
              pas perdus : si vous avez déjà payé, un courrier de confirmation vous a été envoyé.
            </p>
            <p>
              Dans le doute, écrivez-nous à{' '}
              <a href="mailto:contact@protranslayte.com">contact@protranslayte.com</a> en indiquant
              votre adresse e-mail — nous retrouvons votre dossier.
            </p>
            <Link className="btn btn-primary btn-block" href="/">
              Retourner à l’accueil
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <EnTete />
      <main className="paiement-page">
        <div className="paiement-carte">
          <div className="paiement-tete">
            <span className="eyebrow">Paiement sécurisé</span>
            <span className="ref tabular">DOSSIER N° {etat.reference}</span>
          </div>

          <div className="paiement-recap">
            <div>
              <span>Traduction assermentée</span>
              <span className="tabular">
                {etat.pages} page{etat.pages > 1 ? 's' : ''} · {etat.source} → {etat.cible}
              </span>
            </div>
            {etat.postal ? (
              <div>
                <span>Envoi de l’original par courrier</span>
                <span className="tabular">inclus</span>
              </div>
            ) : null}
            <div className="paiement-total">
              <span>Total</span>
              <span className="tabular">{eur(etat.montant)}</span>
            </div>
          </div>

          <PaiementStripe clientSecret={etat.clientSecret} />

          <div className="paiement-rassure">
            <span>Paiement chiffré, traité par Stripe</span>
            <span>Satisfait ou remboursé 30 jours</span>
            <span>Livraison sous 24 à 48 h ouvrées</span>
          </div>

          <button
            type="button"
            className="lien-discret"
            onClick={() => {
              effacerEnAttente();
              router.push('/');
            }}
          >
            Annuler et revenir au site
          </button>
        </div>
      </main>
    </>
  );
}

/* En-tête minimal : le logo ramène à l'accueil, et c'est tout. C'est
   exactement ce qui manquait — un visiteur bloqué sur le paiement n'avait
   aucune sortie. */
function EnTete() {
  return (
    <header className="paiement-entete">
      <Link href="/" aria-label="Retour à l’accueil">
        <Logo />
      </Link>
    </header>
  );
}
