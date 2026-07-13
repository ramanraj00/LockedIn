// frontend/src/context/CryptoContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const CryptoContext = createContext();

export const useCrypto = () => {
    return useContext(CryptoContext);
};

export const CryptoProvider = ({ children }) => {
    // This state holds the raw CryptoKey object ONLY in RAM.
    const [dek, setDek] = useState(null);

    // Derived state: if DEK is null, workspace is locked
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
        setDek(null);
    }, []);

    return (
        <CryptoContext.Provider value={{ dek, setDek, isLocked, encryptData, decryptData, clearCrypto }}>
            {children}
        </CryptoContext.Provider>
    );
};