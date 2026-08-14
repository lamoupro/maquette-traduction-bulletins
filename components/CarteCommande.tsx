'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MAX_DOCS, PRIX_ENVOI, PRIX_NORMAL, PRIX_OFFRE } from '@/lib/data';
import BoutonExpress from './BoutonExpress';
import {
  ecrireBrouillon,
  ecrireEnAttente,
  effacerEnAttente,
  lireBrouillon,
  lireEnAttente,
  type EnAttente,
} from '@/lib/memoire';

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
  const [dossier, setDossier] = useState('—');
  const [enAttente, setEnAttente] = useState<EnAttente | null>(null);
  // Référence du dépôt, obtenue dès la sélection des fichiers.
  const [refDepot, setRefDepot] = useState<string | null>(null);
  const [depotEnCours, setDepotEnCours] = useState(false);

  const router = useRouter();
  const refFichier = useRef<HTMLInputElement>(null);
  const refCarte = useRef<HTMLDivElement>(null);
  const [cachetVisible, setCachetVisible] = useState(false);

  // Numéro de dossier généré côté client : évite toute divergence entre le
  // rendu serveur et le rendu navigateur.
  useEffect(() => {
    setDossier(String(Math.floor(100000 + Math.random() * 899999)));

    // Restitution du brouillon. Les fichiers ne peuvent pas être conservés
    // — le navigateur l'interdit — mais tout le reste revient.
    const b = lireBrouillon();
    if (b) {
      if (b.source) setSource(b.source);
      if (b.cible) setCible(b.cible);
      if (b.qte) setQte(b.qte);
      if (b.email) setEmail(b.email);
      if (b.prenom) setPrenom(b.prenom);
      if (b.nom) setNom(b.nom);
      if (b.remarque) setRemarque(b.remarque);
      if (b.postal) setPostal(true);
      if (b.adresse) setAdresse(b.adresse);
      if (b.codePostal) setCodePostal(b.codePostal);
      if (b.ville) setVille(b.ville);
    }

    setEnAttente(lireEnAttente());
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

  /* Révélation en cascade : un champ rempli en découvre un nouveau. Tout
     afficher d'un coup après le dépôt donnait un mur de formulaire, et
     c'est là que les gens renoncent. */
  const emailPret = emailValide(email);
  const identitePrete = prenom.trim() !== '' && nom.trim() !== '';

  // Le brouillon suit chaque frappe : le visiteur peut quitter à tout moment.
  useEffect(() => {
    ecrireBrouillon({
      source,
      cible,
      qte,
      email,
      prenom,
      nom,
      remarque,
      postal,
      adresse,
      codePostal,
      ville,
    });
  }, [source, cible, qte, email, prenom, nom, remarque, postal, adresse, codePostal, ville]);

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

  async function surFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;
    const tab = Array.from(liste);
    setFichiers(tab);
    if (tab.length > qte) setQte(Math.min(tab.length, MAX_DOCS));
    setMessage('');

    /* Les documents partent immédiatement, sans attendre le paiement.
       C'est ce qui permet à la feuille Apple Pay de s'ouvrir au doigt :
       elle ne peut pas patienter le temps d'un téléversement. */
    setRefDepot(null);
    setDepotEnCours(true);
    try {
      const d = new FormData();
      tab.forEach((f) => d.append('fichiers', f));
      const r = await fetch('/api/depot', { method: 'POST', body: d });
      const json = await r.json();
      if (!r.ok) throw new Error(json.erreur || 'Dépôt impossible');
      setRefDepot(json.reference);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Le dépôt a échoué. Réessayez.');
    } finally {
      setDepotEnCours(false);
    }
  }

  async function commander(moyen: 'carte' | 'applepay') {
    if (fichiers.length === 0) {
      setMessage('Déposez d’abord vos documents.');
      return;
    }
    if (!refDepot) {
      setMessage(
        depotEnCours ? 'Vos documents finissent de se déposer…' : 'Redéposez vos documents.',
      );
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
      donnees.append('reference', refDepot ?? '');
      donnees.append('envoiPostal', postal ? '1' : '0');
      if (postal) {
        donnees.append('adresse', adresse);
        donnees.append('codePostal', codePostal);
        donnees.append('ville', ville);
      }

      const r = await fetch('/api/commande', { method: 'POST', body: donnees });
      const json = await r.json();
      if (!r.ok) throw new Error(json.erreur || 'Envoi impossible');
      if (!json.clientSecret) throw new Error("Le paiement n'a pas pu être initialisé.");

      /* Les documents sont chez nous : on mémorise de quoi reprendre le
         paiement, puis on quitte la page d'accueil pour une page dédiée.

         C'est cette navigation qui répare le bouton « retour » du
         navigateur : sans elle, revenir en arrière faisait sortir du site. */
      ecrireEnAttente({
        reference: json.reference,
        clientSecret: json.clientSecret,
        montant: json.montant,
        quantite: qte,
        source,
        cible,
        postal,
      });
      router.push(`/commande/paiement?ref=${encodeURIComponent(json.reference)}`);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez dans un instant.',
      );
    } finally {
      setEnvoi(false);
    }
  }

  /* Le paiement vit désormais sur sa propre page, /commande/paiement.
     La carte n'affiche donc plus jamais Checkout : elle propose seulement
     de reprendre une commande laissée en plan. */
  if (enAttente) {
    return (
      <div className="dossier" id="dossier" ref={refCarte}>
        <div className="dossier-top">
          <span className="eyebrow">Commande en attente</span>
          <span className="ref tabular">DOSSIER N° {enAttente.reference}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>
          Vos {enAttente.quantite > 1 ? 'documents sont déposés' : 'document est déposé'} et vous
          attendent. Il ne reste qu’à régler <strong>{eur(enAttente.montant)}</strong>.
        </p>
        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={() =>
            router.push(`/commande/paiement?ref=${encodeURIComponent(enAttente.reference)}`)
          }
        >
          Reprendre et payer {eur(enAttente.montant)}
        </button>
        <button
          type="button"
          className="lien-discret"
          onClick={() => {
            effacerEnAttente();
            setEnAttente(null);
          }}
        >
          Recommencer une nouvelle commande
        </button>
        <div className="microtrust">
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 13.4 4.8 10.2l1.1-1.1L8 11.2l6.1-6.1 1.1 1.1z" />
            </svg>
            {enAttente.source} → {enAttente.cible} · rien n’a été débité
          </div>
        </div>
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
            {/* Le nom n'apparaît qu'une fois l'e-mail valide, la remarque et
                l'option postale qu'une fois le nom donné. Un champ à la fois
                se remplit ; cinq champs d'un coup se referment. */}
            {emailPret && (
              <div className="duo revele">
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
            )}

            {emailPret && identitePrete && (
              <textarea
                className="revele"
                rows={2}
                placeholder="Une précision sur votre dossier ? (facultatif)"
                value={remarque}
                onChange={(e) => setRemarque(e.target.value)}
              />
            )}

            {/* Proposé en dernier, une fois les coordonnées données : un
                supplément payant présenté trop tôt fait hésiter avant même
                que le visiteur ait commencé. */}
            {emailPret && identitePrete && (
              <label className="option-postal revele">
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
            )}

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

        {/* Le vrai bouton Apple Pay : il ouvre la feuille du système au doigt,
            sans page intermédiaire. Il n'apparaît que si l'appareil le
            supporte, et dès que l'adresse électronique est valide — le nom
            vient de la feuille, et figure de toute façon sur les bulletins. */}
        {refDepot && emailPret && adresseComplete && (
          <>
            <div className="pay-divider">ou</div>
            <BoutonExpress
              montant={total}
              surErreur={setMessage}
              donnees={{
                reference: refDepot,
                email,
                prenom,
                nom,
                source,
                cible,
                remarque,
                quantite: qte,
                envoiPostal: postal,
                adresse,
                codePostal,
                ville,
              }}
            />
          </>
        )}

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
