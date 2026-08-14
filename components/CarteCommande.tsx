'use client';

import { useEffect, useRef, useState } from 'react';
import { MAX_DOCS, PRIX_ENVOI, PRIX_NORMAL, PRIX_OFFRE } from '@/lib/data';
import PaiementStripe from './PaiementStripe';

const LANGUES = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Portugais', 'Italien', 'Allemand'];

// Les montants ronds restent sans décimale — « 25 € », pas « 25,00 € ».
const eur = (n: number) =>
  `${n.toLocaleString('fr-FR', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })} €`;
const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const cpValide = (v: string) => /^\d{5}$/.test(v.trim());

export default function CarteCommande() {
  const [source, setSource] = useState('Français');
  const [cible, setCible] = useState('Anglais');
  const [qte, setQte] = useState(1);
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [email, setEmail] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [remarque, setRemarque] = useState('');
  const [postal, setPostal] = useState(false);
  const [adresse, setAdresse] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [dossier, setDossier] = useState('—');

  const refFichier = useRef<HTMLInputElement>(null);
  const refCarte = useRef<HTMLDivElement>(null);
  const [cachetVisible, setCachetVisible] = useState(false);

  // Numéro de dossier généré côté client : évite toute divergence entre le
  // rendu serveur et le rendu navigateur.
  useEffect(() => {
    setDossier(String(Math.floor(100000 + Math.random() * 899999)));
  }, []);

  const avant = qte * PRIX_NORMAL;
  const apres = qte * PRIX_OFFRE;
  // L'envoi papier est facturé une fois par commande, pas par document :
  // trois bulletins tiennent dans la même enveloppe.
  const total = apres + (postal ? PRIX_ENVOI : 0);
  const contactComplet = emailValide(email) && prenom.trim() !== '' && nom.trim() !== '';
  const adresseComplete =
    !postal || (adresse.trim() !== '' && cpValide(codePostal) && ville.trim() !== '');
  const peutPayer = fichiers.length > 0 && contactComplet && adresseComplete && !envoi;

  const etape = contactComplet && fichiers.length > 0 ? 3 : fichiers.length > 0 ? 2 : 1;
  const libelleEtape = ['Déposez vos documents', 'Vos coordonnées', 'Prêt à payer'][etape - 1];

  // Barre collante : visible dès que la carte sort de l'écran.
  useEffect(() => {
    const carte = refCarte.current;
    if (!carte || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      ([e]) => setCachetVisible(!e.isIntersecting && window.scrollY > 240),
      { threshold: 0.12 },
    );
    obs.observe(carte);
    return () => obs.disconnect();
  }, []);

  function surFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;
    const tab = Array.from(liste);
    setFichiers(tab);
    if (tab.length > qte) setQte(Math.min(tab.length, MAX_DOCS));
    setMessage('');
  }

  async function commander(moyen: 'carte' | 'applepay') {
    if (fichiers.length === 0) {
      setMessage('Déposez d’abord vos documents.');
      return;
    }
    setEnvoi(true);
    setMessage('');
    try {
      const donnees = new FormData();
      donnees.append('source', source);
      donnees.append('cible', cible);
      donnees.append('quantite', String(qte));
      donnees.append('email', email);
      donnees.append('prenom', prenom);
      donnees.append('nom', nom);
      donnees.append('remarque', remarque);
      donnees.append('moyen', moyen);
      donnees.append('envoiPostal', postal ? '1' : '0');
      if (postal) {
        donnees.append('adresse', adresse);
        donnees.append('codePostal', codePostal);
        donnees.append('ville', ville);
      }
      fichiers.forEach((f) => donnees.append('fichiers', f));

      const r = await fetch('/api/commande', { method: 'POST', body: donnees });
      const json = await r.json();
      if (!r.ok) throw new Error(json.erreur || 'Envoi impossible');
      if (!json.clientSecret) throw new Error("Le paiement n'a pas pu être initialisé.");
      // Les documents sont déposés, le paiement peut commencer : on remplace
      // le formulaire par Checkout, dans la même carte.
      setReference(json.reference);
      setClientSecret(json.clientSecret);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez dans un instant.',
      );
    } finally {
      setEnvoi(false);
    }
  }

  // Paiement en cours : Checkout prend toute la carte. Le visiteur reste sur
  // protranslayte.com, seul le formulaire vient de Stripe.
  if (reference && clientSecret) {
    return (
      <div className="dossier" id="dossier" ref={refCarte}>
        <div className="dossier-top">
          <span className="eyebrow">Paiement sécurisé</span>
          <span className="ref tabular">DOSSIER N° {reference}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink-soft)' }}>
          Vos {fichiers.length > 1 ? 'documents sont déposés' : 'document est déposé'}. Il ne reste
          qu’à régler {eur(total)}.
        </p>
        <PaiementStripe clientSecret={clientSecret} />
        <div className="microtrust">
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Paiement chiffré, traité par Stripe
          </div>
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Satisfait ou remboursé 30 jours
          </div>
        </div>
      </div>
    );
  }

  if (reference) {
    return (
      <div className="dossier" id="dossier" ref={refCarte}>
        <div className="dossier-top">
          <span className="eyebrow">Dossier enregistré</span>
          <span className="ref tabular">DOSSIER N° {reference}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          Merci {prenom}. Nous avons bien reçu {fichiers.length}{' '}
          {fichiers.length > 1 ? 'documents' : 'document'}.
        </p>
        <div className="microtrust">
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Un récapitulatif part à l’adresse {email}
          </div>
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Traduction livrée sous 24 à 48 h
          </div>
          {postal && (
            <div>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
              </svg>
              Original papier envoyé à {ville || 'votre adresse'}
            </div>
          )}
        </div>
        <p className="toast">
          Le paiement sera branché à l’étape suivante : votre dossier est enregistré, rien n’a été
          débité.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="dossier" id="dossier" ref={refCarte}>
        <div className="dossier-top">
          <span className="eyebrow">Devis instantané</span>
          <span className="ref tabular">DOSSIER N° {dossier}</span>
        </div>

        <div className="etapes">
          <div className="etapes-barre" aria-hidden="true">
            <i className={etape >= 1 ? 'on' : ''} />
            <i className={etape >= 2 ? 'on' : ''} />
            <i className={etape >= 3 ? 'on' : ''} />
          </div>
          <p className="etapes-txt" aria-live="polite">
            <strong>Étape {etape} sur 3</strong> · {libelleEtape}
          </p>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="src">Langue source</label>
            <select id="src" value={source} onChange={(e) => setSource(e.target.value)}>
              {LANGUES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <button
            className="swap"
            type="button"
            aria-label="Inverser les langues"
            onClick={() => {
              setSource(cible);
              setCible(source);
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 7h11M15 7l-3-3M15 7l-3 3M16 13H5M5 13l3-3M5 13l3 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="field">
            <label htmlFor="tgt">Langue souhaitée</label>
            <select id="tgt" value={cible} onChange={(e) => setCible(e.target.value)}>
              {LANGUES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="doctype-lock">
          {/* C'est ici que le visiteur vérifie s'il a le droit d'envoyer son
              diplôme. Tant que cette ligne ne le nomme pas, il ne l'envoie pas,
              quelle que soit la page d'accueil. */}
          <span className="name">Bulletins et diplômes</span>
          <span className="qty">
            <button
              type="button"
              aria-label="Retirer un document"
              disabled={qte <= 1}
              onClick={() => setQte((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="qty-val" aria-live="polite">
              {qte}
            </span>
            <button
              type="button"
              aria-label="Ajouter un document"
              disabled={qte >= MAX_DOCS}
              onClick={() => setQte((q) => Math.min(MAX_DOCS, q + 1))}
            >
              +
            </button>
          </span>
        </div>

        <div className="price-row">
          <span className="label">
            Traduction assermentée {source} → {cible}
          </span>
          <span className="amount-wrap">
            <s className="amount-old tabular">{eur(avant)}</s>
            <span className="amount tabular">
              {apres.toLocaleString('fr-FR')}
              <sup>€</sup>
            </span>
          </span>
        </div>

        {postal && (
          <div className="ligne-sup">
            <span>Envoi de l&apos;original par courrier</span>
            <span className="tabular">+&nbsp;{eur(PRIX_ENVOI)}</span>
          </div>
        )}

        {/* Le <label> ouvre nativement le sélecteur : pas d'appel JS
            supplémentaire, qui provoquait une double ouverture annulée par
            Safari iOS. Le filtre accepte les photos iPhone (HEIC). */}
        <label className="upload">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 4v11m0-11 4 4m-4-4-4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="u-title">Déposez vos documents ici</span>
          <span className="u-sub">Bulletins, relevés, diplômes · plusieurs fichiers à la fois</span>
          {fichiers.length > 0 && (
            <span className="fichiers" style={{ display: 'flex' }}>
              {fichiers.map((f) => (
                <span key={f.name}>✓ {f.name}</span>
              ))}
            </span>
          )}
          <input
            type="file"
            ref={refFichier}
            accept="application/pdf,image/*"
            multiple
            onChange={(e) => surFichiers(e.target.files)}
          />
        </label>

        {fichiers.length > 0 && (
          <div className="contact">
            <div>
              <label className="aide" htmlFor="email">
                Où devons-nous envoyer la traduction ?
              </label>
              <input
                type="email"
                id="email"
                inputMode="email"
                autoComplete="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={email !== '' && !emailValide(email)}
                required
              />
            </div>
            <div className="duo">
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
              <input
                type="text"
                autoComplete="family-name"
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <textarea
              rows={2}
              placeholder="Une précision sur votre dossier ? (facultatif)"
              value={remarque}
              onChange={(e) => setRemarque(e.target.value)}
            />

            {/* Proposé seulement ici, une fois le bulletin déposé : présenté
                d'emblée, un supplément payant ferait hésiter avant même que
                le visiteur ait commencé. */}
            <label className="option-postal">
              <input
                type="checkbox"
                checked={postal}
                onChange={(e) => setPostal(e.target.checked)}
              />
              <span className="op-txt">
                <span className="op-titre">Recevoir aussi l&apos;original par courrier</span>
                <span className="op-sub">
                  Exemplaire papier tamponné et signé, envoi suivi en France
                </span>
              </span>
              <span className="op-prix tabular">+&nbsp;{eur(PRIX_ENVOI)}</span>
            </label>

            {postal && (
              <div className="adresse-bloc">
                <input
                  type="text"
                  autoComplete="street-address"
                  placeholder="Numéro et rue"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  required
                />
                <div className="duo duo-cp">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="Code postal"
                    maxLength={5}
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={codePostal !== '' && !cpValide(codePostal)}
                    required
                  />
                  <input
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Ville"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    required
                  />
                </div>
                <p className="aide">
                  L&apos;original part sous 48 h après la traduction. Vous recevez de toute façon
                  la version numérique par e-mail, sans attendre le courrier.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          type="button"
          disabled={!peutPayer}
          onClick={() => commander('carte')}
        >
          {envoi ? 'Envoi en cours…' : `Payer ${eur(total)} et faire traduire ${qte > 1 ? 'mes documents' : 'mon document'}`}
        </button>

        <div className="pay-divider">ou</div>

        {/* Apple Pay mène au même formulaire, où il est proposé en premier sur
            les appareils Apple. Il exige donc les mêmes coordonnées : la
            traduction se livre par e-mail, il nous faut l'adresse avant le
            paiement, pas après. */}
        <button
          className="apple-pay-btn"
          type="button"
          aria-label="Payer avec Apple Pay"
          disabled={!peutPayer}
          onClick={() => commander('applepay')}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.5 6.4c-.6.7-1.5 1.3-2.5 1.2-.1-1 .4-2 .9-2.6.6-.7 1.6-1.3 2.4-1.3.1 1-.3 2-1 2.7zm.9 1.4c-1.4-.1-2.6.8-3.2.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.7.8-3.5 2.1-1.5 2.5-.4 6.3 1 8.3.7 1 1.6 2.1 2.7 2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7 1.9-1 2.6-2c.6-.9.9-1.7 1.1-2.1-2.9-1.1-3.4-5.3-.5-6.9-.8-1.1-2-1.5-2.9-1.5z" />
          </svg>
          <span>Pay</span>
        </button>

        <div className="toast">{message}</div>

        <div className="microtrust">
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Traducteur assermenté, agréé Cour d&apos;appel
          </div>
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Paiement chiffré — traité par Stripe
          </div>
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            Fichiers supprimés après livraison (RGPD)
          </div>
        </div>
      </div>

      <div className={`sticky-cta${cachetVisible ? ' is-visible' : ''}`}>
        <div>
          <span className="sp-amount tabular">
            {total.toLocaleString('fr-FR', { minimumFractionDigits: postal ? 2 : 0 })}&nbsp;€
          </span>
          {/* Le prix barré ne s'affiche plus dès qu'un supplément s'ajoute :
              comparer 35 € de traduction à un total incluant le port serait
              un prix de référence trompeur. */}
          <span className="sp-label">
            {postal ? 'envoi de l’original inclus' : <><s>{eur(avant)}</s> · tout compris</>}
          </span>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            refCarte.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              if (fichiers.length === 0) refFichier.current?.focus({ preventScroll: true });
              else document.getElementById('email')?.focus({ preventScroll: true });
            }, 500);
          }}
        >
          Traduire mes documents
        </button>
      </div>
    </>
  );
}
