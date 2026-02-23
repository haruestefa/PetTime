import api from './api';

export const petService = {
  getAll: async () => {
    const response = await api.get('/pets');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },

  create: async (petData) => {
    const response = await api.post('/pets', petData);
    return response.data;
  },

  update: async (id, petData) => {
    const response = await api.put(`/pets/${id}`, petData);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/pets/${id}`);
    return response.data;
  }
};
