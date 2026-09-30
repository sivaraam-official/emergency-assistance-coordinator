import { useState } from "react"; import { api } from "../services/api"; import { getRecentIds, rememberId } from "../services/recent";
import { Notice, Badge, fmt, label, TYPE_ICON } from "../components/Feedback";
const STEPS = [["PENDING", "Received", "📥"], ["ASSIGNED", "Responder assigned", "🚒"], ["IN_PROGRESS", "Help in progress", "🛠️"], ["RESOLVED", "Resolved", "✅"]];
export default function TrackRequest() {
  const [id, setId] = useState(""), [r, setR] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [recent, setRecent] = useState(getRecentIds());
  async function lookup(x) {
    setErr(""); setR(null); if (!x.trim()) return setErr("Enter a request ID such as ER-1001.");
    setBusy(true); try { const d = await api.getRequest(x); setR(d); rememberId(d.requestId); setRecent(getRecentIds()); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  const idx = r ? STEPS.findIndex(([s]) => s === r.status) : -1;
  return (<><h2>🔎 Track a request</h2>
    <form onSubmit={(e) => { e.preventDefault(); lookup(id); }} className="filters"><input value={id} onChange={(e) => setId(e.target.value)} placeholder="ER-1001" aria-label="Request ID" /><button className="btn" disabled={busy}>{busy ? "Searching…" : "Find request"}</button></form>
    {recent.length > 0 && <div className="chips recent"><small className="muted">Recent:</small>{recent.map((x) => <button key={x} className="chip" onClick={() => { setId(x); lookup(x); }}>{x}</button>)}</div>}
    <Notice>{err}</Notice>
    {r && <div className="panel">
      <h3>{TYPE_ICON[r.emergencyType]} {r.requestId} <Badge value={r.status} /> <Badge value={r.priority} /></h3>
      {r.status === "CANCELLED" ? <Notice kind="error">This request was cancelled.</Notice> :
        <ol className="stepper">{STEPS.map(([s, t, i], n) => <li key={s} className={n < idx ? "done" : n === idx ? "now" : ""}><span>{n <= idx ? i : n + 1}</span>{t}</li>)}</ol>}
      <div className="details"><p><b>Type:</b> {label(r.emergencyType)}</p><p><b>Location:</b> {r.location}</p><p><b>Description:</b> {r.description}</p>
        <p><b>Assigned responder:</b> {r.assignedResponderId || "Not yet assigned"}</p><p><b>Submitted:</b> {fmt(r.createdAt)}</p><p><b>Last updated:</b> {fmt(r.updatedAt)}</p></div>
      <h4>Timeline</h4><ul className="timeline">{[...(r.timeline || [])].reverse().map((t, i) => <li key={i}><small>{fmt(t.time)}</small>{t.message}</li>)}</ul>
      <button className="ghost" onClick={() => lookup(r.requestId)}>🔄 Refresh status</button></div>}</>);
}
