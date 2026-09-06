import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageLegale from '@/components/PageLegale';
import { ENTREPRISE } from '@/lib/legal';
import { LANGUE_RACINE, estLangue } from '@/lib/langues';

export const metadata: Metadata = {
  title: 'Contact — Protranslayte',
  robots: { index: false, follow: false },
};

export default async function ContactEn({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue) || langue === LANGUE_RACINE) notFound();
  const e = ENTREPRISE;

  return (
    <PageLegale
      langue={langue}
      titre="Contact"
      intro="A question before ordering, or a file in progress? Write to us — a person answers."
    >
      <h2>By email</h2>
      <p>
        <a href={`mailto:${e.email}`}>{e.email}</a> — we answer within one business day, Monday to
        Friday.
      </p>

      <h2 id="suivre-un-dossier">Tracking a file</h2>
      <p>
        Quote the reference from your confirmation email — it looks like{' '}
        <code>PT-260906-A3F2</code>. It is the fastest way for us to find your file. If you have
        lost it, the email address you ordered with is enough.
      </p>

      <h2>Refund or complaint</h2>
      <p>
        Write to the same address, quoting your reference. You are covered by a 30-day
        money-back guarantee, with no justification required — see our{' '}
        <a href={`/${langue}/cgv`}>terms of sale</a>.
      </p>
    </PageLegale>
  );
}
