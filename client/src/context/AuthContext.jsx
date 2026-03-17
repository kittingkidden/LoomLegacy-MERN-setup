/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('loom_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });


    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('loom_user', JSON.stringify(userData));
                return userData;
            } else {
                const err = await response.json();
                alert(err.message || 'Login failed');
                return null;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Server error during login');
            return null;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('loom_user', JSON.stringify(userData));
                return userData;
            } else {
                const err = await response.json();
                alert(err.message || 'Registration failed');
                return null;
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Server error during registration');
            return null;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loom_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
