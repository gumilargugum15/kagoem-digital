declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: SnapCallbacks) => void;
    };
  }
}

export interface SnapResult {
  order_id: string;
  transaction_status: string;
  [key: string]: unknown;
}

export interface SnapCallbacks {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

const SNAP_URL =
  import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY ?? "";

let loadPromise: Promise<void> | null = null;

export function loadSnapScript(): Promise<void> {
  if (window.snap) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", CLIENT_KEY);
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Gagal memuat Midtrans Snap."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function payWithSnap(token: string, callbacks: SnapCallbacks): Promise<void> {
  await loadSnapScript();
  window.snap?.pay(token, callbacks);
}
