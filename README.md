# Emergency Assistance Request Coordinator
Academic prototype (Spring Boot + React). **It does not contact real emergency services.** Admin mode is a labelled demo with no authentication and is not secure. Priority is a demonstration rule, not medical triage.

**Storage:** all data lives in Java memory (ArrayList, HashMap, ConcurrentHashMap, PriorityQueue). **Restarting the backend erases all requests and resets responders.** No database is used.

## Quick start (one click)
Windows: double-click **`run.bat`**. macOS/Linux/Git Bash: `chmod +x run.sh && ./run.sh`.
It checks Java/Maven/Node, installs frontend packages on first run, starts both servers and opens http://localhost:5173.

## What's new
- Animated emergency-themed background (siren light beams, heartbeat line, skyline, ambulance and fire engine), dark/light theme toggle, live clock.
- Dashboard: live auto-refresh, animated counters, priority bars. Report: tap-to-choose type/severity, "Use my location", success screen.
- Track: progress stepper, request timeline, recent IDs. Manage: auto-refresh, CSV export, admin notes, timeline. Responders: availability filter.
- Floating SOS button listing real helpline numbers (112, 108, 101, 100) for awareness only.
- Backend: request timeline (auto-logged), `POST /api/requests/{id}/notes`, `GET /api/requests/search?q=`.

## Run manually (Windows PowerShell)
Prerequisites: JDK 17+, Maven 3.9+, Node 18+.
```powershell
cd backend
mvn test
mvn spring-boot:run          # http://localhost:8080
```
```powershell
cd frontend
npm install
npm run dev                  # http://localhost:5173
```
## Test the API (curl.exe)
```powershell
curl.exe -X POST http://localhost:8080/api/requests -H "Content-Type: application/json" -d '{\"requesterName\":\"Asha\",\"contactNumber\":\"9876543210\",\"emergencyType\":\"FIRE\",\"location\":\"Main St\",\"description\":\"Smoke\",\"reportedSeverity\":\"CRITICAL\"}'
curl.exe http://localhost:8080/api/requests/active
curl.exe -X PATCH http://localhost:8080/api/requests/ER-1001/assign -H "Content-Type: application/json" -d '{\"responderId\":\"R-201\"}'
curl.exe -X PATCH http://localhost:8080/api/requests/ER-1001/status -H "Content-Type: application/json" -d '{\"status\":\"IN_PROGRESS\"}'
curl.exe http://localhost:8080/api/admin/dashboard
```
## Endpoints
POST/GET `/api/requests`; GET `/active`, `/{id}`, `/status/{status}`, `/priority/{priority}`; PATCH `/{id}/status|priority|assign|cancel`; GET `/api/responders`, `/available`, `/{id}`; GET `/api/admin/dashboard`.
Status flow: PENDING→ASSIGNED (via assign only)→IN_PROGRESS→RESOLVED; CANCELLED allowed from any active state.

## Design notes
- `PriorityService`: PriorityQueue + Comparator (priority rank, then oldest first); re-prioritising does remove-then-add, so no stale entries.
- `EmergencyRequestService`: ArrayList (all requests), HashMap (ID lookup); mutating methods are `synchronized`, so two admins cannot assign the same responder.
- `ResponderService`: ConcurrentHashMap with 5 sample responders. `GlobalExceptionHandler` returns JSON errors (400/404).
- Frontend calls the backend only through `src/services/api.js` (base URL from `.env`).

## Known limitations / future work
In-memory data; no authentication; no automated frontend tests; add a database, real auth and notifications later.

## Group contributions
| Member | Contribution |
|---|---|
| | |
