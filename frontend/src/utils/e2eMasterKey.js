// frontend/src/utils/e2eMasterKey.js

const str2ab = (str) => new TextEncoder().encode(str);
const ab2base64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base642ab = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;

// 1. Generate Unique PBKDF2 Salt (16 bytes)
export const generateUserSalt = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return ab2base64(array);
};

// 2. Derive KEK using dynamic salt and iterations
export const deriveKEK = async (secretString, saltBase64, iterations = 250000) => {
    // Remove dashes if they exist (for Recovery Key usage)
    const normalizedSecret = secretString.replace(/-/g, '').trim().toUpperCase();

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        str2ab(normalizedSecret),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: base642ab(saltBase64),
            iterations: iterations,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

// 3. Generate a random Workspace AES Key (DEK)
export const generateWorkspaceDEK = async () => {
    return window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, 
        ["encrypt", "decrypt"]
    );
};

// 4. Generate 256-bit Recovery Key (32 bytes = 64 hex chars)
export const generateRecoveryKey = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Format into XXXX-XXXX-XXXX-... (16 blocks of 4 chars)
    return hex.match(/.{1,4}/g).join('-'); 
};

// 5. Encrypt DEK
export const encryptDEK = async (dek, kek) => {
    const rawDEK = await window.crypto.subtle.exportKey("raw", dek);
    // ALWAYS generate a random 12-byte IV for every encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedRaw = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        kek,
        rawDEK
    );
    
    return {
        iv: ab2base64(iv),
        data: ab2base64(encryptedRaw)
    };
};

// 6. Decrypt DEK
export const decryptDEK = async (encryptedData, kek) => {
    const iv = base642ab(encryptedData.iv);
    const data = base642ab(encryptedData.data);
    
    const decryptedRaw = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        kek,
        data
    );
    
    return window.crypto.subtle.importKey(
        "raw",
        decryptedRaw,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
    );
};