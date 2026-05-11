import { API_URL } from '../config';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
});

// Dashboard
export const getDashboardStats = async () => {
    const res = await fetch(`${API_URL}/admin/dashboard-stats`, { headers: headers() });
    return res.json();
};

export const getLowStockProducts = async () => {
    const res = await fetch(`${API_URL}/admin/low-stock`, { headers: headers() });
    return res.json();
};

export const getRecentOrders = async () => {
    const res = await fetch(`${API_URL}/admin/orders`, { headers: headers() });
    return res.json();
};

// Products
export const getProducts = async (page = 1) => {
    const res = await fetch(`${API_URL}/admin/products?page=${page}`, { headers: headers() });
    return res.json();
};

export const createProduct = async (formData) => {
    const res = await fetch(`${API_URL}/admin/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
    });
    return res.json();
};

export const getCategories = async () => {
    const res = await fetch(`${API_URL}/admin/categories`, { headers: headers() });
    return res.json();
};

export const getBrands = async () => {
    const res = await fetch(`${API_URL}/admin/brands`, { headers: headers() });
    return res.json();
};