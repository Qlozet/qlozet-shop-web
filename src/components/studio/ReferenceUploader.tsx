'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface ReferenceUploaderProps {
  referenceImages: string[];
  onRemove: (index: number) => void;
  onUploadClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ReferenceUploader: React.FC<ReferenceUploaderProps> = ({
  referenceImages,
  onRemove,
  onUploadClick,
  fileInputRef,
  onFileChange,
}) => (
  <div>
    {/* Upload zone */}
    <div
      onClick={onUploadClick}
      className="flex flex-col items-center justify-center transition-all hover:border-[#2C1810] cursor-pointer"
      style={{
        padding: '28px 16px',
        borderRadius: '16px',
        border: '2px dashed rgba(0,0,0,0.15)',
        background: '#FAFAFA',
        marginBottom: '16px',
      }}
    >
      <Upload size={28} color="#999" style={{ marginBottom: '10px' }} />
      <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center' }}>
        Drag or drop your images here or{' '}
        <span style={{ color: '#2C1810', textDecoration: 'underline' }}>choose a file</span>
      </p>
      <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>PNG, JPG up to 10MB</p>
    </div>

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
      <div className="flex flex-col" style={{ gap: '8px' }}>
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
                <Image src={img} alt={`Ref ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
              </div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>
                Reference {idx + 1}
              </p>
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
  </div>
);
