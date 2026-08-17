import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./components/ui/tooltip";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "./components/ui/toast";
import I18nProvider from "./lib/i18n/i18nProvider";
import { EventsProvider } from "./providers/EventsProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <EventsProvider>
          <TooltipProvider>
            <Toaster>
              <RouterProvider router={router} />
            </Toaster>
          </TooltipProvider>
        </EventsProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}

export default App

