import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../../apiClient';

// 🔥 Global cache: Backend auth check sirf ek baar hoga, har page change pe nahi
let cachedAuthResult = null; // { authenticated: true/false, timestamp: number }
const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minute cache — re-verify after 5 min

const ProtectedRoute = ({ children }) => {
    // 🛡️ FAST SYNCHRONOUS CHECK:
    // auth_token localStorage me reliably save hota hai login/signup ke time
    const hasToken = !!localStorage.getItem("auth_token");
    
    // Agar token hi nahi hai, user definitely logged out hai
    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    // 🔥 Check cache first — avoid unnecessary /me calls
    const now = Date.now();
    const cacheValid = cachedAuthResult 
        && cachedAuthResult.authenticated 
        && (now - cachedAuthResult.timestamp) < AUTH_CACHE_TTL;

    const [isAuthenticated, setIsAuthenticated] = useState(cacheValid ? true : false);
    const [isLoading, setIsLoading] = useState(cacheValid ? false : true);

    useEffect(() => {
        // Agar cache valid hai, skip backend call
        if (cacheValid) return;

        const verifyAuth = async () => {
            try {
                const response = await apiFetch('/api/auth/me', {
                    method: 'GET',
                    credentials: 'include' 
                });
                
                // 🔥 429 (Rate Limited) = user IS authenticated, server is just busy
                // Don't kick the user out for rate limiting!
                if (response.status === 429) {
                    cachedAuthResult = { authenticated: true, timestamp: Date.now() };
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    return;
                }
                
                const data = await response.json();
                
                if (data.success) {
                    cachedAuthResult = { authenticated: true, timestamp: Date.now() };
                    setIsAuthenticated(true);
                } else {
                    // Token actually expired or invalid — clean up
                    cachedAuthResult = null;
                    localStorage.removeItem("auth_token");
                    setIsAuthenticated(false);
                }
            } catch (error) {
                // Network error — don't kick out, user might just be offline
                console.error("Auth check error:", error);
                // If token exists, give benefit of doubt
                if (localStorage.getItem("auth_token")) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } finally {
                setIsLoading(false); 
            }
        };

        verifyAuth();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#000000] flex items-center justify-center">
                <div className="text-[#B0B0B4] text-lg animate-pulse tracking-widest">
                    Checking Authentication...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// 🔥 Export cache invalidator for logout
export const clearAuthCache = () => { cachedAuthResult = null; };

export default ProtectedRoute;