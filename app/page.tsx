import Link from 'next/link';
import BandeauOffre from '@/components/BandeauOffre';
import Carrousel from '@/components/Carrousel';
import CarteCommande from '@/components/CarteCommande';
import Comparateur from '@/components/Comparateur';
import NotificationAchat from '@/components/NotificationAchat';
import Logo from '@/components/Logo';
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
          <img className="ata" src="/ata.png" width={320} height={320} alt="American Translators Association" />
        </span>
      </div>
      <div className="logo-item" {...attrs}>
        <span className="logo-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="atc" src="/atc.png" width={640} height={165} alt="Association of Translation Companies" />
        </span>
      </div>
      <div className="logo-item" {...attrs}>
        <span className="logo-chip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="th" src="/th.png" width={340} height={280} alt="Trackhouse" />
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
      <BandeauOffre />

      <header className="nav">
        <div className="wrap">
          <Logo />
          <nav className="navlinks">
            <a href="#process">Comment ça marche</a>
            <a href="#documents">Bulletins acceptés</a>
            <a href="#assermentation">Certification</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="navcta">
            <a className="btn btn-primary" href="#dossier">
              Traduire mon bulletin
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="hero-intro">
            <span className="eyebrow">Traduction certifiée de bulletins scolaires</span>
            <h1>Votre bulletin de notes, traduit et certifié, sans devis à attendre.</h1>
            <p className="lead">
              <span className="lead-long">
                Déposez votre bulletin, choisissez la langue d&apos;arrivée, payez 25&nbsp;€ au lieu
                de 35&nbsp;€. Un traducteur assermenté prend le relais — livraison sous 24 à
                48&nbsp;h, reconnue par les universités et administrations.
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
              <h3>Dépôt du bulletin</h3>
              <p>Vous téléversez une photo ou un scan de votre bulletin et réglez 25&nbsp;€ par carte, en une fois.</p>
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
              <span className="eyebrow">Notre spécialité</span>
              <h2 style={{ marginTop: 10 }}>Un seul document, fait pour être fait bien</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>
                Contrairement aux agences généralistes, protranslayte se concentre sur un seul type
                de document : le bulletin de notes. Cette spécialisation garantit une mise en page
                fidèle et un vocabulaire scolaire précis, quelle que soit la langue.
              </p>
              <ul>
                <li><Coche />Bulletins trimestriels et semestriels</li>
                <li><Coche />Collège, lycée général, technologique et professionnel</li>
                <li><Coche />Systèmes de notation français conservés et expliqués</li>
              </ul>
            </div>
            <div className="variant-grid">
              <div className="variant"><b>Bulletin collège</b><span>4e, 3e — bilan trimestriel</span></div>
              <div className="variant"><b>Bulletin lycée</b><span>Seconde à Terminale</span></div>
              <div className="variant"><b>Livret scolaire</b><span>Suivi annuel des acquis</span></div>
              <div className="variant"><b>Relevé de moyennes</b><span>Extrait synthétique</span></div>
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
            <h2>Tout ce qu&apos;il faut savoir avant de déposer votre bulletin</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>Le prix de 25&nbsp;€ inclut-il vraiment tout ?</summary>
              <p>Oui. 25&nbsp;€ couvre la traduction assermentée d&apos;un bulletin, quelle que soit la paire de langues, la certification par un traducteur assermenté et la livraison du PDF signé par email.</p>
            </details>
            <details>
              <summary>Combien de temps pour recevoir ma traduction ?</summary>
              <p>Sous 24 à 48&nbsp;h ouvrées après paiement et réception d&apos;un document lisible. Un email de confirmation est envoyé dès le dépôt du dossier.</p>
            </details>
            <details>
              <summary>Quels formats de fichiers sont acceptés ?</summary>
              <p>PDF et photos jusqu&apos;à 10 Mo par fichier. Une photo nette et bien cadrée du bulletin suffit — pas besoin de scanner professionnel.</p>
            </details>
            <details>
              <summary>La traduction est-elle acceptée par les administrations et universités ?</summary>
              <p>Oui. La traduction assermentée porte le cachet et la signature d&apos;un traducteur agréé près d&apos;une Cour d&apos;appel, reconnue par les établissements scolaires, universités et administrations françaises et étrangères.</p>
            </details>
          </div>
        </div>
      </section>

      <NotificationAchat />

      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div style={{ marginBottom: 10 }}>
                <Logo />
              </div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', maxWidth: 280 }}>
                Traduction assermentée de bulletins de notes, prix fixe, sans devis à attendre.
              </p>
            </div>
            <div>
              <h4>Service</h4>
              <ul>
                <li><a href="#process">Comment ça marche</a></li>
                <li><a href="#documents">Bulletins acceptés</a></li>
                <li><a href="#assermentation">Certification</a></li>
              </ul>
            </div>
            <div>
              <h4>Entreprise</h4>
              <ul>
                <li><Link href="/mentions-legales">Mentions légales</Link></li>
                <li><Link href="/cgv">CGV</Link></li>
                <li><Link href="/confidentialite">Confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
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
