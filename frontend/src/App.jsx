import React from "react";
import { Routes, Route } from "react-router-dom"; // Yaha se BrowserRouter hata diya

import Landing from "../src/pages/landing.jsx"; 
import Login from "../src/pages/login.jsx"; 
import ResetPassword from './components/loginpages/ResetPassword.jsx';

function App() {
  return (
    // Yahan se <BrowserRouter> tag hata diya, seedha <Routes> use kar rahe hain
    <Routes>
      
      <Route path="/" element={<Landing />} />
      
      <Route path="/login" element={<Login />} />
      
      <Route path="/signup" element={<Login />} />

      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
    </Routes>
  );
}

export default App;