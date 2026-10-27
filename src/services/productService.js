import apiClient from './apiClient';

const productService = {
  async getProducts(params = {}) {
    // Filter out undefined or empty values
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });

    const res = await apiClient.get(`/products?${query.toString()}`);
    return {
      products: res.data || [],
      meta: res.meta || { page: 1, limit: 12, total: 0, totalPages: 1 },
    };
  },

  async getProductBySlug(slug) {
    const res = await apiClient.get(`/products/${slug}`);
    return res.data;
  },

  async createProduct(productData) {
    const res = await apiClient.post('/products', productData);
    return res.data;
  },

  async updateProduct(id, updateData) {
    const res = await apiClient.patch(`/products/${id}`, updateData);
    return res.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiClient.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};

export default productService;
