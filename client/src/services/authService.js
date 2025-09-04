import api from './api';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success && response.data.data.token) {
        Cookies.set(TOKEN_KEY, response.data.data.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        Cookies.set(TOKEN_KEY, response.data.data.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
    } finally {
      Cookies.remove(TOKEN_KEY);
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },

  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      
      const response = await api.get(`/auth/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get users' };
    }
  },

  getToken() {
    return Cookies.get(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  removeToken() {
    Cookies.remove(TOKEN_KEY);
  }
};