const enabled = (value: unknown) => ["1", "true", "on"].includes(String(value ?? "0").trim().toLowerCase())

export const crossProjectEnabled = enabled(import.meta.env.VITE_ORCHESTRATOR_CROSS_PROJECT)

