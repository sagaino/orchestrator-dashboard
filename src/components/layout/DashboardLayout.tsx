import React, { useEffect, useState } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BookOpen,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  Cpu,
  Layers,
} from "lucide-react"
import { OrchestratorApi, type DaemonStatus } from "@/services/orchestrator"
import { subscribeToEvents } from "@/services/events"

export const DashboardLayout: React.FC = () => {
  const [daemon, setDaemon] = useState<DaemonStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [liveEvents, setLiveEvents] = useState<Array<{ event: string; timestamp: string; message: string }>>([])
  const location = useLocation()

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const data = await OrchestratorApi.getDaemonStatus()
      setDaemon(data)
    } catch {
      setDaemon(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)

    const unsubscribe = subscribeToEvents((evt) => {
      const entry = {
        event: evt.event,
        timestamp: new Date().toLocaleTimeString(),
        message: typeof evt.data === "object" ? JSON.stringify(evt.data) : String(evt.data),
      }
      setLiveEvents((prev) => [entry, ...prev.slice(0, 19)])
      fetchStatus()
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const navItems = [
    { label: "Overview", to: "/", icon: LayoutDashboard },
    { label: "Task Intake", to: "/tasks", icon: PlayCircle },
    { label: "Runs & Review", to: "/runs", icon: History },
    { label: "Knowledge Center", to: "/knowledge", icon: BookOpen },
    { label: "Telemetry", to: "/telemetry", icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-white">AI Orchestrator</h1>
              <p className="text-xs text-slate-400 font-mono">Autonomous Core</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none border ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-400 border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Daemon Connection Widget */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daemon Runtime</span>
              <button
                onClick={fetchStatus}
                disabled={loading}
                title="Refresh Status"
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                {daemon?.healthy ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-200">
                {daemon?.healthy ? "Healthy (Active)" : "Disconnected"}
              </span>
            </div>

            {daemon && (
              <div className="mt-2.5 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Worker Slots:</span>
                  <span className="text-emerald-400 font-semibold">
                    {daemon.parallel.activeWorkers}/{daemon.parallel.maxWorkers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Heartbeat:</span>
                  <span>{daemon.heartbeatAgeMs !== null ? `${Math.round(daemon.heartbeatAgeMs / 1000)}s ago` : "-"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100">
              {navItems.find((item) => item.to === location.pathname)?.label || "Dashboard"}
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Port 3721
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Event Pill */}
            {liveEvents.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>SSE: {liveEvents[0].event}</span>
              </div>
            )}

            {/* Notification Badge */}
            <div className="relative">
              <button
                onClick={fetchStatus}
                className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/60"
              >
                <Bell className="h-4 w-4" />
                {daemon?.notifications && daemon.notifications.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {daemon.notifications.unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Body Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
