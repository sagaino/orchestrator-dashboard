import type { ReactNode } from 'react'

interface IPrivateRoute {
  children: ReactNode
}

const PrivateRoute = ({ children }: IPrivateRoute) => {
  return <>{children}</>
}

export default PrivateRoute
