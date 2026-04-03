import api from './api';

export const getAllLands = async () => {
    try {
        // If user is admin/public/owner, the backend filters accordingly or we filter here
        // For simplicity, let's assume one endpoint returns all permissible lands
        const response = await api.get('/lands/verified');
        return response.data;
    } catch (error) {
        console.error("Error fetching lands", error);
        return [];
    }
};

export const getMyLands = async () => {
    try {
        const response = await api.get(`/lands/my`);
        return response.data;
    } catch (error) {
        return [];
    }
};

export const getPendingLands = async () => {
    try {
        const response = await api.get('/lands/pending');
        return response.data;
    } catch (error) {
        return [];
    }
};

export const registerLand = async (landData) => {
    const response = await api.post('/lands', landData);
    return response.data;
};

export const verifyLand = async (id) => {
    const response = await api.put(`/lands/${id}/verify`);
    return response.data;
};

export const initiateTransfer = async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
};

export const verifyTransferDocuments = async (id) => {
    const response = await api.put(`/transfers/${id}/verify-documents`);
    return response.data;
};

export const approveTransfer = async (id) => {
    const response = await api.put(`/transfers/${id}/approve`);
    return response.data;
};
