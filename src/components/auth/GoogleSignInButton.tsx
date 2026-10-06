'use client';

/**
 * Google's own "Sign in with Google" button.
 *
 * Rendered by Google Identity Services rather than hand-built: their branding
 * terms require their button, and it also handles the One Tap and FedCM
 * plumbing we would otherwise have to follow as browsers change it.
 *
 * We take no dependency for this. The wrappers around GIS have not caught up
 * with React 19, and the whole integration is a script tag plus two calls.
 */

import { useEffect, useRef, useState } from 'react';
import { config } from '@/lib/config';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/** Load the GIS script once, and reuse it on later mounts. */
const loadGsi = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.google?.accounts?.id) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gsi'));
    document.head.appendChild(script);
  });

interface GoogleSignInButtonProps {
  /** Receives Google's ID token. Hand it straight to the API to verify. */
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
  /** Google renders its own label; this picks which one. */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

export const GoogleSignInButton = ({
  onCredential,
  onError,
  text = 'continue_with',
  disabled = false,
}: GoogleSignInButtonProps) => {
  const holder = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  // The callback has to stay current without re-initialising GIS on every
  // render, which would tear the button down mid-click.
  const handler = useRef(onCredential);
  handler.current = onCredential;

  const clientId = config.google.clientId;

  useEffect(() => {
    if (!clientId || !holder.current) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !holder.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: GoogleCredentialResponse) => {
            if (response.credential) {
              void handler.current(response.credential);
            } else {
              onError?.('Google did not return a sign-in token.');
            }
          },
        });

        window.google.accounts.id.renderButton(holder.current, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text,
          width: holder.current.offsetWidth || 320,
          logo_alignment: 'center',
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
    // onError is intentionally out: see the handler ref above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, text]);

  /**
   * With no client id configured there is nothing to render, and a dead
   * button is worse than none - so the whole option disappears and the email
   * form stands on its own.
   */
  if (!clientId) return null;

  if (failed) {
    return (
      <p style={{ fontSize: '12px', color: 'var(--muted, #6b7280)', textAlign: 'center' }}>
        Google sign-in could not load. Use your email and password below.
      </p>
    );
  }

  return (
    <div
      ref={holder}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    />
  );
};

export default GoogleSignInButton;
