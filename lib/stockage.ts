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
/* Un nom de fichier accentué ne peut pas voyager tel quel dans un en-tête
   HTTP. On donne donc une version ASCII en repli, pour les vieux clients, et
   la version complète encodée que tous les navigateurs actuels préfèrent. */
function dispositionAttachement(nom: string) {
  const repli = nom.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');
  return `attachment; filename="${repli}"; filename*=UTF-8''${encodeURIComponent(nom)}`;
}

/* Sans « telecharger », R2 renvoie le document avec son type MIME et le
   navigateur l'affiche — pratique pour vérifier une pièce d'un coup d'œil.
   Avec, il force l'enregistrement sur l'appareil. */
export function lienTemporaire(cle: string, secondes = 3600, telecharger?: string) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: cle,
      ...(telecharger ? { ResponseContentDisposition: dispositionAttachement(telecharger) } : {}),
    }),
    { expiresIn: secondes },
  );
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
