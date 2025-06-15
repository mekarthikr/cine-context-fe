import axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  ApiResponse,
} from '../types/http';
import { ApiError } from '../types/http';

// Error handler function
const handleError = (error: AxiosError): never => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage =
      typeof error.response.data === 'object' && error.response.data !== null
        ? (error.response.data as { message?: string }).message || 'An error occurred'
        : 'An error occurred';

    throw new ApiError(error.response.status, errorMessage, error.response.data, error);
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError(0, 'No response received from server', null, error);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new ApiError(
      0,
      error.message || 'An error occurred while setting up the request',
      null,
      error,
    );
  }
};

class HttpClient {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      // baseURL: process.env.VITE_API_URL || 'http://localhost:3000',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NTI3NzczODUxMDRiYjE2OTZlMTYzYTdkYTU3OTAxZiIsIm5iZiI6MTcwMjI2OTExNC45NjMsInN1YiI6IjY1NzY5MGJhYTg0YTQ3MmRlNTdkZmU4MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aD9eMkKsQTKA7RAW9xDPowcx7oUkpR5dLGkxDtq-dUY',
        accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      config => {
        // You can add auth token here
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          // Handle forbidden access
          console.error('Access forbidden:', error);
        } else if (error.response?.status === 404) {
          // Handle not found
          console.error('Resource not found:', error);
        } else if (error.response?.status === 500) {
          // Handle server error
          console.error('Server error:', error);
        }

        return Promise.reject(error);
      },
    );
  }

  // Generic GET method
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.get(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }

  // Generic POST method
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.post(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }

  // Generic PUT method
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.put(url, data, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }

  // Generic DELETE method
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete(url, config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return handleError(error as AxiosError);
    }
  }

  // Get the underlying axios instance if needed
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create a singleton instance
const httpClient = new HttpClient();

export default httpClient;
