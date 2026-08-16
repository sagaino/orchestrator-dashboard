import Axios, { type AxiosError } from "axios"
import { getTimestamp, makeSignature } from "./signature"

import { LOCALSTORAGE_KEY } from "./constant/localstorage"
import Swal from "sweetalert2"
import { getData, removeData } from "@/hooks/useLocalStorage"
import type { ApiError } from "./error-utils"
import { ROUTES } from "./constant/routes"

const API_URL = import.meta.env.VITE_API_URL || "/api"

export const axios = Axios.create({
  baseURL: API_URL,
})

// Default token from local runs runtime
const DEFAULT_TOKEN = "3ac5c42a38a780fce985ed6b77ae859ab10d3bbc3172579814ea79b860c63c49"

// Add a request interceptor to add auth token
axios.interceptors.request.use(
  async (config) => {
    const token = getData<string>(LOCALSTORAGE_KEY.TOKEN) || localStorage.getItem("orchestrator_token") || DEFAULT_TOKEN
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
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status
    const data = error.response?.data

    if (status === 401) {
      const isLoginPage = window.location.pathname.includes(ROUTES.LOGIN)

      if (!isLoginPage) {
        removeData(LOCALSTORAGE_KEY.TOKEN)
        removeData(LOCALSTORAGE_KEY.USER)
        const message = data?.message || "Sesi telah kedaluwarsa."
        await Swal.fire({
          title: message.split(",")[0],
          text: "Sesi telah kedaluwarsa.",
          icon: "warning",
          confirmButtonText: "Go to Login",
          allowOutsideClick: false,
          allowEscapeKey: false,
          confirmButtonColor: "#FFD700",
        })

        window.location.assign(ROUTES.LOGIN)
      }
    }

    return Promise.reject(error)
  },
)

export default axios
