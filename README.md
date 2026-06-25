# TaskFlow - Project Management Dashboard 🚀

TaskFlow is a modern, full-stack Kanban-style project management application built with the **MERN** stack (MongoDB, Express, React, Node.js). It is designed to help individuals and teams organize tasks, manage projects efficiently, and boost productivity using built-in AI estimation features.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based login and registration system with encrypted passwords and strict validation.
- **📋 Project Boards**: Create, rename, edit, and delete multiple boards. Each board functions as a standalone project.
- **🕹️ Kanban Interface**: Interactive drag-and-drop task management across "To Do", "In Progress", and "Done" columns.
- **⚡ Task Details**: Set priority levels (High/Medium/Low), due dates, and track estimated effort for individual tasks.
- **🤖 AI Task Estimator**: Integrated with Google's Gemini API to automatically suggest effort estimates and due dates based on your task title and description.
- **🔍 Global Search**: Instant, debounced global search to find any task or board across your entire account.
- **📊 Sorting & Filtering**: Instantly sort tasks by Due Date or filter by Priority within your boards.
- **🌗 Theming**: Beautiful, fully-responsive UI built with Tailwind CSS featuring an interactive Light Mode (with gradient mesh) and a sleek Dark Mode.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4 (Styling)
- React Router DOM (Navigation)
- Axios (API requests)
- @hello-pangea/dnd (Drag and drop)
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs
- @google/genai (AI Integration)
- CORS & dotenv

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed on your machine
- A MongoDB cluster URI (MongoDB Atlas recommended)
- A Google Gemini API Key (Available free at Google AI Studio)

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
Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```
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
Start the frontend development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

## 📦 Deployment Guide

**Backend (Render):**
1. Push your code to GitHub.
2. Create a new "Web Service" on Render.com and connect your repository.
3. Set the Root Directory to `backend`.
4. Set the Build Command to `npm install`.
5. Set the Start Command to `node server.js`.
6. Add your `.env` variables in the Render dashboard.

**Frontend (Vercel):**
1. Create a `.env` file inside the `frontend` folder with: `VITE_API_URL=your_render_backend_url/api`.
2. Push your code to GitHub.
3. Import the repository into Vercel.
4. Set the Framework Preset to "Vite".
5. Set the Root Directory to `frontend`.
6. Add your Environment Variable in Vercel.
7. Click Deploy.

---
*Developed by Hemant Prajapat*
