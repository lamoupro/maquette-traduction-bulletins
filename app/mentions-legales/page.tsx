import type { Metadata } from 'next';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, SOUS_TRAITANTS, denomination, siren, siretLisible } from '@/lib/legal';

export const metadata: Metadata = { title: 'Mentions légales — Protranslayte' };

/* Mentions obligatoires : article 6 III de la loi n° 2004-575 pour la
   confiance dans l'économie numérique, et article L111-1 du code de la
   consommation pour la vente à distance. */
export default function MentionsLegales() {
  const e = ENTREPRISE;
  const hebergeur = SOUS_TRAITANTS.find((s) => s.nom.startsWith('Vercel'))!;

  return (
    <PageLegale
      titre="Mentions légales"
      intro="Informations relatives à l'éditeur du site protranslayte.com et à son hébergeur."
    >
      <h2>Éditeur du site</h2>
      <dl className="legal-dl">
        <dt>Éditeur</dt>
        <dd>
          <Champ v={denomination()} />
        </dd>

        <dt>Enseigne commerciale</dt>
        <dd>{e.nomCommercial}</dd>

        <dt>Forme juridique</dt>
        <dd>
          <Champ v={e.formeJuridique} />
        </dd>

        {e.capital !== null ? (
          <>
            <dt>Capital social</dt>
            <dd>{e.capital.toLocaleString('fr-FR')} €</dd>
          </>
        ) : null}

        <dt>Siège social</dt>
        <dd>
          {e.adresse.map((l, i) => (
            <span key={i} style={{ display: 'block' }}>
              <Champ v={l} />
            </span>
          ))}
        </dd>

        <dt>SIRET</dt>
        <dd className="tabular">
          <Champ v={siretLisible()} />
        </dd>

        {siren() ? (
          <>
            <dt>SIREN</dt>
            <dd className="tabular">{siren()}</dd>
          </>
        ) : null}

        <dt>Immatriculation</dt>
        <dd>
          {e.villeRcs ? `RCS ${e.villeRcs}` : 'Registre national des entreprises (RNE)'}
        </dd>

        <dt>TVA intracommunautaire</dt>
        <dd>
          {e.tva ? (
            e.tva
          ) : (
            <>TVA non applicable — article 293 B du code général des impôts</>
          )}
        </dd>

        <dt>Directeur de la publication</dt>
        <dd>
          <Champ v={e.directeurPublication} />
        </dd>

        <dt>Téléphone</dt>
        <dd>
          <Champ v={e.telephone} />
        </dd>

        <dt>Adresse électronique</dt>
        <dd>
          <a href={`mailto:${e.email}`}>{e.email}</a>
        </dd>
      </dl>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>{hebergeur.nom}</strong>, {hebergeur.adresse}.
      </p>
      <p>
        Les documents déposés par les clients ne sont pas hébergés sur le site : ils sont conservés
        séparément, dans un espace de stockage privé opéré par{' '}
        <strong>Cloudflare, Inc.</strong>, et ne sont accessibles qu&apos;au moyen de liens
        temporaires nominatifs. Le détail figure dans la{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site — textes, mise en page, illustrations, logotype et
        code source — est protégé par le droit d&apos;auteur. Toute reproduction ou représentation,
        totale ou partielle, sans autorisation écrite préalable est interdite.
      </p>
      <p>
        Les documents reproduits à titre d&apos;exemple sur la page d&apos;accueil sont des
        bulletins réels dont les mentions permettant d&apos;identifier un élève ont été
        irréversiblement occultées avant publication.
      </p>

      <h2>Signalement d&apos;un contenu</h2>
      <p>
        Tout contenu que vous estimeriez illicite peut être signalé à{' '}
        <a href={`mailto:${e.email}`}>{e.email}</a>. Nous accusons réception de chaque signalement
        et y répondons dans les meilleurs délais.
      </p>

      <h2>Réclamations et litiges</h2>
      <p>
        Toute réclamation peut être adressée à <a href={`mailto:${e.email}`}>{e.email}</a>. Une
        garantie de remboursement sans justification est prévue à l&apos;article 8 des{' '}
        <a href="/cgv">conditions générales de vente</a>. Les voies de recours, dont la médiation
        de la consommation, sont détaillées à l&apos;article 12 des mêmes conditions.
      </p>
    </PageLegale>
  );
}
