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

export const getMyLands = async (ownerId) => {
    try {
        const response = await api.get(`/lands/my?ownerId=${ownerId}`);
        return response.data;
    } catch {
        return [];
    }
};

export const getPendingLands = async () => {
    try {
        const response = await api.get('/lands/pending');
        return response.data;
    } catch {
        return [];
    }
};

export const registerLand = async (landData) => {
    const formData = new FormData();
    const { image, ...landFields } = landData;

    formData.append(
        'land',
        new Blob(
            [
                JSON.stringify({
                    ...landFields,
                    area: Number(landFields.area),
                    price: Number(landFields.price),
                }),
            ],
            { type: 'application/json' },
        ),
    );

    if (image instanceof File) {
        formData.append('image', image);
    }

    const response = await api.post('/lands', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const getPendingTransfers = async () => {
    try {
        const response = await api.get('/transfers/pending');
        return response.data;
    } catch (error) {
        console.error("Error fetching pending transfers", error);
        return [];
    }
};

export const approveTransfer = async (id) => {
    const response = await api.put(`/transfers/${id}/approve`);
    return response.data;
};
