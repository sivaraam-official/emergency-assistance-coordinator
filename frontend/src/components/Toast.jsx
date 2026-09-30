import { createContext, useCallback, useContext, useState } from "react";
const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((kind, text) => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 4200);
  }, []);
  return (<Ctx.Provider value={push}>{children}
    <div className="toasts" aria-live="polite">{items.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.kind === "success" ? "✅" : "⚠️"} {t.text}</div>)}</div></Ctx.Provider>);
}
