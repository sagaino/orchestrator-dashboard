import React, { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, BarChart3, AreaChart as AreaChartIcon } from "lucide-react"
import type { TokenTrendChartProps, TokenTrendPoint } from "../types"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    payload: TokenTrendPoint
  }>
  label?: string
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  const point = payload[0]?.payload

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/95 p-3 text-xs shadow-xl backdrop-blur-md space-y-2 min-w-[220px]">
      <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-2">
        <span className="font-semibold text-white font-mono truncate max-w-[140px]">
          {point?.taskId || label || point?.label}
        </span>
        {point?.stage && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-medium">
            {point.stage}
          </span>
        )}
      </div>

      <div className="space-y-1 font-mono">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold text-slate-200">
              {Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800/80 pt-1.5 flex justify-between text-[10px] text-slate-400 font-mono">
        <span>Model: {point?.model ? point.model.replace("gemini-", "") : "gemini"}</span>
        <span>{point?.durationSeconds ? `${point.durationSeconds.toFixed(1)}s` : "-"}</span>
      </div>
    </div>
  )
}

export const TokenTrendChart: React.FC<TokenTrendChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<"area" | "bar">("area")

  // Calculate quick summary metrics
  const totalInput = data.reduce((acc, cur) => acc + cur.inputTokens, 0)
  const totalOutput = data.reduce((acc, cur) => acc + cur.outputTokens, 0)
  const totalThinking = data.reduce((acc, cur) => acc + cur.thinkingTokens, 0)
  const totalCacheRead = data.reduce((acc, cur) => acc + cur.cacheReadTokens, 0)

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header with Title & Chart Type Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Token Usage Trends</h2>
            <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-slate-800 text-slate-300">
              {data.length} Calls / Runs
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Perbandingan penggunaan Input, Output, Thinking, dan Cache Read Tokens antar panggilan orchestrator.
          </p>
        </div>

        {/* View Switcher Button Group */}
        <div className="flex items-center self-start sm:self-auto bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              chartType === "area"
                ? "bg-slate-800 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AreaChartIcon className="h-3.5 w-3.5" />
            <span>Area</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
              chartType === "bar"
                ? "bg-slate-800 text-white font-medium shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Bar</span>
          </button>
        </div>
      </div>

      {/* Mini summary badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
        <span className="px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/20 text-indigo-300">
          Input: <strong className="text-indigo-200">{totalInput.toLocaleString()}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/20 text-purple-300">
          Output: <strong className="text-purple-200">{totalOutput.toLocaleString()}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/20 text-amber-300">
          Thinking: <strong className="text-amber-200">{totalThinking.toLocaleString()}</strong>
        </span>
        {totalCacheRead > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
            Cache: <strong className="text-emerald-200">{totalCacheRead.toLocaleString()}</strong>
          </span>
        )}
      </div>

      {/* Chart Canvas */}
      {data.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-lg bg-slate-950 border border-dashed border-slate-800 text-slate-500 text-xs">
          <TrendingUp className="h-8 w-8 text-slate-600 mb-2 stroke-1" />
          <p>Belum ada data rekaman panggilan telemetry.</p>
          <p className="text-[11px] text-slate-600 mt-1">Jalankan task orkestrasi untuk melihat tren penggunaan token.</p>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientThinking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientCache" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="inputTokens"
                  name="Input Tokens"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientInput)"
                />
                <Area
                  type="monotone"
                  dataKey="outputTokens"
                  name="Output Tokens"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientOutput)"
                />
                <Area
                  type="monotone"
                  dataKey="thinkingTokens"
                  name="Thinking Tokens"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientThinking)"
                />
                <Area
                  type="monotone"
                  dataKey="cacheReadTokens"
                  name="Cache Read"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradientCache)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  iconType="circle"
                />
                <Bar dataKey="inputTokens" name="Input Tokens" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outputTokens" name="Output Tokens" fill="#a855f7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="thinkingTokens" name="Thinking Tokens" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cacheReadTokens" name="Cache Read" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
