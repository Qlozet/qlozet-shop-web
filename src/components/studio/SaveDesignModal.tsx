'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useBespokeDesigns, type CreateDesignPayload } from '@/hooks/useBespokeDesigns';
import { enrichSelections } from '@/data/studio-options';

export interface DesignSelections {
  neckline?: string | null;
  sleeve?: string | null;
  silhouette?: string | null;
  collar?: string | null;
  fabric?: string | null;
  color?: string | null;
  fit?: string | null;
  userPrompt?: string;
}

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  category: string;
  gender: 'men' | 'women';
  designImages: string[];
  referenceImages: string[];
  selections?: DesignSelections;
  designId?: string | null;
}

export const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  designName,
  category,
  gender,
  designImages,
  referenceImages,
  selections,
  designId,
}) => {
  const { saveDesign } = useBespokeDesigns();

  const [name, setName] = useState(designName || '');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    if (designImages.length === 0) {
      setSaveError('Generate at least one design image first.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // Serialize selections + user notes into description as structured JSON
    const descriptionPayload = JSON.stringify({
      notes: description.trim() || '',
      selections: enrichSelections(selections),
    });

    const payload: CreateDesignPayload = {
      name: name.trim(),
      category,
      gender,
      design_images: [...designImages].reverse(),
      reference_images: referenceImages.length > 0 ? referenceImages : undefined,
      description: descriptionPayload,
    };

    const result = await saveDesign(payload, designId);

    if (result) {
      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
        setName(designName);
        setDescription('');
      }, 1500);
    } else {
      setSaveError('Failed to save design. Please try again.');
    }

    setIsSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full animate-fade-in"
        style={{
          maxWidth: '420px',
          margin: '20px',
          borderRadius: '24px',
          background: 'var(--bg-base)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer',
          }}
        >
          <X size={14} color="var(--text-secondary)" />
        </button>

        <div style={{ padding: '32px 28px' }}>
          {/* Success state */}
          {saved ? (
            <div className="flex flex-col items-center justify-center" style={{ gap: '16px', padding: '40px 0' }}>
              <CheckCircle2 size={48} color="#059669" />
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Design Saved!</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>View it in your My Designs collection</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Save Your<br />Design
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
                  Save this design to your collection and request quotes from tailors
                </p>
              </div>

              {/* Preview thumbnails */}
              {designImages.length > 0 && (
                <div className="flex" style={{ gap: '8px', overflowX: 'auto' }}>
                  {designImages.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 overflow-hidden"
                      style={{ width: '72px', height: '90px', borderRadius: '12px', background: 'var(--bg-surface-elevated)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Design ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Name input */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Design Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Wedding Agbada"
                  style={{
                    width: '100%', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
                    background: 'none', border: 'none', borderBottom: '1.5px solid var(--border-glass)',
                    outline: 'none', padding: '10px 0',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Notes (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any notes for the tailor..."
                  rows={2}
                  style={{
                    width: '100%', fontSize: '13px', color: 'var(--text-primary)',
                    background: 'var(--bg-surface-elevated)', border: '1.5px solid var(--border-glass)',
                    borderRadius: '12px', outline: 'none', padding: '12px 14px',
                    resize: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Error */}
              {saveError && (
                <p style={{ fontSize: '11px', color: '#DC2626', padding: '0 4px' }}>
                  ⚠ {saveError}
                </p>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  padding: '16px', borderRadius: '14px',
                  background: isSaving ? 'var(--text-secondary)' : 'var(--brand-fill)',
                  color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                  gap: '8px', opacity: !name.trim() ? 0.5 : 1,
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Design
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
