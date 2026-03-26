# Smart Campus Operations Hub

PUF Project — production-style monorepo: **Spring Boot 3** (JWT, JPA, layered architecture) + **React** (Vite, Tailwind, Axios, React Router).

## Prerequisites

- **JDK 17+** (set `JAVA_HOME` or add `java` to `PATH` — the scripts below auto-detect `JAVA_HOME` from `java` on PATH).
- **Node.js 18+** and npm (for the frontend).
- **PostgreSQL** (optional; default config uses **H2 in-memory** so the API runs without installing a database).

## Quick start (H2 — no PostgreSQL)

### Option A — Windows (simplest)

Double‑click **`start-local.bat`**, or from the repo root in PowerShell:

```powershell
.\run-local.ps1
```

This detects **`JAVA_HOME`** from the JVM (works with Oracle `javapath`), opens two windows (API on **8080**, UI on **5173**), and passes `JAVA_HOME` to Maven Wrapper. No global Maven install — use `backend\mvnw.cmd`.

Open **http://localhost:5173** after the UI window shows the Vite “ready” line and the API window shows `Started CampusHubApplication` (first Maven run may take several minutes).

### Troubleshooting

- **`ERR_CONNECTION_REFUSED` in the browser** — Usually the dev server is not running yet or only the API failed. Confirm the **UI** window shows `Local: http://localhost:5173/` (or similar). Use **http://localhost:5173** (Vite listens on all local interfaces so `localhost` works on Windows).
- **API window closes or shows errors** — Very new JDKs (e.g. 26) may not be fully supported by all Spring Boot versions. If the API will not start, install **JDK 21 LTS** ([Temurin](https://adoptium.net/)), set `JAVA_HOME` to that JDK, and run `run-local.ps1` again.

### Option B — manual (any OS)

**Backend** (uses bundled Maven Wrapper when `mvn` is not installed):

```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# macOS / Linux:
./mvnw spring-boot:run
```

Or with a global Maven install: `mvn spring-boot:run`

API: `http://localhost:8080`

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` — Vite proxies `/api` to `http://localhost:8080`.

### Demo accounts (seeded on first run)

| Email | Password | Role |
|--------|----------|------|
| admin@campus.edu | admin123 | ADMIN |
| tech@campus.edu | tech123 | TECHNICIAN |
| user@campus.edu | user123 | USER |

Seeded resources include **Seminar Room 101**, **CS Lab 3**, and **Grand Auditorium** (40 seats: rows A–E × 8).

## PostgreSQL

1. Create database and user.
2. In `backend/src/main/resources/application.yml`, comment the H2 `datasource` block and uncomment the PostgreSQL block (see comments in file).
3. Set `JWT_SECRET` to a long random string (≥ 32 bytes when UTF-8 encoded).
4. Run the application; Hibernate `ddl-auto: update` will create tables. For a manual baseline, see `database/schema.sql`.

## Features (checklist)

- **Resources** — CRUD (admin), search/filter by type, capacity, location.
- **Bookings** — PENDING → APPROVED / REJECTED / CANCELLED; overlap rules; auditorium **per-seat** conflicts only.
- **Auditorium seats** — API availability; UI grid (green / red / yellow) with transitions.
- **Tickets** — workflow, technician assignment, comments (author edit/delete), up to **3** JPG/PNG attachments (5MB each).
- **Notifications** — booking decisions, ticket updates, comments.
- **JWT auth** — roles `USER`, `ADMIN`, `TECHNICIAN`.
- **Audit log** — booking/ticket actions (`GET /api/admin/audit-logs`).

## Documentation

- **Endpoint list & contracts:** [docs/API.md](docs/API.md)
- **Example HTTP:** [docs/sample-requests.http](docs/sample-requests.http)
- **SQL reference:** [database/schema.sql](database/schema.sql)

## Integration

1. Start backend, then frontend.
2. Log in as `user@campus.edu` / `user123`.
3. **Bookings:** create a room booking (pick future times, attendees ≥ 1) or an auditorium booking (load seats, select seats, submit).
4. **Admin:** log in as `admin@campus.edu`, approve/reject bookings, open **Admin** for resources + audit log.
5. **Tickets:** create a ticket, add comments, upload images; as **tech**, set status; as **admin**, assign technician (use user id **2** for seeded technician).

## Project layout

```
backend/          Maven Spring Boot API
frontend/         Vite + React SPA
database/         Reference SQL
docs/             API notes & samples
```

## Production notes

- Switch `ddl-auto` to `validate` or use Flyway/Liquibase.
- Use strong `JWT_SECRET` and HTTPS.
- Point `app.upload.dir` to persistent storage and back up files.
