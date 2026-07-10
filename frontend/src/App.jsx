import React from "react";
import { Routes, Route } from "react-router-dom"; 

import Landing from "../src/pages/landing.jsx"; 
import Signup  from "./components/loginpages/signinCode.jsx";
import Login from "./components/loginpages/reallogin.jsx";
import ResetPassword from './components/loginpages/ResetPassword.jsx';

// 🔥 NAYE IMPORTS
import ProtectedRoute from './components/loginpages/ProtectedRoute.jsx'; // Apna path check karlena
import Dashboard from './components/loginpages/dashboard.jsx'; // Dashboard jahan banaya hai uska path

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* 🛑 SECURE ROUTE: Bina login koi nahi jaa sakta! */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
    </Routes>
  );
}

export default App;