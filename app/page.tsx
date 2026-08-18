import Link from 'next/link';
import BandeauOffre from '@/components/BandeauOffre';
import Carrousel from '@/components/Carrousel';
import CarteCommande from '@/components/CarteCommande';
import Comparateur from '@/components/Comparateur';
import DonneesStructurees from '@/components/DonneesStructurees';
import Logo from '@/components/Logo';
import NotificationAchat from '@/components/NotificationAchat';
import { AVIS } from '@/lib/data';

const Coche = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
  </svg>
);

const Etoile = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 1.6l2.5 5.1 5.6.8-4 4 .9 5.6L10 14.4l-5 2.7.9-5.6-4-4 5.6-.8z" />
  </svg>
);

/* Les logos partenaires sont triplés : le carrousel maintient la position dans
   la copie du milieu pour permettre de remonter en arrière indéfiniment. */
function SerieLogos({ muet }: { muet?: boolean }) {
  const attrs = muet ? { 'aria-hidden': true as const } : {};
  return (
    <>
      <div className="logo-item" {...attrs}>
        <span className="logo-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ata" src="/ata.png" width={170} height={170} alt="American Translators Association" />
        </span>
      </div>
      <div className="logo-item" {...attrs}>
        <span className="logo-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="atc" src="/atc.png" width={340} height={87} alt="Association of Translation Companies" />
        </span>
      </div>
      <div className="logo-item" {...attrs}>
        <span className="logo-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="th" src="/th.png" width={150} height={123} alt="Trackhouse" />
        </span>
        <div className="badge-copy">
          <span className="badge-name">Trackhouse</span>
          <span className="badge-role">Recrutement athlétique universitaire</span>
        </div>
      </div>
      <div className="delivery-badge" {...attrs}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className="badge-copy">
          <span className="d-main">24–48h</span>
          <span className="d-sub">Livraison garantie</span>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <>
      <DonneesStructurees />
      <BandeauOffre />

      <header className="nav">
        <div className="wrap">
          <Logo />
          <nav className="navlinks">
            <a href="#process">Comment ça marche</a>
            <a href="#documents">Documents acceptés</a>
            <a href="#assermentation">Certification</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="navcta">
            <a className="btn btn-primary" href="#dossier">
              Traduire mes documents
            </a>
          </div>
        </div>
      </header>

      {/* Repère principal : permet aux lecteurs d'écran de sauter la
          navigation et d'atteindre directement le contenu. */}
      <main>
        <section className="hero">
        <div className="wrap">
          <div className="hero-intro">
            {/* « assermentée » plutôt que « certifiée » : 1K–10K recherches
                mensuelles contre 100–1K, mesuré dans l'outil Google le 13 août. */}
            <span className="eyebrow">Traduction assermentée de bulletins et diplômes</span>
            <h1>Vos bulletins et diplômes, traduits et certifiés, sans devis à attendre.</h1>
            <p className="lead">
              <span className="lead-long">
                Déposez vos documents, choisissez la langue d&apos;arrivée, payez 25&nbsp;€ la
                page au lieu de 35&nbsp;€. Un traducteur assermenté prend le relais — livraison
                sous 24 à 48&nbsp;h, reconnue par les universités et administrations.
              </span>
              <span className="lead-short">
                Traduction assermentée en 24 à 48&nbsp;h, reconnue par les universités et
                administrations.
              </span>
            </p>
            <div className="trustchips">
              <span className="chip">
                <Coche />
                Traducteurs assermentés
              </span>
              <span className="chip">
                <Coche />
                Livraison 24–48h
              </span>
              <span className="chip">
                <Coche />
                Paiement sécurisé
              </span>
            </div>
          </div>

          <div className="hero-stage">
            <Comparateur />
            <CarteCommande />
          </div>
        </div>
      </section>

      <section className="logo-strip">
        <span className="eyebrow">Certifications &amp; partenaires</span>
        <Carrousel parCopie={4} className="logos-track" ariaLabel="Certifications et partenaires — faites défiler horizontalement">
          <SerieLogos />
          <SerieLogos muet />
          <SerieLogos muet />
        </Carrousel>
      </section>

      <section className="reviews" id="avis">
        <div className="wrap">
          <div className="reviews-head">
            <span className="eyebrow">Avis clients</span>
            <h2>Ils nous ont confié leur dossier</h2>
            <p>Inscriptions universitaires, diplômes, démarches administratives — voici leurs retours.</p>
          </div>
        </div>
        <Carrousel
          parCopie={AVIS.length}
          className="reviews-track"
          arretDefinitif
          ariaLabel="Avis clients — faites défiler horizontalement"
        >
          {[0, 1, 2].map((copie) =>
            AVIS.map((a, i) => (
              <figure className="review-card" key={`${copie}-${i}`} aria-hidden={copie > 0}>
                <div className="review-stars" role="img" aria-label={`${a.e} étoiles sur 5`}>
                  {Array.from({ length: a.e }, (_, k) => (
                    <Etoile key={k} />
                  ))}
                </div>
                <blockquote className="review-text">{a.texte}</blockquote>
                <figcaption className="review-meta">
                  <span className="review-av" aria-hidden="true">
                    {a.nom.charAt(0).toUpperCase()}
                  </span>
                  <span className="review-name">{a.nom}</span>
                </figcaption>
              </figure>
            )),
          )}
        </Carrousel>
      </section>

      <section className="section" id="process">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Le parcours de votre dossier</span>
            <h2>Du dépôt à la livraison, sans détour</h2>
            <p>
              Trois étapes, un interlocuteur : un traducteur assermenté, du premier clic à la remise
              du document final.
            </p>
          </div>
          <div className="rail">
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 4v11m0-11 4 4m-4-4-4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Dépôt des documents</h3>
              <p>Vous téléversez une photo ou un scan de chaque document. Le nombre de pages est compté automatiquement, et vous réglez 25&nbsp;€ la page, en une fois.</p>
            </div>
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <h3>Traduction assermentée</h3>
              <p>Un traducteur assermenté traduit chaque note, appréciation et mention, puis appose son cachet officiel.</p>
            </div>
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Livraison sous 24–48h</h3>
              <p>Le PDF certifié arrive par email, prêt à être transmis à l&apos;établissement ou l&apos;administration destinataire.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="documents" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="doc-focus">
            <div>
              {/* Formulé comme une expertise, pas comme une limite : chaque
                  futur service aura son propre site, et cette section ne doit
                  pas laisser entendre que l'entreprise ne fait que ça. */}
              <span className="eyebrow">Notre expertise</span>
              <h2 style={{ marginTop: 10 }}>Le vocabulaire scolaire ne s&apos;improvise pas</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>
                Coefficients, appréciations, mentions, livrets de compétences, moyennes sur 20 :
                autant de notions qui n&apos;ont pas d&apos;équivalent direct d&apos;un pays à
                l&apos;autre. Ce site est entièrement consacré aux documents scolaires, et nos
                traducteurs assermentés en traitent tous les jours.
              </p>
              <ul>
                <li><Coche />Bulletins trimestriels et semestriels</li>
                <li><Coche />Relevés de notes, livrets scolaires et diplômes</li>
                <li><Coche />Systèmes de notation français conservés et expliqués</li>
              </ul>
            </div>
            <div className="variant-grid">
              <div className="variant"><b>Bulletin collège</b><span>4e, 3e — bilan trimestriel</span></div>
              <div className="variant"><b>Bulletin lycée</b><span>Seconde à Terminale</span></div>
              <div className="variant"><b>Livret scolaire</b><span>Suivi annuel des acquis</span></div>
              <div className="variant"><b>Diplôme &amp; relevé</b><span>Baccalauréat, licence, master</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="assermentation" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="annex">
            <div>
              <span className="eyebrow">Valeur légale</span>
              <h2 style={{ marginTop: 10 }}>
                Une traduction assermentée, reconnue partout où elle est présentée
              </h2>
              <p style={{ marginTop: 14 }}>
                Chaque traduction est réalisée par un traducteur inscrit sur la liste d&apos;une Cour
                d&apos;appel, qui engage sa responsabilité en apposant son cachet, sa signature et son
                numéro d&apos;agrément.
              </p>
            </div>
            <ul className="annex-list">
              <li><div><b>Cachet et signature originaux</b><span>Sur chaque page du document livré, au format PDF signé.</span></div></li>
              <li><div><b>Numéro d&apos;agrément vérifiable</b><span>Traducteur inscrit près d&apos;une Cour d&apos;appel française.</span></div></li>
              <li><div><b>Conservation 3 ans</b><span>Dossier archivé pour toute demande de duplicata.</span></div></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout ce qu&apos;il faut savoir avant de déposer vos documents</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>Le prix de 25&nbsp;€ inclut-il vraiment tout ?</summary>
              <p>Oui. 25&nbsp;€ couvre la traduction assermentée d&apos;une page, quelle que soit la paire de langues, la certification par un traducteur assermenté et la livraison du PDF signé par email. Le tarif s&apos;entend par page : un bulletin recto verso compte pour deux, et le total s&apos;affiche avant tout paiement.</p>
            </details>
            <details>
              <summary>Combien de temps pour recevoir ma traduction ?</summary>
              <p>Sous 24 à 48&nbsp;h ouvrées après paiement et réception d&apos;un document lisible. Un email de confirmation est envoyé dès le dépôt du dossier.</p>
            </details>
            <details>
              <summary>Quels formats de fichiers sont acceptés ?</summary>
              <p>PDF et photos jusqu&apos;à 10 Mo par fichier. Une photo nette et bien cadrée du document suffit — pas besoin de scanner professionnel.</p>
            </details>
            <details>
              <summary>La traduction est-elle acceptée par les administrations et universités ?</summary>
              <p>Oui. La traduction assermentée porte le cachet et la signature d&apos;un traducteur agréé près d&apos;une Cour d&apos;appel, reconnue par les établissements scolaires, universités et administrations françaises et étrangères.</p>
            </details>
          </div>
        </div>
        </section>
      </main>

      {/* Remises en ligne le 16 août 2026, à titre temporaire, plafonnées à
          deux apparitions par visiteur (voir NotificationAchat). À rebrancher
          sur les vraies commandes ou retirer une fois l'intégration avec les
          agences partenaires terminée. */}
      <NotificationAchat />

      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div style={{ marginBottom: 10 }}>
                <Logo />
              </div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', maxWidth: 280 }}>
                Traduction assermentée de bulletins, relevés et diplômes. Prix fixe, sans devis à
                attendre.
              </p>
            </div>
            <div>
              <h3>Service</h3>
              <ul>
                <li><a href="#process">Comment ça marche</a></li>
                <li><a href="#documents">Documents acceptés</a></li>
                <li><a href="#assermentation">Certification</a></li>
              </ul>
            </div>
            <div>
              <h3>Entreprise</h3>
              <ul>
                <li><Link href="/mentions-legales">Mentions légales</Link></li>
                <li><Link href="/cgv">CGV</Link></li>
                <li><Link href="/confidentialite">Confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h3>Support</h3>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/contact#suivre-un-dossier">Suivi de dossier</Link></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Protranslayte</span>
            <span className="pay-icons">
              <span>VISA</span>
              <span>MASTERCARD</span>
              <span>STRIPE</span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
