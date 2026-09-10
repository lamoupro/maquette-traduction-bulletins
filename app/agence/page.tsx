import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/agence/auth';
import { db } from '@/lib/agence/db/client';
import { membres, organisations } from '@/lib/agence/db/schema';
import './agence.css';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

/* La racine du portail agence. Il n'existe pas d'ANNUAIRE public des
   organisations clientes — une agence n'a rien à faire dans la liste d'une
   autre — donc cette page ne peut faire qu'une chose utile : si quelqu'un
   est déjà connecté (à une autre organisation, par exemple), lui montrer
   celles auxquelles son compte appartient. Sinon, expliquer où aller plutôt
   que renvoyer un 404 sec. */

export default async function RacineAgence() {
  const session = await auth();

  const mesOrganisations = session?.user?.id
    ? await db
        .select({ slug: organisations.slug, nom: organisations.nom, role: membres.role })
        .from(membres)
        .innerJoin(organisations, eq(organisations.id, membres.organisationId))
        .where(and(eq(membres.userId, session.user.id), eq(membres.statut, 'actif')))
    : [];

  return (
    <div className="pt">
      <main className="pt-entree">
        <div className="pt-carte">
          <span className="pt-cartouche">
            <span className="pt-notre-marque">
              pro<span className="bleu">translayte</span>
            </span>
          </span>
          <h1>Partner document portal</h1>
          {mesOrganisations.length > 0 ? (
            <>
              <p>Your account has access to:</p>
              <div className="pt-connexion-boutons">
                {mesOrganisations.map((o) => (
                  <a key={o.slug} href={`/agence/${o.slug}`} className="pt-bouton-fournisseur">
                    {o.nom} <span style={{ marginLeft: 'auto', color: 'var(--pt-faint)' }}>{o.role}</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <p>
              Use the link your organisation gave you to sign in — this page doesn&apos;t list
              organisations on its own.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
