import type { Metadata } from 'next';
import PageLegale, { Champ } from '@/components/PageLegale';
import { ENTREPRISE } from '@/lib/legal';

export const metadata: Metadata = { title: 'Contact — Protranslayte' };

export default function Contact() {
  const e = ENTREPRISE;

  return (
    <PageLegale
      titre="Contact"
      intro="Une question avant de commander, ou un dossier en cours à suivre ? Écrivez-nous, une personne vous répond."
    >
      <div className="legal-contact">
        <div className="legal-carte">
          <h2>Par courrier électronique</h2>
          <p className="legal-gros">
            <a href={`mailto:${e.email}`}>{e.email}</a>
          </p>
          <p>
            C&apos;est le moyen le plus rapide. Réponse sous un jour ouvré. Si votre message
            concerne une commande, indiquez sa référence — elle figure dans votre courrier de
            confirmation, sous la forme <span className="tabular">PT-000000-XXXX</span>.
          </p>
        </div>

        {/* Pas de téléphone ici : le support se fait par écrit, pour garder une
            trace du dossier et de la référence. Le numéro reste publié dans les
            mentions légales, où la loi l'exige. */}
        <div className="legal-carte">
          <h2>Par voie postale</h2>
          <p>
            <Champ v={e.raisonSociale} />
            <br />
            {e.adresse.map((l, i) => (
              <span key={i} style={{ display: 'block' }}>
                <Champ v={l} />
              </span>
            ))}
          </p>
        </div>
      </div>

      <h2 id="suivre-un-dossier">Suivre un dossier</h2>
      <p>
        Toute commande donne lieu à un courrier électronique de confirmation portant une référence.
        La traduction est livrée à cette même adresse sous 24 à 48 heures ouvrées. Si le délai est
        dépassé, écrivez-nous en rappelant la référence : nous vous indiquons où en est le dossier.
      </p>
      <p>
        Pensez à vérifier votre dossier de courriers indésirables avant de nous relancer — les
        messages automatiques y atterrissent parfois.
      </p>

      <h2>Réclamation ou remboursement</h2>
      <p>
        Écrivez-nous à <a href={`mailto:${e.email}`}>{e.email}</a> en rappelant votre référence.
        Une traduction qui ne convient pas est corrigée sans frais, ou remboursée — vous avez{' '}
        {ENTREPRISE.garantieJours} jours, sans justification à fournir. Le détail figure à
        l&apos;article 8 des <a href="/cgv">conditions générales de vente</a>.
      </p>
    </PageLegale>
  );
}
