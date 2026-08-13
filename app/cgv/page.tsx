import type { Metadata } from 'next';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE } from '@/lib/legal';
import { MAX_DOCS, PRIX_OFFRE } from '@/lib/data';
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
        Le service est édité et exploité par <Champ v={e.raisonSociale} />,{' '}
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
        Le prix est de <strong>{PRIX_OFFRE} € par document</strong>, toutes taxes comprises. Il est
        fixe et ne dépend ni de la longueur du document, ni du couple de langues retenu. Une
        commande peut porter sur {MAX_DOCS} documents au maximum.
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
        Les prix barrés affichés sur le site correspondent au tarif effectivement pratiqué
        antérieurement à l&apos;opération promotionnelle en cours, conformément à l&apos;article
        L112-1-1 du code de la consommation.
      </p>

      <h2>Article 4 — Commande</h2>
      <p>La commande se déroule en trois étapes :</p>
      <ol>
        <li>choix de la langue source, de la langue souhaitée et du nombre de documents ;</li>
        <li>dépôt des documents à traduire, au format PDF ou image, 10 Mo au maximum par fichier ;</li>
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
        En cas de dépassement du délai annoncé, vous pouvez nous mettre en demeure d&apos;exécuter
        dans un délai supplémentaire raisonnable. À défaut d&apos;exécution, vous pouvez résoudre
        le contrat par lettre recommandée ou par écrit sur support durable, et obtenir le
        remboursement intégral dans les quatorze jours, conformément aux articles L216-6 et L216-7
        du code de la consommation.
      </p>

      <h2>Article 7 — Droit de rétractation</h2>
      <p>
        Vous disposez en principe d&apos;un délai de quatorze jours pour exercer votre droit de
        rétractation, sans avoir à motiver votre décision.
      </p>
      <p className="legal-encadre">
        <strong>Exception applicable à ce service.</strong> Parce que la traduction commence
        immédiatement après le paiement, il vous est demandé, au moment de commander, de consentir
        expressément à cette exécution immédiate et de renoncer expressément à votre droit de
        rétractation. Conformément à l&apos;article L221-28 3° du code de la consommation, ce droit
        ne peut plus être exercé <strong>une fois la traduction pleinement exécutée</strong>,
        c&apos;est-à-dire une fois le document certifié livré.
      </p>
      <p>
        Tant que la traduction n&apos;a pas été livrée, vous conservez la faculté de vous rétracter
        en nous écrivant à <a href={`mailto:${e.email}`}>{e.email}</a>. Le montant retenu est alors
        proportionné au travail déjà accompli ; le solde vous est remboursé sous quatorze jours,
        par le même moyen de paiement que celui utilisé lors de la commande.
      </p>

      <h2>Article 8 — Réclamations et garanties</h2>
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

      <h2>Article 9 — Responsabilité</h2>
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

      <h2>Article 10 — Données personnelles</h2>
      <p>
        Les documents déposés sont conservés dans un espace privé pendant{' '}
        {CONSERVATION_JOURS} jours, puis supprimés. Ils contiennent des données personnelles, le
        plus souvent relatives à des mineurs, et ne sont communiqués qu&apos;au traducteur chargé
        du dossier. Le détail des traitements, des destinataires et de vos droits figure dans la{' '}
        <a href="/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Article 11 — Médiation de la consommation</h2>
      <p>
        En cas de litige non résolu par une réclamation écrite préalable auprès de nos services,
        vous pouvez recourir gratuitement au médiateur de la consommation suivant :
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
      <p>
        Vous pouvez également recourir à la plateforme européenne de règlement en ligne des
        litiges.
      </p>

      <h2>Article 12 — Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit français. En cas de litige, les tribunaux
        français sont compétents. Cette clause ne prive pas le consommateur de la faculté de saisir
        la juridiction de son lieu de résidence.
      </p>
    </PageLegale>
  );
}
