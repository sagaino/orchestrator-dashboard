import React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OperationsHeaderProps } from "../types"

export const OperationsHeader: React.FC<OperationsHeaderProps> = ({
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">Operations Center</p>
        <h2 className="text-2xl font-semibold text-white">
          Kesiapan dan tata kelola sumber daya
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Eksekusi baru berhenti otomatis ketika backup, disk, atau integrity evidence tidak aman.
        </p>
      </div>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {isRefreshing ? "Memeriksa…" : "Periksa ulang"}
      </Button>
    </div>
  )
}
