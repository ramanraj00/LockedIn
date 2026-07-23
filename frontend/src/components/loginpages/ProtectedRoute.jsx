import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // 🛡️ 1. FAST SYNCHRONOUS CHECK: Kya Vault Key hai?
    const dek = localStorage.getItem("lockedin_e2e_key") || sessionStorage.getItem("workspace_dek");
    
    // 🔥 Agar frontend pe DEK nahi hai (matlab logout ho chuka hai), 
    // toh backend check karne ki wait hi mat karo, direct kick out!
    if (!dek) {
        return <Navigate to="/login" replace />;
    }

    // --- BAAKI TERA PURANA ASYNC BACKEND CHECK ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Backend se pucho user zinda hai ya nahi
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    method: 'GET',
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
                setIsLoading(false); 
            }
        };

        verifyAuth();
    }, []);

    // Jab tak backend check kar raha hai, Loading dikhao
    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center">
                <div className="text-[#B0B0B4] text-lg animate-pulse tracking-widest">
                    Checking Authentication...
                </div>
            </div>
        );
    }

    // Agar API ne bola user galat hai, tabhi Login par feko
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Agar sab sahi hai, toh unko unka Page dikha do
    return children;
};

export default ProtectedRoute;