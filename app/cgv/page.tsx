import type { Metadata } from 'next';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, denomination } from '@/lib/legal';
import { MAX_DOCS, MAX_PAGES, PRIX_ENVOI, PRIX_OFFRE } from '@/lib/data';
import { CONSERVATION_JOURS } from '@/lib/stockage';

export const metadata: Metadata = { title: 'Conditions générales de vente — Protranslayte' };

export default function CGV() {
  const e = ENTREPRISE;

  return (
    <PageLegale
      titre="Conditions générales de vente"
      intro="Elles régissent toute commande passée sur protranslayte.com. Le fait de commander vaut acceptation pleine et entière."
    >
      <h2>Article 1 — Identité du vendeur</h2>
      <p>
        Le service est édité et exploité par <Champ v={denomination()} />,{' '}
        <Champ v={e.formeJuridique} />, dont le siège est situé{' '}
        <Champ v={e.adresse.join(', ')} />, joignable à{' '}
        <a href={`mailto:${e.email}`}>{e.email}</a> et au <Champ v={e.telephone} />. Les mentions
        complètes figurent sur la page <a href="/mentions-legales">mentions légales</a>.
      </p>

      <h2>Article 2 — Objet</h2>
      <p>
        Le service consiste en la traduction assermentée de bulletins de notes et documents
        scolaires. La traduction est réalisée par un traducteur inscrit sur la liste des experts
        judiciaires d&apos;une cour d&apos;appel française, puis certifiée conforme à
        l&apos;original par apposition de son cachet, de sa signature et d&apos;un numéro
        d&apos;enregistrement unique.
      </p>
      <p className="legal-encadre">
        <strong>Portée de la certification.</strong> Une traduction assermentée établie par un
        traducteur français est reconnue par les administrations françaises, ainsi que par les
        autorités étrangères qui l&apos;acceptent. Elle ne se substitue pas à une traduction
        assermentée établie selon le régime propre à un autre État. Il vous appartient de vérifier
        auprès de l&apos;organisme destinataire le type de certification qu&apos;il exige avant de
        commander.
      </p>

      <h2>Article 3 — Prix</h2>
      <p>
        Le prix est de <strong>{PRIX_OFFRE} € par page</strong>, toutes taxes comprises. Il ne
        dépend ni de la densité du texte, ni du couple de langues retenu.
      </p>
      <p className="legal-encadre">
        <strong>L&apos;unité facturée est la page, non le fichier.</strong> Un bulletin recto verso
        compte pour deux pages, un livret scolaire de six pages pour six. Le nombre de pages de
        chaque document est déterminé automatiquement au moment du dépôt et vous est affiché,
        document par document, <strong>avant tout paiement</strong>.
      </p>
      <p>
        Une commande peut porter sur {MAX_DOCS} fichiers et {MAX_PAGES} pages au maximum. Au-delà,
        écrivez-nous à <a href={`mailto:${e.email}`}>{e.email}</a> : votre dossier est pris en
        charge de la même manière.
      </p>
      <p>
        {e.tva ? (
          <>Le prix s&apos;entend toutes taxes comprises, TVA au taux en vigueur incluse.</>
        ) : (
          <>
            TVA non applicable, article 293 B du code général des impôts. Aucune TVA n&apos;est
            due ni récupérable.
          </>
        )}
      </p>
      <p>
        L&apos;envoi de l&apos;exemplaire original par voie postale est une option facturée{' '}
        <strong>{PRIX_ENVOI.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong> par
        commande, quel que soit le nombre de pages. Elle n&apos;est proposée qu&apos;à destination
        de la France.
      </p>
      <p>
        Les prix barrés affichés sur le site correspondent au tarif effectivement pratiqué
        antérieurement à l&apos;opération promotionnelle en cours, conformément à l&apos;article
        L112-1-1 du code de la consommation.
      </p>

      <h2>Article 4 — Commande</h2>
      <p>La commande se déroule en trois étapes :</p>
      <ol>
        <li>choix de la langue source et de la langue souhaitée ;</li>
        <li>
          dépôt des documents à traduire, au format PDF ou image, 10 Mo au maximum par fichier. Le
          nombre de pages est compté et le montant affiché avant toute saisie de paiement ;
        </li>
        <li>saisie des coordonnées puis paiement.</li>
      </ol>
      <p>
        La commande n&apos;est définitive qu&apos;après encaissement effectif du paiement. Un
        courrier électronique de confirmation, portant une référence de dossier, est envoyé à
        l&apos;adresse indiquée. Il vous appartient de fournir des documents lisibles et complets :
        un document illisible ou tronqué peut empêcher l&apos;exécution de la prestation.
      </p>

      <h2>Article 5 — Paiement</h2>
      <p>
        Le paiement s&apos;effectue en ligne par carte bancaire ou par Apple Pay, au moment de la
        commande. Les opérations sont traitées par Stripe Payments Europe, Ltd. Aucune donnée de
        carte bancaire ne transite par nos serveurs ni n&apos;y est conservée.
      </p>

      <h2>Article 6 — Délai de livraison</h2>
      <p>
        La traduction est livrée sous <strong>24 à 48 heures ouvrées</strong> à compter de
        l&apos;encaissement du paiement, par courrier électronique, à l&apos;adresse indiquée lors
        de la commande. Les samedis, dimanches et jours fériés ne sont pas comptés.
      </p>
      <p>
        Si vous avez choisi l&apos;envoi de l&apos;original par voie postale, celui-ci est expédié
        en courrier suivi dans les 48 heures suivant la traduction. La livraison numérique
        n&apos;en est pas retardée : vous disposez du document certifié par courrier électronique
        sans attendre le courrier.
      </p>
      <p>
        En cas de dépassement du délai annoncé, vous pouvez nous mettre en demeure d&apos;exécuter
        dans un délai supplémentaire raisonnable. À défaut d&apos;exécution, vous pouvez résoudre
        le contrat par lettre recommandée ou par écrit sur support durable, et obtenir le
        remboursement intégral dans les quatorze jours, conformément aux articles L216-6 et L216-7
        du code de la consommation.
      </p>

      <h2>Article 7 — Droit de rétractation</h2>
      <p>
        Vous disposez d&apos;un délai de <strong>quatorze jours</strong> à compter de la commande
        pour exercer votre droit de rétractation, sans avoir à motiver votre décision ni à
        supporter de frais.
      </p>
      <p className="legal-encadre">
        <strong>Nous ne vous demandons pas d&apos;y renoncer.</strong> La loi permettrait de vous
        faire renoncer à ce droit en contrepartie d&apos;une exécution immédiate. Nous avons choisi
        de ne pas le faire : vous conservez votre droit de rétractation entier, y compris après
        avoir reçu votre traduction.
      </p>
      <p>
        Il suffit de nous écrire à <a href={`mailto:${e.email}`}>{e.email}</a> en rappelant la
        référence de votre dossier. Aucune formule particulière n&apos;est exigée.
      </p>

      <h2>Article 8 — Garantie de remboursement</h2>
      <p className="legal-encadre">
        <strong>
          Satisfait ou remboursé pendant {ENTREPRISE.garantieJours} jours, sans justification.
        </strong>{' '}
        Cette garantie commerciale s&apos;ajoute au droit de rétractation et va au-delà de ce que
        la loi impose. Si la traduction ne vous convient pas, quelle qu&apos;en soit la raison,
        écrivez-nous : nous la corrigeons, ou nous vous remboursons.
      </p>
      <p>
        Le remboursement est effectué sous {ENTREPRISE.remboursementJoursOuvres} jours ouvrés, par
        le même moyen de paiement que celui utilisé lors de la commande, sans frais pour vous. Le
        délai maximal légal de quatorze jours reste garanti en tout état de cause.
      </p>
      <p>
        Vous n&apos;avez rien à renvoyer et rien à prouver. Si le document a été refusé par
        l&apos;organisme auquel vous l&apos;avez présenté, indiquez-nous simplement le motif du
        refus : dans la plupart des cas nous corrigeons sans frais, et à défaut nous remboursons.
      </p>
      <p>
        Cette garantie ne restreint ni votre droit de rétractation (article 7), ni les garanties
        légales rappelées à l&apos;article 9.
      </p>

      <h2>Article 9 — Réclamations et garanties légales</h2>
      <p>
        Toute réclamation portant sur une erreur de traduction, une omission ou une erreur de
        transcription doit nous être adressée à <a href={`mailto:${e.email}`}>{e.email}</a> en
        rappelant la référence du dossier. Une erreur qui nous est imputable est corrigée sans
        frais et dans les meilleurs délais.
      </p>
      <p>
        Le service reste soumis à la garantie légale de conformité (articles L217-1 et suivants du
        code de la consommation) et à la garantie contre les vices cachés (articles 1641 et
        suivants du code civil).
      </p>

      <h2>Article 10 — Responsabilité</h2>
      <p>
        Nous répondons de la fidélité de la traduction et de la régularité de sa certification.
        Notre responsabilité ne saurait en revanche être engagée en cas de refus du document par un
        organisme destinataire pour un motif étranger à la traduction elle-même, notamment
        l&apos;exigence d&apos;une légalisation, d&apos;une apostille ou d&apos;une certification
        relevant d&apos;un autre État, ni en cas de document source illisible, incomplet ou
        falsifié.
      </p>
      <p>
        Notre responsabilité est en tout état de cause limitée au montant effectivement payé pour
        la commande concernée.
      </p>

      <h2>Article 11 — Données personnelles</h2>
      <p>
        Les documents déposés sont conservés dans un espace privé pendant{' '}
        {CONSERVATION_JOURS} jours, puis supprimés. Ils contiennent des données personnelles, le
        plus souvent relatives à des mineurs, et ne sont communiqués qu&apos;au traducteur chargé
        du dossier. Le détail des traitements, des destinataires et de vos droits figure dans la{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Article 12 — Règlement des litiges</h2>
      <p>
        Adressez d&apos;abord votre réclamation à <a href={`mailto:${e.email}`}>{e.email}</a>.
        Compte tenu de la garantie de remboursement prévue à l&apos;article 8, la très grande
        majorité des différends se règle en un échange.
      </p>
      {e.mediateur ? (
        <>
          <p>
            À défaut de solution, vous pouvez recourir gratuitement au médiateur de la consommation
            suivant :
          </p>
          <p>
            <strong>
              <Champ v={e.mediateur.nom} />
            </strong>
            <br />
            <Champ v={e.mediateur.adresse} />
            <br />
            <Champ v={e.mediateur.site} />
          </p>
        </>
      ) : (
        <p>
          Conformément à l&apos;article L612-1 du code de la consommation, vous disposez du droit de
          recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable
          d&apos;un litige. Vous pouvez également saisir la plateforme européenne de règlement en
          ligne des litiges.
        </p>
      )}

      <h2>Article 13 — Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux
        français sont compétents. Cette clause ne prive pas le consommateur de la faculté de saisir
        la juridiction de son lieu de résidence.
      </p>
    </PageLegale>
  );
}
