export interface LoginResponse {
  code?: number
  message?: string
  result?: LoginResult
}

export interface LoginResult {
  token: string
  user?: LoginData
}

export interface LoginData {
  code?: string
  id?: string
  nik?: string
  nrp?: string
  name?: string
  username?: string
  email?: string
  phone?: string
}