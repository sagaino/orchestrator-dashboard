import { LOCALSTORAGE_KEY } from '@/lib/constant/localstorage'
import useLocalStorage from '@/hooks/useLocalStorage'
import type { ReactNode } from 'react'
import { DEFAULT_API_TOKEN } from '@/lib/constant/auth'

interface IPrivateRoute {
  children: ReactNode
}

const PrivateRoute = ({ children }: IPrivateRoute) => {
  const [token, setToken] = useLocalStorage<string | null>(LOCALSTORAGE_KEY.TOKEN, DEFAULT_API_TOKEN)

  if (!token) {
    setToken(DEFAULT_API_TOKEN)
  }

  return <>{children}</>
}

export default PrivateRoute
