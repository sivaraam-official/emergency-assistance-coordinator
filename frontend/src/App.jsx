import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; import ReportEmergency from "./pages/ReportEmergency"; import ManageRequests from "./pages/ManageRequests";
import TrackRequest from "./pages/TrackRequest"; import Responders from "./pages/Responders";
import EmergencyBackground from "./components/EmergencyBackground"; import Helplines from "./components/Helplines"; import { ToastProvider } from "./components/Toast";

const LINKS = [["/", "🏠 Dashboard"], ["/report", "🚨 Report"], ["/manage", "🗂️ Manage"], ["/track", "🔎 Track"], ["/responders", "🧑‍🚒 Responders"]];

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span className="clock">{t.toLocaleTimeString()}</span>;
}

export default function App() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("eac-theme") || "dark"; } catch { return "dark"; } });
  const loc = useLocation();
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem("eac-theme", theme); } catch { /* ignore */ } }, [theme]);
  return (<ToastProvider>
    <EmergencyBackground />
    <header className="top">
      <div className="brand"><span className="logo">🚨</span><div><h1>Emergency Assistance Coordinator</h1><small>Report · Prioritise · Respond</small></div></div>
      <nav>{LINKS.map(([to, l]) => <NavLink key={to} to={to} end={to === "/"}>{l}</NavLink>)}</nav>
      <div className="tools"><Clock /><button className="ghost round" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle light or dark theme" title="Toggle theme">{theme === "dark" ? "☀️" : "🌙"}</button></div>
    </header>
    <div className="banner">Academic prototype. Demo administrator mode, no login. This does not contact real emergency services. Priority is a demonstration rule, not medical triage.</div>
    <main key={loc.pathname} className="page"><Routes><Route path="/" element={<Dashboard />} /><Route path="/report" element={<ReportEmergency />} /><Route path="/manage" element={<ManageRequests />} />
      <Route path="/track" element={<TrackRequest />} /><Route path="/responders" element={<Responders />} /></Routes></main>
    <Helplines />
  </ToastProvider>);
}
