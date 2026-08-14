import Link from 'next/link';
import { stripe, stripeConfigure } from '@/lib/stripe';
import Logo from '@/components/Logo';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Commande confirmée — Protranslayte',
  robots: { index: false, follow: false },
};

/* Page d'arrivée après le paiement.

   Elle informe, elle ne décide pas : la commande est marquée payée par le
   webhook, pas ici. Cette page peut ne jamais être vue — un client qui ferme
   son onglet est traité exactement pareil. */

export default async function Retour({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let etat: 'paye' | 'en_cours' | 'inconnu' = 'inconnu';
  let reference: string | null = null;
  let email: string | null = null;
  let montant: number | null = null;

  if (session_id && stripeConfigure()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      reference = s.metadata?.reference ?? s.client_reference_id ?? null;
      email = s.customer_details?.email ?? null;
      montant = (s.amount_total ?? 0) / 100;
      etat = s.payment_status === 'paid' ? 'paye' : 'en_cours';
    } catch {
      etat = 'inconnu';
    }
  }

  return (
    <>
      <header className="legal-tete">
        <div className="wrap">
          <Link href="/" aria-label="Retour à l'accueil">
            <Logo />
          </Link>
          <Link href="/" className="legal-retour">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="legal">
        <div className="wrap" style={{ maxWidth: 560 }}>
          {etat === 'paye' ? (
            <>
              <h1>Merci, votre commande est confirmée</h1>
              <p className="legal-intro">
                Votre paiement de{' '}
                <strong>
                  {montant?.toLocaleString('fr-FR', {
                    minimumFractionDigits: Number.isInteger(montant) ? 0 : 2,
                  })}
                  &nbsp;€
                </strong>{' '}
                a bien été enregistré. Un traducteur assermenté prend votre dossier en charge.
              </p>

              {reference ? (
                <p className="legal-encadre">
                  <strong>Votre référence : {reference}</strong>
                  <br />
                  Conservez-la, elle nous permet de retrouver votre dossier immédiatement.
                </p>
              ) : null}

              <h2>Ce qui se passe maintenant</h2>
              <ul>
                <li>
                  Un récapitulatif vient de partir{email ? ` à l'adresse ${email}` : ''}. Vérifiez
                  vos courriers indésirables s’il n’apparaît pas.
                </li>
                <li>La traduction certifiée vous parvient sous 24 à 48 heures ouvrées.</li>
                <li>
                  Si quelque chose ne va pas, écrivez-nous : vous êtes couvert par la garantie de
                  remboursement de 30 jours, sans justification.
                </li>
              </ul>

              <p>
                Une question ? <a href="mailto:contact@protranslayte.com">contact@protranslayte.com</a>
              </p>
            </>
          ) : etat === 'en_cours' ? (
            <>
              <h1>Paiement en cours de validation</h1>
              <p className="legal-intro">
                Votre banque n’a pas encore confirmé l’opération. C’est fréquent avec certains
                moyens de paiement et ça ne demande aucune action de votre part.
              </p>
              <p>
                Dès la confirmation reçue, un récapitulatif vous sera envoyé par courrier
                électronique et la traduction sera lancée. Si vous n’avez rien reçu d’ici demain,
                écrivez-nous à{' '}
                <a href="mailto:contact@protranslayte.com">contact@protranslayte.com</a>.
              </p>
            </>
          ) : (
            <>
              <h1>Nous n’avons pas pu vérifier ce paiement</h1>
              <p className="legal-intro">
                Cette page ne reconnaît pas la commande. Cela n’a rien d’alarmant : si vous avez
                reçu un courrier de confirmation, votre dossier est bien enregistré.
              </p>
              <p>
                Dans le doute, écrivez-nous à{' '}
                <a href="mailto:contact@protranslayte.com">contact@protranslayte.com</a> — nous
                vérifions et nous vous répondons sous un jour ouvré.
              </p>
              <p>
                <Link href="/">Retourner à l’accueil</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}
