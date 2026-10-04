// frontend/src/utils/authUtils.js

const TOKEN_KEY = "auth_token";

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }
};

export const getAuthToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const hasAuthToken = () => {
    return !!localStorage.getItem(TOKEN_KEY);
};
