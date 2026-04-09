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

export const uploadLandDocument = async (landId, file, documentType = 'PROOF', transferRequestId = '') => {
    const formData = new FormData();
    formData.append('landId', landId);
    formData.append('documentType', documentType);
    formData.append('file', file);

    if (transferRequestId) {
        formData.append('transferRequestId', transferRequestId);
    }

    const response = await api.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const verifyLand = async (id) => {
    const response = await api.put(`/lands/${id}/verify`);
    return response.data;
};

export const initiateTransfer = async (transferData) => {
    try {
        const response = await api.post('/transfers', transferData);
        return response.data;
    } catch (error) {
        const responseData = error.response?.data;
        throw new Error(responseData?.message || 'Transfer request failed');
    }
};

export const getPendingTransfers = async () => {
    try {
        const response = await api.get('/transfers/pending');
        return response.data;
    } catch (error) {
        console.error("Error fetching pending transfers", error);
        return [];
    }
};

export const verifyTransferDocuments = async (id) => {
    const response = await api.put(`/transfers/${id}/verify-documents`);
    return response.data;
};

export const approveTransfer = async (id, adminRemarks = '') => {
    const response = await api.put(`/transfers/${id}/approve`, { adminRemarks });
    return response.data;
};

export const rejectTransfer = async (id, adminRemarks = '') => {
    const response = await api.put(`/transfers/${id}/reject`, { adminRemarks });
    return response.data;
};
