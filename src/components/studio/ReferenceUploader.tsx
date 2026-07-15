'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, MessageSquare, Sparkles } from 'lucide-react';

interface ReferenceUploaderProps {
  referenceImages: string[];
  onRemove: (index: number) => void;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  uploadStatus?: string | null;
  uploadError?: string | null;
  userPrompt?: string;
  onPromptChange?: (value: string) => void;
  suggestedPrompt?: string | null;
  isAnalyzing?: boolean;
}

const PROMPT_SUGGESTIONS = [
  'Make it elegant with a modern twist and rich African motifs',
  'Use bold colours with gold embroidery accents',
  'Keep it minimal and tailored with clean lines',
  'Add intricate lace detailing around the neckline',
  'Incorporate traditional ankara patterns in a contemporary way',
  'Design a flowing silhouette with subtle pleats',
];

export const ReferenceUploader: React.FC<ReferenceUploaderProps> = ({
  referenceImages,
  onRemove,
  onUploadClick,
  fileInputRef,
  onFileChange,
  isUploading = false,
  uploadStatus = null,
  uploadError = null,
  userPrompt = '',
  onPromptChange,
  suggestedPrompt = null,
  isAnalyzing = false,
}) => {
  const atLimit = referenceImages.length >= 3;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pick a ghost suggestion: use AI-generated one if available, otherwise rotate through static ones
  const [suggestionIdx] = useState(() => Math.floor(Math.random() * PROMPT_SUGGESTIONS.length));
  const ghostSuggestion = suggestedPrompt || PROMPT_SUGGESTIONS[suggestionIdx];

  // Show ghost text only when prompt is empty (trim to handle whitespace after erasing)
  const showGhost = !userPrompt?.trim() && !!ghostSuggestion;

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && showGhost) {
      e.preventDefault();
      onPromptChange?.(ghostSuggestion!);
    }
  }, [showGhost, ghostSuggestion, onPromptChange]);

  return (
    <div>
      {/* Upload zone */}
      <div
        onClick={!isUploading && !atLimit ? onUploadClick : undefined}
        className={`flex flex-col items-center justify-center transition-all ${
          isUploading || atLimit ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#2C1810] cursor-pointer'
        }`}
        style={{
          padding: '28px 16px',
          borderRadius: '16px',
          border: `2px dashed ${uploadError ? 'rgba(220,38,38,0.4)' : 'rgba(0,0,0,0.15)'}`,
          background: uploadError ? '#FEF2F2' : '#FAFAFA',
          marginBottom: '16px',
        }}
      >
        {isUploading ? (
          <>
            <Loader2 size={28} color="#2C1810" className="animate-spin" style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#2C1810', textAlign: 'center' }}>
              {uploadStatus || 'Uploading...'}
            </p>
          </>
        ) : (
          <>
            <Upload size={28} color={atLimit ? '#CCC' : '#999'} style={{ marginBottom: '10px' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center' }}>
              {atLimit ? (
                'Maximum 3 reference images reached'
              ) : (
                <>
                  Drag or drop your images here or{' '}
                  <span style={{ color: '#2C1810', textDecoration: 'underline' }}>choose a file</span>
                </>
              )}
            </p>
            <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>
              {atLimit ? `${referenceImages.length}/3 uploaded` : `PNG, JPG up to 10MB · ${referenceImages.length}/3`}
            </p>
          </>
        )}
      </div>

      {/* Upload error */}
      {uploadError && (
        <p style={{ fontSize: '11px', color: '#DC2626', marginBottom: '8px', padding: '0 4px' }}>
          ⚠ {uploadError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        style={{ display: 'none' }}
      />

      {/* Uploaded references */}
      {referenceImages.length > 0 && (
        <div className="flex flex-col" style={{ gap: '8px', marginBottom: '16px' }}>
          {referenceImages.map((img, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between"
              style={{ padding: '10px 12px', borderRadius: '12px', background: '#F5F5F5' }}
            >
              <div className="flex items-center" style={{ gap: '10px' }}>
                <div
                  className="relative overflow-hidden flex-shrink-0"
                  style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Ref ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>
                    Reference {idx + 1}
                  </p>
                  <p style={{ fontSize: '9px', color: '#999' }}>
                    ✓ Uploaded to cloud
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(idx)}
                className="flex items-center justify-center transition-all hover:bg-gray-200 active:scale-90"
                style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                }}
              >
                <X size={14} color="#888" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Prompt input */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <MessageSquare size={14} color="#666" />
            <label
              htmlFor="user-prompt"
              style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}
            >
              Additional Instructions
            </label>
          </div>
          {isAnalyzing && (
            <div className="flex items-center" style={{ gap: '5px' }}>
              <Loader2 size={12} color="#D4AF37" className="animate-spin" />
              <span style={{ fontSize: '10px', color: '#D4AF37', fontWeight: 500 }}>Analyzing...</span>
            </div>
          )}
        </div>
        <div className="relative" style={{ borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: '#FAFAFA', overflow: 'hidden' }}>
          {/* Ghost suggestion text (underneath) */}
          {showGhost && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '12px 14px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: 'rgba(0,0,0,0.18)',
                fontFamily: 'inherit',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {ghostSuggestion}
            </div>
          )}
          <textarea
            ref={textareaRef}
            id="user-prompt"
            value={userPrompt}
            onChange={(e) => onPromptChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#333',
              lineHeight: '1.5',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              background: 'transparent',
              border: 'none',
              position: 'relative',
              zIndex: 1,
            }}
          />
        </div>
        {showGhost ? (
          <div className="flex items-center" style={{ gap: '4px', marginTop: '6px' }}>
            <Sparkles size={10} color="#D4AF37" />
            <p style={{ fontSize: '10px', color: '#999' }}>
              Press <kbd style={{ padding: '1px 5px', borderRadius: '3px', border: '1px solid #DDD', background: '#F5F5F5', fontSize: '9px', fontWeight: 600, color: '#666' }}>Tab</kbd> to accept suggestion
            </p>
          </div>
        ) : (
          <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>
            Optional — describe any specific details the AI should focus on
          </p>
        )}
      </div>
    </div>
  );
};
