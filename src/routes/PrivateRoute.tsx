import { LOCALSTORAGE_KEY } from '@/lib/constant/localstorage'
import { ROUTES } from '@/lib/constant/routes'
import useLocalStorage from '@/hooks/useLocalStorage'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface IPrivateRoute {
  children: ReactNode
}

const PrivateRoute = ({ children }: IPrivateRoute) => {
  const [token] = useLocalStorage<string | null>(LOCALSTORAGE_KEY.TOKEN, null, { encrypted: true })
  const location = useLocation()

  // If no token, redirect to login with the current location
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Token exists, render the protected content
  return <>{children}</>
}

export default PrivateRoute
