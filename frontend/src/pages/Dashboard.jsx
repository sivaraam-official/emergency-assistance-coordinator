import { useCallback, useEffect, useState } from "react"; import { Link } from "react-router-dom";
import { api } from "../services/api"; import useCountUp from "../hooks/useCountUp";
import { Notice, Loading, Empty, Badge, fmt, label, TYPE_ICON } from "../components/Feedback";

function Stat({ icon, text, value, cls }) {
  const v = useCountUp(value);
  return <div className={`stat ${cls || ""}`}><span className="ico">{icon}</span><b>{v}</b><span>{text}</span></div>;
}

export default function Dashboard() {
  const [d, setD] = useState(null), [reqs, setReqs] = useState([]), [err, setErr] = useState(""), [at, setAt] = useState(null);
  const load = useCallback(() => Promise.all([api.getDashboard(), api.getRequests()])
    .then(([a, b]) => { setD(a); setReqs(b); setErr(""); setAt(new Date()); }).catch((e) => setErr(e.message)), []);
  useEffect(() => { load(); const i = setInterval(load, 8000); return () => clearInterval(i); }, [load]); // live auto-refresh
  if (err && !d) return <Notice>{err}</Notice>; if (!d) return <Loading />;
  const stats = [["📋", "Total requests", d.totalRequests], ["🔴", "Critical (active)", d.criticalRequests, "crit"], ["⏳", "Pending", d.pendingRequests], ["🚒", "Assigned", d.assignedRequests], ["🛠️", "In progress", d.inProgressRequests], ["✅", "Resolved", d.resolvedRequests], ["🧑‍🚒", "Available responders", d.availableResponders]];
  const dist = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => [p, reqs.filter((r) => r.priority === p).length]);
  return (<>
    <section className="hero">
      <div><h2>Every second counts.</h2><p>Report an emergency, watch it get prioritised, and follow it until help arrives.</p>
        <div className="hero-actions"><Link to="/report" className="btn big pulse">🚨 Report an emergency</Link><Link to="/track" className="btn big ghost">🔎 Track a request</Link></div></div>
      <div className="live"><span className="dot" /> Live · {at ? `updated ${at.toLocaleTimeString()}` : ""}</div>
    </section>
    {err && <Notice>{err}</Notice>}
    <div className="grid">{stats.map(([i, l, v, c]) => <Stat key={l} icon={i} text={l} value={v} cls={c} />)}</div>
    <div className="two">
      <section className="panel"><h3>Priority distribution</h3>{dist.map(([p, n]) => <div className="bar" key={p}><Badge value={p} /><div className="track"><i style={{ width: `${reqs.length ? (n / reqs.length) * 100 : 0}%` }} className={p} /></div><span>{n}</span></div>)}</section>
      <section className="panel"><h3>Recent requests</h3>{reqs.length === 0 ? <Empty>No requests yet. Use "Report emergency" to create one.</Empty> :
        <ul className="plain">{reqs.slice(-5).reverse().map((r) => <li key={r.requestId}><span className="ico">{TYPE_ICON[r.emergencyType]}</span><div><b>{r.requestId}</b> {label(r.emergencyType)} at {r.location}<br /><Badge value={r.priority} /> <Badge value={r.status} /> <small>{fmt(r.createdAt)}</small></div></li>)}</ul>}</section>
    </div></>);
}
