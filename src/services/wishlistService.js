import apiClient from './apiClient';

const wishlistService = {
  async getWishlist() {
    const res = await apiClient.get('/wishlist');
    return res.data;
  },

  async addToWishlist(productId) {
    const res = await apiClient.post('/wishlist/items', { productId });
    return res.data;
  },

  async removeFromWishlist(productId) {
    const res = await apiClient.delete(`/wishlist/items/${productId}`);
    return res.data;
  },

  async moveToCart(productId) {
    const res = await apiClient.post(`/wishlist/move-to-cart/${productId}`);
    return res.data;
  },
};

export default wishlistService;
