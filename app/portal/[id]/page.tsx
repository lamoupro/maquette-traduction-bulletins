import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { peutVoirLaDemo } from '@/lib/auth';
import { partenaireActif } from '@/lib/partenaire-actif';
import {
  type AnneeDossier,
  ETATS,
  anneesDuDossier,
  avancement,
  dansLePerimetre,
  lienEmail,
  messageRelance,
  trouver,
} from '@/lib/portail-demo';
import DocumentPaire from '@/components/portail/DocumentPaire';
import Recuperer from '@/components/portail/Recuperer';
import RelanceWhatsApp from '@/components/portail/RelanceWhatsApp';

/* Le dossier d'un candidat.

   L'écran est bâti autour d'une idée : l'original et sa traduction se lisent
   ENSEMBLE. Un registrar compare la pièce en langue d'origine et sa version
   anglaise ; les séparer en deux listes l'oblige à faire l'appariement à la
   main, ce qui est précisément le travail qu'on lui enlève.

   L'entraîneur voit le MÊME dossier que le partenaire — décidé le 5 septembre.
   Une version antérieure lui cachait les documents. La restriction ne
   protégeait rien : un athlète recruté transmet ses bulletins à son coach de
   toute façon, par courrier ou messagerie, hors de l'outil. Elle empêchait
   seulement l'outil de servir à quelqu'un qui a déjà l'information.

   La ligne de partage utile n'est pas CE QU'IL VOIT mais DE QUI : un entraîneur
   n'a rien à faire dans le dossier d'un athlète hors de son périmètre. La
   suppression, elle, reste une décision du partenaire. */

/* L'étiquette d'état d'une année.

   Une année à moitié reçue ne se résume pas par « Not received » : ce qui
   intéresse celui qui regarde, c'est COMBIEN il en manque. Le détail
   trimestre par trimestre est déjà donné plus haut, dans ce qu'on attend de
   l'étudiant — ici on veut le compte, pas la liste. */
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

export default async function Dossier({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view } = await searchParams;

  // La garde est ICI, pas sur le gabarit : celui-ci couvre aussi la page
  // d'entrée, et l'y placer la faisait se rediriger vers elle-même.
  if (!(await peutVoirLaDemo())) redirect('/portal/sign-in');
  const coach = view === 'coach';
  const pa = await partenaireActif();

  const c = trouver(id);
  /* Le périmètre se vérifie ICI aussi, pas seulement dans la liste. Une liste
     filtrée dont les adresses restent ouvertes ne restreint rien : il suffit
     de connaître l'identifiant. On répond « introuvable » plutôt qu'« interdit »,
     pour ne pas confirmer l'existence d'un dossier hors périmètre. */
  if (!c || !dansLePerimetre(c, pa, coach)) notFound();

  const a = avancement(c);
  const lien = (chemin: string) => (coach ? `${chemin}?view=coach` : chemin);

  /* Ce que chaque livraison contient RÉELLEMENT de certifié : une livraison
     dont rien n'est encore traduit n'a pas de bouton, et la route la refuserait
     de toute façon.

     L'ordre d'affichage suit le CURSUS, pas les dates de commande. Prince a
     fait traduire son lycée avant de retrouver sa 3ème : rangées par date, les
     deux lignes affichaient « Grades 10 to 12 » puis « Grade 9 », ce qui se lit
     comme une erreur. On classe donc chaque envoi par la première pièce qu'il
     couvre — la date reste écrite sur la ligne, pour qui la cherche. */
  const annees = anneesDuDossier(c);
  const envois = c.livraisons
    .map((l) => ({
      ...l,
      certifiees: c.pieces.filter((p) => p.livraison === l.cle && p.traduction).length,
      rang: c.pieces.findIndex((p) => p.livraison === l.cle),
    }))
    .sort((x, y) => x.rang - y.rang);

  /* Adresse d'un document. Le serveur retrouve la pièce dans les données de
     démonstration à partir de ces deux clés : rien de ce qui est écrit ici ne
     finit imprimé tel quel dans le PDF. */
  const doc = (requirement: string, role: 'original' | 'translation') =>
    `/portal/document?c=${encodeURIComponent(c.id)}&r=${encodeURIComponent(requirement)}&t=${role}` +
    (coach ? '&view=coach' : '');

  return (
    <main className="pt-wrap">
      <Link className="pt-retour" href={lien('/portal')}>
        ← All {pa.suivis}
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
            <span aria-hidden="true">{c.drapeau}</span> {c.pays} · {c.sport} · Entering {c.entree}{' '}
            · <span className="pt-mono">{c.reference}</span>
          </p>
        </div>
        <div className="pt-fiche-actions">
          <span className={`pt-etat ${a.resume.ton}`}>{a.resume.texte}</span>
          {/* Supprimer les données du partenaire n'est pas un geste
              d'entraîneur : c'est la seule action qui lui reste fermée. */}
          {!coach && (
            <button type="button" className="pt-bouton pt-danger">
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Ce dossier-là n'est pas une maquette, et le taire serait le pire des
          deux mondes : soit on le prend pour un exemple et il ne prouve rien,
          soit on découvre plus tard que c'était réel et la question devient
          « vous montrez mes athlètes à qui, vous ? ». On le dit donc, avec la
          seule chose qui compte : l'accord de l'intéressé. */}
      {c.reel && (
        <section className="pt-reel-note">
          <strong>This is a real delivered file.</strong> {c.prenom} {c.nom} ordered through
          protranslayte.com and received these translations in August and September 2026 — four
          full years of French secondary school, every term from Grade 9 to the Baccalauréat,
          across two schools. The records below are the actual documents, shown here with his
          permission.
        </section>
      )}

      {/* Le pendant du bloc ci-dessus, pour tous les autres : un dossier
          fabriqué ne doit jamais se lire comme un vrai, et la sortie doit
          être aussi visible que l'entrée — d'où le rappel du bouton
          « Remove » juste au-dessus. */}
      {!c.reel && !coach && (
        <section className="pt-demo-note">
          <strong>Sample record — demonstration only.</strong> Not a real {pa.suivis.replace(/s$/, '')}
          . Shown so {pa.nom} can see how a complete file looks before any real one exists — remove
          it with the button above whenever you're ready.
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
          {/* Les deux relances sont de vrais liens : le message est déjà écrit,
              il ne reste qu'à choisir le destinataire et à envoyer. */}
          <div className="pt-relance">
            {/* Numéro de démonstration : lu dans l'environnement, jamais
                inscrit dans le dépôt — celui-ci est public. Sans lui, WhatsApp
                ouvre son sélecteur de contact. */}
            <RelanceWhatsApp
              texte={messageRelance(c, pa.nom)}
              telephone={process.env.DEMO_TELEPHONE?.replace(/\D/g, '') || undefined}
              enfants="Remind on WhatsApp"
            />
            <a className="pt-bouton" href={lienEmail(c, pa.nom, messageRelance(c, pa.nom))}>
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
            English translation, opened by the certificate of accuracy. Individual records are not
            distributed separately — altering the document voids it.
          </p>
          {/* Deux envois, deux documents, et il faut le dire : sans cette
              phrase, un dossier complet qui se télécharge en deux fois passe
              pour un dossier coupé en deux. */}
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
          vue={coach ? '&view=coach' : ''}
        />
      </section>

      <h2 className="pt-cat">Academic records</h2>
      {/* Une ligne PAR ANNÉE, pas par trimestre. Le suivi se fait au trimestre —
          c'est ce qu'on relance — mais personne n'ouvre treize documents un par
          un pour se faire une idée d'un élève. Chaque année s'ouvre en un seul
          fichier, ses trimestres mis bout à bout. */}
      <p className="pt-cat-note">
        Each year opens as one document, its terms in order. The certificate of accuracy is not
        part of these — it belongs to the certified {envois.length > 1 ? 'files' : 'file'} above.
      </p>

      {annees.map((an) => {
        const et = etiquette(an);
        const doc = (role: 'original' | 'translation') =>
          `/portal/document?c=${encodeURIComponent(c.id)}&a=${encodeURIComponent(an.nom)}&t=${role}` +
          (coach ? '&view=coach' : '');

        return (
          <article className="pt-doc" key={an.nom}>
            <div className="pt-doc-tete">
              <span className="pt-doc-titre">{an.nom}</span>
              {an.pieces.length > 1 && (
                <span className="pt-doc-sous">
                  {an.pieces.length} term reports
                </span>
              )}
              <span className={`pt-etat ${et.ton}`}>{et.texte}</span>
            </div>

            {an.pagesOriginal > 0 && (
              <DocumentPaire
                original={{
                  /* « records » au pluriel n'a de sens que si l'année en réunit
                     plusieurs : un relevé d'examen n'est pas « des pièces ». */
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
  );
}
