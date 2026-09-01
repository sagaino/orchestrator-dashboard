import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import { ThemeProvider } from "@/components/theme-provider"

// Suppress benign ResizeObserver timing warnings in browser/E2E environments
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (
      event.message?.includes("ResizeObserver loop completed with undelivered notifications") ||
      event.message?.includes("ResizeObserver loop limit exceeded")
    ) {
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
