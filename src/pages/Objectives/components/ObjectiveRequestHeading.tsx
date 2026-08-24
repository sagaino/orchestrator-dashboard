import React, { useState } from "react"
import type { ObjectiveRequestHeadingProps } from "../types"

export function requestSections(request: string): { title: string; details: string } {
  const normalized = request.trim().replace(/\s+/g, " ")
  const sentence = normalized.match(/^(.{1,180}?[.!?])(?:\s|$)/)?.[1]
  if (sentence) return { title: sentence, details: normalized.slice(sentence.length).trim() }
  if (normalized.length <= 150) return { title: normalized, details: "" }
  const boundary = normalized.slice(0, 150).lastIndexOf(" ")
  const titleEnd = boundary > 80 ? boundary : 150
  return { title: normalized.slice(0, titleEnd).trim(), details: normalized.slice(titleEnd).trim() }
}

export const ObjectiveRequestHeading: React.FC<ObjectiveRequestHeadingProps> = ({ request }) => {
  const [expanded, setExpanded] = useState(false)
  const { title, details } = requestSections(request)

  return (
    <div className="min-w-0">
      <h1 className="max-w-5xl break-words text-xl font-semibold leading-tight text-white sm:text-2xl">
        {title}
      </h1>
      {details && (
        <div className="mt-3 max-w-5xl">
          <p className={`text-sm leading-6 text-slate-400 ${expanded ? "" : "line-clamp-2"}`}>
            {details}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-1 text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200"
          >
            {expanded ? "Sembunyikan instruksi" : "Lihat instruksi lengkap"}
          </button>
        </div>
      )}
    </div>
  )
}
