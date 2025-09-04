import api from './api';

export const clientService = {
  async getClients(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/clients?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch clients' };
    }
  },

  async getClient(clientId) {
    try {
      const response = await api.get(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch client' };
    }
  },

  async createClient(clientData, files = []) {
    try {
      const formData = new FormData();
      
      Object.keys(clientData).forEach(key => {
        if (clientData[key] !== null && clientData[key] !== undefined) {
          if (typeof clientData[key] === 'object' && clientData[key] !== null) {
            formData.append(key, JSON.stringify(clientData[key]));
          } else {
            formData.append(key, clientData[key]);
          }
        }
      });

      files.forEach((file, index) => {
        formData.append('documents', file);
      });

      const response = await api.post('/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create client' };
    }
  },

  async updateClient(clientId, clientData, files = []) {
    try {
      const formData = new FormData();
      
      Object.keys(clientData).forEach(key => {
        if (clientData[key] !== null && clientData[key] !== undefined) {
          if (typeof clientData[key] === 'object' && clientData[key] !== null) {
            formData.append(key, JSON.stringify(clientData[key]));
          } else {
            formData.append(key, clientData[key]);
          }
        }
      });

      files.forEach((file, index) => {
        formData.append('documents', file);
      });

      const response = await api.put(`/clients/${clientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update client' };
    }
  },

  async deleteClient(clientId) {
    try {
      const response = await api.delete(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete client' };
    }
  },

  async uploadDocuments(clientId, files, category = 'other', description = '') {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('documents', file);
      });
      
      formData.append('category', category);
      formData.append('description', description);

      const response = await api.post(`/clients/${clientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload documents' };
    }
  },

  async downloadDocument(clientId, documentId) {
    try {
      const response = await api.get(`/clients/${clientId}/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download document' };
    }
  },

  async deleteDocument(clientId, documentId) {
    try {
      const response = await api.delete(`/clients/${clientId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete document' };
    }
  },

  async addNote(clientId, content) {
    try {
      const response = await api.post(`/clients/${clientId}/notes`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add note' };
    }
  },

  async getStats() {
    try {
      const response = await api.get('/clients/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch client statistics' };
    }
  }
};