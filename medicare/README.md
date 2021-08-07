# MediCare — Hospital Portal 🏥

A full-stack **MERN** hospital portal where patients book specialist appointments by open time slot, manage their visits, and look up trusted drug information — while admins manage the doctor roster and every appointment.

> **App #5 of a 12-app MERN portfolio.** Engineering lesson: **Role-Based Access Control (RBAC)** — one auth system, two experiences (patient vs admin), enforced on both the client and the server.

---

## ✨ Features

**Patients**
- Register / sign in (JWT auth)
- Browse doctors by specialty or search by name
- See **real-time slot availability** per doctor per day and book in a couple of taps
- Personal dashboard: upcoming + past appointments, cancel anytime
- Drug-information lookup powered by NIH **RxNav** + **openFDA**

**Admins**
- Separate, role-gated dashboard
- Manage the **doctor roster** (add / edit / remove, with working days + time slots)
- View **all appointments**, filter by status, mark completed or cancel
- At-a-glance stats (doctors, appointments, booked today, cancellations)

**Throughout**
- Loading / empty / error states on every async view
- Mobile-first responsive UI, keyboard focus, semantic markup, reduced-motion support
- Toast notifications, skeleton/spinner loaders, consistent teal design system

---

## 🎓 The engineering lesson: RBAC

Authorisation is layered so the server is always the source of truth:

| Layer | Mechanism |
|---|---|
| **Token** | JWT issued on register/login, sent as `Authorization: Bearer <token>` |
| **Authentication** | `protect` middleware verifies the token and loads `req.user` |
| **Authorisation** | `requireRole('admin')` / `requireRole('patient', 'admin')` gate each route |
| **Client guard** | `<RoleRoute role="admin">` redirects users away from pages their role can't use |
| **Ownership** | Patients can only cancel their **own** appointments; admins can act on any |

Roles are **never** accepted from the registration body — patients self-register as `patient`, and admin accounts are provisioned by the seed script (or by another admin).

---

## 🧱 Tech stack (2021–2022)

**Frontend (`client/`)** — React `17.0.2` (CRA 5), react-router-dom `6.3`, axios `0.27.2`, react-hook-form `7`, Tailwind CSS `3.1`, react-toastify `9`, dayjs.

**Backend (`server/`)** — Express `4.18.1`, Mongoose `6.5` (MongoDB 5/6), jsonwebtoken `8.5.1`, bcryptjs `2.4.3`, express-validator `6.14`, helmet `6`, morgan, express-rate-limit `6`, node-cache `5`, axios.

**Runtime** — Node `16.x` LTS, npm `8.x`. CommonJS on the backend.

---

## 📁 Project structure

```
medicare/
├── client/                 # React (CRA)
│   └── src/
│       ├── api/            # axios instance + endpoint modules
│       ├── components/     # design system + feature components
│       ├── context/        # AuthContext
│       ├── hooks/          # useAuth
│       ├── pages/          # route-level views
│       └── utils/
├── server/                 # Express + Mongoose
│   └── src/
│       ├── config/         # db.js
│       ├── controllers/
│       ├── data/           # seed roster
│       ├── middleware/     # auth (protect/requireRole), errorHandler, notFound
│       ├── models/         # User, Doctor, Appointment
│       ├── routes/
│       ├── seed/           # seed.js
│       ├── services/       # drugService (RxNav + openFDA + cache + mock)
│       └── utils/          # asyncHandler, apiResponse, generateToken
└── package.json            # root — runs both with `concurrently`
```

---

## 🚀 Getting started

### Prerequisites
- Node.js **16.x** and npm **8.x**
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Install
```bash
# from the repo root — installs root, server, and client
npm run install:all
```

### 2. Configure environment
```bash
# server
cp server/.env.example server/.env
# client
cp client/.env.example client/.env
```
Then edit `server/.env` and set at least `MONGO_URI` and `JWT_SECRET`.
RxNav and openFDA are **keyless** — no API keys to add.

### 3. Seed the database
```bash
npm run seed
```
Creates the demo accounts, a 10-doctor roster, and a couple of sample appointments.

### 4. Run (client + server together)
```bash
npm run dev
```
- Client → http://localhost:3000
- API → http://localhost:5000/api

---

## 🔑 Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medicare.dev` | `Admin123!` |
| Patient | `patient@medicare.dev` | `Patient123!` |

The sign-in screen has one-tap buttons to fill these in.

---

## 🌐 External data layer

- **RxNav** (NIH) and **openFDA** are called **only from the backend** (`server/src/services/drugService.js`) and reshaped into the app's standard envelope.
- Responses are **cached with `node-cache`** (6h TTL), so repeated lookups are instant and the public endpoints aren't hammered.
- A built-in **mock fallback** means the drug lookup (and the whole UI) still works with no internet or if an upstream API is down.
- Our own routes are protected by `express-rate-limit` and `helmet`.

---

## 📡 API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (always role `patient`) |
| POST | `/auth/login` | Public | Sign in, returns JWT |
| GET | `/auth/me` | Auth | Current user |
| GET | `/doctors` | Public | List doctors (`?specialty=&q=`) |
| GET | `/doctors/specialties` | Public | Specialty list |
| GET | `/doctors/:id` | Public | Doctor profile |
| POST | `/doctors` | **Admin** | Add doctor |
| PUT | `/doctors/:id` | **Admin** | Update doctor |
| DELETE | `/doctors/:id` | **Admin** | Remove doctor (cancels active appts) |
| GET | `/appointments/availability` | Public | Free slots (`?doctor=&date=`) |
| POST | `/appointments` | Patient | Book a slot |
| GET | `/appointments/me` | Auth | My appointments |
| GET | `/appointments` | **Admin** | All appointments (`?status=&date=`) |
| PATCH | `/appointments/:id/cancel` | Owner/Admin | Cancel |
| PATCH | `/appointments/:id/status` | **Admin** | Update status |
| GET | `/drugs/search` | Auth | Drug name search (`?q=`) |
| GET | `/drugs/info` | Auth | Drug details (`?name=`) |

Every response uses the shared envelope:
```json
{ "success": true, "data": { }, "message": "" }
```

---

## 🩺 How slot booking works

Each doctor has `workingDays` (0–6) and a list of `slots` (`"HH:mm"`). The availability endpoint takes the doctor's slots for a date and **subtracts already-booked slots**, skips non-working days, and hides past times for today. A **compound partial unique index** on `(doctor, date, slot)` for active statuses guarantees two patients can never grab the same slot, even in a race.

---

## ✅ Definition of Done

- [x] One command boots client + server (`npm run dev`)
- [x] `.env.example` in client **and** server; no secrets committed
- [x] Loading / empty / error states everywhere
- [x] Responsive + accessibility basics
- [x] Shared design system + teal accent
- [x] Client **and** server validation
- [x] Keyless APIs proxied + cached through the backend
- [x] Auth + protected/role-based routes; passwords never leaked
- [x] README with setup, env, features, API reference

---

## 📸 Screenshots

_Add screenshots here:_
- `docs/home.png` — landing + specialties
- `docs/doctors.png` — doctor listing & filters
- `docs/booking.png` — slot picker
- `docs/admin.png` — admin dashboard
- `docs/drugs.png` — drug lookup

---

## 📝 License

MIT — portfolio/demo project. Not affiliated with any real clinic; not medical advice.
