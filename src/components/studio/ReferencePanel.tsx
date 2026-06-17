'use client';

import React from 'react';
import { ReferenceUploader } from './ReferenceUploader';

interface ReferencePanelProps {
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

export const ReferencePanel: React.FC<ReferencePanelProps> = (props) => (
  <div style={{ padding: '20px' }}>
    <ReferenceUploader {...props} />
  </div>
);
