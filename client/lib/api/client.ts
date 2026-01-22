import type { ApiResponse } from './types';

import { API_BASE_URL, MESSAGES } from '@/constants';

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
      console.error(MESSAGES.ERROR.API_GET_ERROR, error);
      return {
        success: false,
        error: MESSAGES.ERROR.NETWORK,
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
      console.error(MESSAGES.ERROR.API_POST_ERROR, error);
      return {
        success: false,
        error: MESSAGES.ERROR.NETWORK,
      };
    }
  },
};

