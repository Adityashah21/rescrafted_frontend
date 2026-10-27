import apiClient from './apiClient';

const orderService = {
  createOrder: async ({ shippingAddressId, paymentMethod = 'cod', notes = '' }) => {
    const res = await apiClient.post('/orders', {
      shippingAddressId,
      paymentMethod,
      notes,
    });
    return res.data.order;
  },

  getOrders: async (params = {}) => {
    const res = await apiClient.get('/orders', { params });
    return {
      orders: res.data.orders,
      meta: res.meta,
    };
  },

  getOrderById: async (orderId) => {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data.order;
  },

  cancelOrder: async (orderId, reason) => {
    const res = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return res.data.order;
  },
};

export default orderService;
