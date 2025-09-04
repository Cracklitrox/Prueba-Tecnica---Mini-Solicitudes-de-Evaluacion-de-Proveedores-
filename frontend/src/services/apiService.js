const API_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No hay token de autenticación.');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getCompanies = async () => {
    const response = await fetch(`${API_URL}/companies/?page_size=100`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener las compañías.');
    return response.json();
};

export const getRequests = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    const response = await fetch(`${API_URL}/requests/?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener las solicitudes.');
    return response.json();
};

export const createRequest = async (requestData) => {
    const response = await fetch(`${API_URL}/requests/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear la solicitud.");
    }
    return response.json();
};