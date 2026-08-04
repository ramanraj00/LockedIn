import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../apiClient';

const ProtectedRoute = ({ children }) => {
    // 🛡️ Auth check uses TWO mechanisms:
    // 1. auth_token in localStorage (survives reload + new tabs)
    // 2. httpOnly cookie (set by backend, sent automatically)
    // If NEITHER exists, user is definitely logged out → fast kick
    const hasToken = !!localStorage.getItem("auth_token");
    const hasDek = !!localStorage.getItem("lockedin_e2e_key") || !!sessionStorage.getItem("workspace_dek");
    
    // Only fast-kick if there's no token AND no DEK at all
    // If token exists, let the backend verify it
    if (!hasToken && !hasDek) {
        return <Navigate to="/login" replace />;
    }

    // --- ASYNC BACKEND CHECK ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Backend se pucho user zinda hai ya nahi
                const response = await apiFetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include' 
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setIsAuthenticated(true);
                } else {
                    // Token expired or invalid — clean up
                    localStorage.removeItem("auth_token");
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