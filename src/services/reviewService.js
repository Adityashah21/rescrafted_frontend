import apiClient from './apiClient';

const reviewService = {
  /**
   * Fetch approved reviews and star distribution for a product
   */
  getProductReviews: async (productId, params = {}) => {
    const res = await apiClient.get(`/reviews/product/${productId}`, { params });
    return {
      reviews: res.data?.reviews || [],
      ratingDistribution: res.data?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      meta: res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 },
    };
  },

  /**
   * Fetch LCA Environmental Impact Assessment scorecard for a product
   */
  getProductImpact: async (productId) => {
    const res = await apiClient.get(`/reviews/product/${productId}/impact`);
    return res.data;
  },

  /**
   * Check if current authenticated customer has purchased this product
   * and is eligible to submit a verified review
   */
  checkEligibility: async (productId) => {
    const res = await apiClient.get(`/reviews/product/${productId}/eligibility`);
    return res.data;
  },

  /**
   * Submit a verified customer review
   */
  createReview: async ({ productId, rating, title, comment, orderId }) => {
    const res = await apiClient.post('/reviews', {
      productId,
      rating,
      title,
      comment,
      orderId,
    });
    return res.data?.review;
  },

  /**
   * Delete review (author or platform admin)
   */
  deleteReview: async (reviewId) => {
    const res = await apiClient.delete(`/reviews/${reviewId}`);
    return res;
  },

  /**
   * Admin moderation: approve, flag, or hide review
   */
  moderateReview: async (reviewId, status) => {
    const res = await apiClient.patch(`/reviews/${reviewId}/moderate`, { status });
    return res.data?.review;
  },
};

export default reviewService;
