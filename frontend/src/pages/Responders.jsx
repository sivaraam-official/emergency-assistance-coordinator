import { useEffect, useState } from "react"; import { api } from "../services/api"; import { Notice, Loading, Empty, Badge, label } from "../components/Feedback";
const ICON = { MEDICAL_TEAM: "🚑", FIRE_AND_RESCUE_TEAM: "🚒", ACCIDENT_RESPONSE_TEAM: "🚓", GENERAL_ASSISTANCE_TEAM: "🧑‍🚒" };
export default function Responders() {
  const [list, setList] = useState(null), [err, setErr] = useState(""), [show, setShow] = useState("ALL");
  useEffect(() => { const load = () => api.getResponders().then(setList).catch((e) => setErr(e.message)); load(); const i = setInterval(load, 8000); return () => clearInterval(i); }, []);
  if (err && !list) return <Notice>{err}</Notice>; if (!list) return <Loading />; if (!list.length) return <Empty>No responders configured.</Empty>;
  const shown = list.filter((r) => show === "ALL" || r.availabilityStatus === show), free = list.filter((r) => r.availabilityStatus === "AVAILABLE").length;
  return (<><h2>🧑‍🚒 Responders</h2><p className="muted">{free} of {list.length} available</p>
    <div className="chips">{["ALL", "AVAILABLE", "BUSY"].map((s) => <button key={s} className={`chip ${show === s ? "on" : ""}`} onClick={() => setShow(s)}>{s}</button>)}</div>
    <div className="grid">{shown.map((r) => <div className={`card resp ${r.availabilityStatus}`} key={r.responderId}><span className="big-ico">{ICON[r.responderType]}</span><h3>{r.name}</h3><p>{label(r.responderType)} · {r.responderId}</p><p>📞 {r.contactNumber}</p>
      <p><Badge value={r.availabilityStatus} /> {r.assignedRequestId && <small>Handling {r.assignedRequestId}</small>}</p></div>)}</div></>);
}
