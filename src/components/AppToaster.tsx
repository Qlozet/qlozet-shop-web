'use client';

// App-wide toast notifications (sonner), styled to match the Qlozet storefront:
// a clean white card, soft rounded corners, a subtle warm shadow, and small
// brand-coloured status icons. Use anywhere via `import { toast } from 'sonner'`.

import { Toaster } from 'sonner';
import { Check, X, Info, TriangleAlert } from 'lucide-react';

const Badge = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      background: bg,
      flexShrink: 0,
    }}
  >
    {children}
  </span>
);

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      offset={18}
      gap={10}
      duration={3200}
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#26201B',
          border: '1px solid #EFE7DD',
          borderRadius: '14px',
          boxShadow: '0 10px 34px rgba(38, 32, 27, 0.12)',
          fontSize: '13.5px',
          fontWeight: 600,
          lineHeight: 1.45,
          padding: '13px 15px',
          gap: '11px',
          fontFamily: 'var(--font-outfit), system-ui, sans-serif',
        },
      }}
      icons={{
        success: (
          <Badge bg="#128A4B">
            <Check size={13} color="#fff" strokeWidth={3} />
          </Badge>
        ),
        error: (
          <Badge bg="#C8352C">
            <X size={13} color="#fff" strokeWidth={3} />
          </Badge>
        ),
        warning: (
          <Badge bg="#B87503">
            <TriangleAlert size={12} color="#fff" strokeWidth={2.5} />
          </Badge>
        ),
        info: (
          <Badge bg="#462814">
            <Info size={13} color="#fff" strokeWidth={2.5} />
          </Badge>
        ),
      }}
    />
  );
}

export default AppToaster;
