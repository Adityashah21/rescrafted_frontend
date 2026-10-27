import apiClient from './apiClient';

const dashboardService = {
  // Seller APIs
  getSellerDashboard: async () => {
    const res = await apiClient.get('/seller/dashboard');
    return res.data;
  },

  getSellerOrders: async (params = {}) => {
    const res = await apiClient.get('/seller/orders', { params });
    return {
      orders: res.data.orders,
      meta: res.meta,
    };
  },

  updateSellerProfile: async (data) => {
    const res = await apiClient.patch('/seller/profile', data);
    return res.data.profile;
  },

  updateFulfillmentStatus: async (orderId, fulfillmentId, data) => {
    const res = await apiClient.patch(
      `/orders/${orderId}/fulfillments/${fulfillmentId}`,
      data
    );
    return res.data.order;
  },

  // Admin APIs
  getAdminMetrics: async () => {
    const res = await apiClient.get('/admin/metrics');
    return res.data;
  },

  getAdminUsers: async (params = {}) => {
    const res = await apiClient.get('/admin/users', { params });
    return {
      users: res.data.users,
      meta: res.meta,
    };
  },

  updateUserStatus: async (userId, isActive) => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
    return res.data.user;
  },

  getAdminSellers: async (params = {}) => {
    const res = await apiClient.get('/admin/sellers', { params });
    return {
      sellers: res.data.sellers,
      meta: res.meta,
    };
  },

  updateSellerStatus: async (sellerProfileId, status, rejectionReason = '') => {
    const res = await apiClient.patch(`/admin/sellers/${sellerProfileId}/status`, {
      status,
      rejectionReason,
    });
    return res.data.profile;
  },

  getAdminProducts: async (params = {}) => {
    const res = await apiClient.get('/admin/products', { params });
    return {
      products: res.data.products,
      meta: res.meta,
    };
  },

  moderateProduct: async (productId, status, rejectionReason = '') => {
    const res = await apiClient.patch(`/admin/products/${productId}/moderate`, {
      status,
      rejectionReason,
    });
    return res.data.product;
  },

  getAdminAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/audit-logs', { params });
    return {
      logs: res.data.logs,
      meta: res.meta,
    };
  },
};

export default dashboardService;
