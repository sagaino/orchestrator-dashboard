import React from "react"
import { useTelemetryPage } from "./hooks"
import {
  TelemetryHeader,
  TelemetryMetricsCards,
  TokenTrendChart,
  StageDistributionChart,
  RtkAnalyticsCard,
  StageBreakdown,
  RunsLogTable,
} from "./components"

export const TelemetryPage: React.FC = () => {
  const {
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
    totalOptimizedTokens,
  } = useTelemetryPage()

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header with Title and Refresh Action */}
      <TelemetryHeader loading={loading} onRefresh={handleRefresh} />

      {/* Top Metric Cards Row */}
      <TelemetryMetricsCards
        usage={usage}
        totalOptimizedTokens={totalOptimizedTokens}
      />

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <TokenTrendChart data={trendData} loading={loading} />
        </div>
        <div className="lg:col-span-5">
          <StageDistributionChart
            data={stageData}
            totalTokens={totalStageTokens}
            loading={loading}
          />
        </div>
      </div>

      {/* RTK Token Killer Analytics Scoreboard */}
      <RtkAnalyticsCard rtkSummary={rtkSummary} available={rtkAvailable} />

      {/* Stage Breakdown Metrics */}
      <StageBreakdown stageBreakdown={stageBreakdown} stageData={stageData} />

      {/* Recorded Runs Telemetry Log Table */}
      <RunsLogTable runs={latestRuns} />
    </div>
  )
}

export default TelemetryPage
