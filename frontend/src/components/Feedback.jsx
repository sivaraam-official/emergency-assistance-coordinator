export const Notice = ({ kind = "error", children }) => children ? <div className={`notice ${kind}`} role={kind === "error" ? "alert" : "status"}>{children}</div> : null;
export const Loading = () => <p className="muted loading" aria-busy="true"><span className="spinner" /> Loading…</p>;
export const Empty = ({ children }) => <p className="empty">{children}</p>;
export const Badge = ({ value }) => <span className={`badge ${value}`}>{value.replace("_", " ")}</span>;
export const fmt = (t) => new Date(t).toLocaleString();
export const TYPE_ICON = { MEDICAL_EMERGENCY: "🚑", ROAD_ACCIDENT: "🚗", FIRE: "🔥", RESCUE: "🛟", OTHER: "🆘" };
export const label = (s) => s.replaceAll("_", " ");
