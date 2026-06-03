'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

interface DatePickerProps {
  value: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}

export default function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'year-month'>('calendar');
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const pm = viewMonth === 0 ? 11 : viewMonth - 1;
      const py = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day: daysInPrevMonth - i, month: pm, year: py, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    const nm = viewMonth === 11 ? 0 : viewMonth + 1;
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: nm, year: ny, isCurrentMonth: false });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const yearRange = useMemo(() => {
    const years: number[] = [];
    for (let y = 1950; y <= 2035; y++) years.push(y);
    return years;
  }, []);

  if (viewMode === 'year-month') {
    return (
      <div
        className="flex animate-fade-in"
        style={{ gap: '0', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <div className="overflow-y-auto hide-scrollbar" style={{ width: '120px', maxHeight: '360px', background: '#FAFAFA' }}>
          {yearRange.map((y) => (
            <button
              key={y}
              onClick={() => setViewYear(y)}
              style={{
                display: 'block', width: '100%', padding: '10px 16px', textAlign: 'center',
                fontSize: '14px', fontWeight: y === viewYear ? 700 : 500,
                color: y === viewYear ? '#FFF' : '#555',
                background: y === viewYear ? '#462814' : 'transparent',
                borderRadius: y === viewYear ? '100px' : '0', border: 'none', cursor: 'pointer',
              }}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto hide-scrollbar" style={{ width: '160px', maxHeight: '360px', background: '#FFFFFF', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
          {MONTHS.map((m, idx) => (
            <button
              key={m}
              onClick={() => { setViewMonth(idx); setViewMode('calendar'); }}
              style={{
                display: 'block', width: '100%', padding: '10px 20px', textAlign: 'left',
                fontSize: '14px', fontWeight: idx === viewMonth ? 700 : 500,
                color: idx === viewMonth ? '#FFF' : '#444',
                background: idx === viewMonth ? '#462814' : 'transparent',
                borderRadius: idx === viewMonth ? '100px' : '0', border: 'none', cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{ background: '#FFF', borderRadius: '16px', padding: '20px 24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px' }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <button onClick={() => setViewMode('year-month')} className="flex items-center hover:opacity-70" style={{ gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{MONTHS[viewMonth]} {viewYear}</span>
          <ChevronRight size={16} color="#1A1A1A" />
        </button>
        <div className="flex items-center" style={{ gap: '8px' }}>
          <button
            onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }}
            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={18} color="#462814" />
          </button>
          <button
            onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }}
            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={18} color="#462814" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7" style={{ marginBottom: '8px' }}>
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-center" style={{ fontSize: '12px', fontWeight: 600, color: '#999', padding: '4px 0' }}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((cell, i) => {
          const isSelected = cell.day === value.getDate() && cell.month === value.getMonth() && cell.year === value.getFullYear();
          const isWeekend = i % 7 >= 4;
          return (
            <button
              key={i}
              onClick={() => { onChange(new Date(cell.year, cell.month, cell.day)); onClose(); }}
              style={{
                padding: '10px 0', textAlign: 'center', fontSize: '14px',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#FFF' : !cell.isCurrentMonth ? '#D0D0D0' : isWeekend ? '#462814' : '#1A1A1A',
                background: isSelected ? '#462814' : 'transparent',
                borderRadius: isSelected ? '50%' : '0', border: 'none', cursor: 'pointer',
                width: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
