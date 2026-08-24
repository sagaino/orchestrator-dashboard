import React from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DecisionHeaderProps } from "../types"

export const DecisionHeader: React.FC<DecisionHeaderProps> = ({ isFetching, onRefresh }) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">Human review queue</p>
        <h2 className="text-2xl font-semibold text-white">Decision Inbox</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Decision yang belum selesai diurutkan berdasarkan risk lalu waktu tunggu. Action di bawah hanya berasal dari daftar enumerasi decision.
        </p>
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={isFetching}>
        <RefreshCw className="mr-2 h-4 w-4" />
        {isFetching ? "Memuat…" : "Periksa ulang"}
      </Button>
    </div>
  )
}
