import { unwrapResult } from "@/lib/error-utils"
import type { LoginFormData } from "@/pages/Login/types/request"
import type { LoginResponse, LoginResult } from "@/pages/Login/types/response"

export type LoginAdapter = (data: LoginFormData) => Promise<LoginResponse>

export class AuthAdapterNotConfiguredError extends Error {
  constructor() {
    super("AUTH_ADAPTER_NOT_CONFIGURED")
    this.name = "AuthAdapterNotConfiguredError"
  }
}

let loginAdapter: LoginAdapter | null = null

export function configureAuthLoginAdapter(adapter: LoginAdapter): void {
  loginAdapter = adapter
}

export const AuthServices = {
  login: async (data: LoginFormData): Promise<LoginResult> => {
    if (!loginAdapter) throw new AuthAdapterNotConfiguredError()
    const response = await loginAdapter(data)
    return unwrapResult(response)
  },
}
