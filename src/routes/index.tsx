import { createBrowserRouter } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { OverviewPage } from "@/pages/Overview"
import { TasksPage } from "@/pages/Tasks"
import { RunsPage } from "@/pages/Runs"
import { KnowledgePage } from "@/pages/Knowledge"
import { TelemetryPage } from "@/pages/Telemetry"
import NotFound from "@/pages/NotFound"
import PrivateRoute from "./PrivateRoute"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "runs",
        element: <RunsPage />,
      },
      {
        path: "knowledge",
        element: <KnowledgePage />,
      },
      {
        path: "telemetry",
        element: <TelemetryPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])
