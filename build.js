/* Produit deux sorties à partir de index.html :

   dist/index.html        Fragment autonome pour l'artifact Claude.
                          Images inlinées en data URI : la plateforme
                          interdit tout fichier externe.
                          Pas de <html>/<head> : elle les fournit.

   docs/                  Site complet pour l'hébergement web (GitHub Pages).
                          Document HTML complet avec doctype, viewport
                          — sans elle un téléphone rend la page à 980 px —
                          et noindex pour que ce lien de test ne soit pas
                          référencé. Images servies en fichiers séparés :
                          page légère et images mises en cache.

   Usage :  node build.js
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'index.html');
const ASSETS = path.join(ROOT, 'assets');
const DIST = path.join(ROOT, 'dist');
const PAGES = path.join(ROOT, 'docs');

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' };

const source = fs.readFileSync(SRC, 'utf8');
const titre = (source.match(/<title>([^<]*)<\/title>/) || [, 'protranslayte'])[1];
const corps = source.replace(/<title>[^<]*<\/title>\s*/, '');

// ---------- 1. sortie artifact : images inlinées ----------
let inlined = 0;
const artifact = source.replace(/src="assets\/([^"]+)"/g, (m, file) => {
  const full = path.join(ASSETS, file);
  if (!fs.existsSync(full)) throw new Error(`asset manquant : assets/${file}`);
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) throw new Error(`type non géré : ${file}`);
  inlined++;
  return `src="data:${mime};base64,${fs.readFileSync(full).toString('base64')}"`;
});
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), artifact);

// ---------- 2. sortie web : document complet + assets copiés ----------
const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="Traduction assermentée de bulletins de notes — 25 € fixe, livraison sous 24 à 48 h.">
<meta name="theme-color" content="#1359B8">
<title>${titre}</title>
</head>
<body style="margin:0">
${corps}
</body>
</html>
`;
fs.rmSync(PAGES, { recursive: true, force: true });
fs.mkdirSync(path.join(PAGES, 'assets'), { recursive: true });
fs.writeFileSync(path.join(PAGES, 'index.html'), page);
fs.writeFileSync(path.join(PAGES, '.nojekyll'), '');   // GitHub Pages : pas de filtrage Jekyll
let copies = 0;
for (const f of fs.readdirSync(ASSETS)) {
  fs.copyFileSync(path.join(ASSETS, f), path.join(PAGES, 'assets', f));
  copies++;
}

const ko = f => Math.round(fs.statSync(f).size / 1024) + ' Ko';
console.log(`artifact : dist/index.html — ${ko(path.join(DIST, 'index.html'))} (${inlined} images inlinées)`);
console.log(`web      : docs/index.html — ${ko(path.join(PAGES, 'index.html'))} + ${copies} fichiers dans assets/`);
