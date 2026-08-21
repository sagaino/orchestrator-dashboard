import Axios, { type AxiosError } from "axios"

const API_URL = import.meta.env.VITE_API_URL || ""

export const axios = Axios.create({
  baseURL: API_URL,
})

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as any

    if (status === 401) {
      const message = data?.error?.message || data?.message || "Proxy lokal tidak dapat mengautentikasi dashboard."
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  },
)

export default axios
