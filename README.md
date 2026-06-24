# TaskFlow - A Smart Task & Project Manager

TaskFlow is a lightweight, full-stack task and project management application built with the MERN stack. It features an integrated AI assistant to suggest task effort and due dates.

## Screenshots

*(Add screenshots here before submitting: Login, Dashboard, Board view, Mobile view)*

## Tech Stack
- **Frontend**: React.js (v18), Vite, React Router, Tailwind CSS v4, `@hello-pangea/dnd` (for Drag & Drop)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini API (`@google/genai`)

## Features Implemented
- **Authentication**: JWT-based auth with bcrypt hashed passwords.
- **Boards (Projects)**: Full CRUD operations, strictly scoped to the logged-in user.
- **Tasks & Kanban View**: Drag-and-drop tasks across To Do, In Progress, and Done columns.
- **AI Feature**: Click "Suggest" when creating a task to have Gemini analyze your title and description, and suggest an effort estimate and reasonable due date.
- **UI/UX**: Fully responsive, dark mode toggle, loading skeletons, error handling.

## Local Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your values.
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/taskflow
   JWT_SECRET=your_jwt_secret_here
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env` to `.env.local` if needed, ensuring `VITE_API_URL` points to your backend.
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## AI Feature Details
**Provider**: Google Gemini API (`gemini-2.0-flash`)
**Why**: Generous free tier, excellent reasoning speed, and very easy to integrate securely on the Node backend.
**How it works**: The user types a task title/description. The frontend calls the protected `/api/ai/suggest-estimate` backend route. The backend sends a structured prompt to Gemini, asking for a JSON response with effort and due date. The backend parses this securely and returns it to the frontend, which pre-fills the form. The API key never reaches the browser.

## Deployment Information
- **Frontend**: Ready for Vercel. A `vercel.json` is included for React Router SPA fallbacks.
- **Backend**: Ready for Render/Railway. Just set the Environment Variables in the Render dashboard and start the web service with `npm start`.
- **Database**: Use MongoDB Atlas for the deployed version.

## Bonus Challenges Completed
- **Drag-and-drop**: Smooth column movement implemented.
- **UI Styling**: Tailwind CSS v4 with dark mode toggle.
