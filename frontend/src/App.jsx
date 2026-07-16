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

// 🔥 CALENDAR PAGE IMPORT (Apna actual path yahan adjust kar lena)
import Calendar from './components/Calendar/Calendar.jsx'; 

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

      {/* 👇 YEH NAYA CALENDAR ROUTE HAI */}
      <Route 
        path="/calendar" 
        element={<ProtectedRoute><Calendar /></ProtectedRoute>} 
      />
      
    </Routes>
  );
}

export default App;