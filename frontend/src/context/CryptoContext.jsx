import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CryptoContext = createContext();

export const useCrypto = () => {
    return useContext(CryptoContext);
};

export const CryptoProvider = ({ children }) => {
    const [dek, setDekState] = useState(null);
    const [isRestoring, setIsRestoring] = useState(true); // 🔥 Page load par pehle session check karega

    // 🔥 CUSTOM SETTER: Ye Key ko SessionStorage me save karega taaki Refresh par data na ude!
    const setDek = useCallback(async (key, keepUnlocked = true) => {
        setDekState(key);
        if (key && keepUnlocked) {
            try {
                // CryptoKey object ko raw string me badal kar save karna
                const exported = await window.crypto.subtle.exportKey("raw", key);
                const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
                sessionStorage.setItem("workspace_dek", base64Key);
            } catch (err) {
                console.error("Failed to save DEK to session", err);
            }
        } else {
            sessionStorage.removeItem("workspace_dek");
        }
    }, []);

    // 🔥 AUTO-RESTORE: Page Refresh hote hi Session se wapas Key nikalega
    useEffect(() => {
        const restoreKey = async () => {
            const savedKey = sessionStorage.getItem("workspace_dek");
            if (savedKey) {
                try {
                    const rawKey = Uint8Array.from(atob(savedKey), c => c.charCodeAt(0));
                    const importedKey = await window.crypto.subtle.importKey(
                        "raw",
                        rawKey,
                        "AES-GCM",
                        true, 
                        ["encrypt", "decrypt"]
                    );
                    setDekState(importedKey);
                } catch (err) {
                    sessionStorage.removeItem("workspace_dek");
                }
            }
            setIsRestoring(false); // Check complete! Ab page render hone do
        };
        restoreKey();
    }, []);

    const isLocked = dek === null;

    const encryptData = useCallback(async (plainText) => {
        if (!dek) throw new Error("Encryption key not loaded in context. Workspace is locked.");
        
        const enc = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
        
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            dek,
            enc.encode(plainText)
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...combined));
    }, [dek]);

    const decryptData = useCallback(async (base64Cipher) => {
        if (!dek) throw new Error("Encryption key not loaded in context. Workspace is locked.");
        
        const combined = Uint8Array.from(atob(base64Cipher), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            dek,
            data
        );
        
        return new TextDecoder().decode(decrypted);
    }, [dek]);

    const clearCrypto = useCallback(() => {
        setDekState(null);
        sessionStorage.removeItem("workspace_dek"); // Logout par key delete
    }, []);

    // Jab tak session check na ho jaye, baki components ko roko warna wo 'Locked' samajh lenge
    if (isRestoring) return null; 

    return (
        <CryptoContext.Provider value={{ dek, setDek, isLocked, encryptData, decryptData, clearCrypto }}>
            {children}
        </CryptoContext.Provider>
    );
};