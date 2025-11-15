// src/services/api.js

import axios from "axios";
import storage from "../utils/storage";

// ⚙️ Replace with your local backend IP (run `ipconfig` to find it)
const BASE_URL = "http://10.234.213.187:5000/api";

// 🌐 Axios instance configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧾 Request interceptor → Add auth token automatically
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Response interceptor → Clear token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearAll();
    }
    return Promise.reject(error);
  }
);

//
// =========================
// 🔐 AUTH API
// =========================
export const authAPI = {
  signup: async (name, email, password) => {
    const response = await api.post("/auth/signup", { name, email, password });
    return response.data;
  },
  signin: async (email, password) => {
    const response = await api.post("/auth/signin", { email, password });
    return response.data;
  },
};

//
// =========================
// 💸 EXPENSE API
// =========================
export const expenseAPI = {
  addExpense: async (expenseData) => {
    const response = await api.post("/expenses", expenseData);
    return response.data;
  },
  getExpenses: async () => {
    const response = await api.get("/expenses");
    return response.data;
  },
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

//
// =========================
// 💰 INCOME API (Salary or Other Incomes)
// =========================
export const incomeAPI = {
  addIncome: async (incomeData) => {
    const response = await api.post("/income", incomeData);
    return response.data;
  },
  getIncomes: async () => {
    const response = await api.get("/income");
    return response.data;
  },
  deleteIncome: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },
};

//
// =========================
// 🏦 LOAN API (Lending / Borrowing Module)
// =========================
export const loanAPI = {
  addLoan: async (loanData) => {
    const response = await api.post("/loans", loanData);
    return response.data;
  },
  getLoans: async (type, status) => {
    const params = {};
    if (type) params.type = type;
    if (status) params.status = status;
    const response = await api.get("/loans", { params });
    return response.data;
  },
  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },
  updateLoanStatus: async (id, status) => {
    const response = await api.put(`/loans/${id}/status`, { status });
    return response.data;
  },
  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },
  getLoanStats: async () => {
    const response = await api.get("/loans/stats");
    return response.data;
  },
};

//
// =========================
// 🔔 NOTIFICATION API
// =========================
export const notificationAPI = {
  getNotifications: async (unreadOnly = false) => {
    const response = await api.get("/notifications", {
      params: { unreadOnly },
    });
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },
};

//
// =========================
// 📊 ANALYTICS API (Charts + Suggestions)
// =========================
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },
  getChartData: async (period = "month") => {
    const response = await api.get(`/analytics/charts?period=${period}`);
    return response.data;
  },
  getSuggestions: async () => {
    const response = await api.get("/analytics/suggestions");
    return response.data;
  },
};

export default api;
