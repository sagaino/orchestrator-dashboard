import { LOCALSTORAGE_KEY } from '@/lib/constant/localstorage'
import { ROUTES } from '@/lib/constant/routes'
import useLocalStorage from '@/hooks/useLocalStorage'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface IPrivateRoute {
  children: ReactNode
}

const DEFAULT_TOKEN = "3ac5c42a38a780fce985ed6b77ae859ab10d3bbc3172579814ea79b860c63c49"

const PrivateRoute = ({ children }: IPrivateRoute) => {
  const [token, setToken] = useLocalStorage<string | null>(LOCALSTORAGE_KEY.TOKEN, DEFAULT_TOKEN)

  if (!token) {
    setToken(DEFAULT_TOKEN)
  }

  return <>{children}</>
}

export default PrivateRoute
