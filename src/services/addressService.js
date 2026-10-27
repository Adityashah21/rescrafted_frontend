import apiClient from './apiClient';

const addressService = {
  async getAddresses() {
    const res = await apiClient.get('/addresses');
    return res.data;
  },

  async getAddress(id) {
    const res = await apiClient.get(`/addresses/${id}`);
    return res.data;
  },

  async createAddress(addressData) {
    const res = await apiClient.post('/addresses', addressData);
    return res.data;
  },

  async updateAddress(id, addressData) {
    const res = await apiClient.patch(`/addresses/${id}`, addressData);
    return res.data;
  },

  async deleteAddress(id) {
    const res = await apiClient.delete(`/addresses/${id}`);
    return res.data;
  },

  async setDefaultAddress(id) {
    const res = await apiClient.patch(`/addresses/${id}/set-default`);
    return res.data;
  },
};

export default addressService;
