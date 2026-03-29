import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();

const normalizeUser = (userData) => {
    if (!userData) return null;

    return {
        ...userData,
        id: userData.id ?? userData.userId ?? null,
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('land_user');
        if (storedUser) {
            const parsedUser = normalizeUser(JSON.parse(storedUser));
            setUser(parsedUser);
            localStorage.setItem('land_user', JSON.stringify(parsedUser));
        }
    }, []);

    const login = async (role, email, password) => {
        try {
            // Strict Login: Only call loginUser, NEVER register automatically
            const backendData = normalizeUser(await loginUser(email, password));

            // Role Mismatch Check (Optional but good for security)
            if (backendData.role !== role) {
                console.warn(`Role Mismatch: Login role ${backendData.role} !== Selected ${role}`);
                throw new Error(`Access Denied: You are not authorized as ${role}. Your account is ${backendData.role}.`);
            }

            setUser(backendData);
            localStorage.setItem('land_user', JSON.stringify(backendData));
            console.log("Logged in successfully:", backendData.name);
            return true;

        } catch (error) {
            console.error("Login Failed:", error);
            throw error; // Propagate error to UI
        }
    };

    // Separate Register function for explicit registration
    const register = async (userData) => {
        try {
            await registerUser(userData);
            return true;
        } catch (error) {
            console.error("Registration Failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('land_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
