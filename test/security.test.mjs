import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

console.log("Running dashboard security.test.mjs...")

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = path.join(root, "src")

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(absolute)
    return entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [absolute] : []
  })
}

const combinedSource = sourceFiles(sourceRoot)
  .map((filePath) => fs.readFileSync(filePath, "utf8"))
  .join("\n")

assert.equal(fs.existsSync(path.join(sourceRoot, "lib", "constant", "auth.ts")), false)
assert.doesNotMatch(combinedSource, /DEFAULT_API_TOKEN/)
assert.doesNotMatch(combinedSource, /VITE_ORCHESTRATOR_TOKEN/)
assert.doesNotMatch(combinedSource, /orchestrator_token/)
assert.doesNotMatch(combinedSource, /\/api\/events\?token=/)
assert.doesNotMatch(combinedSource, /Authorization\s*=\s*[`'"]Bearer/)
assert.doesNotMatch(combinedSource, /["'][0-9a-f]{64}["']/i)

const viteConfig = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8")
assert.match(viteConfig, /host:\s*["']127\.0\.0\.1["']/)
assert.match(viteConfig, /ORCHESTRATOR_RUNS/)
assert.match(viteConfig, /proxyRequest\.setHeader\(["']Authorization["']/)

console.log("dashboard security.test.mjs: All tests passed!")
