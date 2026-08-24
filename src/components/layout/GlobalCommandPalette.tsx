import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Target,
  Inbox,
  Wrench,
  ExternalLink,
  Plus,
} from "lucide-react"
import { useRuns } from "@/hooks/use-orchestrator"

interface GlobalCommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddProject?: () => void
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  open,
  onOpenChange,
  onAddProject,
}) => {
  const navigate = useNavigate()
  const { data: runs = [] } = useRuns()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = (callback: () => void) => {
    onOpenChange(false)
    callback()
  }

  const activeRuns = runs.filter(
    (r) =>
      r.state === "REVIEW" ||
      r.state === "RETROSPECTIVE" ||
      r.state === "RUNNING" ||
      r.state === "VERIFYING"
  ).slice(0, 5)

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Quick Navigation & Commands"
      description="Cari halaman, run aktif, atau jalankan aksi cepat..."
    >
      <CommandInput placeholder="Ketik perintah atau cari..." />
      <CommandList className="max-h-[350px]">
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        {activeRuns.length > 0 && (
          <CommandGroup heading="Active Runs & Review">
            {activeRuns.map((run) => (
              <CommandItem
                key={run.runId}
                value={`${run.task.id} ${run.project.id} ${run.runId} ${run.state}`}
                onSelect={() => handleSelect(() => navigate(`/runs?runId=${encodeURIComponent(run.runId)}`))}
                className="cursor-pointer"
              >
                <History className="mr-2 h-4 w-4 text-amber-400" />
                <span className="font-semibold text-white mr-2">{run.task.id}</span>
                <span className="text-xs text-slate-400 font-mono truncate mr-2">({run.project.id})</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 ml-auto uppercase">
                  {run.state}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem
            value="overview dashboard beranda"
            onSelect={() => handleSelect(() => navigate("/"))}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Overview</span>
            <CommandShortcut>G O</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="task intake buat tugas baru"
            onSelect={() => handleSelect(() => navigate("/tasks"))}
            className="cursor-pointer"
          >
            <PlayCircle className="mr-2 h-4 w-4 text-emerald-400" />
            <span>Task Intake</span>
            <CommandShortcut>G T</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="objectives dag planning master"
            onSelect={() => handleSelect(() => navigate("/objectives"))}
            className="cursor-pointer"
          >
            <Target className="mr-2 h-4 w-4 text-cyan-400" />
            <span>Objectives</span>
            <CommandShortcut>G J</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="runs review human acceptance diff"
            onSelect={() => handleSelect(() => navigate("/runs"))}
            className="cursor-pointer"
          >
            <History className="mr-2 h-4 w-4 text-amber-400" />
            <span>Runs & Review</span>
            <CommandShortcut>G R</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="decision inbox blockers exceptions"
            onSelect={() => handleSelect(() => navigate("/decisions"))}
            className="cursor-pointer"
          >
            <Inbox className="mr-2 h-4 w-4 text-purple-400" />
            <span>Decision Inbox</span>
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="knowledge center wiki candidates"
            onSelect={() => handleSelect(() => navigate("/knowledge"))}
            className="cursor-pointer"
          >
            <BookOpen className="mr-2 h-4 w-4 text-blue-400" />
            <span>Knowledge Center</span>
            <CommandShortcut>G K</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="telemetry token metrics analytics"
            onSelect={() => handleSelect(() => navigate("/telemetry"))}
            className="cursor-pointer"
          >
            <BarChart3 className="mr-2 h-4 w-4 text-violet-400" />
            <span>Telemetry</span>
            <CommandShortcut>G L</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="operations backups storage health governance"
            onSelect={() => handleSelect(() => navigate("/operations"))}
            className="cursor-pointer"
          >
            <ShieldCheck className="mr-2 h-4 w-4 text-teal-400" />
            <span>Operations & Backups</span>
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>

          <CommandItem
            value="skills management registry"
            onSelect={() => handleSelect(() => navigate("/skills"))}
            className="cursor-pointer"
          >
            <Wrench className="mr-2 h-4 w-4 text-rose-400" />
            <span>Skill Management</span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {onAddProject && (
            <CommandItem
              value="add register onboard project"
              onSelect={() => handleSelect(() => onAddProject())}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4 text-indigo-400" />
              <span>Onboard / Add Project</span>
            </CommandItem>
          )}

          <CommandItem
            value="open runs list review"
            onSelect={() => handleSelect(() => navigate("/runs"))}
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4 text-amber-400" />
            <span>Go to Runs & Review</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
