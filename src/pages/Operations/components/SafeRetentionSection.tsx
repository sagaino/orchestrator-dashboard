import React from "react"
import { RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SafeRetentionSectionProps } from "../types"

const formatBytes = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "unit",
    unit: "megabyte",
    maximumFractionDigits: 1,
  }).format(value / 1024 / 1024)

export const SafeRetentionSection: React.FC<SafeRetentionSectionProps> = ({
  days,
  onDaysChange,
  onPreviewRetention,
  isPreviewingRetention,
  activePlan,
  planId,
  retentionConfirmed,
  onRetentionConfirmedChange,
  onPurgeRetention,
  isPurgingRetention,
  trash,
  onRestoreRetention,
  isRestoringRetention,
}) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
      <h3 className="text-lg font-semibold text-white">Retention aman</h3>
      <p className="mt-1 text-sm text-slate-400">
        Preview hanya memilih artefak lama. Purge memindahkan data ke trash yang dapat dipulihkan—tidak ada penghapusan otomatis.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300">
          Usia minimum{" "}
          <input
            className="ml-2 w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
            type="number"
            min="1"
            value={days}
            onChange={(event) => onDaysChange(Number(event.target.value))}
          />{" "}
          hari
        </label>
        <Button onClick={onPreviewRetention} disabled={isPreviewingRetention}>
          {isPreviewingRetention ? "Membuat preview…" : "Buat preview"}
        </Button>
      </div>

      {activePlan && (
        <div className="mt-4 rounded-lg border border-slate-700 p-4">
          <p className="font-medium text-slate-100">
            {activePlan.summary.candidateCount} kandidat · {formatBytes(activePlan.summary.bytes)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Plan {activePlan.planId} kedaluwarsa{" "}
            {new Date(activePlan.expiresAt || "").toLocaleString("id-ID")}
          </p>
          {activePlan.protection && (
            <p className="mt-2 text-xs text-emerald-300">
              {activePlan.protection.protectedActiveRecordCount} active state dilindungi dan tidak masuk kandidat purge.
            </p>
          )}
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={retentionConfirmed && planId === activePlan.planId}
              onChange={(event) =>
                onRetentionConfirmedChange(event.target.checked, activePlan.planId)
              }
            />{" "}
            Saya memahami data dipindahkan ke trash yang dapat dipulihkan.
          </label>
          <Button
            className="mt-3"
            variant="destructive"
            disabled={
              !retentionConfirmed ||
              planId !== activePlan.planId ||
              isPurgingRetention
            }
            onClick={() => onPurgeRetention(activePlan.planId)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Pindahkan ke trash
          </Button>
        </div>
      )}

      {trash.length > 0 && (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <p className="font-medium text-slate-200">Trash yang dapat dipulihkan</p>
          {trash.map((item) => (
            <div
              key={item.planId}
              className="mt-2 flex items-center justify-between rounded border border-slate-800 px-3 py-2 text-sm"
            >
              <span>
                {item.moved?.length ?? 0} item · {item.planId}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={isRestoringRetention}
                onClick={() => onRestoreRetention(item.planId)}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Pulihkan
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
