import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 🔥 YE HAI MAGIC STATE

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Backend se pucho user zinda hai ya nahi
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    method: 'GET',
                    // Cookies allow karne ke liye credentials include karte hain
                    credentials: 'include' 
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                setIsAuthenticated(false);
            } finally {
                // 🔥 Jawab aane ke baad hi loading khatam karo
                setIsLoading(false); 
            }
        };

        verifyAuth();
    }, []);

    // 1. Jab tak backend check kar raha hai, Loading dikhao (Login par mat feko)
    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center">
                <div className="text-[#B0B0B4] text-lg animate-pulse tracking-widest">
                    Checking Authentication...
                </div>
            </div>
        );
    }

    // 2. Agar API ne bola user galat hai, tabhi Login par feko
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Agar sab sahi hai, toh unko unka Page (Dashboard/Workspace) dikha do
    return children;
};

export default ProtectedRoute;