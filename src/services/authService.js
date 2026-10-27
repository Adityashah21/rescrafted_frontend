import apiClient from './apiClient';

const authService = {
  async register(data) {
    const res = await apiClient.post('/auth/register', data);
    if (res.data?.token) {
      localStorage.setItem('rescrafted_token', res.data.token);
    }
    return res.data;
  },

  async login(credentials) {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('rescrafted_token', res.data.token);
    }
    return res.data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('rescrafted_token');
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },

  async verifyEmail({ email, otp }) {
    const res = await apiClient.post('/auth/verify-email', { email, otp });
    if (res.data?.token) {
      localStorage.setItem('rescrafted_token', res.data.token);
    }
    return res.data;
  },

  async resendOtp({ email }) {
    const res = await apiClient.post('/auth/resend-otp', { email });
    return res;
  },

  async forgotPassword({ email }) {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res;
  },

  async resetPassword(token, password) {
    const res = await apiClient.post(`/auth/reset-password/${token}`, { password });
    if (res.data?.token) {
      localStorage.setItem('rescrafted_token', res.data.token);
    }
    return res.data;
  },

  async updatePassword({ currentPassword, newPassword }) {
    const res = await apiClient.patch('/auth/update-password', {
      currentPassword,
      newPassword,
    });
    if (res.data?.token) {
      localStorage.setItem('rescrafted_token', res.data.token);
    }
    return res.data;
  },

  async updateProfile(profileData) {
    const res = await apiClient.patch('/auth/update-profile', profileData);
    return res.data.user;
  },
};

export default authService;
