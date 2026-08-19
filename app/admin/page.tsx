import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  CONSERVATION_JOURS,
  lireFiche,
  listerCommandes,
  perimee,
  stockageConfigure,
} from '@/lib/stockage';
import { COOKIE, authConfiguree, egal, empreinte, estConnecte } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

type Fiche = {
  reference: string;
  recuLe: string;
  client: { email: string; prenom: string; nom: string };
  langues: { source: string; cible: string };
  pages?: number;
  clic?: string | null;
  fichiers?: { nom: string; pages?: number }[];
  montant: number;
  statut?: 'en_attente_paiement' | 'payee';
  payeLe?: string;
  envoiPostal?: boolean;
  adressePostale?: { adresse: string; codePostal: string; ville: string } | null;
  remarque?: string;
  cles?: string[];
};

/* Une commande écrite partiellement — dépôt interrompu, format plus ancien —
   suffisait à faire tomber tout le tableau de bord : le try/catch protégeait
   l'analyse du JSON, pas la forme de l'objet obtenu. On donne donc une valeur
   sûre à chaque champ que le rendu lit sans précaution. */
function normaliser(brut: unknown, cle: string): Fiche | null {
  if (!brut || typeof brut !== 'object') return null;
  const f = brut as Partial<Fiche>;
  if (!f.reference && !f.recuLe) return null;
  return {
    ...f,
    reference: f.reference ?? cle.split('/')[1] ?? '—',
    recuLe: f.recuLe ?? '',
    client: {
      email: f.client?.email ?? '',
      prenom: f.client?.prenom ?? '',
      nom: f.client?.nom ?? '',
    },
    langues: { source: f.langues?.source ?? '—', cible: f.langues?.cible ?? '—' },
    fichiers: f.fichiers ?? [],
    montant: typeof f.montant === 'number' ? f.montant : 0,
  };
}

async function connexion(donnees: FormData) {
  'use server';
  const saisi = String(donnees.get('motdepasse') ?? '');
  if (!authConfiguree() || !process.env.ADMIN_MOT_DE_PASSE) redirect('/admin?e=config');
  if (!egal(saisi, process.env.ADMIN_MOT_DE_PASSE)) redirect('/admin?e=1');
  (await cookies()).set(COOKIE, empreinte(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  redirect('/admin');
}

async function deconnexion() {
  'use server';
  (await cookies()).delete(COOKIE);
  redirect('/admin');
}

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;

  if (!(await estConnecte())) {
    return (
      <main className="wrap" style={{ maxWidth: 380, padding: '64px 24px' }}>
        <h1 style={{ fontSize: '1.4rem', marginBottom: 18 }}>Administration</h1>
        {!authConfiguree() && (
          <p style={{ color: '#B3261E', fontSize: '0.9rem' }}>
            Aucun mot de passe n’est configuré. Définissez <code>ADMIN_MOT_DE_PASSE</code> (12
            caractères minimum) dans les variables d’environnement.
          </p>
        )}
        {e === '1' && (
          <p style={{ color: '#B3261E', fontSize: '0.9rem' }}>Mot de passe incorrect.</p>
        )}
        <form action={connexion} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            name="motdepasse"
            placeholder="Mot de passe"
            autoComplete="current-password"
            required
            style={{
              padding: '11px 12px',
              borderRadius: 5,
              border: '1px solid var(--rule)',
              fontSize: '0.95rem',
            }}
          />
          <button className="btn btn-primary" type="submit">
            Entrer
          </button>
        </form>
      </main>
    );
  }

  if (!stockageConfigure()) {
    return (
      <main className="wrap" style={{ padding: '48px 24px' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Administration</h1>
        <p style={{ color: '#B3261E' }}>
          Le stockage n’est pas configuré : les variables R2 sont manquantes.
        </p>
      </main>
    );
  }

  /* Le stockage peut répondre en erreur : identifiants révoqués, bucket
     renommé, panne de Cloudflare. Laisser l'exception remonter transformait
     le tableau de bord en page 500, sans indice sur la cause. */
  let objets: Awaited<ReturnType<typeof listerCommandes>>;
  try {
    objets = await listerCommandes();
  } catch (err) {
    return (
      <main className="wrap" style={{ padding: '48px 24px' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Administration</h1>
        <p style={{ color: '#B3261E' }}>
          Le stockage R2 a refusé la requête. Les variables sont présentes, mais l’appel échoue.
        </p>
        <pre
          style={{
            background: '#F6F6F4',
            padding: 12,
            borderRadius: 5,
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {err instanceof Error ? `${err.name} : ${err.message}` : String(err)}
        </pre>
      </main>
    );
  }

  const fiches: Fiche[] = [];
  let illisibles = 0;
  for (const o of objets.filter((x) => x.cle.endsWith('/commande.json'))) {
    try {
      const fiche = normaliser(await lireFiche(o.cle), o.cle);
      if (fiche) fiches.push(fiche);
      else illisibles += 1;
    } catch {
      illisibles += 1;
    }
  }
  fiches.sort((a, b) => (b.recuLe ?? '').localeCompare(a.recuLe ?? ''));

  return (
    <main className="wrap" style={{ padding: '40px 24px 80px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 16,
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: '1.4rem' }}>Commandes</h1>
        <form action={deconnexion}>
          <button
            type="submit"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Se déconnecter
          </button>
        </form>
      </div>
      <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: 0 }}>
        {fiches.length} commande{fiches.length > 1 ? 's' : ''} · documents conservés{' '}
        {CONSERVATION_JOURS} jours
        {illisibles > 0 && (
          <>
            {' · '}
            <span style={{ color: '#B3261E' }}>
              {illisibles} fiche{illisibles > 1 ? 's' : ''} illisible{illisibles > 1 ? 's' : ''}
            </span>
          </>
        )}
      </p>

      {/* Export des ventes venues d'une annonce, à déposer dans Google Ads.
          C'est ce qui remplace la balise de suivi : aucun cookie chez le
          visiteur, donc aucune bannière de consentement à afficher. */}
      {fiches.some((f) => f.statut === 'payee' && f.clic) && (
        <p style={{ marginTop: 4 }}>
          <a
            href="/admin/conversions"
            style={{ fontSize: '0.85rem', color: 'var(--brass)', fontWeight: 600 }}
          >
            ↓ Exporter les conversions pour Google Ads
          </a>
        </p>
      )}

      {fiches.length === 0 && (
        <p style={{ color: 'var(--ink-soft)' }}>Aucune commande pour l’instant.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        {fiches.map((f) => (
          <article
            key={f.reference}
            style={{
              background: 'var(--paper-raised)',
              border: '1px solid var(--rule)',
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                alignItems: 'baseline',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{f.reference}</strong>
                {/* Un dossier non payé n'est pas une commande : il ne doit
                    surtout pas partir en traduction. */}
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: f.statut === 'payee' ? 'var(--verified-tint)' : '#FDE8E8',
                    color: f.statut === 'payee' ? 'var(--verified)' : '#A32020',
                  }}
                >
                  {f.statut === 'payee' ? 'Payée' : 'Non payée'}
                </span>
              </span>
              <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                {f.recuLe ? new Date(f.recuLe).toLocaleString('fr-FR') : 'date inconnue'}
                {f.recuLe && perimee(f.recuLe) && ' · à supprimer'}
              </span>
            </div>
            <p style={{ margin: '8px 0 4px', fontSize: '0.94rem' }}>
              {f.client.prenom} {f.client.nom} — <a href={`mailto:${f.client.email}`}>{f.client.email}</a>
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
              {f.langues.source} → {f.langues.cible} ·{' '}
              {f.fichiers?.length ?? 0} document{(f.fichiers?.length ?? 0) > 1 ? 's' : ''} ·{' '}
              <strong>
                {f.pages ?? 0} page{(f.pages ?? 0) > 1 ? 's' : ''}
              </strong>{' '}
              ·{' '}
              {f.montant.toLocaleString('fr-FR', {
                minimumFractionDigits: Number.isInteger(f.montant) ? 0 : 2,
              })}{' '}
              €
            </p>
            {f.envoiPostal && f.adressePostale && (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.88rem',
                  background: 'var(--brass-tint)',
                  borderLeft: '3px solid var(--brass)',
                  borderRadius: '0 6px 6px 0',
                  padding: '8px 10px',
                }}
              >
                <strong>📮 Envoi papier</strong>
                <br />
                {f.client.prenom} {f.client.nom}
                <br />
                {f.adressePostale.adresse}
                <br />
                {f.adressePostale.codePostal} {f.adressePostale.ville}
              </p>
            )}
            {f.remarque && (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: '0.88rem',
                  background: 'var(--paper)',
                  padding: '8px 10px',
                  borderRadius: 6,
                }}
              >
                {f.remarque}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {(f.cles ?? []).map((c) => (
                <a
                  key={c}
                  href={`/admin/fichier?cle=${encodeURIComponent(c)}`}
                  style={{ fontSize: '0.85rem', color: 'var(--brass)', fontWeight: 600 }}
                >
                  ↓ {c.split('/').pop()}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
