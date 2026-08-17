import type { TelemetryReport, RtkAnalytics } from "@/services/orchestrator"

export interface TelemetryUsage {
  inputTokens?: number
  outputTokens?: number
  thinkingTokens?: number
  cacheReadTokens?: number
  totalTokens?: number
  contextTokens?: number
}

export interface RunTelemetrySummary {
  runId: string
  taskId: string | null
  projectId: string | null
  state: string
  calls: number
  totalTokens: number
  durationSeconds: number
  warning?: boolean
}

export interface TokenTrendPoint {
  id: string
  label: string
  stage: string
  model?: string
  inputTokens: number
  outputTokens: number
  thinkingTokens: number
  cacheReadTokens: number
  totalTokens: number
  durationSeconds: number
  taskId?: string
  runId?: string
}

export interface StageDistributionItem {
  name: string
  stageKey: string
  totalTokens: number
  calls: number
  durationSeconds: number
  percentage: number
  color: string
}

export interface TokenTrendChartProps {
  data: TokenTrendPoint[]
  loading?: boolean
}

export interface StageDistributionChartProps {
  data: StageDistributionItem[]
  totalTokens?: number
  loading?: boolean
}

export interface TelemetryHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export interface TelemetryMetricsCardsProps {
  usage?: TelemetryUsage
  totalOptimizedTokens: number
}

export interface RtkAnalyticsCardProps {
  rtkSummary?: RtkAnalytics["summary"]
  available?: boolean
}

export interface StageBreakdownProps {
  stageBreakdown: Record<string, { calls: number; usage?: TelemetryUsage; durationSeconds?: number }>
  stageData?: StageDistributionItem[]
}

export interface RunsLogTableProps {
  runs: RunTelemetrySummary[]
}

export interface UseTelemetryPageReturn {
  telemetry: TelemetryReport | null
  rtk: RtkAnalytics | null
  loading: boolean
  handleRefresh: () => void
  usage?: TelemetryUsage
  latestRuns: RunTelemetrySummary[]
  stageBreakdown: Record<string, { calls: number; usage?: TelemetryUsage; durationSeconds?: number }>
  trendData: TokenTrendPoint[]
  stageData: StageDistributionItem[]
  totalStageTokens: number
  rtkSummary?: RtkAnalytics["summary"]
  rtkAvailable?: boolean
  cacheSavings: number
  rtkSavings: number
  totalOptimizedTokens: number
}
