import { useState } from "react"; import { Link } from "react-router-dom";
import { api } from "../services/api"; import { rememberId } from "../services/recent"; import { Notice, TYPE_ICON, label } from "../components/Feedback"; import { useToast } from "../components/Toast";
const TYPES = ["MEDICAL_EMERGENCY", "ROAD_ACCIDENT", "FIRE", "RESCUE", "OTHER"], SEV = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const blank = { requesterName: "", contactNumber: "", emergencyType: "MEDICAL_EMERGENCY", location: "", description: "", reportedSeverity: "MEDIUM" };
const MAX = 300;
export default function ReportEmergency() {
  const [f, setF] = useState(blank), [msg, setMsg] = useState(null), [busy, setBusy] = useState(false), [done, setDone] = useState(null), [geo, setGeo] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toast = useToast();
  function locate() {
    if (!navigator.geolocation) return setMsg({ kind: "error", text: "Your browser does not support location." });
    setGeo(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setF((x) => ({ ...x, location: `GPS ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}` })); setGeo(false); toast("success", "Location filled in."); },
      () => { setGeo(false); setMsg({ kind: "error", text: "Could not get your location. Please type it instead." }); });
  }
  async function submit(e) {
    e.preventDefault(); setMsg(null);
    if (!f.requesterName.trim() || !f.location.trim() || !f.description.trim()) return setMsg({ kind: "error", text: "Name, location and description are required." });
    if (!/^\+?[0-9]{7,15}$/.test(f.contactNumber)) return setMsg({ kind: "error", text: "Contact number must be 7-15 digits." });
    setBusy(true);
    try { const r = await api.createRequest(f); rememberId(r.requestId); setDone(r); toast("success", `Request ${r.requestId} submitted.`); setF(blank); }
    catch (er) { setMsg({ kind: "error", text: er.message }); } finally { setBusy(false); }
  }
  if (done) return (<div className="panel success-box"><div className="check">✓</div><h2>Request submitted</h2>
    <p>Your request ID is</p><div className="rid">{done.requestId}</div><p className="muted">Keep it to track your request.</p>
    <div className="hero-actions"><Link className="btn big" to="/track">🔎 Track it now</Link><button className="btn big ghost" onClick={() => setDone(null)}>Report another</button></div></div>);
  return (<><h2>🚨 Report an emergency</h2><Notice kind={msg?.kind}>{msg?.text}</Notice>
    <form onSubmit={submit} className="form panel">
      <div className="wide"><span className="lbl">What kind of emergency?</span>
        <div className="types">{TYPES.map((t) => <button type="button" key={t} className={`type ${f.emergencyType === t ? "on" : ""}`} onClick={() => setF({ ...f, emergencyType: t })} aria-pressed={f.emergencyType === t}><span>{TYPE_ICON[t]}</span>{label(t)}</button>)}</div></div>
      <div className="wide"><span className="lbl">How severe is it?</span>
        <div className="chips">{SEV.map((s) => <button type="button" key={s} className={`chip ${s} ${f.reportedSeverity === s ? "on" : ""}`} onClick={() => setF({ ...f, reportedSeverity: s })} aria-pressed={f.reportedSeverity === s}>{s}</button>)}</div></div>
      <label>Your name<input value={f.requesterName} onChange={set("requesterName")} required /></label>
      <label>Contact number<input value={f.contactNumber} onChange={set("contactNumber")} inputMode="tel" placeholder="9876543210" required /></label>
      <label className="wide">Location
        <div className="row"><input value={f.location} onChange={set("location")} placeholder="Street, landmark or area" required /><button type="button" className="ghost" onClick={locate} disabled={geo}>{geo ? "Locating…" : "📍 Use my location"}</button></div></label>
      <label className="wide">Description<textarea rows="4" maxLength={MAX} value={f.description} onChange={set("description")} required /><small className="muted right">{f.description.length}/{MAX}</small></label>
      <button className="btn big" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button></form></>);
}
