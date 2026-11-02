'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast { id: number; message: string; type: 'success' | 'error'; }
interface Ctx { showToast: (msg: string, type?: 'success' | 'error') => void; }

const ToastCtx = createContext<Ctx>({ showToast: () => {} });
export const useToast = () => useContext(ToastCtx);

let _id = 0;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-dot" />
            <span className="toast-text">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
