# Enterprise Company Email Collector MVP

A simple, secure, and production-ready web application portal designed to systemize the collection of authentic enterprise company email addresses from Internshala/Naukri applicants.

---

## 📌 Features & System Overview

- **Applicant Registration & Authentication**: Simple session-based registration and login using `express-session`, secure HTTP-only cookies, and `bcryptjs` password hashing.
- **Applicant Dashboard**:
  - Displays user profile (Name & Email).
  - Dynamic enterprise company email form with **+ Add Another** row addition and **Remove** controls.
  - Bulk email submission with confirmation status: `✓ Your emails have been submitted successfully.`
  - Submission history tracking.
- **Admin Dashboard**:
  - Secure role-restricted access (`role === 'admin'`).
  - Searchable data table with real-time filtering by **Company Name**, **Email Address**, or **Applicant Name**.
  - Standardized column structure: `ID | Company Name | Email | Applicant Name`.
- **Production Architecture**:
  - Separate cross-domain deployment setup (Frontend on Netlify, Backend on Render, Database on MongoDB Atlas).
  - Configured CORS credentials and `SameSite=None; Secure` cross-site cookies.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router (`react-router-dom`)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern Executive Dark Theme)
- **Deployment Target**: Netlify SPA (`public/_redirects`)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas via Mongoose
- **Session Management**: `express-session` & `connect-mongo`
- **Security**: `bcryptjs`, `cors`, `helmet`, `express-rate-limit`
- **Deployment Target**: Render

---

## 📂 Project Structure

```text
vedron_intershall_exceltarck/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js               # Mongoose User model (applicant/admin)
│   │   │   └── CompanyEmail.js       # Mongoose Company Email model
│   │   ├── middleware/
│   │   │   └── auth.js               # requireAuth & requireAdmin middleware
│   │   ├── controllers/
│   │   │   ├── authController.js     # register, login, logout, me
│   │   │   └── companyEmailController.js # submit, fetch, admin search
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── companyEmailRoutes.js # /api/company-emails & /api/profile
│   │   │   └── adminRoutes.js        # /api/admin/company-emails
│   │   ├── scripts/
│   │   │   └── createAdmin.js        # CLI admin account generator
│   │   └── server.js                 # Express app & session middleware
│   ├── .env.example
│   ├── package.json
│   └── .gitignore
│
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Fetch wrapper (credentials: include)
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth provider & session hook
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   └── ProtectedRoute.jsx    # Auth & role route guard
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing redirect page
│   │   │   ├── Login.jsx             # Applicant/Admin login
│   │   │   ├── Register.jsx          # Applicant account registration
│   │   │   ├── ApplicantDashboard.jsx# Multi-row email entry portal
│   │   │   └── AdminDashboard.jsx    # Searchable admin data table
│   │   ├── App.jsx                   # Main React SPA component & routes
│   │   ├── main.jsx                  # React DOM root entry
│   │   ├── index.css                 # Base theme resets & tokens
│   │   └── App.css                   # Custom UI styles
│   ├── public/
│   │   └── _redirects                # Netlify SPA redirect config
│   ├── .env.example
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`Backend/.env`)
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vedron_emails?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`Frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd Backend
npm install
```

Create `.env` inside `Backend/`:
```bash
cp .env.example .env
```
Fill in your `MONGODB_URI` from MongoDB Atlas and set `SESSION_SECRET`.

Start the backend server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`.

---

### 2. Create Initial Admin Account
Run the interactive CLI command inside `Backend/`:
```bash
npm run create-admin
```
Or pass credentials via CLI flags:
```bash
npm run create-admin -- --name="Admin User" --email="admin@example.com" --password="AdminSecretPassword123"
```

---

### 3. Frontend Setup
In a new terminal:
```bash
cd Frontend
npm install
```

Create `.env` inside `Frontend/`:
```bash
cp .env.example .env
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment Guide

### Database: MongoDB Atlas
1. Create a MongoDB Atlas cluster.
2. Under **Network Access**, add `0.0.0.0/0` (or Render IP addresses) to allow connections.
3. Under **Database Access**, create a database user and password.
4. Copy the connection URI string.

---

### Backend: Render Deployment
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Set root directory to `Backend`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Set Environment Variables in Render settings:
   - `MONGODB_URI`: `<your_atlas_connection_string>`
   - `SESSION_SECRET`: `<strong_random_secret_string>`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://your-app.netlify.app`
   - `PORT`: `5000` (or allow Render default)

---

### Frontend: Netlify Deployment
1. Create a new site on [Netlify](https://netlify.com).
2. Connect your Git repository.
3. Set base directory to `Frontend`.
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`
6. Set Environment Variable in Netlify site configuration:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com`
7. Ensure `public/_redirects` is included so routes like `/dashboard` and `/admin` reload properly.

---

## 🔐 CORS & Session Cookie Security Configuration

When deployed across different domains (e.g. Netlify + Render):
- **CORS**: Express server enables `cors({ origin: FRONTEND_URL, credentials: true })`.
- **Cookies**: `express-session` uses:
  - `httpOnly: true` (prevents XSS access)
  - `secure: true` (requires HTTPS in production)
  - `sameSite: "none"` (enables cross-site session cookies across Netlify and Render)
- **Frontend Fetching**: `apiFetch` uses `credentials: "include"` for every HTTP request.
