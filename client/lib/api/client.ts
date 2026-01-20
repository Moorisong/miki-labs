import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      return response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  async post<T, D = unknown>(endpoint: string, data?: D): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      });
      return response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },
};
