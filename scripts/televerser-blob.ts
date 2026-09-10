/* Téléverse une fois, à la main, les fichiers réels exclus de Git vers le
   store Blob privé « demo-portail » : les bulletins de Prince Folikoe et le
   logo Trackhouse. lib/fichier-demo.ts et lib/portail-demo.ts les lisent
   ensuite de là plutôt que du disque local, qui n'existe pas sur Vercel.

   Exécution : npx tsx scripts/televerser-blob.ts */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

async function main() {
  const racineFolikoe = path.join(process.cwd(), 'donnees-demo/folikoe');
  const fichiers = (await readdir(racineFolikoe)).filter((f) => f.endsWith('.pdf'));

  for (const f of fichiers) {
    const contenu = await readFile(path.join(racineFolikoe, f));
    const { url } = await put(`folikoe/${f}`, contenu, {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/pdf',
    });
    console.log('folikoe/%s -> %s', f, url);
  }

  const logo = await readFile(
    path.join(process.cwd(), 'public/demo-trackhouse/trackhouse-monogramme.png'),
  );
  const { url } = await put('logos/trackhouse-monogramme.png', logo, {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'image/png',
  });
  console.log('logos/trackhouse-monogramme.png -> %s', url);
}

main().then(() => process.exit(0));
