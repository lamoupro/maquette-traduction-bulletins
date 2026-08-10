# Note de passation — protranslayte

Rédigée le 10 août 2026. À lire en premier avant toute reprise du projet.

## Où en est le projet

Maquette de landing page pour un service de traduction assermentée de bulletins
de notes. Prix fixe 25 €, marché francophone. Pas encore de vrai site applicatif.

**En ligne :** https://lamoupro.github.io/maquette-traduction-bulletins/
**Dépôt :** https://github.com/lamoupro/maquette-traduction-bulletins (public, `noindex`)

### Structure

```
site/
├── index.html      ← LA SOURCE. C'est le seul fichier à éditer.
├── build.js        ← génère les deux sorties
├── assets/         ← logos ATA/ATC/Trackhouse + bulletins caviardés
├── docs/           ← sortie web publiée par GitHub Pages (main, /docs)
└── dist/index.html ← sortie artifact, images inlinées en data URI
```

Après toute modification :

```bash
cd /Users/macbook/xenderpc/site && node build.js && git add -A && git commit -m "..." && git push
```

Le déploiement GitHub Pages prend 1 à 3 minutes. `gh` est installé dans
`/usr/local/bin`, le compte `lamoupro` est authentifié, les permissions Bash
nécessaires sont dans `.claude/settings.local.json`.

---

## LE BUG À TRAITER — comparateur avant/après

**Statut : jamais traité.** L'utilisateur avait explicitement demandé de ne pas
y toucher tant que la section avis n'était pas finie. Elle l'est maintenant.

### Symptôme, mot pour mot

> « Quand je suis tout en haut de la page et que je scrolle, mon premier geste
> fait remonter le avant-après d'un coup sous la section devis instantané.
> Ensuite je peux scroller normalement sur le site. »

Donc : un saut de mise en page au tout premier défilement, sur mobile, puis
plus rien d'anormal ensuite.

### Ce qui a DÉJÀ été corrigé sur ce composant (ne pas refaire)

Un autre bug, distinct, où le document débordait de sa carte pendant le
défilement. Cause : `clip-path` n'est pas repeint de façon fiable par Safari
iOS. Remplacé par une découpe à conteneur de largeur variable
(`.doc-clip { width: var(--pos); overflow: hidden }`), plus `contain: paint`
et `isolation: isolate` sur `.compare`. `touch-action: none` a aussi été retiré
de la zone du document — il bloquait le défilement vertical de la page.

### Hypothèses sur la cause du saut, par ordre de vraisemblance

1. **Ancrage du défilement / chargement tardif des images.** Les deux JPEG de
   bulletins pèsent environ 230 Ko chacun. Ils arrivent après le premier rendu.
   Safari iOS diffère souvent le reflux jusqu'au premier geste de défilement.
   À vérifier en priorité : ajouter `width` et `height` explicites sur les
   `<img>` du comparateur, ou tester `overflow-anchor: none` sur le conteneur.

2. **`aspect-ratio: 1000/1417` sur `.compare`.** L'espace est bien réservé en
   théorie, mais à confirmer sur appareil réel : mesurer la hauteur de
   `.compare-card` avant et après chargement des images.

3. **Barre d'adresse de Safari.** Elle se rétracte au premier défilement et
   modifie la hauteur du viewport. Peu probable ici, aucune unité `vh` n'est
   utilisée, mais à écarter formellement.

### Méthode de diagnostic recommandée

Le panneau de prévisualisation intégré est **inutilisable** pour ce bug : il
rapporte `document.visibilityState === 'hidden'`, donc `requestAnimationFrame`
n'y tourne jamais, et le défilement programmatique n'y fonctionne pas de façon
fiable. Deux contournements possibles :

- Mesurer les positions via `getBoundingClientRect()` en JavaScript plutôt que
  se fier aux captures d'écran.
- Faire tester l'utilisateur sur son iPhone : c'est le seul environnement où le
  bug se manifeste.

---

## Ce qui fonctionne et qu'il ne faut pas casser

### Les deux bandeaux défilants

Logos et avis partagent la fonction `creerCarrousel()`. Points sensibles, tous
issus de bugs réels déjà corrigés :

- **La position est accumulée en décimal côté JavaScript**, pas relue depuis
  `scrollLeft`. À 24 px/s une image n'avance que de 0,4 px, or Safari iOS
  arrondit `scrollLeft` à l'entier : un `scrollLeft += 0.4` perdait l'incrément
  à chaque image et le bandeau restait figé. **Ne jamais revenir à une lecture-
  modification-écriture de `scrollLeft`.**
- **La période est mesurée** entre le premier élément d'une copie et celui de la
  copie suivante (`children[n].offsetLeft - children[0].offsetLeft`). La déduire
  de `scrollWidth / 3` est faux : l'espacement inter-copies s'ajoute, ce qui
  produisait un sursaut de 15 px sur les logos à chaque tour.
- **Trois copies** de la série, position maintenue dans celle du milieu, avec
  repositionnement après `load` — les logos n'ont pas leurs dimensions à la
  première mesure.
- Le rebouclage attend l'arrêt du défilement (140 ms) pour ne pas couper
  l'inertie iOS.

Réglages en haut de `creerCarrousel()` : `vitesse` 24 px/s, `reprise` 5000 ms.
L'utilisateur a validé les deux.

### Mobile

Le devis instantané passe avant le comparateur (`order` dans la media query
940 px). Hero allégé sous 640 px. Barre CTA collante en bas. Prix visible à
436 px et bouton de paiement à 595 px, donc au premier écran.

---

## Décisions en attente de l'utilisateur

1. **Le nom de marque.** « protranslayte » est le nom exact de **Translayte**
   (translayte.com), société britannique établie : 9 971 avis Trustpilot,
   membre accrédité ATC, membre corporate ATA — les deux mêmes accréditations
   que celles affichées sur le bandeau. Risque de contrefaçon, référencement
   impossible sur son propre nom, réputation d'un tiers qui rejaillit.
   **Recommandation : changer de nom avant tout achat de domaine**, avec
   vérification INPI et EUIPO.

2. **Les 12 avis sont fictifs.** Écrits de toutes pièces comme remplissage de
   maquette, jamais copiés sur de vraies personnes. Ils sont dans le tableau
   `AVIS` en bas du script, avec un commentaire en majuscules. L'utilisateur
   doit fournir de vrais avis avant toute mise en ligne commerciale.

3. **Le contenu société** : mentions légales, SIRET, CGV, coordonnées — tout est
   en attente.

---

## Éléments de contexte utiles

- L'analyse de la clientèle est dans `recherche-clientele.md` à la racine :
  motivations réelles, freins, vocabulaire employé, et les correctifs faciles
  identifiés dans les avis 4 étoiles des concurrents. **La rapidité prime sur
  le prix** dans les avis, et **la peur de confier des documents intimes** est
  le frein le moins bien traité par le marché.
- Les bulletins du comparateur sont de vrais documents, caviardés de façon
  irréversible : sous-échantillonnage destructif puis lissage, sur 25 zones par
  document, positions détectées automatiquement. Vérifié illisible à 3× de
  grossissement. Les PDF originaux non caviardés sont dans `~/Downloads`
  (`FR.pdf`, `EN.pdf`) et **ne doivent jamais être publiés**.
- Stack prévue pour le vrai site : Next.js App Router, Postgres/Prisma, Stripe
  Checkout avec Apple Pay, stockage fichiers, emails transactionnels, Vercel.
  Pas de back-office au départ.
- L'utilisateur ne connaît pas Git ni les outils de déploiement. Guider pas à
  pas, et ne jamais supposer qu'une commande lui est familière.
- **Il demande explicitement d'être challengé** plutôt qu'approuvé. Donner un
  avis technique franc, y compris quand il contredit sa demande, et distinguer
  ce qui relève du goût de ce qui sert son projet.
