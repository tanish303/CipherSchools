# CipherSQLStudio

CipherSQLStudio is a beautifully crafted, browser-based SQL learning platform built specifically to help students practice their SQL queries against pre-configured sandboxed assignments, featuring real-time PostgreSQL database execution and integrated AI tutoring specifically designed to give hints without solving the problem completely.

## Features
- **Assignment View & Selection**: Elegantly displays problem statements, expected datasets, and assignment difficulty.
- **SQL Execution Engine**: Runs user queries safely against a PostgreSQL Sandbox database.
- **AI Tutors**: Integrates Gemini API to analyze the student's query and provide non-revealing structural or syntax hints.
- **Custom Design System**: Built with strict Vanilla SCSS without external UI libraries, fully adopting BEM architecture and a mobile-first philosophy with responsive breakpoints.
- **Editor Integration**: State-of-the-art Monaco Editor integrated directly into the browser.

## Technology Stack
- **Frontend**: React.js, Vite, Vanilla SCSS, React-Router
- **Backend**: Node.js, Express.js
- **Databases**: PostgreSQL (Sandbox query execution), MongoDB (Assignment persistence)
- **AI**: Google Gemini Flash GenAI SDK

## Project Setup

### Prerequisites
- Node.js installed on your machine
- A MongoDB cluster instance (e.g., MongoDB Atlas)
- A running PostgreSQL Server locally or remote
- A Google GenAI (Gemini) API Key

### Installation

1. Clone this repository or extract the project.
2. In the `backend` folder, copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` (Your MongoDB Atlas Data URL)
   - `GEMINI_API_KEY` (Your Gemini Key)
   - `PG_USER`, `PG_PASSWORD`, `PG_HOST` (etc. for your local postgres)
3. Navigate to **backend** and run:
   > `npm install`
   > `npm run seed` *(Note: I added `node src/seed.js` script to auto-fill the DB with the initial assignment problem)*
   > `node src/server.js` (Starts API at port 5000)
4. Open a new terminal, navigate to **frontend** and run:
   > `npm install`
   > `npm run dev` (Starts frontend at port 5173 usually)

Open your browser to the local frontend URL, and start solving SQL assignments with generative AI assistance!

## Data-Flow Architecture

A hand-drawn architecture map of the Data-Flow is included in the project submission.

**System Flow:**
User React "Execute" -> API Server -> Node pg Driver -> PostgreSQL Sandbox -> Final View.
