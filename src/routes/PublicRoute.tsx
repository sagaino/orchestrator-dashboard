import { LOCALSTORAGE_KEY } from '@/lib/constant/localstorage'
import useLocalStorage from '@/hooks/useLocalStorage'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface IPublicRoute {
  children: ReactNode
}

const PublicRoute = ({ children }: IPublicRoute) => {
  const [token] = useLocalStorage<string | null>(LOCALSTORAGE_KEY.TOKEN, null, { encrypted: true })
  const location = useLocation()

  // If authenticated, redirect to dashboard
  if (token) {
    return <Navigate to={"/"} replace state={{ from: location }} />
  }

  // Not authenticated, render children (login, register, etc.)
  return <>{children}</>
}

export default PublicRoute
