import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/* Stockage privé des bulletins, sur Cloudflare R2 (compatible S3).

   Aucun fichier n'est accessible publiquement : chaque téléchargement passe
   par un lien signé qui expire. Ces documents contiennent des données
   personnelles de mineurs — nom, date de naissance, parfois l'adresse — un
   stockage à URL publique, même imprévisible, serait inadapté. */

export const CONSERVATION_JOURS = 30;

const requis = (nom: string) => {
  const v = process.env[nom];
  if (!v) throw new Error(`Variable d'environnement manquante : ${nom}`);
  return v;
};

export const stockageConfigure = () =>
  Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );

let clientMemo: S3Client | null = null;
function client() {
  if (clientMemo) return clientMemo;
  clientMemo = new S3Client({
    region: 'auto',
    endpoint: `https://${requis('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requis('R2_ACCESS_KEY_ID'),
      secretAccessKey: requis('R2_SECRET_ACCESS_KEY'),
    },
  });
  return clientMemo;
}

const bucket = () => requis('R2_BUCKET');

/** Nettoie un nom de fichier : pas de chemin, pas de caractère exotique. */
export function nomSur(nom: string) {
  return (
    nom
      .split(/[\\/]/)
      .pop()!
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9._-]/g, '_')
      .slice(-120) || 'document'
  );
}

export async function deposer(cle: string, corps: Buffer, type: string) {
  await client().send(
    new PutObjectCommand({ Bucket: bucket(), Key: cle, Body: corps, ContentType: type }),
  );
}

export async function ecrireFiche(reference: string, fiche: unknown) {
  await deposer(
    `commandes/${reference}/commande.json`,
    Buffer.from(JSON.stringify(fiche, null, 2), 'utf8'),
    'application/json',
  );
}

/** Lien de téléchargement temporaire. Une heure suffit largement. */
export function lienTemporaire(cle: string, secondes = 3600) {
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: bucket(), Key: cle }), {
    expiresIn: secondes,
  });
}

export async function listerCommandes() {
  const r = await client().send(
    new ListObjectsV2Command({ Bucket: bucket(), Prefix: 'commandes/', MaxKeys: 1000 }),
  );
  return (r.Contents ?? []).map((o) => ({
    cle: o.Key!,
    taille: o.Size ?? 0,
    modifieLe: o.LastModified?.toISOString() ?? '',
  }));
}

export async function lireFiche(cle: string) {
  const r = await client().send(new GetObjectCommand({ Bucket: bucket(), Key: cle }));
  return JSON.parse(await r.Body!.transformToString('utf8'));
}

export async function supprimer(cle: string) {
  await client().send(new DeleteObjectCommand({ Bucket: bucket(), Key: cle }));
}

/** Vrai si la commande a dépassé la durée de conservation annoncée. */
export function perimee(recuLe: string) {
  const age = Date.now() - new Date(recuLe).getTime();
  return age > CONSERVATION_JOURS * 24 * 3600 * 1000;
}
