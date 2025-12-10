import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SeasonProvider, useSeason } from "@/hooks/contexts/SeasonContext";
import { CompetitionProvider } from "./lib/CompetitionProvider";

import Index from "./pages/Index";
import Standings from "./pages/Standings";
import Fixtures from "./pages/Fixtures";
import Teams from "./pages/Teams";
import Admin from "./pages/Auth/Admin";
import Auth from "./pages/Auth/Auth";
import MatchStats from "./pages/MatchStats";
import TeamDetails from "./pages/TeamDetails";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  const { selectedSeason } = useSeason();

  return (
    <Routes>
      {/* Use season _id as key to force remount when season changes */}
      <Route path="/" element={<Index key={selectedSeason?._id || "none"} />} />
      <Route
        path="/standings"
        element={<Standings key={selectedSeason?._id || "none"} />}
      />
      <Route
        path="/fixtures"
        element={<Fixtures key={selectedSeason?._id || "none"} />}
      />
      <Route
        path="/teams"
        element={<Teams key={selectedSeason?._id || "none"} />}
      />
      <Route path="/admin" element={<Admin />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/match/:matchId" element={<MatchStats />} />
      <Route path="/team/:teamName" element={<TeamDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="elite-league-theme">
    <AuthProvider>
      <SeasonProvider>
        <CompetitionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CompetitionProvider>
      </SeasonProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
