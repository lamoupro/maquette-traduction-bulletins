/* Nommer un appareil à partir de son « user agent ».

   Uniquement pour que la liste « Signed-in devices » soit lisible : sans ça
   elle affiche « Unknown device » autant de fois qu'il y a de sessions, et le
   bouton « Sign out this device » devient un pari. Avec des sessions de trente
   jours, cette liste est le seul moyen de reprendre la main sur un appareil
   perdu — elle doit dire lequel est lequel.

   Pas de bibliothèque : les chaînes d'user-agent mentent toutes (Chrome se
   déclare Safari, Edge se déclare Chrome), et une correspondance approximative
   suffit ici. L'ordre des tests EST la logique — le plus menteur d'abord. */

function navigateur(ua: string): string | null {
  if (/Edg[A-Z]?\//.test(ua)) return 'Edge';
  if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/SamsungBrowser\//.test(ua)) return 'Samsung Internet';
  if (/Firefox\/|FxiOS\//.test(ua)) return 'Firefox';
  // Sur iOS, Chrome s'annonce « CriOS » — et tout navigateur iOS contient
  // « Safari » dans sa chaîne, d'où ce test avant celui de Safari.
  if (/Chrome\/|CriOS\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua)) return 'Safari';
  return null;
}

function systeme(ua: string): string | null {
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return null;
}

/** « Safari on iPhone », « Chrome on Windows », ou rien si on ne sait pas. */
export function appareilLisible(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const n = navigateur(ua);
  const s = systeme(ua);
  if (n && s) return `${n} on ${s}`;
  return n ?? s ?? null;
}
