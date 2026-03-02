import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode: number;
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallbackMessage;
}
