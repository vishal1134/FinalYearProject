import api from './api';

const extractErrorMessage = (error, fallback) => {
    const responseData = error.response?.data;

    if (typeof responseData === 'string') {
        return responseData;
    }

    return responseData?.message || fallback;
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Login failed'));
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error("Register Error Details:", error.response || error);
        throw new Error(extractErrorMessage(error, 'Registration failed'));
    }
};
