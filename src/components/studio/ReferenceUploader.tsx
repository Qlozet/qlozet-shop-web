'use client';

import React from 'react';
import { Upload, X, Loader2, MessageSquare } from 'lucide-react';

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
}

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
}) => {
  const atLimit = referenceImages.length >= 3;

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
      <div style={{ marginTop: referenceImages.length > 0 ? '0' : '0' }}>
        <div className="flex items-center" style={{ gap: '6px', marginBottom: '8px' }}>
          <MessageSquare size={14} color="#666" />
          <label
            htmlFor="user-prompt"
            style={{ fontSize: '12px', fontWeight: 600, color: '#444' }}
          >
            Additional Instructions
          </label>
        </div>
        <textarea
          id="user-prompt"
          value={userPrompt}
          onChange={(e) => onPromptChange?.(e.target.value)}
          placeholder="E.g. &quot;Make it elegant with a modern twist&quot; or &quot;Use bold African prints with gold accents&quot;"
          rows={3}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1.5px solid rgba(0,0,0,0.1)',
            background: '#FAFAFA',
            fontSize: '12px',
            color: '#333',
            lineHeight: '1.5',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2C1810'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; }}
        />
        <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>
          Optional — describe any specific details the AI should focus on
        </p>
      </div>
    </div>
  );
};
