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
import EnTete from '../../EnTete';
import Relances from './Relances';
import { dernierRappel, fusionnerReglees, regleesDe } from '@/lib/agence/suivi';
import { emailEtudiant } from '@/lib/agence/relance';
import { cocherReglee, decocherReglee, relancerParEmail, relancerParSms } from './actions';

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
  const brut = sportifDe(slug, id);
  if (!brut) notFound();

  /* Le dossier tel qu'il est VRAIMENT : celui du fichier, plus ce qui a été
     ajouté à la main depuis. Une pièce ajoutée cesse de manquer — voir
     lib/agence/suivi.ts. */
  const [reglees, rappel, adresseEtudiant] = await Promise.all([
    regleesDe(ctx.org.id, id),
    dernierRappel(ctx.org.id, id),
    /* Montrée à l'écran, et pas seulement utilisée au moment d'envoyer : on ne
       demande pas à quelqu'un d'appuyer sur un bouton sans lui dire où part
       le message. C'est aussi ce qui rend visible le cas où l'adresse manque,
       avant de découvrir l'échec après coup. */
    emailEtudiant(brut),
  ]);
  const c = fusionnerReglees(brut, reglees);
  const regleePour = new Map(reglees.map((x) => [x.requirement, x]));

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

        {a.manquantes.length > 0 && (
          <section className="pt-manquant">
            <h2>Waiting on the student</h2>
            <ul>
              {a.manquantes.map((m) => (
                <li key={m.requirement}>{m.requirement}</li>
              ))}
            </ul>

            {/* Ce qu'on a déjà fait, avant de proposer de le refaire : trois
                personnes d'une même agence cliquent le même bouton sans se
                concerter, et l'étudiant reçoit quatre fois le même message. */}
            {rappel && (
              <p className="pt-deja">
                A reminder was already sent{' '}
                {rappel.canal === 'email' ? 'by email' : rappel.canal === 'sms' ? 'by text message' : 'on WhatsApp'} on{' '}
                <strong>{rappel.envoyeLe.toISOString().slice(0, 10)}</strong> by {rappel.envoyePar}.
              </p>
            )}

            <Relances
              onEmail={relancerParEmail.bind(null, slug, c.id)}
              onSms={relancerParSms.bind(null, slug, c.id)}
              dejaEnvoye={Boolean(rappel)}
            />

            <p className="pt-relance-note">
              {adresseEtudiant ? (
                <>
                  Sent to <strong>{adresseEtudiant}</strong> from contact@protranslayte.com — the
                  address {c.prenom} already received their translations from.
                </>
              ) : (
                <>
                  No email address on file for {c.prenom}, so the email reminder can&apos;t be sent.
                  A text message can still be requested.
                </>
              )}
            </p>

            {/* L'étudiant s'en est occupé de son côté : la ligne cesse d'être
                rouge sans qu'on ait à déposer quoi que ce soit. */}
            <div className="pt-ajout">
              <h3>Already taken care of?</h3>
              <p>
                If the student has handled a record another way, tick it here and it stops showing
                as missing. Nothing is added to the certified document.
              </p>
              {a.manquantes.map((m) => (
                <form
                  key={m.requirement}
                  action={cocherReglee.bind(null, slug, c.id, m.requirement)}
                  className="pt-ajout-ligne"
                >
                  <span className="pt-ajout-nom">{m.requirement}</span>
                  <button type="submit" className="pt-bouton">Mark as handled</button>
                </form>
              ))}
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

              {regleePour.get(an.pieces[0]?.requirement ?? '') && (
                <div className="pt-volet vide" style={{ borderTop: '1px solid var(--pt-rule)' }}>
                  <span className="pt-volet-lab">Handled elsewhere</span>
                  Marked as taken care of on{' '}
                  {regleePour.get(an.pieces[0].requirement)!.regleeLe.toISOString().slice(0, 10)} by{' '}
                  {regleePour.get(an.pieces[0].requirement)!.regleePar} — not part of the certified
                  document.
                  <form
                    action={decocherReglee.bind(null, slug, c.id, an.pieces[0].requirement)}
                    style={{ marginTop: 8 }}
                  >
                    <button type="submit" className="pt-bouton">Undo</button>
                  </form>
                </div>
              )}

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
                    regleePour.get(an.pieces[0]?.requirement ?? '')
                      ? 'Handled by the student another way — not produced by us.'
                      : an.rienATraduire
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
