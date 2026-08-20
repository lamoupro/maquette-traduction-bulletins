import type { Metadata } from 'next';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, SOUS_TRAITANTS, denomination } from '@/lib/legal';
import { CONSERVATION_JOURS } from '@/lib/stockage';

export const metadata: Metadata = { title: 'Politique de confidentialité — Protranslayte' };

/* Information des personnes concernées : articles 13 et 14 du RGPD. Les
   bulletins traités portent sur des mineurs, ce qui impose une vigilance
   particulière sur la durée de conservation et la limitation des accès. */
export default function Confidentialite() {
  const e = ENTREPRISE;

  return (
    <PageLegale
      titre="Politique de confidentialité"
      intro="Comment vos données et celles figurant sur les bulletins que vous déposez sont traitées, par qui, pendant combien de temps."
    >
      <h2>Responsable du traitement</h2>
      <p>
        <Champ v={denomination()} />, <Champ v={e.adresse.join(', ')} />. Pour toute question
        relative à vos données : <a href={`mailto:${e.email}`}>{e.email}</a>.
      </p>

      <h2>Données traitées</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Identification du client</td>
            <td>Prénom, nom, adresse électronique</td>
          </tr>
          <tr>
            <td>Documents déposés</td>
            <td>
              Bulletins et documents scolaires, comportant le nom de l&apos;élève, son
              établissement, ses résultats et appréciations, parfois sa date de naissance
            </td>
          </tr>
          <tr>
            <td>Commande</td>
            <td>Référence, langues, nombre de documents, montant, date</td>
          </tr>
          <tr>
            <td>Paiement</td>
            <td>
              Traité directement par Stripe. Aucune donnée bancaire n&apos;est reçue ni conservée
              par nos soins
            </td>
          </tr>
        </tbody>
      </table>

      <h2 id="mineurs">Données relatives aux mineurs</h2>
      <p>
        Les bulletins concernent le plus souvent des élèves mineurs. Ces données sont fournies par
        le représentant légal, ou par l&apos;élève majeur lui-même. Elles ne servent
        qu&apos;à l&apos;exécution de la traduction. Elles ne font l&apos;objet d&apos;aucun
        profilage, d&apos;aucune décision automatisée, et ne sont jamais utilisées à des fins
        publicitaires ni cédées à un tiers.
      </p>

      <h2>Finalités et bases légales</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Exécuter la traduction commandée et la livrer</td>
            <td>Exécution du contrat — article 6.1.b du RGPD</td>
          </tr>
          <tr>
            <td>Émettre et conserver les factures</td>
            <td>Obligation légale — article 6.1.c du RGPD</td>
          </tr>
          <tr>
            <td>Répondre à vos demandes et réclamations</td>
            <td>Exécution du contrat, intérêt légitime</td>
          </tr>
        </tbody>
      </table>

      <h2>Durées de conservation</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Donnée</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Documents déposés et traductions</td>
            <td>
              <strong>{CONSERVATION_JOURS} jours</strong> à compter du dépôt, puis suppression
            </td>
          </tr>
          <tr>
            <td>Coordonnées et détail de la commande</td>
            <td>3 ans à compter de la dernière commande</td>
          </tr>
          <tr>
            <td>Pièces comptables et factures</td>
            <td>10 ans — article L123-22 du code de commerce</td>
          </tr>
        </tbody>
      </table>
      <p>
        Pensez à enregistrer votre traduction dès réception : passé {CONSERVATION_JOURS} jours,
        nous ne sommes plus en mesure de vous la fournir à nouveau.
      </p>

      <h2>Sécurité</h2>
      <p>
        Les documents ne sont accessibles depuis aucune adresse publique. Ils sont conservés dans
        un espace de stockage privé et ne peuvent être consultés qu&apos;au moyen de liens signés
        expirant au bout d&apos;une heure, générés depuis une interface d&apos;administration
        protégée par mot de passe. Les échanges avec le site sont chiffrés de bout en bout (HTTPS).
      </p>
      <p>
        Vos documents ne sont jamais transmis en pièce jointe par courrier électronique. Les
        notifications internes ne contiennent qu&apos;un lien vers cette interface protégée.
      </p>

      <h2>Destinataires</h2>
      <p>
        Vos données sont communiquées au traducteur assermenté chargé de votre dossier, tenu au
        secret professionnel, ainsi qu&apos;aux prestataires techniques suivants, qui agissent en
        qualité de sous-traitants et sur nos seules instructions :
      </p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Prestataire</th>
            <th>Rôle</th>
            <th>Pays</th>
          </tr>
        </thead>
        <tbody>
          {SOUS_TRAITANTS.map((s) => (
            <tr key={s.nom}>
              <td>{s.nom}</td>
              <td>{s.role}</td>
              <td>{s.lieu}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Transferts hors Union européenne</h2>
      <p>
        Certains prestataires sont établis aux États-Unis. Ces transferts sont encadrés par les
        clauses contractuelles types de la Commission européenne et, le cas échéant, par
        l&apos;adhésion du prestataire au cadre de protection des données UE — États-Unis.
      </p>

      <h2>Cookies et stockage local</h2>
      <p>
        Le site ne dépose aucun cookie publicitaire ni aucun traceur de mesure d&apos;audience.
        Aucun consentement n&apos;est donc requis, et aucune bannière ne vous est imposée.
      </p>
      <p>
        Deux mécanismes strictement nécessaires sont utilisés, tous deux limités à votre appareil :
      </p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Ce qui est conservé</th>
            <th>Pourquoi</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Un cookie de session d&apos;administration</td>
            <td>Réservé à l&apos;éditeur du site, jamais déposé chez un client</td>
            <td>12 heures</td>
          </tr>
          <tr>
            <td>
              Votre saisie en cours : langues, nombre de documents, adresse électronique, nom,
              adresse postale
            </td>
            <td>
              Vous éviter de tout ressaisir si vous quittez la page — pour consulter votre
              application bancaire, par exemple
            </td>
            <td>7 jours</td>
          </tr>
          <tr>
            <td>La référence de la commande en attente de paiement</td>
            <td>Vous permettre de reprendre un paiement interrompu sans redéposer vos documents</td>
            <td>12 heures</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ces informations restent <strong>sur votre appareil</strong> : elles ne sont transmises à
        aucun serveur et à aucun tiers. Vider les données de site de votre navigateur les supprime
        immédiatement.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
        limitation, d&apos;opposition et de portabilité, ainsi que du droit de définir des
        directives relatives au sort de vos données après votre décès. Pour les exercer, écrivez à{' '}
        <a href={`mailto:${e.email}`}>{e.email}</a>. Nous répondons dans un délai d&apos;un mois.
      </p>
      <p>
        Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous
        pouvez adresser une réclamation à la Commission nationale de l&apos;informatique et des
        libertés, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
      </p>
    </PageLegale>
  );
}
