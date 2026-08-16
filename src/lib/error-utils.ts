import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

export interface ApiError {
  code: number;
  message: string;
  errors?: Record<string, string>;
  result: null;
}

export const formatErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiError>;
  const apiError = axiosError.response?.data;

  if (!apiError) {
    return [axiosError.message || "An error occurred"];
  }

  // If we have field-specific validation errors
  if (apiError.errors && Object.keys(apiError.errors).length > 0) {
    return Object.values(apiError.errors);
  }

  // If we have a general error message (like 404 not found)
  if (apiError.message) {
    // Capitalize first letter of message
    const formattedMessage = apiError.message.charAt(0).toUpperCase() + apiError.message.slice(1);
    return [formattedMessage];
  }

  // Fallback error message
  return ["An error occurred"];
};

export function unwrapResult<T>(response: {
  code?: number
  message?: string
  result?: T | null
}): T {
  if (response.code && response.code !== 200) {
    throw new Error(response.message || 'Request gagal')
  }

  if (!response.result) {
    throw new Error(response.message || 'Data tidak ditemukan')
  }

  return response.result
}

export const showErrorToast = (error: AxiosError<ApiError>) => {
  const errors = formatErrorMessage(error);
  const errorList = errors.map(error => `• ${error}`).join('\n');

  toast.add({
    title: "Error",
    type: "error",
    description: errorList,
  })
}; 