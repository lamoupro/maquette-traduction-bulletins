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
  quantite: number;
  montant: number;
  remarque?: string;
  cles?: string[];
};

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

  const objets = await listerCommandes();
  const fiches: Fiche[] = [];
  for (const o of objets.filter((x) => x.cle.endsWith('/commande.json'))) {
    try {
      fiches.push(await lireFiche(o.cle));
    } catch {
      /* fiche illisible : on l'ignore plutôt que de casser la page */
    }
  }
  fiches.sort((a, b) => b.recuLe.localeCompare(a.recuLe));

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
      </p>

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
              <strong style={{ fontFamily: 'var(--font-mono)' }}>{f.reference}</strong>
              <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                {new Date(f.recuLe).toLocaleString('fr-FR')}
                {perimee(f.recuLe) && ' · à supprimer'}
              </span>
            </div>
            <p style={{ margin: '8px 0 4px', fontSize: '0.94rem' }}>
              {f.client.prenom} {f.client.nom} — <a href={`mailto:${f.client.email}`}>{f.client.email}</a>
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
              {f.langues.source} → {f.langues.cible} · {f.quantite} document
              {f.quantite > 1 ? 's' : ''} · {f.montant} €
            </p>
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
