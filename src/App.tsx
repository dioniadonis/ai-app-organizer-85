
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlannerPage from "./pages/PlannerPage";
import ExpensesPage from "./pages/ExpensesPage";
import DailyTasksPage from "./pages/DailyTasksPage";
import NotFound from "./pages/NotFound";
import AccountPage from "./pages/AccountPage";
import { useIsMobile } from "./hooks/use-mobile";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className={`min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 ${
            isMobile ? 'p-2' : ''
          }`}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/daily-tasks" element={<DailyTasksPage />} />
              <Route path="/account" element={<AccountPage />} />
              {/* Link to the standalone daily tasks app */}
              <Route path="/daily-tasks-app" element={
                <div className="max-w-md mx-auto p-4">
                  <h1 className="text-xl font-bold mb-4">Daily Tasks App</h1>
                  <p className="mb-4">The Daily Tasks App is now available as a standalone application.</p>
                  <a 
                    href="/apps/daily-tasks/index.html" 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Daily Tasks App
                  </a>
                </div>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
