'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/* Les deux gestes qui coûtaient le plus de temps sur une commande :
   récupérer les originaux, et remettre les traductions au client.

   Le dépôt part dès la sélection des fichiers, sans bouton de confirmation :
   c'est le même parti pris que la carte de commande côté client, et il n'y a
   rien à décider entre choisir ses PDF et les envoyer. */

type Etat =
  | { phase: 'repos' }
  | { phase: 'envoi' }
  | { phase: 'fait'; message: string; alerte?: string }
  | { phase: 'erreur'; message: string };

const BOUTON: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 12px',
  borderRadius: 6,
  border: '1px solid var(--rule)',
  background: 'var(--paper)',
  color: 'var(--brass)',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: 'inherit',
};

export default function LivraisonDossier({
  reference,
  livree,
}: {
  reference: string;
  livree?: boolean;
}) {
  const [etat, setEtat] = useState<Etat>({ phase: 'repos' });
  const champ = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function livrer(liste: FileList | null) {
    if (!liste || liste.length === 0) return;
    setEtat({ phase: 'envoi' });

    const corps = new FormData();
    corps.set('reference', reference);
    for (const f of Array.from(liste)) corps.append('fichiers', f);

    try {
      const r = await fetch('/admin/livrer', { method: 'POST', body: corps });
      const data = await r.json();
      if (!r.ok) {
        setEtat({ phase: 'erreur', message: data.erreur ?? 'Livraison refusée.' });
        return;
      }
      const jour = new Date(data.supprimeLe).toLocaleDateString('fr-FR');
      setEtat({
        phase: 'fait',
        message: `${data.deposees} fichier${data.deposees > 1 ? 's' : ''} livré${data.deposees > 1 ? 's' : ''} · suppression le ${jour}`,
        // L'e-mail peut échouer alors que les fichiers sont bien déposés :
        // le dire ici évite de croire le client servi alors qu'il n'a rien reçu.
        alerte: !data.email?.envoye
          ? "L'e-mail n'est pas parti — à envoyer à la main."
          : !data.email?.jointes
            ? 'Trop lourd pour la pièce jointe : le client a été prévenu, les fichiers restent à envoyer.'
            : undefined,
      });
      router.refresh();
    } catch {
      setEtat({ phase: 'erreur', message: 'Le réseau a coupé. Réessayez.' });
    } finally {
      if (champ.current) champ.current.value = '';
    }
  }

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--rule)', paddingTop: 12 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={`/admin/dossier?ref=${encodeURIComponent(reference)}`} style={BOUTON}>
          ↓ Tout télécharger
        </a>

        <button
          type="button"
          style={{ ...BOUTON, opacity: etat.phase === 'envoi' ? 0.55 : 1 }}
          disabled={etat.phase === 'envoi'}
          onClick={() => champ.current?.click()}
        >
          {etat.phase === 'envoi'
            ? 'Envoi…'
            : livree
              ? '↑ Remplacer les traductions'
              : '↑ Livrer les traductions'}
        </button>

        <input
          ref={champ}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => livrer(e.target.files)}
        />

        {etat.phase === 'fait' && (
          <span style={{ fontSize: '0.82rem', color: 'var(--verified)' }}>✓ {etat.message}</span>
        )}
        {etat.phase === 'erreur' && (
          <span style={{ fontSize: '0.82rem', color: '#B3261E' }}>{etat.message}</span>
        )}
      </div>

      {etat.phase === 'fait' && etat.alerte && (
        <p
          style={{
            margin: '8px 0 0',
            fontSize: '0.82rem',
            color: '#8A5A00',
            background: '#FBF2E2',
            borderRadius: 5,
            padding: '7px 9px',
          }}
        >
          {etat.alerte}
        </p>
      )}
    </div>
  );
}
