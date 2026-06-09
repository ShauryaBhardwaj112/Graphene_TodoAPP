# Graphene Personal Task Manager

> **Studio Graphene Full-Stack Developer Assessment — Exercise 1: Personal Task Manager**

A production-grade, full-stack Task Manager application built as part of the Studio Graphene Node.js + React assessment. While Exercise 1 specified a single-user task tracker without authentication, this implementation extends the brief with a complete **multi-user authentication system** — featuring JWT-based stateless sessions, Bcrypt password hashing, and secure HTTPOnly cross-origin cookies — to demonstrate real-world, production-ready engineering practices.

---

## 🔗 Live Demo

| Layer | URL |
|-------|-----|
| **Frontend (Vercel)** | https://app1-neon-tau.vercel.app/ |
| **Backend API (Render)** | https://shauryas-taskmanager.onrender.com |
| **Video Walkthrough** | https://drive.google.com/drive/folders/11sVzi1BA-JhB-Ru2QoNyc0SJNlDr-Owt?usp=drive_link |

> **Note:** The backend is hosted on Render's free tier. If the first request takes 30–50 seconds to respond, the server is waking from sleep — this is expected behaviour on free-tier hosting and is not a bug.

---

## 🎥 Video Walkthroughs

The following video recordings are available in the linked Google Drive folder:

- **Full Product Walkthrough & UI Feature Demo** — Covers user onboarding, task creation, status toggling, overdue task highlighting, filter/search functionality, and mobile responsiveness.
- **Backend Architecture & Security Review** — Covers JWT validation flow, Bcrypt password hashing, CORS preflight configuration, lazy-loaded MongoDB connection pool lifecycle, and HTTPOnly cookie handshake.

📁 [Access Video Folder](https://drive.google.com/drive/folders/11sVzi1BA-JhB-Ru2QoNyc0SJNlDr-Owt?usp=drive_link)

---

## ✅ Feature Coverage

### Must Have (All Completed)
- [x] Add a new task with title (required), optional description, and due date
- [x] View all tasks sorted by creation date (newest first)
- [x] Mark a task as complete or incomplete (toggle via checkbox)
- [x] Edit a task's title, description, or due date
- [x] Delete a task with a confirmation prompt
- [x] Filter tasks by status: All / Active / Completed

### Should Have (All Completed)
- [x] Active vs Completed task count displayed on screen
- [x] Overdue tasks visually distinguished (red text + "OVERDUE" label)
- [x] Empty state UI when no tasks match

### Bonus / Nice to Have (Completed)
- [x] Search tasks by title (live filter)
- [x] Multi-user data isolation (each user sees only their own tasks)
- [x] Persistent storage via MongoDB Atlas (tasks survive server restarts)

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React 18 + Vite | Fast HMR, optimised production builds, minimal config |
| **Routing** | React Router DOM v6 | Declarative client-side routing with protected route guards |
| **Styling** | Vanilla CSS + Design Tokens | Custom `--clr-*` variables for consistent theming without dependencies |
| **Backend** | Node.js + Express | Lightweight, async-first REST API framework |
| **Database** | MongoDB Atlas + Native Driver | Skipped Mongoose ODM intentionally to work directly with the driver for faster, leaner queries |
| **Auth** | JWT + Cookie Parser | Stateless session tokens stored in HTTPOnly cookies — immune to XSS attacks |
| **Password Security** | Bcrypt (10 rounds) | Industry-standard cryptographic password hashing |
| **Deployment** | Vercel (frontend) + Render (backend) | Both offer free-tier CI/CD with GitHub integration |

---

## 📂 Project Structure

```
Graphene_TodoAPP/
├── client/                        # React + Vite Frontend
│   ├── public/                    # Static assets (favicon, SVGs)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTask.jsx        # Task creation form
│   │   │   ├── List.jsx           # Task list with filter, search, toggle, delete
│   │   │   ├── UpdateTask.jsx     # Task edit form
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── SignUp.jsx         # Registration form
│   │   │   ├── NavBar.jsx         # Top navigation with auth-aware links
│   │   │   └── Protected.jsx      # Route guard — redirects unauthenticated users
│   │   ├── style/                 # Component-scoped CSS files
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx               # React root mount
│   ├── .env.production            # Production API URL (Render)
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Node.js + Express Backend
│   ├── index.js                   # Express app — all routes and middleware
│   ├── dbconfig.js                # Lazy-loaded MongoDB Atlas connection pool
│   ├── .env                       # Environment secrets (not committed)
│   └── package.json
│
├── vercel.json                    # Vercel build config (forces client/ context)
└── README.md
```

---

## 💻 How to Run Locally

**Prerequisites:** Node.js v18 or higher, a MongoDB Atlas account (free tier works).

### 1. Clone the repository

```bash
git clone https://github.com/ShauryaBhardwaj112/Graphene_TodoAPP.git
cd Graphene_TodoAPP
```

### 2. Set up and start the Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=3200
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/todo-app-db?retryWrites=true&w=majority
JWT_SECRET=your_ultra_secure_random_string_here
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm start
```

The API will be live at `http://localhost:3200`.

### 3. Set up and start the Frontend

Open a new terminal from the repo root:

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:3200
```

Start the dev server:

```bash
npm run dev
```

The app will be live at `http://localhost:5173`.

---

## 📡 API Documentation

All task endpoints require authentication. Send requests with `credentials: 'include'` to pass the HTTPOnly session cookie.

### Authentication Endpoints

#### `POST /signup` — Register a new user

**Request Body:**
```json
{
  "name": "Shaurya Bhardwaj",
  "email": "shaurya@example.com",
  "password": "securePassword123"
}
```

**Success Response `200`:**
```json
{ "success": true, "msg": "Signup successful" }
```

---

#### `POST /login` — Authenticate user

**Request Body:**
```json
{
  "email": "shaurya@example.com",
  "password": "securePassword123"
}
```

**Success Response `200`:** Sets an HTTPOnly `token` cookie automatically.
```json
{ "success": true, "msg": "Login successful" }
```

---

#### `POST /logout` — Terminate session

**Success Response `200`:**
```json
{ "success": true, "msg": "Logged out successfully" }
```

---

### Task Endpoints (All Protected)

#### `GET /tasks` — Fetch all tasks for the logged-in user

**Success Response `200`:**
```json
{
  "success": true,
  "result": [
    {
      "_id": "6481f0b2f0a1c23456789abc",
      "title": "Complete Studio Graphene Assignment",
      "description": "Finalise and push to main.",
      "dueDate": "2026-06-10T00:00:00.000Z",
      "status": "active",
      "userEmail": "shaurya@example.com"
    }
  ]
}
```

---

#### `GET /task/:id` — Fetch a single task by ID

**Success Response `200`:**
```json
{
  "success": true,
  "result": { "_id": "...", "title": "...", "description": "...", "dueDate": "...", "status": "active" }
}
```

---

#### `POST /add-task` — Create a new task

**Request Body:**
```json
{
  "title": "Complete Studio Graphene Assignment",
  "description": "Optional description",
  "dueDate": "2026-06-10",
  "status": "active"
}
```

**Success Response `200`:**
```json
{ "success": true, "message": "New task added" }
```

---

#### `PUT /update-task/:id` — Update a task

**Request Body** (send only fields to update):
```json
{ "status": "completed" }
```

**Success Response `200`:**
```json
{ "success": true, "message": "Task updated" }
```

---

#### `DELETE /delete/:id` — Delete a single task

**Success Response `200`:**
```json
{ "success": true, "message": "Task deleted" }
```

---

## 🔐 Security Architecture

- **HTTPOnly Cookies:** JWT tokens are stored in HTTPOnly cookies — they cannot be read by JavaScript, eliminating XSS token theft.
- **SameSite: None + Secure:** Required for cross-origin cookie transmission between Vercel (frontend) and Render (backend).
- **Multi-User Isolation:** Every task query filters by `req.user.email` decoded from the JWT — users can never access each other's tasks.
- **Bcrypt (10 rounds):** Passwords are hashed before storage. Plain-text passwords never reach the database.

---

## 📈 What I Would Build Next

Given more time, the following improvements would be prioritised:

- **Automated Tests:** Backend route security tests using Vitest + Supertest (e.g., verify that a user cannot access another user's tasks even with a valid token).
- **Redis Cache Layer:** Cache active task lists per user to reduce MongoDB query load.
- **Drag-and-Drop Reordering:** Implement `@hello-pangea/dnd` for intuitive task priority management.
- **Password Reset Flow:** Email-based reset using Nodemailer.
- **Pagination:** For users with large task lists, add cursor-based pagination to the `/tasks` endpoint.

---

## 🤖 AI Usage Disclosure

AI tools (Claude) were used during development for debugging deployment configuration issues (Vercel build pipeline) and for structuring this README. All application code — components, API routes, authentication logic, database queries — was written and is fully understood by me. I can walk through every line in a technical discussion.

---

*Built by Shaurya Bhardwaj for the Studio Graphene Full-Stack Developer Assessment.*