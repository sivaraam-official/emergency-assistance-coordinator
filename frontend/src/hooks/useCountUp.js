import { useEffect, useRef, useState } from "react";
/** Smoothly animates a number from its previous value to the new one. */
export default function useCountUp(target, ms = 700) {
  const [val, setVal] = useState(0); const from = useRef(0);
  useEffect(() => {
    const start = performance.now(), a = from.current; let raf;
    const tick = (t) => { const p = Math.min(1, (t - start) / ms); const v = Math.round(a + (target - a) * (1 - Math.pow(1 - p, 3))); setVal(v); from.current = v; if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}
