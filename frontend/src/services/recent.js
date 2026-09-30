// Remembers the request IDs you created in this browser so you can track them with one click.
const KEY = "eac-recent-ids";
export function getRecentIds() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
export function rememberId(id) {
  try { localStorage.setItem(KEY, JSON.stringify([id, ...getRecentIds().filter((x) => x !== id)].slice(0, 5))); } catch { /* storage unavailable */ }
}
