import React, { useState } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BookOpen,
  BarChart3,
  Bell,
  RefreshCw,
  Cpu,
  Menu,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { useDaemonStatus, useNotifications, useMarkNotificationsRead } from "@/hooks/use-orchestrator"
import { useSSEEvents } from "@/providers/EventsProvider"
import { AddProjectModal } from "@/components/project/AddProjectModal"
import { FloatingHarvestProgress } from "@/components/knowledge/FloatingHarvestProgress"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface NotificationItem {
  id: string
  type?: string
  title?: string
  message?: string
  taskId?: string | null
  createdAt?: string
  readAt?: string | null
  delivery?: string
}

export const DashboardLayout: React.FC = () => {
  const { data: daemon, isLoading: loading, refetch } = useDaemonStatus()
  const { data: notificationsData, refetch: refetchNotifications } = useNotifications()
  const { mutateAsync: markAllRead, isPending: markingRead } = useMarkNotificationsRead()
  const { lastEvent } = useSSEEvents()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [addProjectOpen, setAddProjectOpen] = useState(false)

  const navItems = [
    { label: "Overview", to: "/", icon: LayoutDashboard },
    { label: "Task Intake", to: "/tasks", icon: PlayCircle },
    { label: "Runs & Review", to: "/runs", icon: History },
    { label: "Knowledge Center", to: "/knowledge", icon: BookOpen },
    { label: "Telemetry", to: "/telemetry", icon: BarChart3 },
  ]

  const notificationList: NotificationItem[] = Array.isArray(notificationsData)
    ? (notificationsData as NotificationItem[])
    : ((notificationsData as unknown as { notifications?: NotificationItem[] })?.notifications ||
      daemon?.notifications?.latest ||
      [])

  const unreadCount = daemon?.notifications?.unreadCount ?? notificationList.filter((n) => !n.readAt).length

  const renderSidebarContent = (onNavClick?: () => void) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold shrink-0">
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
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 select-none border ${
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

        {/* Add Project Sidebar Action */}
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={() => {
              setAddProjectOpen(true)
              if (onNavClick) onNavClick()
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {/* Daemon Connection Widget */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Daemon Runtime</span>
            <button
              onClick={() => refetch()}
              disabled={loading}
              title="Refresh Status"
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
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
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex-col justify-between shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" showCloseButton={true} className="w-72 p-0 bg-slate-900 border-r border-slate-800 text-slate-100">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Main navigation and daemon status</SheetDescription>
          </SheetHeader>
          {renderSidebarContent(() => setMobileOpen(false))}
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>

            <h2 className="text-base font-semibold text-slate-100">
              {navItems.find((item) => item.to === location.pathname)?.label || "Dashboard"}
            </h2>
            <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Port 3721
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Add Project Button */}
            <button
              type="button"
              onClick={() => setAddProjectOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Project</span>
            </button>

            {/* Live Event Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono text-indigo-300">
              <span className={`h-2 w-2 rounded-full ${lastEvent?.event && lastEvent.event !== "connected" ? "bg-indigo-400 animate-pulse" : "bg-emerald-400"}`}></span>
              <span>SSE: {lastEvent?.event || "connected"}</span>
            </div>

            {/* Notification Popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    aria-label="Open notifications"
                    className="relative p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/60 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
                  />
                }
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 sm:w-96 p-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-white">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      await markAllRead({})
                      refetch()
                      refetchNotifications()
                    }}
                    disabled={markingRead || unreadCount === 0}
                    className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1.5 py-0.5 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{markingRead ? "Menandai..." : "Tandai semua dibaca"}</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notificationList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Belum ada notifikasi
                    </div>
                  ) : (
                    notificationList.map((item: any, idx: number) => {
                      const deliveryStatus = typeof item.delivery === "object" && item.delivery !== null
                        ? (item.delivery.status || "SENT")
                        : (item.delivery ? String(item.delivery) : null);
                      const key = item.id || item.notificationId || (item.createdAt ? `notif-${idx}-${item.createdAt}` : `notif-${idx}`);

                      return (
                        <div
                          key={key}
                          className={`p-3 text-xs space-y-1 transition-colors ${
                            item.readAt ? "opacity-70 hover:bg-slate-800/40" : "bg-indigo-950/20 hover:bg-indigo-950/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-medium text-slate-200">
                              {!item.readAt && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />}
                              <span className="truncate">{item.title || item.type || "Notification"}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">
                              {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                          </div>
                          {item.message && (
                            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{item.message}</p>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                            {item.taskId ? (
                              <span className="text-indigo-400 font-semibold">{item.taskId}</span>
                            ) : (
                              <span className="text-slate-500">{item.type || "system"}</span>
                            )}
                            {deliveryStatus && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                                {deliveryStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Body Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>

      {/* Add / Onboard Project Modal */}
      <AddProjectModal
        isOpen={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
      />

      {/* Floating Background Harvest Progress Dock */}
      <FloatingHarvestProgress />
    </div>
  )
}

