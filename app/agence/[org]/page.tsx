import Link from 'next/link';
import { garde } from '@/lib/agence/garde';
import { sportifsDe, vocabulaireDe } from '@/lib/agence/sportifs';
import { avancement, exigences } from '@/lib/portail-demo';
import { ajoutsParSportif, fusionnerAjouts } from '@/lib/agence/suivi';
import EnTete from './EnTete';

export const dynamic = 'force-dynamic';

/* L'accueil du portail réel : le vivier de l'organisation.

   L'ordre n'est pas alphabétique — ce qui appelle une action passe devant.
   Un tableau de suivi se lit pour savoir quoi faire, pas pour retrouver un
   nom ; la recherche s'en chargera le jour où la liste sera longue. */

export default async function Sportifs({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await garde(slug);

  const pa = vocabulaireDe(slug);
  const rangs = { manque: 0, attente: 1, ok: 2 };
  /* Les pièces ajoutées à la main comptent ici aussi : une liste qui annonce
     « 1 document outstanding » sur un dossier que la fiche dit complet est
     pire que pas de compteur du tout. */
  const ajouts = await ajoutsParSportif(ctx.org.id);
  const lignes = sportifsDe(slug)
    .map((c) => fusionnerAjouts(c, ajouts.get(c.id) ?? []))
    .map((c) => ({ c, a: avancement(c) }))
    .sort((x, y) => rangs[x.a.resume.ton] - rangs[y.a.resume.ton]);

  const total = lignes.length;
  const complets = lignes.filter((l) => l.a.resume.ton === 'ok').length;
  const bloques = lignes.filter((l) => l.a.resume.ton === 'manque').length;

  return (
    <>
      <EnTete ctx={ctx} actuel="sportifs" />

      <main className="pt-wrap">
        <div className="pt-titre">
          <h1>{ctx.org.nom} athletes</h1>
          <p>
            {total === 0 ? (
              <>No athletes on file yet.</>
            ) : (
              <>
                {total} athletes · {complets} complete · {bloques} waiting on the student. Each
                file is checked against the {pa ? exigences(pa).length : 0} records a US program
                asks for.
              </>
            )}
          </p>
        </div>

        {total === 0 ? (
          <section className="pt-sortie">
            <h2>Nothing here yet</h2>
            <p style={{ marginBottom: 0 }}>
              As soon as an athlete&apos;s records are sent to us, their file appears here — every
              record in its original language, its certified English translation beside it, and
              one certified document to hand on.
            </p>
          </section>
        ) : (
          <>
            <div className="pt-liste">
              <div className="pt-liste-tete" aria-hidden="true">
                <span>Athlete</span>
                <span>Country</span>
                <span>Event</span>
                <span>Term</span>
                <span>Documents</span>
                <span>Status</span>
              </div>

              {lignes.map(({ c, a }) => (
                <Link key={c.id} className="pt-ligne" href={ctx.lien(`/athlete/${c.id}`)}>
                  <span className="pt-cellule">
                    <span className="pt-nom">
                      {c.prenom} {c.nom}
                    </span>
                    <span className="pt-sous pt-mono">{c.reference}</span>
                  </span>
                  <span className="pt-cellule" data-lab="Country">
                    <span aria-hidden="true">{c.drapeau}</span> {c.pays}
                  </span>
                  <span className="pt-cellule" data-lab="Event">{c.sport}</span>
                  <span className="pt-cellule" data-lab="Term">{c.entree}</span>
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

            <section className="pt-sortie">
              <h2>How files are delivered</h2>
              <p>
                Each athlete is delivered as a single certified document — every record in its
                original language, followed by its English translation, opened by a certificate of
                accuracy. Records are never distributed separately, and any alteration voids the
                document. Open an athlete to download their file.
              </p>
              <p style={{ marginBottom: 0 }}>
                This portal is a staging area, not a system of record. Once a file has been taken
                into your own system, you can remove it here and nothing is retained on our side.
              </p>
            </section>
          </>
        )}
      </main>
    </>
  );
}
