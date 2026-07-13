import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CryptoContext = createContext();

export const useCrypto = () => {
    return useContext(CryptoContext);
};

export const CryptoProvider = ({ children }) => {
    const [dek, setDekState] = useState(null);
    const [isRestoring, setIsRestoring] = useState(true); // 🔥 Magic state: Refresh par redirect rokti hai

    // Derived state: Jab tak restore process chal raha hai, tab tak 'isLocked' ko false rakho
    const isLocked = dek === null && !isRestoring;

    // 🔥 PAGE LOAD PAR: Session Storage se DEK wapas laao
    useEffect(() => {
        const restoreKey = async () => {
            const savedBase64 = sessionStorage.getItem('workspace_dek');
            if (savedBase64) {
                try {
                    const rawKey = Uint8Array.from(atob(savedBase64), c => c.charCodeAt(0));
                    const importedKey = await window.crypto.subtle.importKey(
                        "raw",
                        rawKey,
                        "AES-GCM",
                        true, // extractable
                        ["encrypt", "decrypt"]
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

    // 🔥 CUSTOM setDek: RAM me bhi save karega aur SessionStorage me bhi
    const setDek = useCallback(async (newDek) => {
        setDekState(newDek); // React state update
        
        if (newDek) {
            try {
                // CryptoKey ko raw buffer me export karke base64 string banate hain (Session Storage ke liye)
                const exported = await window.crypto.subtle.exportKey("raw", newDek);
                const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
                sessionStorage.setItem('workspace_dek', base64Key);
            } catch (err) {
                console.error("Could not export key to SessionStorage.", err);
            }
        } else {
            sessionStorage.removeItem('workspace_dek');
        }
    }, []);

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
        sessionStorage.removeItem('workspace_dek');
    }, []);

    return (
        <CryptoContext.Provider value={{ dek, setDek, isLocked, encryptData, decryptData, clearCrypto }}>
            {children}
        </CryptoContext.Provider>
    );
};