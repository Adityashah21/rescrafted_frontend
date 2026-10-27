import apiClient from './apiClient';

const categoryService = {
  async getCategories() {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  async getCategory(slug) {
    const res = await apiClient.get(`/categories/${slug}`);
    return res.data;
  },
};

export default categoryService;
