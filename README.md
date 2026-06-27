# TaskFlow - Project Management Dashboard 🚀

TaskFlow is a modern, full-stack Kanban-style project management application built with the **MERN** stack (MongoDB, Express, React, Node.js). It is designed to help individuals and teams organize tasks, manage projects efficiently, and boost productivity using built-in AI estimation features.

## 📸 Screenshots

*To display your application screenshots here, follow these simple steps:*
1. *Create a new folder named `screenshots` in the root directory of this project.*
2. *Take screenshots of your app and name them exactly as shown below (e.g., `login.png`, `dashboard.png`).*
3. *Place those images inside the `screenshots` folder. When you push to GitHub, they will automatically appear below!*

### Login & Authentication
![Login Page](./screenshots/login.png)

### Main Dashboard & Analytics
![Dashboard](./screenshots/dashboard.png)

### Kanban Board View (Drag & Drop)
![Board View](./screenshots/board-view.png)

### Responsive Mobile View
![Mobile View](./screenshots/mobile-view.png)

## 🛠️ Technology Stack
**Frontend:**
- React.js (Vite)
- Tailwind CSS v4
- React Router DOM
- @hello-pangea/dnd (Drag and drop)
- Axios & Lucide React

**Backend:**
- Node.js & Express.js
- JSON Web Tokens (JWT) & bcryptjs
- @google/genai (AI Integration)

**Database:**
- MongoDB & Mongoose (NoSQL)

## 🤖 AI Integration (Google Gemini)
**Which LLM API was chosen and why?**
TaskFlow utilizes the **Google Gemini API** (`@google/genai`) for its AI features. Gemini was chosen because it offers incredibly fast response times, exceptional natural language comprehension, and a very generous free tier for developers, making it perfect for rapid text-based analysis.

**How the AI feature works:**
When creating or editing a task, users can click the "Generate AI Estimate" button. The frontend sends the task's `title` and `description` to the backend `/api/ai/estimate` route. The backend securely communicates with the Gemini model, prompting it to act as a senior project manager. Gemini analyzes the task complexity and returns a structured JSON response containing an estimated time effort (e.g., "3 hours") and a logical due date offset, which automatically populates the user's form.

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed
- A MongoDB cluster URI (Atlas)
- A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/hemant-prajapat20/Task_Flow.git
cd Task_Flow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (see `.env.example` below) and add your keys.
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```
The application will run at `http://localhost:5173`.

## 🔐 Environment Variables (.env.example)
Please refer to the `backend/.env.example` file for the required backend variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
```

## 📡 API Documentation

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/api/auth/register` | Register a new user account |
| **POST** | `/api/auth/login` | Authenticate user & receive JWT token |
| **GET** | `/api/boards` | Fetch all boards for the authenticated user |
| **POST** | `/api/boards` | Create a new project board |
| **PUT** | `/api/boards/:id` | Update a board's title/description |
| **DELETE** | `/api/boards/:id` | Delete a board and all its associated tasks |
| **GET** | `/api/tasks/board/:id` | Fetch all tasks belonging to a specific board |
| **POST** | `/api/tasks/board/:id` | Create a new task in a specific board |
| **PUT** | `/api/tasks/:id` | Update a task (including drag-and-drop status changes) |
| **DELETE** | `/api/tasks/:id` | Delete a specific task |
| **POST** | `/api/ai/estimate` | Send task details to Gemini API for effort estimation |
| **GET** | `/api/search` | Globally search tasks and boards by query string |

## 🌍 Live Demo & Test Credentials
- **Frontend URL:** (https://task-flow-theta-seven.vercel.app/)
- **Backend URL:** (https://task-flow-ldhn.onrender.com/api)

**Test Account:**
- **Email:** `test@example.com`
- **Password:** `password123`

## ⚠️ Known Issues & Future Improvements
**Limitations:**
- The application currently operates in a single-user context (workspaces are private to the logged-in user). There is no multi-user collaboration or board sharing yet.
- Task ordering within the exact same column does not persist strictly on refresh (it groups by status, but strict index ordering requires an indexing schema update).

**What I would improve with more time:**
1. **WebSockets (Socket.io):** Implement real-time updates so if a board is shared, multiple users can see drag-and-drop actions happen instantly without refreshing.
2. **Team Collaboration:** Add Role-Based Access Control (RBAC) allowing users to invite team members to specific boards as Viewers or Editors.
3. **Automated Testing:** Implement comprehensive unit and integration tests using Jest and Cypress to ensure UI stability.
4. **Cross-Board Dragging:** Allow users to drag a task from one board directly into another.
