import Link from 'next/link';
import { notFound } from 'next/navigation';
import { garde } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import {
  type AnneeDossier,
  ETATS,
  anneesDuDossier,
  avancement,
  lienEmail,
  messageRelance,
} from '@/lib/portail-demo';
import DocumentPaire from '@/components/portail/DocumentPaire';
import Recuperer from '@/components/portail/Recuperer';
import RelanceWhatsApp from '@/components/portail/RelanceWhatsApp';
import EnTete from '../../EnTete';

export const dynamic = 'force-dynamic';

/* Le dossier d'un sportif, dans le portail réel.

   Même écran que la démonstration, et c'est voulu : l'original et sa
   traduction se lisent ENSEMBLE, année par année. Ce qui change n'est pas
   l'affichage mais la porte — ici une vraie session, une vraie appartenance
   à l'organisation, revérifiées à chaque chargement. */

function etiquette(an: AnneeDossier) {
  const recues = an.pieces.length - an.manquantes.length;
  if (an.manquantes.length > 0) {
    return recues > 0
      ? { texte: `${recues} of ${an.pieces.length} received`, ton: 'manque' as const }
      : { texte: 'Not received', ton: 'manque' as const };
  }
  if (an.rienATraduire) return { texte: 'On file', ton: 'ok' as const };
  return ETATS[an.etat];
}

export default async function DossierSportif({
  params,
}: {
  params: Promise<{ org: string; id: string }>;
}) {
  const { org: slug, id } = await params;
  const ctx = await garde(slug);

  /* Retrouvé DANS le vivier de cette organisation, jamais dans l'ensemble des
     dossiers : une liste filtrée dont les adresses restent ouvertes ne
     restreint rien, il suffirait de connaître l'identifiant. */
  const c = sportifDe(slug, id);
  if (!c) notFound();

  const a = avancement(c);
  const annees = anneesDuDossier(c);
  const envois = c.livraisons
    .map((l) => ({
      ...l,
      certifiees: c.pieces.filter((p) => p.livraison === l.cle && p.traduction).length,
      rang: c.pieces.findIndex((p) => p.livraison === l.cle),
    }))
    .sort((x, y) => x.rang - y.rang);

  return (
    <>
      <EnTete ctx={ctx} actuel="sportifs" />

      <main className="pt-wrap">
        <Link className="pt-retour" href={ctx.lien('')}>
          ← All athletes
        </Link>

        <div className="pt-fiche-tete">
          <div>
            <h1>
              {c.prenom} {c.nom}
              {c.reel ? (
                <span className="pt-reel">real file</span>
              ) : (
                <span className="pt-demo-badge">demo</span>
              )}
            </h1>
            <p className="pt-fiche-meta">
              <span aria-hidden="true">{c.drapeau}</span> {c.pays} · {c.sport} · Entering{' '}
              {c.entree} · <span className="pt-mono">{c.reference}</span>
            </p>
          </div>
          <div className="pt-fiche-actions">
            <span className={`pt-etat ${a.resume.ton}`}>{a.resume.texte}</span>
          </div>
        </div>

        {c.reel && (
          <section className="pt-reel-note">
            <strong>This is a real delivered file.</strong> {c.prenom} {c.nom} ordered through
            protranslayte.com and received these translations in August and September 2026 — four
            full years of French secondary school, every term from Grade 9 to the Baccalauréat,
            across two schools. The records below are the actual documents, shown here with his
            permission.
          </section>
        )}

        {!c.reel && (
          <section className="pt-demo-note">
            <strong>Sample record — demonstration only.</strong> Not a real athlete. It is here so{' '}
            {ctx.org.nom} can see what a complete file looks like before there is a real one, and
            it can be removed at any time.
          </section>
        )}

        {a.manquantes.length > 0 && (
          <section className="pt-manquant">
            <h2>Waiting on the student</h2>
            <ul>
              {a.manquantes.map((m) => (
                <li key={m.requirement}>{m.requirement}</li>
              ))}
            </ul>
            <div className="pt-relance">
              <RelanceWhatsApp
                texte={messageRelance(c, ctx.org.nom)}
                telephone={process.env.DEMO_TELEPHONE?.replace(/\D/g, '') || undefined}
                enfants="Remind on WhatsApp"
              />
              <a
                className="pt-bouton"
                href={lienEmail(c, ctx.org.nom, messageRelance(c, ctx.org.nom))}
              >
                Remind by email
              </a>
            </div>
          </section>
        )}

        <section className={`pt-recuperer${envois.length > 1 ? ' pt-recuperer-multi' : ''}`}>
          <div>
            <h2>Download the certified {envois.length > 1 ? 'files' : 'file'}</h2>
            <p>
              Each record appears in its original language, immediately followed by its certified
              English translation, opened by the certificate of accuracy. Individual records are
              not distributed separately — altering the document voids it.
            </p>
            {envois.length > 1 && (
              <p className="pt-recuperer-note">
                This file was ordered in {envois.length} instalments, so it comes as{' '}
                {envois.length} certified documents. Each carries its own certificate, covering the
                records it was issued for.
              </p>
            )}
          </div>
          <Recuperer
            id={c.id}
            manquantes={a.manquantes.map((m) => m.requirement)}
            livraisons={envois}
            rienATraduire={c.pieces.every((p) => p.traductionRequise === false)}
            vue=""
            base={ctx.lien('/dossier')}
          />
        </section>

        <h2 className="pt-cat">Academic records</h2>
        <p className="pt-cat-note">
          Each year opens as one document, its terms in order. The certificate of accuracy is not
          part of these — it belongs to the certified {envois.length > 1 ? 'files' : 'file'} above.
        </p>

        {annees.map((an) => {
          const doc = (role: 'original' | 'translation') =>
            `${ctx.lien('/document')}?c=${encodeURIComponent(c.id)}&a=${encodeURIComponent(an.nom)}&t=${role}`;
          const et = etiquette(an);

          return (
            <article className="pt-doc" key={an.nom}>
              <div className="pt-doc-tete">
                <span className="pt-doc-titre">{an.nom}</span>
                {an.pieces.length > 1 && (
                  <span className="pt-doc-sous">{an.pieces.length} term reports</span>
                )}
                <span className={`pt-etat ${et.ton}`}>{et.texte}</span>
              </div>

              {an.pagesOriginal > 0 && (
                <DocumentPaire
                  original={{
                    nom: `${an.nom} - original${an.pieces.length > 1 ? ' records' : ''}.pdf`,
                    pages: an.pagesOriginal,
                    date: `received ${an.recuLe}`,
                    adresse: doc('original'),
                  }}
                  traduction={
                    an.pagesTraduction > 0
                      ? {
                          nom: `${an.nom} - English translation.pdf`,
                          pages: an.pagesTraduction,
                          date: `delivered ${an.livreLe}`,
                          adresse: doc('translation'),
                        }
                      : undefined
                  }
                  videTraduction={
                    an.rienATraduire
                      ? 'No translation needed — these records were issued in English.'
                      : 'Being translated — usually ready within 48 hours.'
                  }
                />
              )}
            </article>
          );
        })}
      </main>
    </>
  );
}
