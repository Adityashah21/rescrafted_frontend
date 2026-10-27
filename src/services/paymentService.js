import apiClient from './apiClient';

const paymentService = {
  initiatePayment: async (orderId) => {
    const res = await apiClient.post('/payments/initiate', { orderId });
    return res.data;
  },

  verifyPayment: async ({
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    const res = await apiClient.post('/payments/verify', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return res.data;
  },

  getPaymentDetails: async (orderId) => {
    const res = await apiClient.get(`/payments/order/${orderId}`);
    return res.data.payment;
  },
};

export default paymentService;
