import { createBrowserRouter } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { OverviewPage } from "@/pages/Overview"
import { TasksPage } from "@/pages/Tasks"
import { RunsPage } from "@/pages/Runs"
import { KnowledgePage } from "@/pages/Knowledge"
import { TelemetryPage } from "@/pages/Telemetry"
import NotFound from "@/pages/NotFound"
import { ROUTES } from "@/lib/constant/routes"
import PrivateRoute from "./PrivateRoute"
import ErrorBoundary from "@/components/ErrorBoundary"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: ROUTES.TASK,
        element: <TasksPage />,
      },
      {
        path: ROUTES.RUNS,
        element: <RunsPage />,
      },
      {
        path: ROUTES.KNOWLEDGE,
        element: <KnowledgePage />,
      },
      {
        path: ROUTES.TELEMETRY,
        element: <TelemetryPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])
