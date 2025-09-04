const API_URL = import.meta.env.VITE_API_BASE_URL;

// Función helper para manejar respuestas
const handleResponse = async (response) => {
    if (response.status === 401) {
        localStorage.removeItem('access_token');
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        window.location.reload();
        throw new Error('Sesión expirada');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error: ${response.statusText}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
};


const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getCompanies = async () => {
    const response = await fetch(`${API_URL}/companies/?page_size=100`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const getRequests = async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    const response = await fetch(`${API_URL}/requests/?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const createRequest = async (requestData) => {
    const response = await fetch(`${API_URL}/requests/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
    });
    return handleResponse(response);
};

export const updateRequestStatus = async (requestId, newStatus) => {
    const response = await fetch(`${API_URL}/requests/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
    });
    return handleResponse(response);
};

export const deleteRequest = async (requestId) => {
    const response = await fetch(`${API_URL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const createCompany = async (companyData) => {
    const response = await fetch(`${API_URL}/companies/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyData),
    });
    return handleResponse(response);
};

export const updateCompany = async (companyId, companyData) => {
    const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyData),
    });
    return handleResponse(response);
};

export const deleteCompany = async (companyId) => {
    const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const getRequestById = async (requestId) => {
    const response = await fetch(`${API_URL}/requests/${requestId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};