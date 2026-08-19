import { useMemo } from "react"
import { useTelemetry, useRtkAnalytics } from "@/hooks/use-orchestrator"
import type {
  UseTelemetryPageReturn,
  TokenTrendPoint,
  StageDistributionItem,
} from "../types"

const STAGE_COLOR_MAP: Record<string, string> = {
  TASK_INTAKE: "#6366f1", // Indigo
  INTAKE: "#6366f1",
  IMPLEMENTATION: "#10b981", // Emerald
  RECOVERY: "#f59e0b", // Amber
  RETROSPECTIVE: "#8b5cf6", // Violet
  PLANNING: "#38bdf8", // Sky
  VERIFICATION: "#06b6d4", // Cyan
  KNOWLEDGE_HARVEST: "#ec4899", // Pink
  KNOWLEDGE_INGEST: "#14b8a6", // Teal
}

const DEFAULT_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#06b6d4", // Cyan
  "#ec4899", // Pink
]

export const useTelemetryPage = (): UseTelemetryPageReturn => {
  const {
    data: telemetry = null,
    isLoading: telemetryLoading,
    refetch: refetchTelemetry,
  } = useTelemetry()

  const {
    data: rtk = null,
    isLoading: rtkLoading,
    refetch: refetchRtk,
  } = useRtkAnalytics()

  const loading = telemetryLoading || rtkLoading

  const handleRefresh = () => {
    if (refetchTelemetry) refetchTelemetry()
    if (refetchRtk) refetchRtk()
  }

  const usage = telemetry?.telemetry?.summary?.usage
  const latestRuns = useMemo(() => telemetry?.latestRuns || [], [telemetry?.latestRuns])
  const stageBreakdown = useMemo(
    () => telemetry?.telemetry?.summary?.byStage || {},
    [telemetry?.telemetry?.summary?.byStage]
  )
  const rtkSummary = rtk?.summary
  const rtkAvailable = rtk?.available ?? false

  // Calculate combined savings
  const cacheSavings = usage?.cacheReadTokens ?? 0
  const rtkSavings = rtkSummary?.totalSavedTokens ?? 0
  const totalOptimizedTokens = cacheSavings + rtkSavings

  // Build Token Trend Data
  const trendData = useMemo<TokenTrendPoint[]>(() => {
    const rawRecords = telemetry?.telemetry?.records
    if (rawRecords && rawRecords.length > 0) {
      return rawRecords.map((rec, index) => {
        const inputTokens = rec.usage?.inputTokens ?? 0
        const outputTokens = rec.usage?.outputTokens ?? 0
        const thinkingTokens = rec.usage?.thinkingTokens ?? 0
        const cacheReadTokens = rec.usage?.cacheReadTokens ?? 0
        const totalTokens =
          rec.usage?.totalTokens ?? (inputTokens + outputTokens + thinkingTokens)

        const taskOrRun =
          rec.metadata?.taskId ||
          (rec.metadata?.runId ? rec.metadata.runId.slice(-8) : `Call #${index + 1}`)

        return {
          id: rec.recordId || `rec-${index + 1}`,
          label: taskOrRun,
          stage: rec.stage || "UNKNOWN",
          model: rec.model || "gemini-3.7-flash-high",
          inputTokens,
          outputTokens,
          thinkingTokens,
          cacheReadTokens,
          totalTokens,
          durationSeconds: rec.durationSeconds ?? 0,
          taskId: rec.metadata?.taskId,
          runId: rec.metadata?.runId,
        }
      })
    }

    // Fallback using latestRuns if no granular records are present
    if (latestRuns.length > 0) {
      return latestRuns.map((run, index) => {
        const inputTokens = Math.round(run.totalTokens * 0.7)
        const outputTokens = Math.round(run.totalTokens * 0.2)
        const thinkingTokens = Math.round(run.totalTokens * 0.1)
        return {
          id: run.runId || `run-${index + 1}`,
          label: run.taskId || run.runId.slice(-8),
          stage: run.state || "COMPLETED",
          model: "gemini-3.7-flash-high",
          inputTokens,
          outputTokens,
          thinkingTokens,
          cacheReadTokens: 0,
          totalTokens: run.totalTokens,
          durationSeconds: run.durationSeconds ?? 0,
          taskId: run.taskId || undefined,
          runId: run.runId,
        }
      })
    }

    return []
  }, [telemetry?.telemetry?.records, latestRuns])

  // Build Stage Distribution Data
  const { stageData, totalStageTokens } = useMemo(() => {
    const entries = Object.entries(stageBreakdown)

    if (entries.length > 0) {
      const sumTokens = entries.reduce(
        (acc, [, stats]) => acc + (stats.usage?.totalTokens ?? 0),
        0
      )

      const items: StageDistributionItem[] = entries.map(([stageKey, stats], index) => {
        const tokens = stats.usage?.totalTokens ?? 0
        const percentage =
          sumTokens > 0 ? Number(((tokens / sumTokens) * 100).toFixed(1)) : 0

        const color =
          STAGE_COLOR_MAP[stageKey.toUpperCase()] ||
          DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]

        const formattedName = stageKey
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())

        return {
          name: formattedName,
          stageKey,
          totalTokens: tokens,
          calls: stats.calls,
          durationSeconds: stats.durationSeconds ?? 0,
          percentage,
          color,
        }
      })

      return { stageData: items, totalStageTokens: sumTokens }
    }

    // Fallback: Aggregate from records if byStage summary is missing
    const rawRecords = telemetry?.telemetry?.records
    if (rawRecords && rawRecords.length > 0) {
      const stageMap: Record<
        string,
        { calls: number; totalTokens: number; durationSeconds: number }
      > = {}

      for (const rec of rawRecords) {
        const key = (rec.stage || "UNKNOWN").toUpperCase()
        if (!stageMap[key]) {
          stageMap[key] = { calls: 0, totalTokens: 0, durationSeconds: 0 }
        }
        stageMap[key].calls += 1
        stageMap[key].totalTokens +=
          rec.usage?.totalTokens ??
          (rec.usage?.inputTokens ?? 0) +
            (rec.usage?.outputTokens ?? 0) +
            (rec.usage?.thinkingTokens ?? 0)
        stageMap[key].durationSeconds += rec.durationSeconds ?? 0
      }

      const stageEntries = Object.entries(stageMap)
      const sumTokens = stageEntries.reduce((acc, [, s]) => acc + s.totalTokens, 0)

      const items: StageDistributionItem[] = stageEntries.map(
        ([stageKey, stats], index) => {
          const percentage =
            sumTokens > 0 ? Number(((stats.totalTokens / sumTokens) * 100).toFixed(1)) : 0

          const color =
            STAGE_COLOR_MAP[stageKey] || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]

          const formattedName = stageKey
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())

          return {
            name: formattedName,
            stageKey,
            totalTokens: stats.totalTokens,
            calls: stats.calls,
            durationSeconds: stats.durationSeconds,
            percentage,
            color,
          }
        }
      )

      return { stageData: items, totalStageTokens: sumTokens }
    }

    return { stageData: [], totalStageTokens: 0 }
  }, [stageBreakdown, telemetry?.telemetry?.records])

  return {
    telemetry,
    rtk,
    loading,
    handleRefresh,
    usage,
    latestRuns,
    stageBreakdown,
    trendData,
    stageData,
    totalStageTokens,
    rtkSummary,
    rtkAvailable,
    cacheSavings,
    rtkSavings,
    totalOptimizedTokens,
  }
}
