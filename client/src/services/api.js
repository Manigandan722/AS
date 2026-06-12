import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('asnk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('asnk_token');
      localStorage.removeItem('asnk_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Dashboard
export const getDashboard = () => API.get('/dashboard');

// Loans
export const getLoans = (params) => API.get('/loans', { params });
export const getLoan = (id) => API.get(`/loans/${id}`);
export const createLoan = (data) => API.post('/loans', data);
export const updateLoan = (id, data) => API.put(`/loans/${id}`, data);
export const approveLoan = (id) => API.patch(`/loans/${id}/approve`);
export const rejectLoan = (id) => API.patch(`/loans/${id}/reject`);
export const closeLoan = (id, data) => API.patch(`/loans/${id}/close`, data);
export const releaseGold = (id) => API.patch(`/loans/${id}/release-gold`);
export const deleteLoan = (id) => API.delete(`/loans/${id}`);

// Customers
export const getCustomers = (params) => API.get('/customers', { params });
export const getCustomerLoans = (id) => API.get(`/customers/${id}/loans`);

// Cash Flow
export const getCashFlow = (params) => API.get('/cashflow', { params });
export const addCashFlow = (data) => API.post('/cashflow', data);
export const deleteCashFlow = (id) => API.delete(`/cashflow/${id}`);

// Expenses
export const getExpenses = (params) => API.get('/expenses', { params });
export const addExpense = (data) => API.post('/expenses', data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Reports
export const getReport = (params) => API.get('/reports', { params });

// Contact
export const sendContact = (data) => API.post('/contact', data);
export const getMessages = () => API.get('/contact');
export const markRead = (id) => API.patch(`/contact/${id}/read`);

export default API;
