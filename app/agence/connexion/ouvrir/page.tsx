import { organisation } from '@/lib/agence/organisations';
import Ouvrir from './Ouvrir';
import '../../agence.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Sign in — Protranslayte',
  robots: { index: false, follow: false },
};

/* L'écran que porte le lien envoyé par e-mail.

   Il ne consomme rien en se chargeant : c'est TOUT son intérêt. Le jeton reste
   intact tant que personne n'a cliqué, ce qui met le lien hors de portée des
   machines qui visitent les liens avant leur destinataire — l'aperçu WhatsApp,
   Outlook Safe Links, les antivirus de messagerie. Voir la longue note dans
   lib/agence/auth.ts, sendVerificationRequest.

   LE CONTRÔLE D'ADRESSE CI-DESSOUS N'EST PAS DÉCORATIF. Cette page reçoit une
   adresse dans son URL et envoie le visiteur dessus : sans vérification, elle
   serait une redirection ouverte sous notre domaine — le genre de page qu'on
   met dans un e-mail d'hameçonnage précisément parce que le début de l'adresse
   inspire confiance. On n'accepte donc que nos propres hôtes. */

const RACINE = 'protranslayte.com';

function adresseSure(brut: string | undefined): string | null {
  if (!brut) return null;
  let u: URL;
  try {
    u = new URL(brut);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const hote = u.hostname.toLowerCase();
  const chezNous = hote === RACINE || hote.endsWith(`.${RACINE}`) || hote === 'localhost';
  if (!chezNous) return null;
  // Et seulement la route d'authentification : rien d'autre n'a de raison
  // d'être atteint par un lien reçu dans une boîte mail.
  if (!u.pathname.startsWith('/api/agence-auth/')) return null;
  return u.toString();
}

export default async function OuvrirLien({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; o?: string }>;
}) {
  const { u, o } = await searchParams;
  const cible = adresseSure(u);

  /* Le nom affiché vient de la BASE, jamais de l'adresse : on ne reprend que
     l'identifiant pour aller le chercher. Sinon n'importe qui fabriquerait un
     lien affichant le nom de l'organisation de son choix. */
  const org = o ? await organisation({ slug: o }) : null;

  return (
    <div className="pt est-revele">
      <main className="pt-entree">
        <div className="pt-carte">
          <span className="pt-cartouche">
            <span className="pt-notre-marque">
              pro<span className="bleu">translayte</span>
            </span>
            {org && (
              <>
                <span className="pt-croix" aria-hidden="true">×</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="pt-logo-org"
                  src={org.logo}
                  alt={org.nom}
                  width={org.logoLargeur}
                  height={org.logoHauteur}
                />
              </>
            )}
          </span>

          {cible ? (
            <>
              <span className="pt-carte-lab">One last step</span>
              <h1>Sign in to {org?.nom ?? 'the document portal'}</h1>
              <p>
                You asked for a sign-in link. Confirm below and you&apos;re in — this is the step
                that keeps the link working even after your mail app has opened it for you.
              </p>
              <Ouvrir cible={cible} />
              <p className="pt-carte-pied">
                Didn&apos;t ask for this? Close this page — nothing happens until you confirm.
              </p>
            </>
          ) : (
            <>
              <span className="pt-carte-lab">Link not valid</span>
              <h1>This link can&apos;t be opened</h1>
              <p>
                It looks incomplete — mail apps sometimes cut long links in half. Ask for a new
                one from your organisation&apos;s portal address.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
