import { ROUTES } from "@/lib/constant/routes";
import NotFound from "@/pages/NotFound";
import ProjectReadyPage from "@/pages/ProjectReady";
import { createBrowserRouter, Outlet } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import LoginPage from "@/pages/Login";
import PrivateRoute from "./PrivateRoute";

export const router = createBrowserRouter([
  // Private Routes
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Outlet />
      </PrivateRoute>
    ),
    children: [
      // {
      //   index: true,
      //   element: <Navigate to={ROUTES.GALLERY} replace />
      // },
      {
        index: true,
        element: <ProjectReadyPage />,
      }
    ]
  },
  // Public Routes - No layout wrapper needed
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  // Error Routes
  {
    path: "*",
    element: <NotFound />,
  },
])
