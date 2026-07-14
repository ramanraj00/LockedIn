import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CryptoContext = createContext();

export const useCrypto = () => useContext(CryptoContext);

export const CryptoProvider = ({ children }) => {
    const [dekState, setDekState] = useState(null);
    const [isRestoring, setIsRestoring] = useState(true);

    // 🔥 FIX 1: dek ko dekState se map kar diya
    const dek = dekState; 
    const isLocked = dek === null && !isRestoring;

    // 🟢 App Load: SessionStorage se Base64 uthao -> ArrayBuffer -> Import CryptoKey
    useEffect(() => {
        const restoreKey = async () => {
            const savedBase64 = sessionStorage.getItem('workspace_dek');
            if (savedBase64) {
                try {
                    const rawKey = Uint8Array.from(atob(savedBase64), c => c.charCodeAt(0));
                    const importedKey = await window.crypto.subtle.importKey(
                        "raw", rawKey, "AES-GCM", true, ["encrypt", "decrypt"]
                    );
                    setDekState(importedKey);
                } catch (err) {
                    console.error("Failed to restore DEK from session:", err);
                    sessionStorage.removeItem('workspace_dek');
                }
            }
            setIsRestoring(false);
        };
        restoreKey();
    }, []);

    // 🟢 setDek: Context me set karo, (Agar persist true hai to export karke Base64 banao) aur sessionStorage me dalo
    const setDek = async (newDek, persist = false) => {
        setDekState(newDek);
        
        if (persist && newDek) {
            try {
                // 🔥 FIX 2: CryptoKey ko raw ArrayBuffer me export karo
                const rawDek = await window.crypto.subtle.exportKey("raw", newDek);
                // ArrayBuffer ko Base64 me convert karke save karo
                const base64Dek = btoa(String.fromCharCode(...new Uint8Array(rawDek)));
                sessionStorage.setItem("workspace_dek", base64Dek);
            } catch (err) {
                console.error("Failed to export DEK to session storage", err);
            }
        } else {
            sessionStorage.removeItem("workspace_dek");
        }
    };

    const encryptData = useCallback(async (plainText) => {
        if (!dek) throw new Error("Encryption key not loaded. Workspace is locked.");
        const enc = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv }, dek, enc.encode(plainText)
        );
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        return btoa(String.fromCharCode(...combined));
    }, [dek]);

    const decryptData = useCallback(async (base64Cipher) => {
        if (!dek) throw new Error("Encryption key not loaded. Workspace is locked.");
        const combined = Uint8Array.from(atob(base64Cipher), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv }, dek, data
        );
        return new TextDecoder().decode(decrypted);
    }, [dek]);

    const clearCrypto = useCallback(() => {
        setDekState(null);
        sessionStorage.removeItem('workspace_dek');
    }, []);

    return (
        <CryptoContext.Provider value={{ dek, setDek, isLocked, encryptData, decryptData, clearCrypto }}>
            {children}
        </CryptoContext.Provider>
    );
};