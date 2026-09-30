import { useMemo } from "react";
/**
 * Animated background themed on the title "Emergency Assistance Coordinator":
 * rotating red/blue siren light, a heartbeat (ECG) line, floating medical crosses,
 * a night city skyline with blinking windows, and an ambulance + fire engine driving by.
 * Pure CSS/SVG, no extra libraries.
 */
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export default function EmergencyBackground() {
  const { buildings, windows } = useMemo(() => {
    const r = rng(42), b = [], w = []; let x = 0;
    while (x < 1440) {
      const width = 40 + Math.floor(r() * 60), height = 60 + Math.floor(r() * 130);
      b.push({ x, width, height });
      for (let wx = x + 8; wx < x + width - 10; wx += 16) for (let wy = 220 - height + 10; wy < 210; wy += 20)
        if (r() > 0.55) w.push({ x: wx, y: wy, d: (r() * 6).toFixed(1), k: `${wx}-${wy}` });
      x += width + 4;
    }
    return { buildings: b, windows: w };
  }, []);
  const ecg = useMemo(() => {
    let d = "M0 60"; for (let i = 0; i < 6; i++) { const o = i * 200; d += ` L${o + 60} 60 L${o + 75} 55 L${o + 90} 60 L${o + 110} 60 L${o + 120} 20 L${o + 135} 105 L${o + 148} 60 L${o + 170} 60 L${o + 185} 48 L${o + 200} 60`; }
    return d;
  }, []);
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg-glow red" /><div className="bg-glow blue" />
      <div className="siren"><div className="beam red" /><div className="beam blue" /></div>
      <svg className="ecg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d={ecg} className="ecg-base" vectorEffect="non-scaling-stroke" />
        <path d={ecg} className="ecg-pulse" pathLength="100" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="crosses">{Array.from({ length: 9 }, (_, i) => <span key={i} style={{ left: `${8 + i * 11}%`, animationDelay: `${i * 1.7}s`, animationDuration: `${14 + (i % 4) * 3}s` }}>✚</span>)}</div>
      <svg className="city" viewBox="0 0 1440 220" preserveAspectRatio="none">
        {buildings.map((b) => <rect key={b.x} x={b.x} y={220 - b.height} width={b.width} height={b.height} className="bldg" />)}
        {windows.map((w) => <rect key={w.k} x={w.x} y={w.y} width="6" height="9" className="win" style={{ animationDelay: `${w.d}s` }} />)}
      </svg>
      <div className="vehicle amb">🚑</div><div className="vehicle fire">🚒</div>
    </div>
  );
}
