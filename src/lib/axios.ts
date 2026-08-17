import Axios, { type AxiosError } from "axios"

import { LOCALSTORAGE_KEY } from "./constant/localstorage"
import { getData, removeData } from "@/hooks/useLocalStorage"
import { DEFAULT_API_TOKEN } from "./constant/auth"

const API_URL = import.meta.env.VITE_API_URL || ""

export const axios = Axios.create({
  baseURL: API_URL,
})

// Add a request interceptor to add auth token
axios.interceptors.request.use(
  async (config) => {
    const token = getData<string>(LOCALSTORAGE_KEY.TOKEN) || localStorage.getItem("orchestrator_token") || DEFAULT_API_TOKEN
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      config.headers["x-api-token"] = token
    }
    return config
  },
  (error: unknown) => Promise.reject(error),
)

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as any

    if (status === 401) {
      removeData(LOCALSTORAGE_KEY.TOKEN)
      removeData(LOCALSTORAGE_KEY.USER)
      const message = data?.message || "Sesi telah kedaluwarsa."
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  },
)

export default axios
