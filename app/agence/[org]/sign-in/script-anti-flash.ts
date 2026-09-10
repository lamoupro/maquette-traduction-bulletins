/* Extrait de RebasculeIdentite.tsx : cette fonction est appelée depuis un
   composant SERVEUR (page.tsx) pour construire le contenu d'un <script>, ce
   qu'un export d'un fichier 'use client' ne permet pas — un composant serveur
   peut RENDRE un composant client, mais pas appeler une de ses fonctions. */

const RACINE = '#10233C';
const SIGNATURE = '#1359B8';
const VIF = '#1359B8';
const VIF_SOMBRE = '#0E4695';
const BOUTON_TEXTE = '#fff';

export const REPOS_MS = 60 * 60 * 1000;

export function cleVu(orgSlug: string) {
  return `pt_agence_vu_${orgSlug}`;
}

/* Bloquant, exécuté pendant le parsing du HTML — avant la première peinture
   du navigateur — pour forcer nos couleurs par défaut AVANT que les vraies
   couleurs du partenaire, déjà posées en ligne par le serveur, ne soient
   visibles à l'écran. Sans ça, la page s'afficherait déjà à ses couleurs et
   il n'y aurait rien à animer. */
export function scriptAntiFlash(orgSlug: string) {
  return `(function(){
    try {
      var k = ${JSON.stringify(cleVu(orgSlug))};
      var vu = localStorage.getItem(k);
      var recent = vu && (Date.now() - Number(vu)) < ${REPOS_MS};
      if (recent) return;
      var el = document.querySelector('.pt');
      if (!el) return;
      el.style.setProperty('--pt-p-encre', ${JSON.stringify(RACINE)});
      el.style.setProperty('--pt-p-signature', ${JSON.stringify(SIGNATURE)});
      el.style.setProperty('--pt-vif', ${JSON.stringify(VIF)});
      el.style.setProperty('--pt-vif-sombre', ${JSON.stringify(VIF_SOMBRE)});
      el.style.setProperty('--pt-bouton-texte', ${JSON.stringify(BOUTON_TEXTE)});
      el.style.setProperty('--pt-accent', ${JSON.stringify(VIF_SOMBRE)});
    } catch (e) {}
  })();`;
}
