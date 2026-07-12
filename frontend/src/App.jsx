import React from "react";
import { Routes, Route } from "react-router-dom"; 

import Landing from "../src/pages/landing.jsx"; 
import Signup  from "./components/loginpages/signinCode.jsx";
import Login from "./components/loginpages/reallogin.jsx";
import ResetPassword from './components/loginpages/ResetPassword.jsx';

// 🔥 NAYE IMPORTS
import ProtectedRoute from './components/loginpages/ProtectedRoute.jsx'; 
import Dashboard from './components/loginpages/dashboard.jsx'; 

import Profile from './components/Profile/Profile.jsx'; 
// 👇 WORKSPACE COMPONENT IMPORT KARO (folder path apne hisaab se dekh lena)
import Workspace from './components/Workspace/Workspace.jsx'; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* 🛑 SECURE ROUTES */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* 👇 YEH NAYI WORKSPACE ROUTE ADD HO GAYI */}
      <Route 
        path="/workspace" 
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        } 
      />
      
    </Routes>
  );
}

export default App;