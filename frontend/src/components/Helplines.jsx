import { useState } from "react";
// Real Indian emergency numbers, shown for awareness only. This prototype cannot place calls itself.
const LINES = [["112", "All-in-one emergency", "🆘"], ["108", "Ambulance", "🚑"], ["101", "Fire", "🔥"], ["100", "Police", "👮"]];
export default function Helplines() {
  const [open, setOpen] = useState(false);
  return (<div className="helpline">
    {open && <div className="help-panel" role="dialog" aria-label="Emergency helplines">
      <h4>Real emergency? Call now</h4>
      {LINES.map(([n, t, i]) => <a key={n} href={`tel:${n}`}><span>{i}</span><b>{n}</b><small>{t}</small></a>)}
      <p>This app is a prototype and does not contact emergency services.</p></div>}
    <button className="sos" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "✕" : "SOS"}</button></div>);
}
