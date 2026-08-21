import Axios, { type AxiosError } from "axios"

const API_URL = import.meta.env.VITE_API_URL || ""

type OperatorSession = { sessionId: string; actor: string; actionNonce: string; expiresAt: string }
type MutationConfig = Record<string, any> & { __releaseMutation?: () => void }

export const axios = Axios.create({
  baseURL: API_URL,
})

const sessionClient = Axios.create({ baseURL: API_URL })
let operatorSession: OperatorSession | null = null
let sessionPromise: Promise<OperatorSession> | null = null
let mutationTail: Promise<void> = Promise.resolve()

async function ensureOperatorSession(): Promise<OperatorSession> {
  if (operatorSession && new Date(operatorSession.expiresAt).getTime() > Date.now()) return operatorSession
  if (!sessionPromise) {
    sessionPromise = sessionClient.get("/api/auth/session").then((response) => response.data.data as OperatorSession).finally(() => {
      sessionPromise = null
    })
  }
  operatorSession = await sessionPromise
  return operatorSession
}

axios.interceptors.request.use(async (config) => {
  const method = String(config.method || "get").toUpperCase()
  if (!["POST", "PUT", "DELETE"].includes(method)) return config
  const previous = mutationTail
  let release!: () => void
  mutationTail = new Promise<void>((resolve) => { release = resolve })
  await previous
  ;(config as MutationConfig).__releaseMutation = release
  try {
    const session = await ensureOperatorSession()
    config.headers.set("X-Operator-Session", session.sessionId)
    config.headers.set("X-Action-Nonce", session.actionNonce)
    return config
  } catch (error) {
    release()
    throw error
  }
})

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    const nextNonce = response.headers["x-action-nonce"]
    if (nextNonce && operatorSession) operatorSession.actionNonce = nextNonce
    ;(response.config as MutationConfig).__releaseMutation?.()
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as MutationConfig | undefined
    const nextNonce = error.response?.headers?.["x-action-nonce"]
    if (nextNonce && operatorSession) operatorSession.actionNonce = nextNonce
    else if (config?.__releaseMutation) operatorSession = null
    config?.__releaseMutation?.()
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
