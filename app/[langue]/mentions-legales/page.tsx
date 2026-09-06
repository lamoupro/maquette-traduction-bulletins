import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE, denomination } from '@/lib/legal';
import { LANGUE_RACINE, estLangue } from '@/lib/langues';

export const metadata: Metadata = {
  title: 'Legal notice — Protranslayte',
  robots: { index: false, follow: false },
};

/* Version anglaise des mentions légales, servie aux trois langues autres que
   le français.

   Les obligations d'information sont celles de la LCEN française : c'est une
   entreprise française qui édite le site, quel que soit le pays du lecteur.
   La page traduit donc ces mentions, elle n'en substitue pas d'autres. */

export default async function MentionsEn({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue) || langue === LANGUE_RACINE) notFound();
  const e = ENTREPRISE;

  return (
    <PageLegale
      langue={langue}
      titre="Legal notice"
      intro="Who publishes this site, who hosts it, and how to reach us."
    >
      <p className="legal-encadre">
        This is an English translation provided for convenience. The{' '}
        <a href="/mentions-legales">French version</a> is the reference text, and French law
        applies.
      </p>

      <h2>Publisher</h2>
      <p>
        <Champ v={denomination()} />, sole trader registered in France.
        <br />
        Registered office: <Champ v={e.adresse.join(', ')} />
        <br />
        SIRET: <Champ v={e.siret} />
        {e.tva ? (
          <>
            <br />
            VAT number: <Champ v={e.tva} />
          </>
        ) : (
          <>
            <br />
            VAT not applicable — Article 293 B of the French General Tax Code.
          </>
        )}
        <br />
        Email: <a href={`mailto:${e.email}`}>{e.email}</a>
        <br />
        Publication director: <Champ v={e.raisonSociale} />
      </p>

      <h2>Hosting</h2>
      <p>
        Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States —{' '}
        <a href="https://vercel.com" rel="noreferrer" target="_blank">
          vercel.com
        </a>
        . Uploaded documents are stored by Cloudflare, Inc., 101 Townsend St, San Francisco, CA
        94107, United States.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The layout, texts and images of this site are protected. The sample documents shown in the
        before/after comparison are real translations, irreversibly redacted. Reproduction without
        prior written consent is prohibited.
      </p>

      <h2>Reporting content</h2>
      <p>
        To report unlawful content, write to <a href={`mailto:${e.email}`}>{e.email}</a> stating the
        page concerned and the reason. We reply within one business day.
      </p>

      <h2>Complaints and disputes</h2>
      <p>
        Send any complaint to <a href={`mailto:${e.email}`}>{e.email}</a>, quoting your file
        reference. If no agreement is reached, a consumer resident in the European Union may refer
        the matter free of charge to a consumer ombudsman, and may use the European Commission&apos;s{' '}
        <a href="https://ec.europa.eu/consumers/odr" rel="noreferrer" target="_blank">
          online dispute resolution platform
        </a>
        .
      </p>
    </PageLegale>
  );
}
