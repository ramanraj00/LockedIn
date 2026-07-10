import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                // Backend se pucho kya user login hai?
                const response = await fetch("http://localhost:3000/api/auth/check-auth", {
                    method: "GET",
                    credentials: "include" // Ye bohot zaroori hai, isse cookie jayegi!
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        };

        verifyUser();
    }, []);

    // Jab tak backend se jawaab aa raha hai, blank/loading dikhao
    if (isAuthenticated === null) {
        return <div className="min-h-screen w-full bg-[#02040c] flex items-center justify-center text-white">Loading Security...</div>;
    }

    // Agar pass ho gaya toh Dashboard dikhao, fail hua toh Login pe phenk do
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;