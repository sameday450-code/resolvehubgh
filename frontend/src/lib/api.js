import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh and billing errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 402 Payment Required — billing enforcement, never retry
    if (error.response?.status === 402) {
      // Store billing error details for UI to access
      const billingError = error.response.data;
      sessionStorage.setItem('billingError', JSON.stringify({
        reason: billingError.reason,
        message: billingError.message,
        actionBlocked: billingError.actionBlocked,
        status: billingError.status,
        action: billingError.action,
        timestamp: new Date().toISOString(),
      }));
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  superAdminLogin: (data) => api.post('/auth/super-admin/login', data),
  googleAuth: (accessToken) => api.post('/auth/google', { accessToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
};

// Super Admin API
export const superAdminAPI = {
  getDashboard: () => api.get('/super-admin/dashboard'),
  getCompanies: (params) => api.get('/super-admin/companies', { params }),
  getCompanyDetail: (id) => api.get(`/super-admin/companies/${id}`),
  approveCompany: (id) => api.post(`/super-admin/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.post(`/super-admin/companies/${id}/reject`, { reason }),
  suspendCompany: (id, reason) => api.post(`/super-admin/companies/${id}/suspend`, { reason }),
  reactivateCompany: (id) => api.post(`/super-admin/companies/${id}/reactivate`),
  deleteCompany: (id) => api.delete(`/super-admin/companies/${id}`),
  getAnalytics: () => api.get('/super-admin/analytics'),
  getSupportMessages: (params) => api.get('/super-admin/support-messages', { params }),
};

// Branch API
export const branchAPI = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
  getComplaintPoints: (branchId) => api.get(`/branches/${branchId}/complaint-points`),
  createComplaintPoint: (branchId, data) => api.post(`/branches/${branchId}/complaint-points`, data),
  deleteComplaintPoint: (branchId, pointId) => api.delete(`/branches/${branchId}/complaint-points/${pointId}`),
};

// QR Code API
export const qrCodeAPI = {
  getAll: (params) => api.get('/qrcodes', { params }),
  getById: (id) => api.get(`/qrcodes/${id}`),
  create: (data) => api.post('/qrcodes', data),
  downloadSVG: (id) => api.get(`/qrcodes/${id}/svg`),
  disable: (id) => api.post(`/qrcodes/${id}/disable`),
  enable: (id) => api.post(`/qrcodes/${id}/enable`),
  regenerate: (id) => api.post(`/qrcodes/${id}/regenerate`),
  delete: (id) => api.delete(`/qrcodes/${id}`),
  resolve: (publicSlug) => api.get(`/qrcodes/resolve/${publicSlug}`),
};

// Complaint API
export const complaintAPI = {
  submitPublic: (data) => api.post('/complaints/public/submit', data),
  getDashboardStats: () => api.get('/complaints/dashboard-stats'),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  assign: (id, assignedToId) => api.patch(`/complaints/${id}/assign`, { assignedToId }),
  updatePriority: (id, priority) => api.patch(`/complaints/${id}/priority`, { priority }),
  addNote: (id, content, isInternal) => api.post(`/complaints/${id}/notes`, { content, isInternal }),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Analytics API
export const analyticsAPI = {
  getCompanyAnalytics: (params) => api.get('/analytics', { params }),
};

// Billing & Payments API
export const billingAPI = {
  getBillingProfile: () => api.get('/billing/profile'),
  updateBillingProfile: (data) => api.put('/billing/profile', data),
  getSubscription: () => api.get('/subscriptions/my'),
  getSubscriptionPlans: () => api.get('/subscriptions/plans'),
};

export const paymentsAPI = {
  getMyTransactions: (params) => api.get('/payments/my', { params }),
  getTransaction: (id) => api.get(`/payments/my/${id}`),
  initializePayment: (gateway) => api.post('/payments/initialize', { gateway }),
  verifyPayment: (reference, gateway) => api.post('/payments/verify', { reference, gateway }),
  getAllTransactions: (params) => api.get('/payments', { params }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePreferences: (data) => api.put('/settings/preferences', data),
  getCategories: () => api.get('/settings/categories'),
  createCategory: (data) => api.post('/settings/categories', data),
  deleteCategory: (id) => api.delete(`/settings/categories/${id}`),
  getStaff: () => api.get('/settings/staff'),
  addStaff: (data) => api.post('/settings/staff', data),
  updateStaffStatus: (id, isActive) => api.patch(`/settings/staff/${id}/status`, { isActive }),
};

// Upload API
export const uploadAPI = {
  uploadComplaintFiles: (formData) => api.post('/uploads/complaint-attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/uploads/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Public API
export const publicAPI = {
  contact: (data) => api.post('/public/contact', data),
  getPlans: () => api.get('/public/plans'),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my'),
  activateTrial: () => api.post('/subscriptions/trial/activate'),
};

// Contact Sales API
export const contactSalesAPI = {
  submitInquiry: (data) => api.post('/contact-sales', data),
  getInquiries: (params) => api.get('/contact-sales', { params }),
  getInquiry: (id) => api.get(`/contact-sales/${id}`),
  updateInquiry: (id, data) => api.patch(`/contact-sales/${id}`, data),
};
