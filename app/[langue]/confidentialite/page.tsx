import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, SOUS_TRAITANTS, denomination } from '@/lib/legal';
import { CONSERVATION_JOURS } from '@/lib/stockage';
import { LANGUE_RACINE, estLangue } from '@/lib/langues';

export const metadata: Metadata = {
  title: 'Privacy — Protranslayte',
  robots: { index: false, follow: false },
};

/* Politique de confidentialité, version anglaise.

   Le RGPD s'applique quel que soit le pays du lecteur : le responsable de
   traitement est établi en France. Un athlète brésilien ou américain a donc
   exactement les mêmes droits qu'un client français — la page ne les diminue
   pas au motif qu'elle est écrite en anglais. */

export default async function ConfidentialiteEn({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue) || langue === LANGUE_RACINE) notFound();
  const e = ENTREPRISE;

  return (
    <PageLegale
      langue={langue}
      titre="Privacy policy"
      intro="How your data, and the data appearing on the documents you upload, is handled — by whom, and for how long."
    >
      <p className="legal-encadre">
        This is an English translation provided for convenience. The{' '}
        <a href="/confidentialite">French version</a> is the reference text. The controller is
        established in France, so the GDPR applies whatever country you order from —{' '}
        <strong>your rights are the same</strong>.
      </p>

      <h2>Controller</h2>
      <p>
        <Champ v={denomination()} />, <Champ v={e.adresse.join(', ')} />. For any question about
        your data: <a href={`mailto:${e.email}`}>{e.email}</a>.
      </p>

      <h2>Data processed</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Customer identification</td>
            <td>First name, last name, email address</td>
          </tr>
          <tr>
            <td>Uploaded documents</td>
            <td>
              School records, showing the student&apos;s name, their institution, their results and
              teacher comments, and sometimes their date of birth
            </td>
          </tr>
          <tr>
            <td>Order</td>
            <td>Reference, languages, number of documents, amount, currency, country, date</td>
          </tr>
          <tr>
            <td>Payment</td>
            <td>Handled directly by Stripe. No card details are received or stored by us</td>
          </tr>
        </tbody>
      </table>

      <h2 id="mineurs">Data relating to minors</h2>
      <p>
        School records most often concern minors. This data is supplied by the legal guardian, or by
        the student where of age. It is used only to carry out the translation. It is never
        profiled, never subject to automated decision-making, never used for advertising and never
        sold to a third party.
      </p>

      <h2>Purposes and legal bases</h2>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Carrying out and delivering the translation ordered</td>
            <td>Performance of the contract — Article 6.1.b GDPR</td>
          </tr>
          <tr>
            <td>Issuing invoices and keeping accounts</td>
            <td>Legal obligation — Article 6.1.c GDPR</td>
          </tr>
          <tr>
            <td>Answering a question or a complaint</td>
            <td>Legitimate interest — Article 6.1.f GDPR</td>
          </tr>
        </tbody>
      </table>

      <h2>Retention periods</h2>
      <p>
        Uploaded documents and the translations produced are kept for{' '}
        <strong>{CONSERVATION_JOURS} days</strong> from upload, then deleted. Accounting records are
        kept for the period required by French law.
      </p>
      <p>
        Save your translation as soon as you receive it: after {CONSERVATION_JOURS} days we can no
        longer send it to you.
      </p>

      <h2>Security</h2>
      <p>
        Documents are stored in a private area, encrypted at rest, and are never accessible through
        a public address. Each download goes through a link that expires. Transfers use TLS.
        Documents are never sent as email attachments to our internal notifications.
      </p>

      <h2>Recipients</h2>
      <p>
        Your data is disclosed only to the people who carry out the translation, and to the
        following processors, each for a defined purpose:
      </p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Processor</th>
            <th>Role</th>
            <th>Location</th>
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

      <h2>Transfers outside the European Union</h2>
      <p>
        Some processors are established in the United States. These transfers are covered by the
        European Commission&apos;s standard contractual clauses and, where applicable, by the
        EU–US Data Privacy Framework.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        This site sets <strong>no advertising or analytics cookie</strong>, and therefore displays
        no consent banner. Your browser stores your draft order and your language choice on your own
        device, so you do not lose them if you leave the page. Nothing is sent to a third party.
      </p>

      <h2>Your rights</h2>
      <p>
        You have the right of access, rectification, erasure, restriction, objection and
        portability. Write to <a href={`mailto:${e.email}`}>{e.email}</a>: we reply within one
        month. You may also lodge a complaint with the French supervisory authority, the{' '}
        <a href="https://www.cnil.fr" rel="noreferrer" target="_blank">
          CNIL
        </a>
        , or with the supervisory authority of your country of residence within the European Union.
      </p>
    </PageLegale>
  );
}
