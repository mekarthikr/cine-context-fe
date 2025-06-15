import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create a custom type for the response data
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError };
