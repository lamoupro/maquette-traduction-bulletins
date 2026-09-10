import Link from 'next/link';
import BandeauOffre from '@/components/BandeauOffre';
import ChoixLangue from '@/components/ChoixLangue';
import Carrousel from '@/components/Carrousel';
import CarteCommande from '@/components/CarteCommande';
import Comparateur from '@/components/Comparateur';
import DonneesStructurees from '@/components/DonneesStructurees';
import Logo from '@/components/Logo';
import { AVIS, type Avis } from '@/lib/data';

/* Un avis s'affiche dans la langue de la page quand nous en avons une
   traduction, et dans sa langue d'origine sinon.

   Les avis écrits en anglais ne sont jamais traduits : ils restent en anglais
   partout, y compris sur le site français. Traduire une traduction n'ajoute
   rien et éloigne un peu plus du texte que la personne a réellement écrit.

   Un texte traduit est SIGNALÉ comme tel. Une traduction n'est pas une
   citation, et la présenter sans le dire reviendrait à faire dire à quelqu'un
   des mots qu'il n'a pas écrits. */
function texteAvis(a: Avis, langue: Langue) {
  if (langue === a.ecritEn) return { texte: a.texte, traduit: false };
  const traduction = a[langue as 'en' | 'es' | 'pt'];
  return traduction ? { texte: traduction, traduit: true } : { texte: a.texte, traduit: false };
}
import { headers } from 'next/headers';
import { chemin, type Langue } from '@/lib/langues';
import { deviseDuPays } from '@/lib/devises';
import { textes } from '@/lib/traductions';

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
function SerieLogos({ muet, t }: { muet?: boolean; t: ReturnType<typeof textes> }) {
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
          <span className="badge-role">{t.partenaires.trackhouse}</span>
        </div>
      </div>
      <div className="delivery-badge" {...attrs}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className="badge-copy">
          <span className="d-main">24–48h</span>
          <span className="d-sub">{t.partenaires.livraison}</span>
        </div>
      </div>
    </>
  );
}

export default async function Accueil({ langue }: { langue: Langue }) {
  const t = textes(langue);

  /* La devise est résolue DÈS LE RENDU, d'après le pays de la requête.

     La carte de commande démarrait en dollars et n'apprenait la vraie devise
     qu'à la réponse du premier dépôt : un visiteur français lisait « 25 € » dans
     le titre et « Payer $25 » sur le bouton, sur la même page. Le prix affiché
     ne doit jamais dépendre d'un aller-retour qui n'a pas encore eu lieu.

     Le serveur reste seul juge : cette valeur sert à AFFICHER, et le dépôt
     recalculera la sienne à partir du même en-tête. */
  const devise = deviseDuPays((await headers()).get('x-vercel-ip-country'));
  const p = (suite: string) => chemin(langue, suite);

  return (
    <>
      <DonneesStructurees />
      <BandeauOffre t={t.tunnel} />

      <header className="nav">
        <div className="wrap">
          <Logo />
          <nav className="navlinks">
            <a href="#process">{t.nav.process}</a>
            <a href="#documents">{t.nav.documents}</a>
            <a href="#assermentation">{t.nav.certification}</a>
            <a href="#faq">{t.nav.faq}</a>
          </nav>
          <div className="navcta">
            <a className="btn btn-primary" href="#dossier">
              {t.nav.cta}
            </a>
            <ChoixLangue actuelle={langue} libelle={t.langue.libelle} />
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
            <span className="eyebrow">{t.hero.eyebrow}</span>
            <h1>{t.hero.titre}</h1>
            <p className="lead">
              <span className="lead-long">{t.hero.leadLong}</span>
              <span className="lead-short">{t.hero.leadCourt}</span>
            </p>
            <div className="trustchips">
              {t.hero.puces.map((puce) => (
                <span className="chip" key={puce}>
                  <Coche />
                  {puce}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-stage">
            <Comparateur t={t.tunnel} />
            <CarteCommande t={t.tunnel} langue={langue} deviseInitiale={devise} />
          </div>
        </div>
      </section>

      <section className="logo-strip">
        <span className="eyebrow">{t.partenaires.eyebrow}</span>
        <Carrousel parCopie={4} className="logos-track" ariaLabel={t.partenaires.eyebrow}>
          <SerieLogos t={t} />
          <SerieLogos muet t={t} />
          <SerieLogos muet t={t} />
        </Carrousel>
      </section>

      <section className="reviews" id="avis">
        <div className="wrap">
          <div className="reviews-head">
            <span className="eyebrow">{t.avis.eyebrow}</span>
            <h2>{t.avis.titre}</h2>
            <p>{t.avis.intro}</p>
          </div>
        </div>
        <Carrousel
          parCopie={AVIS.length}
          className="reviews-track"
          arretDefinitif
          ariaLabel={t.avis.eyebrow}
        >
          {[0, 1, 2].map((copie) =>
            AVIS.map((a, i) => (
              <figure className="review-card" key={`${copie}-${i}`} aria-hidden={copie > 0}>
                <div className="review-stars" role="img" aria-label={`${a.e}/5`}>
                  {Array.from({ length: a.e }, (_, k) => (
                    <Etoile key={k} />
                  ))}
                </div>
                <blockquote className="review-text">{texteAvis(a, langue).texte}</blockquote>
                <figcaption className="review-meta">
                  <span className="review-av" aria-hidden="true">
                    {a.nom.charAt(0).toUpperCase()}
                  </span>
                  <span className="review-name">{a.nom}</span>
                  {texteAvis(a, langue).traduit && (
                    <span className="review-traduit">{t.avis.traduitDe}</span>
                  )}
                </figcaption>
              </figure>
            )),
          )}
        </Carrousel>
      </section>

      <section className="section" id="process">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t.parcours.eyebrow}</span>
            <h2>{t.parcours.titre}</h2>
            <p>{t.parcours.intro}</p>
          </div>
          <div className="rail">
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 4v11m0-11 4 4m-4-4-4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>{t.parcours.etapes[0].titre}</h3>
              <p>{t.parcours.etapes[0].texte}</p>
            </div>
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <h3>{t.parcours.etapes[1].titre}</h3>
              <p>{t.parcours.etapes[1].texte}</p>
            </div>
            <div className="step">
              <div className="stamp">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12l5 5L20 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>{t.parcours.etapes[2].titre}</h3>
              <p>{t.parcours.etapes[2].texte}</p>
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
              <span className="eyebrow">{t.documents.eyebrow}</span>
              <h2 style={{ marginTop: 10 }}>{t.documents.titre}</h2>
              <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>{t.documents.texte}</p>
              <ul>
                {t.documents.puces.map((puce) => (
                  <li key={puce}>
                    <Coche />
                    {puce}
                  </li>
                ))}
              </ul>
            </div>
            <div className="variant-grid">
              {t.documents.variantes.map(([nom, detail]) => (
                <div className="variant" key={nom}>
                  <b>{nom}</b>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="assermentation" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="annex">
            <div>
              <span className="eyebrow">{t.valeur.eyebrow}</span>
              <h2 style={{ marginTop: 10 }}>{t.valeur.titre}</h2>
              <p style={{ marginTop: 14 }}>{t.valeur.texte}</p>
            </div>
            <ul className="annex-list">
              {t.valeur.points.map(([nom, detail]) => (
                <li key={nom}>
                  <div>
                    <b>{nom}</b>
                    <span>{detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="faq" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{t.faq.eyebrow}</span>
            <h2>{t.faq.titre}</h2>
          </div>
          <div className="faq-list">
            {t.faq.questions.map(([question, reponse], i) => (
              <details key={question} open={i === 0}>
                <summary>{question}</summary>
                <p>{reponse}</p>
              </details>
            ))}
          </div>
        </div>
        </section>
      </main>

      {/* Les notifications d'achat ont été retirées le 5 septembre 2026 : elles
          tiraient dans un tableau de 200 acheteurs inventés. Le composant
          `NotificationAchat` et le tableau `ACHETEURS` restent dans le dépôt,
          débranchés — à ne remonter que sur de vraies commandes. */}

      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <div style={{ marginBottom: 10 }}>
                <Logo />
              </div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', maxWidth: 280 }}>
                {t.pied.accroche}
              </p>
            </div>
            <div>
              <h3>{t.pied.service}</h3>
              <ul>
                <li><a href="#process">{t.nav.process}</a></li>
                <li><a href="#documents">{t.nav.documents}</a></li>
                <li><a href="#assermentation">{t.nav.certification}</a></li>
              </ul>
            </div>
            <div>
              <h3>{t.pied.entreprise}</h3>
              <ul>
                <li><Link href={p('/mentions-legales')}>{t.legal.mentions}</Link></li>
                <li><Link href={p('/cgv')}>{t.legal.cgv}</Link></li>
                <li><Link href={p('/confidentialite')}>{t.legal.confidentialite}</Link></li>
              </ul>
            </div>
            <div>
              <h3>{t.pied.support}</h3>
              <ul>
                <li><a href="#faq">{t.nav.faq}</a></li>
                <li><Link href={p('/contact')}>{t.legal.contact}</Link></li>
                <li><Link href={p('/contact#suivre-un-dossier')}>{t.pied.suivi}</Link></li>
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
