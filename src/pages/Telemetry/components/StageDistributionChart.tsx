import React, { useState } from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { PieChart as PieChartIcon } from "lucide-react"
import type { StageDistributionChartProps, StageDistributionItem } from "../types"

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: StageDistributionItem
  }>
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null
  const item = payload[0]?.payload

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/95 p-3 text-xs shadow-xl backdrop-blur-md space-y-2 min-w-[190px]">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="font-semibold text-white">{item.name}</span>
      </div>
      <div className="space-y-1 font-mono text-[11px]">
        <div className="flex justify-between text-slate-400">
          <span>Tokens:</span>
          <span className="font-semibold text-slate-200">{item.totalTokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Proportion:</span>
          <span className="font-semibold text-indigo-300">{item.percentage}%</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Calls:</span>
          <span className="text-slate-300">{item.calls}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Duration:</span>
          <span className="text-slate-300">
            {item.durationSeconds ? `${item.durationSeconds.toFixed(1)}s` : "-"}
          </span>
        </div>
      </div>
    </div>
  )
}

export const StageDistributionChart: React.FC<StageDistributionChartProps> = ({
  data,
  totalTokens = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const computedTotalTokens =
    totalTokens > 0
      ? totalTokens
      : data.reduce((acc, cur) => acc + cur.totalTokens, 0)

  const activeItem =
    activeIndex !== null && data[activeIndex] ? data[activeIndex] : null

  return (
    <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Stage Token Distribution</h2>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-medium bg-slate-800 text-slate-300">
            {data.length} Stages
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Proporsi konsumsi token per tahapan siklus orkestrasi (Intake, Implementation, Recovery, Retrospective).
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-lg bg-slate-950 border border-dashed border-slate-800 text-slate-500 text-xs">
          <PieChartIcon className="h-8 w-8 text-slate-600 mb-2 stroke-1" />
          <p>Belum ada data distribusi tahapan orkestrasi.</p>
          <p className="text-[11px] text-slate-600 mt-1">Jalankan proses task orkestrasi untuk merekam data per-stage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          {/* Donut Chart Canvas */}
          <div className="h-64 md:col-span-6 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="totalTokens"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {activeItem ? activeItem.name : "Total Stage Tokens"}
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {activeItem
                  ? activeItem.totalTokens.toLocaleString()
                  : computedTotalTokens.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {activeItem ? `${activeItem.percentage}% share` : "100% share"}
              </span>
            </div>
          </div>

          {/* Stage List Details */}
          <div className="md:col-span-6 space-y-2.5">
            {data.map((item, index) => (
              <div
                key={item.stageKey}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  activeIndex === index
                    ? "bg-slate-800/80 border-slate-600 scale-[1.01]"
                    : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {item.calls} calls
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-semibold text-white">
                      {item.totalTokens.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-[10px] ml-1">({item.percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar per stage */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(item.percentage, 2)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
