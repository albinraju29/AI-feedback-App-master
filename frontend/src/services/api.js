import axios from 'axios';
import config from '../config';

const API = axios.create({
    baseURL: config.API_URL
});

// Auth
export const signUp = (userData) => API.post('/signup', userData);
export const signIn = (credentials) => API.post('/signin', credentials);

// Feedback
export const submitFeedback = (data) => API.post('/feedback', data);

// Admin
export const adminLogin = (credentials) => API.post('/admin/login', credentials);
export const getAdminDashboard = () => API.get('/admin/dashboard');

// AI
export const predictSentiment = (text) => {
    const formData = new FormData();
    formData.append('feedback', text);
    return API.post('/predict', formData);
};

export default API;