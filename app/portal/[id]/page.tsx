import Link from 'next/link';
import { redirect } from 'next/navigation';
import { peutVoirLaDemo } from '@/lib/auth';
import { notFound } from 'next/navigation';
import {
  ETABLISSEMENT,
  ETATS,
  type Piece,
  aboutie,
  avancement,
  dansLePerimetre,
  lienEmail,
  messageRelance,
  trouver,
} from '@/lib/portail-demo';
import DocumentPaire from './DocumentPaire';
import Recuperer from './Recuperer';
import RelanceWhatsApp from './RelanceWhatsApp';

/* Le dossier d'un candidat.

   L'écran est bâti autour d'une idée : l'original et sa traduction se lisent
   ENSEMBLE. Un registrar compare la pièce en langue d'origine et sa version
   anglaise ; les séparer en deux listes l'oblige à faire l'appariement à la
   main, ce qui est précisément le travail qu'on lui enlève.

   L'entraîneur voit le MÊME dossier que l'établissement — décidé le 5 septembre.
   Une version antérieure lui cachait les documents. La restriction ne protégeait
   rien : un athlète recruté transmet ses bulletins à son coach de toute façon,
   par courrier ou messagerie, hors de l'outil. Elle empêchait seulement l'outil
   de servir à quelqu'un qui a déjà l'information.

   La ligne de partage utile n'est pas CE QU'IL VOIT mais DE QUI : un entraîneur
   n'a rien à faire dans le dossier d'un candidat qu'il ne recrute pas. Ce
   filtrage n'existe pas encore — il suppose de rattacher chaque candidat à son
   recruteur, donc la base de données. La seule différence conservée ici est la
   suppression, qui reste une décision de l'établissement. */

const CATEGORIES: Piece['categorie'][] = ['Academic', 'Identity', 'Language', 'Financial'];

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

  const c = trouver(id);
  /* Le périmètre se vérifie ICI aussi, pas seulement dans la liste. Une liste
     filtrée dont les adresses restent ouvertes ne restreint rien : il suffit
     de connaître l'identifiant. On répond « introuvable » plutôt qu'« interdit »,
     pour ne pas confirmer l'existence d'un dossier hors périmètre. */
  if (!c || !dansLePerimetre(c, coach)) notFound();

  const a = avancement(c);
  const lien = (chemin: string) => (coach ? `${chemin}?view=coach` : chemin);

  /* Adresse d'un document. Le serveur retrouve la pièce dans les données de
     démonstration à partir de ces deux clés : rien de ce qui est écrit ici ne
     finit imprimé tel quel dans le PDF. */
  const doc = (requirement: string, role: 'original' | 'translation') =>
    `/portal/document?c=${encodeURIComponent(c.id)}&r=${encodeURIComponent(requirement)}&t=${role}`;

  return (
    <main className="pt-wrap">
      <Link className="pt-retour" href={lien('/portal')}>
        ← All applicants
      </Link>

      <div className="pt-fiche-tete">
        <div>
          <h1>
            {c.prenom} {c.nom}
          </h1>
          <p className="pt-fiche-meta">
            <span aria-hidden="true">{c.drapeau}</span> {c.pays} · {c.sport} · Entering {c.entree}{' '}
            · <span className="pt-mono">{c.reference}</span>
          </p>
        </div>
        <div className="pt-fiche-actions">
          <span className={`pt-etat ${a.resume.ton}`}>{a.resume.texte}</span>
          {/* Supprimer les données de l'établissement n'est pas un geste
              d'entraîneur : c'est la seule action qui lui reste fermée. */}
          {!coach && (
            <button type="button" className="pt-bouton pt-danger">
              Remove
            </button>
          )}
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
          {/* Les deux relances sont de vrais liens : le message est déjà écrit,
              il ne reste qu'à choisir le destinataire et à envoyer. */}
          <div className="pt-relance">
            {/* Numéro de démonstration : lu dans l'environnement, jamais
                inscrit dans le dépôt — celui-ci est public. Sans lui, WhatsApp
                ouvre son sélecteur de contact. */}
            <RelanceWhatsApp
              texte={messageRelance(c, ETABLISSEMENT.nom)}
              telephone={process.env.DEMO_TELEPHONE?.replace(/\D/g, '') || undefined}
              enfants="Remind on WhatsApp"
            />
            <a className="pt-bouton" href={lienEmail(c, ETABLISSEMENT.nom, messageRelance(c, ETABLISSEMENT.nom))}>
              Remind by email
            </a>
          </div>
        </section>
      )}

      <section className="pt-recuperer">
          <div>
            <h2>Download the certified file</h2>
            <p>
              One document containing everything: each record in its original language, immediately
              followed by its certified English translation, and the certificate of accuracy.
              Individual records are not distributed separately — altering the document voids it.
            </p>
          </div>
          <Recuperer
            id={c.id}
            manquantes={a.manquantes.map((m) => m.requirement)}
            certifiees={c.pieces.filter((p) => p.traduction).length}
          />
      </section>

      {CATEGORIES.map((cat) => {
          const pieces = c.pieces.filter((p) => p.categorie === cat);
          if (pieces.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="pt-cat">{cat} records</h2>
              {pieces.map((p) => (
                <article className="pt-doc" key={p.requirement}>
                  <div className="pt-doc-tete">
                    <span className="pt-doc-titre">{p.requirement}</span>
                    <span className={`pt-etat ${aboutie(p) ? 'ok' : ETATS[p.etat].ton}`}>
                      {aboutie(p) && p.etat === 'received' ? 'On file' : ETATS[p.etat].texte}
                    </span>
                  </div>

                  {p.etat !== 'missing' && (
                    <DocumentPaire
                      original={
                        p.original && {
                          nom: p.original.nom,
                          pages: p.original.pages,
                          date: `received ${p.original.recuLe}`,
                          adresse: doc(p.requirement, 'original'),
                        }
                      }
                      traduction={
                        p.traduction && {
                          nom: p.traduction.nom,
                          pages: p.traduction.pages,
                          date: `delivered ${p.traduction.livreLe} · certificate of accuracy attached`,
                          adresse: doc(p.requirement, 'translation'),
                        }
                      }
                      videTraduction={
                        p.traductionRequise === false
                          ? 'No translation needed — this record was issued in English.'
                          : 'Being translated — usually ready within 48 hours.'
                      }
                    />
                  )}
                </article>
              ))}
            </section>
          );
      })}
    </main>
  );
}
