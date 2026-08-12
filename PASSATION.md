# Note de passation — protranslayte

Mise à jour le 11 août 2026. À lire en premier avant toute reprise.

## Où en est le projet

Maquette de landing page pour un service de traduction assermentée de bulletins
de notes. Marché francophone.

**En ligne :** https://protranslayte.com (et www), HTTPS actif
**Hébergement :** Vercel, projet `maquette-traduction-bulletins`, équipe `protranslayte`, forfait Hobby
**Dépôt :** https://github.com/lamoupro/maquette-traduction-bulletins (public, `noindex`)
**Domaine :** acheté chez OVH. DNS : deux enregistrements A vers `76.76.21.21`
(racine et www). Les AAAA d'origine ont été supprimés — sans quoi les visiteurs
en IPv6 atterrissaient chez OVH. Les MX OVH sont intacts, l'e-mail fonctionne.

> ⚠️ `vercel.json` fixe `outputDirectory` sur `docs/`. **Ne pas le retirer** :
> à l'import, Vercel servait `index.html` à la racine — le fichier source, sans
> `<head>` ni balise viewport — et les téléphones rendaient la page à 980 px.

Chaque `git push` sur `main` déclenche un redéploiement automatique.
GitHub Pages reste actif en parallèle, sur l'ancienne adresse.

```
site/
├── index.html      ← LA SOURCE. Seul fichier à éditer.
├── build.js        ← génère les deux sorties
├── assets/         ← logos + bulletins caviardés
├── docs/           ← sortie web publiée par GitHub Pages (main, /docs)
└── dist/index.html ← sortie artifact, images inlinées
```

Après toute modification :

```bash
cd /Users/macbook/xenderpc/site && node build.js && git add -A && git commit -m "..." && git push
```

Déploiement en 1 à 3 minutes. `gh` est dans `/usr/local/bin`, compte `lamoupro`
authentifié, permissions Bash dans `.claude/settings.local.json`.

**Toujours faire tester l'utilisateur sur son iPhone.** Le panneau de
prévisualisation intégré est trompeur : il se déclare `document.hidden`, donc
`requestAnimationFrame` n'y tourne jamais et le défilement de page n'y
fonctionne pas. Trois faux diagnostics en sont venus. Les mesures via
`getBoundingClientRect()` en JavaScript restent fiables, pas les captures.

---

## Tarification — décisions arrêtées

- **25 €** par document. **35 €** est le tarif réellement pratiqué auparavant
  par l'utilisateur dans son activité de traduction : le prix barré est donc un
  prix de référence **légitime** au sens de la directive Omnibus.
- Ne pas descendre à 23 € : le marché français est à 35-65 € le document, les
  concurrents à 25 € sont américains. La rapidité prime sur le prix dans les
  avis.
- **Offre d'août** : bandeau avec compte à rebours réel jusqu'au 31 août,
  sans réinitialisation. Constantes `PRIX_NORMAL = 35` et `PRIX_OFFRE = 25`.

> ⚠️ **Au 1er septembre 2026**, le tarif doit réellement passer à 35 €, sinon
> l'annonce devient trompeuse. Le bandeau disparaît tout seul, mais les prix
> affichés restent à 25 € tant que `PRIX_OFFRE` n'est pas modifié.

---

## Ce qui fonctionne — ne pas casser

### Comparateur avant/après

Deux bugs corrigés, tous deux liés à la cascade CSS ou à Safari :

- **Pas de `clip-path`.** Découpe par conteneur à largeur variable
  (`.doc-clip { width: var(--pos); overflow: hidden }`). Safari iOS ne repeint
  pas `clip-path` de façon fiable pendant le défilement, le document débordait
  sur la section suivante.
- **`position: sticky` sur `.dossier` uniquement en `min-width: 941px`**, dans
  une media query placée **après** la règle de base. Déclarée avant, elle était
  écrasée à spécificité égale et la carte de devis se superposait au
  comparateur sur mobile.
- **Aucun `z-index` sur `.doc-tag`.** Chaque étiquette vit dans la couche de
  son document pour être recouverte progressivement ; un z-index la ferait
  flotter au-dessus du découpage.

### Les deux bandeaux défilants

Fonction commune `creerCarrousel(scroller, piste, parCopie, options)` :

- **Position accumulée en décimal côté JS**, jamais relue depuis `scrollLeft` :
  à 24 px/s une image n'avance que de 0,4 px et Safari iOS arrondit à l'entier,
  l'incrément était perdu et le bandeau restait figé.
- **Période mesurée** entre deux copies (`children[n].offsetLeft -
  children[0].offsetLeft`), jamais `scrollWidth / 3` : l'espacement
  inter-copies s'ajoute et produisait un sursaut de 15 px à chaque tour.
- Trois copies, position maintenue dans celle du milieu, repositionnement
  après `load`.
- Rebouclage différé de 140 ms pour ne pas couper l'inertie iOS.
- **Avis** : `arretDefinitif: true`, la première interaction coupe l'avance
  pour de bon. **Logos** : reprise après 5 s.

### Ne jamais ajouter de garde `document.hidden`

Elle a cassé trois fois une fonctionnalité dans des contextes qui se déclarent
masqués tout en étant visibles. `requestAnimationFrame` ne tourne déjà pas
quand l'onglet est réellement caché.

### Carte de commande — collecte progressive

Dépôt du bulletin obligatoire, plusieurs fichiers acceptés, la quantité se
synchronise. Les coordonnées (e-mail, prénom, nom, remarque facultative)
n'apparaissent qu'après le dépôt. Le bouton de paiement reste bloqué tant que
l'e-mail n'est pas valide et les noms renseignés.

**Apple Pay s'active dès le dépôt, sans formulaire** : la feuille Apple renvoie
elle-même le nom et l'e-mail. Ne pas exiger la saisie avant, cela supprimerait
son seul intérêt.

Tout se passe dans la carte, **sans page intermédiaire** — décision assumée :
chaque changement de page fait perdre des clients et contredirait la promesse
d'immédiateté.

---

## Contenu réel vs démonstration

| Élément | État |
|---|---|
| 12 avis clients | **RÉELS**, fournis par l'utilisateur. Orthographe d'origine à conserver telle quelle. |
| Bulletins du comparateur | **RÉELS**, caviardés irréversiblement. Originaux dans `~/Downloads` (`FR.pdf`, `EN.pdf`) — **ne jamais publier**. |
| Logos ATA / ATC / Trackhouse | **RÉELS**, fournis par l'utilisateur. |
| Notifications d'achat | **FICTIVES** — 200 acheteurs inventés, tableau `ACHETEURS`. À brancher sur les vraies commandes avant mise en ligne commerciale. |

---

## À faire

1. **Le nom de marque.** « protranslayte » est le nom exact de **Translayte**
   (translayte.com), société britannique : 9 971 avis Trustpilot, membre
   accrédité ATC et corporate ATA — les deux mêmes badges que notre bandeau.
   Risque de contrefaçon, référencement impossible. **Trancher avant tout achat
   de domaine**, vérifier INPI et EUIPO.
2. **Brancher les notifications d'achat** sur les vraies commandes.
3. **Reformuler le sous-titre des avis** : « Des parents et des étudiants qui
   avaient une date limite à tenir » date des faux avis. Les vrais couvrent des
   cas plus larges (BTS, diplôme allemand, usage personnel, deux anglophones).
4. **Contenu société** : mentions légales, SIRET, CGV, contact, page de suivi.
5. **Passer le tarif à 35 €** au 1er septembre.
6. **Le vrai site** : Next.js App Router, Postgres/Prisma, Stripe Checkout avec
   Apple Pay, stockage fichiers, emails transactionnels, Vercel. Pas de
   back-office au départ.

---

## Travailler avec l'utilisateur

- **Il demande explicitement d'être challengé**, pas approuvé. Donner un avis
  franc même quand il contredit sa demande, et distinguer ce qui relève du goût
  de ce qui sert son projet.
- **Confirmer avant de coder** quand on s'écarte de sa consigne. Il a perdu des
  jetons sur un travail construit sans validation puis annulé.
- Il ne connaît ni Git ni les outils de déploiement — guider pas à pas.
- L'analyse de sa clientèle est dans `recherche-clientele.md` : la **rapidité
  prime sur le prix**, et la **peur de confier des documents intimes** est le
  frein le moins bien traité du marché.
