import React, { useState } from "react"
import {
  BookOpen,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  Code,
  Eye,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { CandidatePreviewModalProps } from "../types"

// Helper to determine suggested target path based on candidate type
const getSuggestedTargetPath = (type?: string, title?: string, candidatePath?: string): string => {
  const cleanType = (type || "concepts").toLowerCase()
  let folder = "concepts"
  if (cleanType.includes("pattern")) folder = "patterns"
  else if (cleanType.includes("snippet")) folder = "snippets"
  else if (cleanType.includes("decision") || cleanType.includes("adr")) folder = "decisions"
  else if (cleanType.includes("debug")) folder = "debugging"

  if (candidatePath) {
    const filename = candidatePath.split("/").pop() || ""
    if (filename) return `01-Knowledge/${folder}/${filename}`
  }

  const slug = (title || "new-knowledge")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  return `01-Knowledge/${folder}/${slug}.md`
}

// Helper to get type badge styles
const getTypeBadge = (type?: string) => {
  const t = (type || "concept").toLowerCase()
  switch (t) {
    case "pattern":
      return {
        label: "PATTERN",
        bg: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      }
    case "snippet":
      return {
        label: "SNIPPET",
        bg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      }
    case "decision":
      return {
        label: "DECISION",
        bg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      }
    case "debugging":
      return {
        label: "DEBUGGING",
        bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      }
    case "concept":
    default:
      return {
        label: "CONCEPT",
        bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      }
  }
}

// Markdown renderer for candidate preview
const RenderMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null)

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText)
    setCopiedCodeIndex(index)
    setTimeout(() => setCopiedCodeIndex(null), 2000)
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeBlockLang = ""
  let codeBlockLines: string[] = []
  let codeBlockCounter = 0
  let inFrontmatter = false
  const frontmatterLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Frontmatter parsing
    if (i === 0 && line.trim() === "---") {
      inFrontmatter = true
      continue
    }

    if (inFrontmatter) {
      if (line.trim() === "---") {
        inFrontmatter = false
        elements.push(
          <div
            key={`frontmatter-${i}`}
            className="p-3.5 mb-4 rounded-lg bg-slate-950/80 border border-slate-800/90 text-xs font-mono space-y-1.5 shadow-inner"
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Obsidian Frontmatter Metadata
            </div>
            {frontmatterLines.map((fmLine, idx) => {
              const colonIndex = fmLine.indexOf(":")
              if (colonIndex !== -1) {
                const key = fmLine.slice(0, colonIndex).trim()
                const value = fmLine.slice(colonIndex + 1).trim()
                return (
                  <div key={idx} className="flex gap-2">
                    <span className="text-indigo-300 font-semibold">{key}:</span>
                    <span className="text-slate-300 break-all">{value}</span>
                  </div>
                )
              }
              return (
                <div key={idx} className="text-slate-400">
                  {fmLine}
                </div>
              )
            })}
          </div>
        )
        continue
      }
      frontmatterLines.push(line)
      continue
    }

    // Code block parsing
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // close code block
        const codeText = codeBlockLines.join("\n")
        const currentIndex = codeBlockCounter++
        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-sm"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span>{codeBlockLang || "code"}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, currentIndex)}
                className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-slate-300 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        )
        inCodeBlock = false
        codeBlockLines = []
        codeBlockLang = ""
      } else {
        inCodeBlock = true
        codeBlockLang = line.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockLines.push(line)
      continue
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg font-bold text-white mt-4 mb-2 pb-1.5 border-b border-slate-800"
        >
          {line.replace("# ", "")}
        </h1>
      )
      continue
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          {line.replace("## ", "")}
        </h2>
      )
      continue
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-slate-200 mt-3 mb-1.5">
          {line.replace("### ", "")}
        </h3>
      )
      continue
    }

    // Blockquote & Alerts
    if (line.startsWith("> ")) {
      const bqText = line.replace("> ", "")
      const isAlert = bqText.startsWith("[!")
      elements.push(
        <div
          key={`bq-${i}`}
          className={`p-3 my-2 rounded-lg border text-xs leading-relaxed ${
            isAlert
              ? "bg-indigo-950/30 border-indigo-800/50 text-indigo-200"
              : "bg-slate-900/60 border-l-4 border-l-indigo-500 border-y-0 border-r-0 text-slate-300"
          }`}
        >
          {bqText}
        </div>
      )
      continue
    }

    // Bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const bulletText = line.trim().substring(2)
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 ml-2 my-1 text-xs text-slate-300">
          <span className="text-indigo-400 mt-1">•</span>
          <span>{renderInlineMarkdown(bulletText)}</span>
        </div>
      )
      continue
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 ml-2 my-1 text-xs text-slate-300">
          <span className="text-slate-500 font-mono text-[11px] mt-0.5">{numMatch[1]}.</span>
          <span>{renderInlineMarkdown(numMatch[2])}</span>
        </div>
      )
      continue
    }

    // Blank lines
    if (!line.trim()) {
      elements.push(<div key={`blank-${i}`} className="h-2" />)
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs text-slate-300 leading-relaxed my-1">
        {renderInlineMarkdown(line)}
      </p>
    )
  }

  return <div className="space-y-1">{elements}</div>
}

// Helper to render inline markdown like `code`, **bold**, [[wikilinks]]
function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex to match inline code, bold, and wikilinks
  const parts: React.ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Check wikilinks [[Target]]
    const wikiMatch = remaining.match(/\[\[(.*?)\]\]/)
    // Check inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Check bold **bold**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)

    const matches = [
      wikiMatch ? { type: "wiki", match: wikiMatch, index: wikiMatch.index! } : null,
      codeMatch ? { type: "code", match: codeMatch, index: codeMatch.index! } : null,
      boldMatch ? { type: "bold", match: boldMatch, index: boldMatch.index! } : null,
    ].filter(Boolean) as Array<{
      type: "wiki" | "code" | "bold"
      match: RegExpMatchArray
      index: number
    }>

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    // Find earliest match
    matches.sort((a, b) => a.index - b.index)
    const first = matches[0]

    // Push text before match
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index))
    }

    if (first.type === "wiki") {
      parts.push(
        <span
          key={`wiki-${keyIndex++}`}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono text-[11px]"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          {first.match[1]}
        </span>
      )
    } else if (first.type === "code") {
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60"
        >
          {first.match[1]}
        </code>
      )
    } else if (first.type === "bold") {
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-white">
          {first.match[1]}
        </strong>
      )
    }

    remaining = remaining.substring(first.index + first.match[0].length)
  }

  return <>{parts}</>
}

export const CandidatePreviewModal: React.FC<CandidatePreviewModalProps> = ({
  isOpen,
  candidate,
  actionLoading,
  onClose,
  onPromote,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<"preview" | "raw" | "provenance">("preview")
  const [copiedRaw, setCopiedRaw] = useState(false)

  if (!candidate) return null

  const suggestedTarget = getSuggestedTargetPath(
    candidate.type,
    candidate.title,
    candidate.candidatePath
  )
  const typeBadge = getTypeBadge(candidate.type)
  const confidencePercent =
    candidate.confidence !== null && candidate.confidence !== undefined
      ? Math.round(
          candidate.confidence > 1 ? candidate.confidence : candidate.confidence * 100
        )
      : null

  // Canonical Markdown content representation
  const markdownDocument =
    (candidate as { content?: string }).content ||
    `---
title: "${candidate.title}"
type: ${candidate.type || "concept"}
tags: [${candidate.type || "concept"}, candidate, knowledge]
created: ${candidate.createdAt ? candidate.createdAt.split("T")[0] : "2026-08-17"}
updated: ${candidate.createdAt ? candidate.createdAt.split("T")[0] : "2026-08-17"}
sources: ["${candidate.provenance || "03-Sources/runs/" + candidate.candidateId}"]
---

# ${candidate.title}

## Ringkasan & Konsep
${candidate.summary || "Tidak ada ringkasan deskripsi."}

## Struktur & Usulan Target
- **Candidate ID**: \`${candidate.candidateId}\`
- **File Lokasi**: \`${candidate.candidatePath}\`
- **Rekomendasi Wiki Path**: \`${suggestedTarget}\`
- **Confidence Score**: \`${confidencePercent !== null ? `${confidencePercent}%` : "N/A"}\`

## Panduan Implementasi & Evaluasi
Dokumen ini diusulkan oleh orchestrator sebagai candidate pengetahuan global yang dapat digunakan kembali lintas proyek. Lakukan review terhadap relevansi, konsistensi skema Obsidian Vault, dan keunikan konten sebelum melakukan tindakan \`Promote to Wiki\`.
`

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(markdownDocument)
    setCopiedRaw(true)
    setTimeout(() => setCopiedRaw(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-800/80 bg-slate-900/90 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-[280px]">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${typeBadge.bg}`}
                >
                  {typeBadge.label}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {candidate.candidateId}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-white leading-snug">
                {candidate.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-mono truncate max-w-xl">
                {candidate.candidatePath}
              </DialogDescription>
            </div>

            {/* Confidence metric indicator */}
            {confidencePercent !== null && (
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-right min-w-[130px]">
                <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  AI Confidence
                </div>
                <div className="text-base font-bold font-mono text-slate-100">
                  {confidencePercent}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {confidencePercent >= 90
                    ? "Memenuhi auto-promote"
                    : "Memerlukan human review"}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Path & Provenance Banner */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Target:</span>
              <code className="font-mono text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/50">
                {suggestedTarget}
              </code>
            </div>

            {candidate.provenance && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Asal:</span>
                <span className="font-mono text-slate-300">{candidate.provenance}</span>
              </div>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Pratinjau Markdown
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "raw"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                Raw Source
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("provenance")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "provenance"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Info className="h-3.5 w-3.5" />
                Provenance & Rincian
              </button>
            </div>

            {activeTab === "raw" && (
              <button
                type="button"
                onClick={handleCopyRaw}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedRaw ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin Markdown</span>
                  </>
                )}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Modal Body / Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "preview" && (
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <RenderMarkdown content={markdownDocument} />
            </div>
          )}

          {activeTab === "raw" && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {markdownDocument}
            </div>
          )}

          {activeTab === "provenance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    Candidate Metadata
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ID:</span>
                      <span className="font-mono text-slate-200">{candidate.candidateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipe Dokumen:</span>
                      <span className="font-mono text-indigo-300">{candidate.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Waktu Dibuat:</span>
                      <span className="font-mono text-slate-300">{candidate.createdAt || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Kelayakan:</span>
                      <span className="text-emerald-400 font-semibold">Siap Promosi</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                    Routing Target
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Layer Asal:</span>
                      <span className="font-mono text-amber-300">05-Knowledge-Candidates/</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Layer Tujuan:</span>
                      <span className="font-mono text-emerald-300">01-Knowledge/</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Path:</span>
                      <span className="font-mono text-slate-200">{suggestedTarget}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  Kriteria Promosi Schema Obsidian
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Berdasarkan skema Wiki Orchestrator, promosi knowledge dari Candidates ke 01-Knowledge/
                  akan memperbarui <code>index.md</code> dan mencatat riwayat transaksi di <code>wiki-log.md</code>.
                  Jika dokumen ditolak (Reject), artefak akan diarsipkan ke direktori riwayat.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Tutup Pratinjau
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onReject(candidate)}
              className="px-4 py-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Tolak (Reject)</span>
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onPromote(candidate)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center gap-1.5 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Promote to Wiki</span>
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
