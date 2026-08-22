/* eslint-disable react-refresh/only-export-components -- route modules intentionally export the router. */
import { createBrowserRouter } from "react-router-dom"
import { lazy, Suspense, type ComponentType } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import NotFound from "@/pages/NotFound"
import { ROUTES } from "@/lib/constant/routes"
import PrivateRoute from "./PrivateRoute"
import ErrorBoundary from "@/components/ErrorBoundary"

const OverviewPage = lazy(() => import("@/pages/Overview").then((module) => ({ default: module.OverviewPage })))
const TasksPage = lazy(() => import("@/pages/Tasks").then((module) => ({ default: module.TasksPage })))
const RunsPage = lazy(() => import("@/pages/Runs").then((module) => ({ default: module.RunsPage })))
const KnowledgePage = lazy(() => import("@/pages/Knowledge").then((module) => ({ default: module.KnowledgePage })))
const TelemetryPage = lazy(() => import("@/pages/Telemetry").then((module) => ({ default: module.TelemetryPage })))
const OperationsPage = lazy(() => import("@/pages/Operations").then((module) => ({ default: module.OperationsPage })))
const RouteFallback = () => <div className="p-6 text-slate-400">Loading…</div>
const routeElement = (Page: ComponentType) => <Suspense fallback={<RouteFallback />}><Page /></Suspense>

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
        element: routeElement(OverviewPage),
      },
      {
        path: ROUTES.TASK,
        element: routeElement(TasksPage),
      },
      {
        path: ROUTES.RUNS,
        element: routeElement(RunsPage),
      },
      {
        path: ROUTES.KNOWLEDGE,
        element: routeElement(KnowledgePage),
      },
      {
        path: ROUTES.TELEMETRY,
        element: routeElement(TelemetryPage),
      },
      {
        path: ROUTES.OPERATIONS,
        element: routeElement(OperationsPage),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])
