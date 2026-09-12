import Link from 'next/link';
import { estConnecte } from '@/lib/auth';
import { db } from '@/lib/agence/db/client';
import { organisations } from '@/lib/agence/db/schema';
import { sportifsDe } from '@/lib/agence/sportifs';
import { fusionnerReglees, regleesParSportif, dernierRappel } from '@/lib/agence/suivi';
import { avancement } from '@/lib/portail-demo';
import { emailEtudiant, listeManquante } from '@/lib/agence/relance';
import Envoyer from './Envoyer';
import { relancerDepuisAdmin } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

/* Les relances, vues de notre côté.

   L'agence a le même bouton dans son portail, et c'est très bien : c'est elle
   qui suit ses athlètes au quotidien. Cette page-ci existe pour les fois où
   c'est nous qui relançons — un dossier qui traîne, un client qui nous
   demande de nous en occuper — sans avoir à ouvrir le portail de quelqu'un
   d'autre avec ses identifiants.

   Le message est le MÊME que celui du portail : même liste, même expéditeur.
   Deux textes différents pour le même rappel finiraient par se contredire. */

export default async function Relances() {
  if (!(await estConnecte())) {
    return (
      <main className="wrap" style={{ maxWidth: 640, padding: '64px 24px' }}>
        <h1 style={{ fontSize: '1.4rem' }}>Relances</h1>
        <p>
          <Link href="/admin">Se connecter à l’administration</Link>
        </p>
      </main>
    );
  }

  const orgs = await db.select().from(organisations);

  const dossiers = [];
  for (const org of orgs) {
    const reglees = await regleesParSportif(org.id);
    for (const brut of sportifsDe(org.slug)) {
      const c = fusionnerReglees(brut, reglees.get(brut.id) ?? []);
      const a = avancement(c);
      if (a.manquantes.length === 0) continue;
      dossiers.push({
        org,
        c,
        manquantes: a.manquantes.map((m) => m.requirement),
        liste: listeManquante(c),
        adresse: await emailEtudiant(c),
        rappel: await dernierRappel(org.id, c.id),
      });
    }
  }

  return (
    <main className="wrap" style={{ maxWidth: 760, padding: '40px 24px 80px' }}>
      <p style={{ marginBottom: 8 }}>
        <Link href="/admin" style={{ fontSize: '0.85rem' }}>← Administration</Link>
      </p>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Relances</h1>
      <p style={{ color: '#55647C', fontSize: '0.9rem', marginTop: 0 }}>
        Les dossiers auxquels il manque une pièce. Le message part de
        contact@protranslayte.com, avec exactement la liste ci-dessous.
      </p>

      {dossiers.length === 0 && (
        <p style={{ marginTop: 28 }}>Aucun dossier incomplet. Rien à relancer.</p>
      )}

      {dossiers.map(({ org, c, manquantes, liste, adresse, rappel }) => (
        <section
          key={`${org.slug}-${c.id}`}
          style={{
            border: '1px solid #DDE4EE',
            borderRadius: 10,
            padding: '18px 20px',
            marginTop: 20,
            background: '#fff',
          }}
        >
          <h2 style={{ fontSize: '1.02rem', margin: '0 0 2px' }}>
            {c.prenom} {c.nom}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.84rem', color: '#55647C' }}>
            {org.nom} · {c.reference} · {adresse ?? <strong>aucune adresse trouvée</strong>}
          </p>

          {rappel && (
            <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#8A5A00' }}>
              Déjà relancé le {rappel.envoyeLe.toISOString().slice(0, 10)} (
              {rappel.canal}) par {rappel.envoyePar}.
            </p>
          )}

          <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600 }}>
            {manquantes.length} pièce{manquantes.length > 1 ? 's' : ''} manquante
            {manquantes.length > 1 ? 's' : ''} :
          </p>
          <pre
            style={{
              margin: '0 0 14px',
              padding: '10px 12px',
              background: '#F7F9FC',
              border: '1px solid #DDE4EE',
              borderRadius: 6,
              fontSize: '0.8rem',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
            }}
          >
            {liste}
          </pre>

          <Envoyer
            action={relancerDepuisAdmin.bind(null, org.slug, c.id)}
            desactive={!adresse}
          />
        </section>
      ))}
    </main>
  );
}
