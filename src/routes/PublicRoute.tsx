import type { ReactNode } from 'react'

interface IPublicRoute {
  children: ReactNode
}

const PublicRoute = ({ children }: IPublicRoute) => {
  return <>{children}</>
}

export default PublicRoute
