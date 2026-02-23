import api from './api';

export const clinicService = {
  getAll: async () => {
    const response = await api.get('/clinics');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clinics/${id}`);
    return response.data;
  },

  create: async (clinicData) => {
    const response = await api.post('/clinics', clinicData);
    return response.data;
  },

  update: async (id, clinicData) => {
    const response = await api.put(`/clinics/${id}`, clinicData);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/clinics/${id}`);
    return response.data;
  },

  // Reseñas
  getReviews: async (clinicId) => {
    const response = await api.get(`/clinics/${clinicId}/reviews`);
    return response.data;
  },

  saveReview: async (clinicId, reviewData) => {
    const response = await api.post(`/clinics/${clinicId}/reviews`, reviewData);
    return response.data;
  },

  deleteReview: async (clinicId, reviewId) => {
    const response = await api.delete(`/clinics/${clinicId}/reviews/${reviewId}`);
    return response.data;
  }
};
