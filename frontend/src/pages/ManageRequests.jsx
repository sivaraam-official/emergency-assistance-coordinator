import { useCallback, useEffect, useMemo, useState } from "react"; import { api } from "../services/api";
import { Notice, Loading, Empty, Badge, fmt, label, TYPE_ICON } from "../components/Feedback"; import { useToast } from "../components/Toast";
const RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const csvCell = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
export default function ManageRequests() {
  const [reqs, setReqs] = useState(null), [resp, setResp] = useState([]), [msg, setMsg] = useState(null), [sel, setSel] = useState(null), [note, setNote] = useState(""), [auto, setAuto] = useState(true);
  const [q, setQ] = useState(""), [fType, setFType] = useState(""), [fStatus, setFStatus] = useState(""), [fPri, setFPri] = useState(""), [sort, setSort] = useState("priority");
  const toast = useToast();
  const load = useCallback(() => Promise.all([api.getRequests(), api.getResponders()]).then(([a, b]) => { setReqs(a); setResp(b); }).catch((e) => setMsg({ kind: "error", text: e.message })), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!auto) return; const i = setInterval(load, 8000); return () => clearInterval(i); }, [auto, load]);
  const act = async (fn, ok, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try { await fn(); setMsg(null); toast("success", ok); await load(); } catch (e) { setMsg({ kind: "error", text: e.message }); }
  };
  const rows = useMemo(() => (reqs || []).filter((r) => (!fType || r.emergencyType === fType) && (!fStatus || r.status === fStatus) && (!fPri || r.priority === fPri) &&
    (!q || (r.requestId + r.location + r.requesterName + r.description).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === "priority" ? RANK[a.priority] - RANK[b.priority] || a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)), [reqs, q, fType, fStatus, fPri, sort]);
  function exportCsv() {
    const head = ["ID", "Type", "Location", "Priority", "Status", "Responder", "Requester", "Contact", "Created"];
    const body = rows.map((r) => [r.requestId, r.emergencyType, r.location, r.priority, r.status, r.assignedResponderId, r.requesterName, r.contactNumber, r.createdAt]);
    const blob = new Blob([[head, ...body].map((l) => l.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "emergency-requests.csv"; a.click(); URL.revokeObjectURL(a.href);
    toast("success", `Exported ${rows.length} request(s).`);
  }
  async function addNote(e) {
    e.preventDefault(); if (!note.trim()) return;
    try { const u = await api.addNote(sel.requestId, note); setSel(u); setNote(""); toast("success", "Note added."); load(); } catch (er) { setMsg({ kind: "error", text: er.message }); }
  }
  if (!reqs) return <><Notice>{msg?.text}</Notice><Loading /></>;
  const free = resp.filter((r) => r.availabilityStatus === "AVAILABLE");
  return (<><div className="title-row"><h2>🗂️ Manage requests</h2>
    <div className="row"><label className="inline"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto-refresh</label><button className="ghost" onClick={exportCsv}>⬇️ Export CSV</button></div></div>
    <Notice kind={msg?.kind}>{msg?.text}</Notice>
    <div className="filters"><input placeholder="🔍 Search ID, name, location" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
      <select value={fType} onChange={(e) => setFType(e.target.value)} aria-label="Type"><option value="">All types</option>{Object.keys(TYPE_ICON).map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
      <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="Status"><option value="">All statuses</option>{["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"].map((t) => <option key={t}>{t}</option>)}</select>
      <select value={fPri} onChange={(e) => setFPri(e.target.value)} aria-label="Priority"><option value="">All priorities</option>{Object.keys(RANK).map((t) => <option key={t}>{t}</option>)}</select>
      <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="priority">Sort: priority, oldest first</option><option value="newest">Sort: newest first</option></select></div>
    {rows.length === 0 ? <Empty>No requests match. Adjust the filters or report a new emergency.</Empty> :
      <div className="scroll"><table><thead><tr><th>ID</th><th>Type</th><th>Location</th><th>Priority</th><th>Status</th><th>Responder</th><th>Created</th><th>Actions</th></tr></thead><tbody>
        {rows.map((r) => { const open = r.status === "PENDING", live = r.status === "ASSIGNED" || r.status === "IN_PROGRESS", active = open || live; return (
          <tr key={r.requestId} className={r.priority === "CRITICAL" && active ? "row-crit" : ""}><td>{r.requestId}</td><td>{TYPE_ICON[r.emergencyType]} {label(r.emergencyType)}</td><td>{r.location}</td><td><Badge value={r.priority} /></td><td><Badge value={r.status} /></td><td>{r.assignedResponderId || "-"}</td><td>{fmt(r.createdAt)}</td>
            <td className="actions"><button className="ghost" onClick={() => { setSel(r); setNote(""); }}>Details</button>
              {open && <select aria-label="Assign responder" value="" onChange={(e) => e.target.value && act(() => api.assign(r.requestId, e.target.value), `Assigned ${e.target.value} to ${r.requestId}.`, `Assign ${e.target.value} to ${r.requestId}?`)}><option value="">Assign…</option>{free.map((x) => <option key={x.responderId} value={x.responderId}>{x.name}</option>)}</select>}
              {live && <select aria-label="Update status" value="" onChange={(e) => e.target.value && act(() => api.updateStatus(r.requestId, e.target.value), `${r.requestId} is now ${e.target.value}.`, `Change ${r.requestId} to ${e.target.value}?`)}><option value="">Status…</option>{r.status === "ASSIGNED" && <option>IN_PROGRESS</option>}<option>RESOLVED</option></select>}
              {active && <select aria-label="Update priority" value={r.priority} onChange={(e) => act(() => api.updatePriority(r.requestId, e.target.value), `Priority of ${r.requestId} set to ${e.target.value}.`, `Change priority to ${e.target.value}?`)}>{Object.keys(RANK).map((t) => <option key={t}>{t}</option>)}</select>}
              {active && <button className="danger" onClick={() => act(() => api.cancel(r.requestId), `${r.requestId} cancelled.`, `Cancel ${r.requestId}? This cannot be undone.`)}>Cancel</button>}</td></tr>); })}</tbody></table></div>}
    {sel && <div className="modal" role="dialog" aria-modal="true" onClick={() => setSel(null)}><div onClick={(e) => e.stopPropagation()}>
      <h3>{TYPE_ICON[sel.emergencyType]} {sel.requestId} <Badge value={sel.status} /> <Badge value={sel.priority} /></h3>
      <p><b>Requester:</b> {sel.requesterName} ({sel.contactNumber})</p><p><b>Location:</b> {sel.location}</p><p><b>Description:</b> {sel.description}</p><p><b>Reported severity:</b> {sel.reportedSeverity}</p><p><b>Updated:</b> {fmt(sel.updatedAt)}</p>
      <h4>Timeline</h4><ul className="timeline">{[...(sel.timeline || [])].reverse().map((t, i) => <li key={i}><small>{fmt(t.time)}</small>{t.message}</li>)}</ul>
      <h4>Admin notes</h4>{(sel.notes || []).length === 0 ? <p className="muted">No notes yet.</p> : <ul className="timeline notes">{[...sel.notes].reverse().map((t, i) => <li key={i}><small>{fmt(t.time)}</small>{t.message}</li>)}</ul>}
      <form onSubmit={addNote} className="row"><input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" aria-label="Note" /><button className="btn">Add</button></form>
      <div className="right"><button className="ghost" onClick={() => setSel(null)}>Close</button></div></div></div>}</>);
}
