# Graphene Personal Task Manager (Secure Full-Stack Monorepo)

An advanced, production-grade Task Manager platform built as part of the Studio Graphene Full-Stack Developer Assessment[cite: 3]. [cite_start]While the core project brief (Exercise 1) specified a single-user task tracker without authentication [cite: 68, 72][cite_start], this implementation steps up to an enterprise-grade stateless authentication architecture. It features **Multi-User Data Isolation**, **Bcrypt password hashing**, and secure cross-origin **HTTPOnly session cookies** to deliver an authentic, secure real-world application experience.

### 🔗 Production Live Links
- **Production Frontend UI (Vercel):** https://taskmanager-liart-sigma.vercel.app
- **Production Backend API (Render):** https://task-manager-wjgy.onrender.com

---

## 🎥 Video Walkthroughs & Live Demos

To provide the review committee with immediate visibility into the system's engineering design and runtime behaviors, the following video presentations are available:

* 🎬 **Full Product Walkthrough & UI Feature Demo:** [URL
    *Covers: User onboarding flow, loading states, multi-user isolation verify, date processing, status toggles, responsive views on mobile breakpoints.*
* ⚙️ **Backend Architecture & Security Handshake Review:** [URl]
    * *Covers: Cryptographic password verification logic, CORS dynamic pre-flights, lazy-loaded connection pool lifecycle, and stateless HTTPOnly cookie validation matrix.*

---

## 🛠️ Production Tech Stack & Architectural Decisions

### Frontend (`/client`)
- **React (Vite):** Selected over heavy traditional setups for near-instantaneous Hot Module Replacement (HMR) and optimized client compile targets[cite: 25].
- **React Router DOM:** Controls client-side view management paired with high-performance routing blocks (`Protected.jsx`) to guard internal view frames against unauthorized traffic injections.
- [cite_start]**Vanilla CSS with Custom Design Tokens:** Configured clean systemic layouts and adaptive design tokens (e.g., `--clr-surface`, `--clr-danger`) ensuring fluid device responsiveness across all screen breakpoints[cite: 28, 147].

### Backend (`/server`)
- **Node.js & Express:** Configured asynchronous callback handling architectures to build clean, predictable, and highly scalable REST API routing tables[cite: 24, 59].
- **MongoDB & Native Driver:** Bypassed bulky Object Data Modeling (ODM) abstraction layers to utilize asynchronous connection pool managers directly, speeding up transactions.
- **JSON Web Tokens (JWT) & Cookie Parser:** Configured stateless session verification mechanisms where validation tokens travel strictly inside HTTPOnly headers, protecting client states from malicious client-side script manipulations (XSS protection).
- **Bcrypt:** Enforced server-side 10-rounds cryptographic salting algorithms ensuring plain-text user passwords are secure before reaching cloud-layer registers.

---

## 📂 Project Structure

```text
Graphene_TodoAPP/
├── client/                 # React Frontend Application (Vite Build Asset Scope)
│   ├── public/             # Static SVGs, favicon models, and web application assets
│   ├── src/
│   │   ├── components/     # UI Views (List.jsx, AddTask.jsx, Login.jsx, SignUp.jsx, Protected.jsx)
│   │   ├── style/          # Dedicated responsive design styling layouts (navbar.css, list.css, etc.)
│   │   ├── App.jsx         # Application base route mapper matrix
│   │   └── main.jsx        # Frontend runtime mount initialization vector
│   ├── vite.config.js      # Build bundler configuration parameters
│   └── package.json        # Client configuration and runtime scripts
│
└── server/                 # Node.js REST API Server Application Scope
    ├── dbconfig.js         # Lazy-loaded MongoDB Atlas client initialization pooling
    ├── index.js            # Main Express server pipeline middleware structure
    └── package.json        # Server configurations and absolute operational scripts

Server Environment Settings (server/.env)Code snippetPORT=3200
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/todo-app-db?retryWrites=true&w=majority
JWT_SECRET=your_ultra_secure_long_random_string_vector
FRONTEND_URL=[https://taskmanager-liart-sigma.vercel.app](https://taskmanager-liart-sigma.vercel.app)
Client Environment Settings (client/.env)Code snippetVITE_API_URL=[https://task-manager-wjgy.onrender.com](https://task-manager-wjgy.onrender.com)
💻 How to Run LocallyFollow these precise commands to instantiate a fully local execution loop. Ensure you have Node.js (v18+) installed globally on your workstation.  1. Clone the MonorepoBashgit clone [https://github.com/ShauryaBhardwaj112/Graphene_TodoAPP.git](https://github.com/ShauryaBhardwaj112/Graphene_TodoAPP.git)
cd Graphene_TodoAPP
2. Configure and Boot the Backend ServerBashcd server
npm install
# Create your local .env file using the schema outlined above
npm start
The API server will initialize dynamically on port 3200.3. Configure and Boot the Frontend ClientOpen a secondary terminal window from the root repository layout directory:Bashcd client
npm install
# Create your local .env file pointing VITE_API_URL to http://localhost:3200
npm run dev
Vite will broadcast the functional application layout at http://localhost:5173.📡 REST API DocumentationAll resource endpoints (except Authentication) are protected via custom JWT state middleware and require credentials: 'include' on the frontend to process HTTPOnly cross-origin session cookies successfully.🔑 Authentication Endpoints1. User Registration (Sign Up)Endpoint: /signupMethod: POSTHeaders: Content-Type: application/jsonRequest Body:JSON{
  "name": "Shaurya Bhardwaj",
  "email": "shaurya@example.com",
  "password": "securePassword123"
}
Success Response (200 OK):JSON{
  "success": true,
  "msg": "Signup successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
2. User Authentication (Login)Endpoint: /loginMethod: POSTHeaders: Content-Type: application/jsonRequest Body:JSON{
  "email": "shaurya@example.com",
  "password": "securePassword123"
}
Success Response (200 OK):JSON{
  "success": true,
  "msg": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Note: Automatically injects a secured token cookie into the browser environment container via cross-origin protocol standards.3. Terminate Session (Logout)Endpoint: /logoutMethod: POSTSuccess Response (200 OK):JSON{
  "success": true,
  "msg": "Logged out successfully"
}
📝 Task Management Endpoints (Protected Routes)1. Create a New TaskEndpoint: /add-taskMethod: POSTHeaders: Content-Type: application/jsonRequest Body:JSON{
  "title": "Complete Studio Graphene Assignment",
  "description": "Refactor codebase, optimize production dependencies, and push to main.",
  "dueDate": "2026-06-10",
  "status": "active"
}
Success Response (200 OK):JSON{
  "success": true,
  "message": "New task added",
  "result": {
    "acknowledged": true,
    "insertedId": "6481f0b2f0a1c23456789abc"
  }
}
2. Fetch All Tasks (Multi-User Isolated List)Endpoint: /tasksMethod: GETSuccess Response (200 OK - Sorted Newest First):JSON{
  "success": true,
  "message": "Task list fetched",
  "result": [
    {
      "_id": "6481f0b2f0a1c23456789abc",
      "title": "Complete Studio Graphene Assignment",
      "description": "Refactor codebase, optimize production dependencies, and push to main.",
      "dueDate": "2026-06-10T00:00:00.000Z",
      "status": "active",
      "userEmail": "shaurya@example.com"
    }
  ]
}
3. Fetch Single Task ParametersEndpoint: /task/:idMethod: GETSuccess Response (200 OK):JSON{
  "success": true,
  "message": "Task fetched",
  "result": {
    "_id": "6481f0b2f0a1c23456789abc",
    "title": "Complete Studio Graphene Assignment",
    "description": "Refactor codebase, optimize production dependencies, and push to main.",
    "dueDate": "2026-06-10T00:00:00.000Z",
    "status": "active",
    "userEmail": "shaurya@example.com"
  }
}
4. Programmatic Task Modification (Update)Endpoint: /update-task/:idMethod: PUTHeaders: Content-Type: application/jsonRequest Body:JSON{
  "status": "completed"
}
Success Response (200 OK):JSON{
  "success": true,
  "message": "Task updated",
  "result": {
    "acknowledged": true,
    "modifiedCount": 1,
    "upsertedId": null,
    "upsertedCount": 0,
    "matchedCount": 1
  }
}
5. Delete Single Task InstanceEndpoint: /delete/:idMethod: DELETESuccess Response (200 OK):JSON{
  "success": true,
  "message": "Task deleted",
  "result": {
    "acknowledged": true,
    "deletedCount": 1
  }
}
6. Delete Multiple Task Index Elements (Bulk Clear)Endpoint: /delete-multipleMethod: DELETEHeaders: Content-Type: application/jsonRequest Body:JSON[
  "6481f0b2f0a1c23456789abc",
  "6481f126f0a1c23456789def"
]
Success Response (200 OK):JSON{
  "success": true,
  "message": "Tasks deleted",
  "result": {
    "acknowledged": true,
    "deletedCount": 2
  }
}
📈 Next Steps & Engineering ImprovementsGiven extended timelines, the application execution loop would integrate the following optimizations:Automated Testing Suite: Deployment of comprehensive Unit and Integration validation routines using Vitest and Supertest to verify backend route security structures under mock environments.  Cache Layer Integration: Implementation of an ephemeral data tier (Redis) to cache active user task collections, significantly decreasing database query overhead.Drag-and-Drop Task Reordering: Integration of fluid tracking components (such as @hello-pangea/dnd) to support intuitive user adjustments. 
