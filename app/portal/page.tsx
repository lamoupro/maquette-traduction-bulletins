import Link from 'next/link';
import { redirect } from 'next/navigation';
import { peutVoirLaDemo } from '@/lib/auth';
import {
  CANDIDATS,
  EXIGENCES,
  SPORT_ENTRAINEUR,
  avancement,
  dansLePerimetre,
} from '@/lib/portail-demo';

/* Liste des candidats internationaux.

   L'ordre n'est pas alphabétique : ce qui appelle une action passe devant.
   Un tableau d'admission se lit pour savoir quoi faire, pas pour retrouver un
   nom — la recherche s'en chargera. */

export default async function Portail({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;

  // La garde est ICI, pas sur le gabarit : celui-ci couvre aussi la page
  // d'entrée, et l'y placer la faisait se rediriger vers elle-même.
  if (!(await peutVoirLaDemo())) redirect('/portal/sign-in');
  const coach = view === 'coach';

  const rangs = { manque: 0, attente: 1, ok: 2 };
  const lignes = CANDIDATS.filter((c) => dansLePerimetre(c, coach))
    .map((c) => ({ c, a: avancement(c) }))
    .sort(
    (x, y) => rangs[x.a.resume.ton] - rangs[y.a.resume.ton],
  );

  const total = lignes.length;
  const complets = lignes.filter((l) => l.a.resume.ton === 'ok').length;
  const bloques = lignes.filter((l) => l.a.resume.ton === 'manque').length;

  return (
    <main className="pt-wrap">
      <div className="pt-titre">
        <h1>{coach ? 'Your recruits' : 'International applicants'}</h1>
        <p>
          {coach ? (
            /* Rien d'autre : le tableau dit le reste. Une version antérieure
               expliquait ici le modèle de permissions — « other sports are not
               visible to you » — ce qui rassurait le produit, pas l'entraîneur,
               qui ne s'attendait pas à voir les autres sports. */
            <>
              {SPORT_ENTRAINEUR} · {total} recruit{total > 1 ? 's' : ''}
            </>
          ) : (
            <>
              {total} applicants · {complets} complete · {bloques} waiting on the student. Each file
              is checked against the {EXIGENCES.length} documents this institution requires.
            </>
          )}
        </p>
      </div>

      <div className="pt-liste">
        <div className="pt-liste-tete" aria-hidden="true">
          <span>Applicant</span>
          <span>Country</span>
          <span>Sport</span>
          <span>Term</span>
          <span>Documents</span>
          <span>Status</span>
        </div>

        {lignes.map(({ c, a }) => (
          <Link
            key={c.id}
            className="pt-ligne"
            href={coach ? `/portal/${c.id}?view=coach` : `/portal/${c.id}`}
          >
            <span className="pt-cellule">
              <span className="pt-nom">
                {c.prenom} {c.nom}
              </span>
              <span className="pt-sous pt-mono">{c.reference}</span>
            </span>
            <span className="pt-cellule" data-lab="Country">
              <span aria-hidden="true">{c.drapeau}</span> {c.pays}
            </span>
            <span className="pt-cellule" data-lab="Sport">
              {c.sport}
            </span>
            <span className="pt-cellule" data-lab="Term">
              {c.entree}
            </span>
            <span className="pt-cellule" data-lab="Documents">
              <span className="pt-jauge">
                <span className="pt-jauge-piste">
                  <span
                    className={`pt-jauge-part${a.resume.ton === 'ok' ? ' ok' : ''}`}
                    style={{ width: `${Math.round((a.recues / a.attendues) * 100)}%` }}
                  />
                </span>
                <span className="pt-mono">
                  {a.recues}/{a.attendues}
                </span>
              </span>
            </span>
            <span className="pt-cellule">
              <span className={`pt-etat ${a.resume.ton}`}>{a.resume.texte}</span>
            </span>
          </Link>
        ))}
      </div>

      {!coach && (
        <section className="pt-sortie">
          <h2>How files are delivered</h2>
          <p>
            Each applicant is delivered as a single certified document — every record in its
            original language, followed by its English translation, closed by a certificate of
            accuracy. Records are never distributed separately, and any alteration voids the
            document. Open an applicant to download their file.
          </p>
          <p style={{ marginBottom: 0 }}>
            This portal is a staging area, not a system of record. Once a file has been taken into
            your own system, you can remove it here and nothing is retained on our side.
          </p>
        </section>
      )}

    </main>
  );
}
