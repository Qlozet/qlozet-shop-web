// ═══════════════════════════════════════════════════════════════
//  Paystack Inline (v2) modal helper
//  Opens the Paystack popup ON the current page instead of doing a
//  full-page redirect. We resume the transaction the backend already
//  initialized (via its access_code), so no public key is needed here
//  and the reference/amount always match what the webhook expects.
// ═══════════════════════════════════════════════════════════════

const PAYSTACK_SRC = 'https://js.paystack.co/v2/inline.js';

let scriptPromise: Promise<void> | null = null;

function loadPaystack(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paystack can only load in the browser'));
  }
  if ((window as unknown as { PaystackPop?: unknown }).PaystackPop) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYSTACK_SRC}"]`,
    );
    const el = existing ?? document.createElement('script');
    el.src = PAYSTACK_SRC;
    el.async = true;
    el.addEventListener('load', () => resolve());
    el.addEventListener('error', () => {
      scriptPromise = null;
      reject(new Error('Failed to load Paystack'));
    });
    if (!existing) document.body.appendChild(el);
  });

  return scriptPromise;
}

export interface PaystackModalOptions {
  /** access_code returned by the backend when it initialized the transaction. */
  accessCode: string;
  /** Fired when the customer completes payment. */
  onSuccess?: (reference?: string) => void;
  /** Fired when the customer closes/cancels the popup without paying. */
  onClose?: () => void;
  /** Fired on a Paystack error (load failure, init error, etc.). */
  onError?: (message?: string) => void;
}

/**
 * Open the Paystack popup for an already-initialized transaction.
 * Resolves once the popup has been launched (not when payment completes —
 * that arrives via the callbacks).
 */
export async function openPaystackModal(opts: PaystackModalOptions): Promise<void> {
  try {
    await loadPaystack();
  } catch (err) {
    opts.onError?.(err instanceof Error ? err.message : 'Failed to load Paystack');
    return;
  }

  const PaystackPop = (
    window as unknown as { PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        handlers?: {
          onSuccess?: (tx: { reference?: string }) => void;
          onCancel?: () => void;
          onError?: (err: { message?: string }) => void;
        },
      ) => void;
    } }
  ).PaystackPop;

  if (!PaystackPop) {
    opts.onError?.('Paystack is unavailable');
    return;
  }

  try {
    const popup = new PaystackPop();
    popup.resumeTransaction(opts.accessCode, {
      onSuccess: (tx) => opts.onSuccess?.(tx?.reference),
      onCancel: () => opts.onClose?.(),
      onError: (err) => opts.onError?.(err?.message),
    });
  } catch (err) {
    opts.onError?.(err instanceof Error ? err.message : 'Could not open Paystack');
  }
}
