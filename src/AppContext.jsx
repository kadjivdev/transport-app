import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';
import axiosInstance from "./api/axiosInstance"
import apiRoutes from "./api/routes"

// Créer le contexte
export const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error', 'info'
    const [message, setMessage] = useState('');
    const [statusCode, setStatusCode] = useState(null);

    // Login
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await axiosInstance.post(apiRoutes.login, { email, password });

            console.log(`The response of success : ${JSON.stringify(response.data)}`)
            const userData = response.data?.user || response.data;

            localStorage.setItem("user", JSON.stringify(userData))
            console.log(`Les elements du localstorage : ${localStorage.getItem("user")} `)

            setUser(userData);
            setIsAuthenticated(true);
            setStatus('success');
            setMessage('Connexion réussie!');
            setStatusCode(response.status);

            return { success: true, status: response.status, message: 'Connexion réussie!' };
        } catch (error) {
            let errorMessage = null
            console.log(`The code status : ${error.response.status}`)
            switch (error.response.status) {
                case 422:
                    errorMessage = "Erreure de validation";
                    break;

                case 500:
                    errorMessage = "Erreure de côté serveur";

                case 401:
                    errorMessage = "Identifiants incorrects! ";
                default:
                    break;
            }

            const errorStatus = error.response?.status;
            const validationErrors = error.response?.data?.errors || {};

            setStatus('error');
            setMessage(errorMessage);
            setStatusCode(errorStatus);

            return {
                success: false,
                status: errorStatus,
                error: errorMessage,
                errors: validationErrors
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        setLoading(true);
        setStatus(null);

        alert("Logout called ....")
        console.log("Logout called ....")

        try {
            const response = await axiosInstance.post(apiRoutes.logout, {});
            setStatus('success');
            setMessage('Déconnexion réussie!');
            setStatusCode(response.status);

            // suppression du localtorage
            localStorage.clear()

            return { success: true, status: response.status };
        } catch (error) {

            let errorStatus = error.response?.status;
            let errorMessage = '';

            alert(`Status error : ${errorStatus}`)
            if (errorStatus === 500) {
                errorMessage = 'Erreur côté serveur';
            } else if (errorStatus === 401) {
                errorMessage = 'Vous êtes hors connexion!';
            } else {
                errorMessage = error.response?.data?.message || 'Erreur de déconnexion';
            }

            setStatus('error');
            setMessage(errorMessage);
            setStatusCode(errorStatus);

            console.log('Erreur de déconnexion:', error);
            return { success: false, status: errorStatus, error: errorMessage };
        } finally {
            console.log("Logout ended ....")
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, []);

    // Register
    const register = useCallback(async (userData) => {
        setLoading(true);
        setStatus(null);
        try {
            const response = await axiosInstance.post(apiRoutes.createUser, userData);
            setStatus('success');
            setMessage(response.data?.message || 'Inscription réussie!');
            setStatusCode(response.status);
            return { success: true, status: response.status, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
            const errorStatus = error.response?.status;
            const errors = error.response?.data?.errors;

            setStatus('error');
            setMessage(errorMessage);
            setStatusCode(errorStatus);

            console.error('Erreur d\'inscription:', error);
            return { success: false, status: errorStatus, error: errorMessage, errors };
        } finally {
            setLoading(false);
        }
    }, []);

    // Update user
    const updateUser = useCallback((updatedUser) => {
        setUser(updatedUser);
    }, []);

    // Réinitialiser le status
    const clearStatus = useCallback(() => {
        setStatus(null);
        setMessage('');
        setStatusCode(null);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        status,
        message,
        statusCode,
        setStatus,
        login,
        logout,
        register,
        updateUser,
        clearStatus,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte
export const useApp = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useApp doit être utilisé à l\'intérieur d\'un AppProvider');
    }
    return context;
};
