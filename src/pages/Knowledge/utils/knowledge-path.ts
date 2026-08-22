export const getSuggestedTargetPath = (type?: string, title?: string, candidatePath?: string): string => {
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
  const slug = (title || "new-knowledge").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  return `01-Knowledge/${folder}/${slug}.md`
}
