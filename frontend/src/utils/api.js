import axios from "axios";

const api = axios.create({
  baseURL: "/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;


// API calls
export const getExpenses = (params) =>
  api.get('/expenses', { params });

export const createExpense = (data) =>
  api.post('/expenses', data);

export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`);

export const getAnalytics = (params) =>
  api.get('/expenses/analytics/summary', { params });


// Constants
export const CATEGORIES = [
'Food & Dining',
'Transportation',
'Shopping',
'Entertainment',
'Bills & Utilities',
'Healthcare',
'Education',
'Travel',
'Personal Care',
'Investments',
'Gifts',
'Other'
];

export const CATEGORY_COLORS = {
'Food & Dining':'#FF6B6B',
'Transportation':'#4ECDC4',
'Shopping':'#45B7D1',
'Entertainment':'#96CEB4',
'Bills & Utilities':'#FFEAA7',
'Healthcare':'#DDA0DD',
'Education':'#98D8C8',
'Travel':'#F7DC6F',
'Personal Care':'#BB8FCE',
'Investments':'#82E0AA',
'Gifts':'#F1948A',
'Other':'#AED6F1'
};

export const PAYMENT_METHODS = [
'Cash',
'Credit Card',
'Debit Card',
'Bank Transfer',
'UPI',
'Other'
];

export const formatCurrency = (amount, currency='USD') =>
 new Intl.NumberFormat(
   'en-US',
   { style:'currency', currency }
 ).format(amount);

export const formatDate = (date)=>
 new Date(date).toLocaleDateString(
   'en-US',
   {
     month:'short',
     day:'numeric',
     year:'numeric'
   }
 );