import React from "react";
import { Routes, Route } from "react-router-dom"; 

import Landing from "../src/pages/landing.jsx"; 
import Signup  from "./components/loginpages/signinCode.jsx";
import Login from "./components/loginpages/reallogin.jsx";
import ResetPassword from './components/loginpages/ResetPassword.jsx';
import ForgotPassword from './components/loginpages/ForgotPassword.jsx'; 

import ProtectedRoute from './components/loginpages/ProtectedRoute.jsx'; 
import Dashboard from './components/loginpages/dashboard.jsx'; 
import Profile from './components/Profile/Profile.jsx'; 
import Workspace from './components/Workspace/Workspace.jsx'; 

// 🔥 CALENDAR PAGE IMPORT
import Calendar from './components/Calendar/Calendar.jsx'; 

// 🔥 STOPWATCH IMPORT
import Stopwatch from './components/stopwatch/Stopwatch.jsx';

// 🔥 NAYA ANALYTICS PAGE IMPORT
import Analytics from './components/Analytics/Analytics.jsx';
// Leaderboard
import Leaderboard from './pages/Leaderboard';


function App() {
  return (
    <Routes>
      {/* 🟢 PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* 🛑 SECURE ROUTES (Log in zaroori hai) */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />

      <Route 
        path="/profile" 
        element={<ProtectedRoute><Profile /></ProtectedRoute>} 
      />

      <Route 
        path="/workspace" 
        element={<ProtectedRoute><Workspace /></ProtectedRoute>} 
      />

      <Route 
        path="/calendar" 
        element={<ProtectedRoute><Calendar /></ProtectedRoute>} 
      />
      
      <Route 
        path="/stopwatch" 
        element={<ProtectedRoute><Stopwatch /></ProtectedRoute>} 
      />

      {/* 👇 YEH TERA NAYA ANALYTICS ROUTE HAI */}
      <Route 
        path="/analytics" 
        element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
      />
      
      <Route path="/leaderboard"
       element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

       <Route path="/profile/:userId"
        element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    </Routes>
  );
}

export default App;