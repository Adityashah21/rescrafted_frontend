import apiClient from './apiClient';

const cartService = {
  async getCart() {
    const res = await apiClient.get('/cart');
    return res.data;
  },

  async addToCart({ productId, quantity = 1 }) {
    const res = await apiClient.post('/cart/items', { productId, quantity });
    return res.data;
  },

  async updateCartItem(itemId, quantity) {
    const res = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  async removeCartItem(itemId) {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return res.data;
  },

  async clearCart() {
    const res = await apiClient.delete('/cart');
    return res.data;
  },
};

export default cartService;
