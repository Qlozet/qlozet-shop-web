'use client';

import React from 'react';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string | null;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onSelect,
}) => (
  <div className="flex flex-wrap" style={{ gap: '8px' }}>
    {colors.map((color) => (
      <button
        key={color}
        onClick={() => onSelect(color)}
        className="transition-all hover:scale-110"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: color,
          border: selectedColor === color ? '3px solid #2C1810' : '2px solid rgba(0,0,0,0.1)',
          cursor: 'pointer',
          boxShadow: selectedColor === color ? '0 0 0 2px #FFF, 0 0 0 4px #2C1810' : 'none',
          padding: 0,
        }}
      />
    ))}
  </div>
);
