const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
async function call(path, method = "GET", body) {
  let res;
  try { res = await fetch(BASE + path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("Cannot reach the backend. Is it running on port 8080?"); }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
const enc = (id) => encodeURIComponent(id);
const patch = (id, part, body) => call(`/requests/${enc(id)}/${part}`, "PATCH", body);
export const api = {
  createRequest: (b) => call("/requests", "POST", b), getRequests: () => call("/requests"),
  getRequest: (id) => call(`/requests/${enc(id.trim())}`),
  updateStatus: (id, status) => patch(id, "status", { status }), updatePriority: (id, priority) => patch(id, "priority", { priority }),
  assign: (id, responderId) => patch(id, "assign", { responderId }), cancel: (id) => patch(id, "cancel"),
  addNote: (id, note) => call(`/requests/${enc(id)}/notes`, "POST", { note }),
  getResponders: () => call("/responders"), getAvailableResponders: () => call("/responders/available"), getDashboard: () => call("/admin/dashboard"),
};
