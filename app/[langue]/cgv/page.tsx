import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, denomination } from '@/lib/legal';
import { MAX_DOCS, MAX_PAGES } from '@/lib/data';
import { CONSERVATION_JOURS } from '@/lib/stockage';
import { LANGUE_RACINE, estLangue } from '@/lib/langues';

export const metadata: Metadata = {
  title: 'Terms of sale — Protranslayte',
  robots: { index: false, follow: false },
};

/* Conditions de vente, version anglaise.

   Elles disent la MÊME chose que la version française, parce que c'est le même
   contrat : une entreprise française vend depuis la France, sous droit
   français. Traduire ne délocalise rien, et la page le dit en tête plutôt que
   de laisser croire à un cadre local.

   Le prix n'est plus écrit en dur : il dépend du pays du visiteur. On renvoie
   donc au montant affiché avant paiement, qui est la seule valeur qui engage. */

export default async function CgvEn({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue) || langue === LANGUE_RACINE) notFound();
  const e = ENTREPRISE;

  return (
    <PageLegale
      langue={langue}
      titre="Terms of sale"
      intro="What you are buying, at what price, within what time, and what happens if something goes wrong."
    >
      <p className="legal-encadre">
        This is an English translation provided for convenience. The{' '}
        <a href="/cgv">French version</a> is the reference text. The contract is governed by French
        law, whatever the country you order from.
      </p>

      <h2>Article 1 — The seller</h2>
      <p>
        <Champ v={denomination()} />, sole trader registered in France, SIRET{' '}
        <Champ v={e.siret} />, <Champ v={e.adresse.join(', ')} />. Contact:{' '}
        <a href={`mailto:${e.email}`}>{e.email}</a>. Full details appear on the{' '}
        <a href={`/${langue}/mentions-legales`}>legal notice</a> page.
      </p>

      <h2>Article 2 — What the service is</h2>
      <p>
        We translate school records — report cards, transcripts, school reports and diplomas — and
        deliver a certified translation accompanied by a certificate of translation accuracy naming
        the translator, dated and signed.
      </p>
      <p>
        Institutions set their own requirements. A certificate of accuracy is the format most
        universities expect, but <strong>we cannot guarantee that a given institution will accept
        it</strong>: some require a credential evaluation, a translation issued by the school of
        origin, or a specific accreditation. Check what your institution asks for before ordering,
        and tell us if it asks for something particular.
      </p>

      <h2>Article 3 — Price</h2>
      <p>
        Prices are shown inclusive of all taxes, in the currency displayed on the page. They do not
        depend on the density of the text nor on the language pair.
      </p>
      <p>
        <strong>The unit charged is the page, not the file.</strong> A double-sided report card
        counts as two pages, a six-page school report as six. The number of pages of each document
        is determined automatically at upload and shown to you, so the total is known before any
        payment.
      </p>
      <p>
        An order may cover up to {MAX_DOCS} files and {MAX_PAGES} pages. Beyond that, write to{' '}
        <a href={`mailto:${e.email}`}>{e.email}</a>: your file is handled the same way.
      </p>
      <p>
        Postal delivery of the stamped original is an option, charged per order regardless of the
        number of pages, and <strong>offered to mainland France only</strong>.
      </p>
      <p>
        Struck-through prices shown on the site correspond to the rate actually charged before the
        current promotion, in accordance with Article L112-1-1 of the French Consumer Code.
      </p>

      <h2>Article 4 — Placing an order</h2>
      <p>Ordering involves: choosing the source and target languages; uploading the documents to be
        translated, as PDF or image, up to 10 MB per file — the page count and the amount are shown
        before any payment details are entered; and entering your contact details.</p>
      <p>
        The order becomes final only once payment has actually been received. A confirmation email
        carrying a file reference is sent to the address given. It is your proof of order.
      </p>

      <h2>Article 5 — Payment</h2>
      <p>
        Payment is made online by card or Apple Pay at the time of ordering. Transactions are
        handled by Stripe Payments Europe, Ltd. <strong>No card details pass through or are stored
        on our servers.</strong>
      </p>

      <h2>Article 6 — Delivery time</h2>
      <p>
        Delivery takes place within <strong>24 to 48 business hours</strong> of payment being
        received, by email, to the address given when ordering. Saturdays, Sundays and public
        holidays are not counted.
      </p>
      <p>
        If you chose postal delivery of the original, it is sent by tracked mail within 48 hours of
        the translation. Digital delivery is not delayed by it.
      </p>
      <p>
        Should the announced time be exceeded, you may give us notice to perform within a reasonable
        additional period. Failing performance, you may terminate the contract in writing and obtain
        a full refund.
      </p>

      <h2>Article 7 — Right of withdrawal</h2>
      <p>
        You have <strong>fourteen days</strong> from the order to exercise your right of withdrawal,
        without giving any reason and without cost.
      </p>
      <p>
        <strong>We do not ask you to waive it.</strong> The law would allow us to have you waive
        this right in exchange for immediate performance. We have chosen not to: you keep your right
        of withdrawal in full, including once the translation has been delivered.
      </p>
      <p>
        To exercise it, write to <a href={`mailto:${e.email}`}>{e.email}</a> quoting your file
        reference. No particular wording is required.
      </p>

      <h2>Article 8 — Money-back guarantee</h2>
      <p>
        <strong>30 days, no justification.</strong> This commercial guarantee is in addition to the
        right of withdrawal and goes beyond what the law requires. If the translation does not suit
        you, for whatever reason, write to us and we refund you.
      </p>
      <p>
        The refund is made within a few business days, by the same means of payment used for the
        order, at no cost to you. The statutory maximum of fourteen days remains guaranteed where
        the right of withdrawal is exercised.
      </p>
      <p>
        You have nothing to return and nothing to prove. If the document was refused by the body you
        presented it to, simply tell us the reason given: in most cases we correct and reissue it at
        no charge.
      </p>

      <h2>Article 9 — Complaints and statutory guarantees</h2>
      <p>
        Any complaint about a translation error, an omission or a transcription error must be sent
        to <a href={`mailto:${e.email}`}>{e.email}</a> quoting the file reference. An error
        attributable to us is corrected free of charge and as quickly as possible.
      </p>
      <p>
        The service remains subject to the statutory guarantee of conformity (Articles L217-1 et
        seq. of the French Consumer Code) and to the guarantee against hidden defects (Articles 1641
        et seq. of the French Civil Code).
      </p>

      <h2>Article 10 — Liability</h2>
      <p>
        We answer for the fidelity of the translation and for the regularity of its certification.
        We cannot however be held liable where a receiving institution refuses the document for
        reasons of its own — a requirement we were not told about, an evaluation required in
        addition, or a rule specific to that institution.
      </p>
      <p>
        Our liability is in any event limited to the amount actually paid for the order concerned.
      </p>

      <h2>Article 11 — Personal data</h2>
      <p>
        Uploaded documents are kept in a private storage area for {CONSERVATION_JOURS} days, then
        deleted. They contain personal data, most often relating to minors, and are disclosed only
        to the people who carry out the translation. See the{' '}
        <a href={`/${langue}/confidentialite`}>privacy policy</a>.
      </p>

      <h2>Article 12 — Dispute resolution</h2>
      <p>
        Send your complaint to <a href={`mailto:${e.email}`}>{e.email}</a> first. Given the
        money-back guarantee in Article 8, the vast majority of disagreements are settled in a
        single exchange.
      </p>

      <h2>Article 13 — Governing law</h2>
      <p>
        These terms are governed by French law and the French courts have jurisdiction. This clause
        does not deprive a consumer of the right to bring proceedings before the court of their place
        of residence where the applicable law so provides.
      </p>
    </PageLegale>
  );
}
