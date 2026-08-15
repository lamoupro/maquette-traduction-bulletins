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
  // Nombre de pages compté par le serveur, et le détail fichier par fichier.
  const [pages, setPages] = useState(0);
  const [detailPages, setDetailPages] = useState<Record<string, number>>({});

  const router = useRouter();
  const refFichier = useRef<HTMLInputElement>(null);
  const depotNumero = useRef(0);
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

  /* Le prix se compte en PAGES, jamais en fichiers : un bulletin de lycée
     en fait souvent deux, un livret scolaire jusqu'à six. Le nombre vient
     du serveur, qui les a lues dans les documents. */
  const qte = Math.max(1, pages);

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
      email,
      prenom,
      nom,
      remarque,
      postal,
      adresse,
      codePostal,
      ville,
    });
  }, [source, cible, email, prenom, nom, remarque, postal, adresse, codePostal, ville]);

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

  /* Les sélections s'ajoutent au lieu de se remplacer.

     Avant, choisir un bulletin puis deux autres faisait disparaître le
     premier sans un mot — et laissait ses fichiers orphelins sur le
     serveur, stockés et facturés par personne. */
  async function surFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;

    const ajoutes = Array.from(liste);
    const fusion = [...fichiers];
    for (const f of ajoutes) {
      // Même nom et même taille : c'est le même document, on ne le double pas.
      if (!fusion.some((d) => d.name === f.name && d.size === f.size)) fusion.push(f);
    }
    const complet = fusion.slice(0, MAX_DOCS);

    setFichiers(complet);
    setMessage(
      fusion.length > MAX_DOCS ? `Maximum ${MAX_DOCS} documents par commande.` : '',
    );
    await deposer(complet);

    // Sans ça, resélectionner le même fichier ne déclencherait rien.
    if (refFichier.current) refFichier.current.value = '';
  }

  function retirer(index: number) {
    const restant = fichiers.filter((_, i) => i !== index);
    setFichiers(restant);
    setMessage('');
    if (restant.length === 0) {
      setRefDepot(null);
      setPages(0);
      setDetailPages({});
      return;
    }
    void deposer(restant);
  }

  /* Le dépôt part sans attendre le paiement : c'est ce qui permet à la
     feuille Apple Pay de s'ouvrir au doigt, elle ne peut pas patienter le
     temps d'un téléversement. La liste complète est renvoyée à chaque fois,
     sous la même référence. */
  async function deposer(liste: File[]) {
    const numero = ++depotNumero.current;
    setDepotEnCours(true);
    try {
      const d = new FormData();
      liste.forEach((f) => d.append('fichiers', f));
      if (refDepot) d.append('reference', refDepot);
      const r = await fetch('/api/depot', { method: 'POST', body: d });
      const json = await r.json();
      // Un dépôt plus récent a déjà répondu : on ignore celui-ci.
      if (numero !== depotNumero.current) return;
      if (!r.ok) throw new Error(json.erreur || 'Dépôt impossible');
      setRefDepot(json.reference);
      setPages(json.pages ?? liste.length);
      setDetailPages(
        Object.fromEntries(
          (json.detail ?? []).map((d: { nom: string; pages: number }) => [d.nom, d.pages]),
        ),
      );
    } catch (e) {
      if (numero !== depotNumero.current) return;
      setRefDepot(null);
      setPages(0);
      setMessage(e instanceof Error ? e.message : 'Le dépôt a échoué. Réessayez.');
      setFichiers([]);
      setDetailPages({});
    } finally {
      if (numero === depotNumero.current) setDepotEnCours(false);
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
        pages: qte,
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
          {enAttente.pages} page{enAttente.pages > 1 ? 's' : ''} déposée
          {enAttente.pages > 1 ? 's' : ''} vous {enAttente.pages > 1 ? 'attendent' : 'attend'}. Il
          ne reste qu’à régler <strong>{eur(enAttente.montant)}</strong>.
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
          {/* Le nombre n'est plus réglable : il compte les fichiers déposés.
              Un compteur pouvant contredire la liste était une promesse de
              litige, puisque le prix est au document. */}
          <span className="qty-lecture tabular" aria-live="polite">
            {fichiers.length === 0
              ? 'aucun document'
              : depotEnCours
                ? 'lecture en cours…'
                : `${pages} page${pages > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="price-row">
          <span className="label">
            Traduction assermentée {source} → {cible}
            {pages > 0 ? ` · ${pages} page${pages > 1 ? 's' : ''} × ${PRIX_OFFRE} €` : ` · ${PRIX_OFFRE} € la page`}
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
          <span className="u-title">
            {fichiers.length === 0 ? 'Déposez vos documents ici' : 'Ajouter d’autres documents'}
          </span>
          <span className="u-sub">Bulletins, relevés, diplômes · plusieurs fichiers à la fois</span>
          <input
            type="file"
            ref={refFichier}
            accept="application/pdf,image/*"
            multiple
            onChange={(e) => surFichiers(e.target.files)}
          />
        </label>

        {/* La liste vit hors du <label> : à l'intérieur, chaque clic sur une
            croix rouvrait le sélecteur de fichiers au lieu de retirer le
            document. */}
        {fichiers.length > 0 && (
          <div className="liste-docs revele">
            <div className="liste-tete">
              <span>
                {depotEnCours
                  ? 'Lecture des documents…'
                  : `${fichiers.length} document${fichiers.length > 1 ? 's' : ''} · ${pages} page${pages > 1 ? 's' : ''}`}
              </span>
              {!depotEnCours && refDepot ? <span className="liste-ok">✓</span> : null}
            </div>
            {fichiers.map((f, i) => (
              <div className="doc-ligne" key={`${f.name}-${f.size}-${i}`}>
                <span className="doc-nom" title={f.name}>
                  {f.name}
                </span>
                <span className="doc-poids tabular">
                  {detailPages[f.name]
                    ? `${detailPages[f.name]} page${detailPages[f.name] > 1 ? 's' : ''}`
                    : `${Math.max(1, Math.round(f.size / 1024))} Ko`}
                </span>
                <button
                  type="button"
                  className="doc-retirer"
                  aria-label={`Retirer ${f.name}`}
                  onClick={() => retirer(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

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
          {envoi
            ? 'Envoi en cours…'
            : `Payer ${eur(total)} et faire traduire ${fichiers.length > 1 ? 'mes documents' : 'mon document'}`}
        </button>

        {/* Le vrai bouton Apple Pay : il ouvre la feuille du système au doigt,
            sans page intermédiaire. Il apparaît dès le dépôt — grisé tant que
            l'adresse électronique manque, puis actif. Le nom vient de la
            feuille, et figure de toute façon sur les bulletins. */}
        <>
          <div className="pay-divider">ou</div>
          <BoutonExpress
            montant={total}
            actif={Boolean(refDepot) && emailPret && adresseComplete && !depotEnCours}
            manque={
              fichiers.length === 0
                ? 'Déposez vos documents pour payer en un geste'
                : depotEnCours || !refDepot
                  ? 'Vos documents finissent de se déposer…'
                  : !emailPret
                    ? 'Renseignez votre e-mail pour payer en un geste'
                    : 'Complétez votre adresse postale'
            }
            surErreur={setMessage}
            donnees={{
                reference: refDepot,
                email,
                prenom,
                nom,
                source,
                cible,
                remarque,
                envoiPostal: postal,
                adresse,
                codePostal,
                ville,
            }}
          />
        </>

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
