import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getTeamLogo } from "@/utils/teamLogos";
import { useToast } from "@/hooks/use-toast";

const FixturesManager = ({ fixtures, setFixtures }) => {
  const { toast } = useToast();

  const fieldClass =
    "h-11 rounded-lg bg-card/50 border-input/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-colors";

  // Meta (local only)
  const [teams, setTeams] = useState([]);
  const [competitions, setCompetitions] = useState([]);

  // New fixture form
  const [newFixture, setNewFixture] = useState({
    home_team: "",
    away_team: "",
    date: "",
    time: "",
    venue: "",
    round: "",
    status: "scheduled",
    competition: "",
    group_name: "",
    home_score: "",
    away_score: "",
  });

  const [homeScorers, setHomeScorers] = useState([]);
  const [awayScorers, setAwayScorers] = useState([]);

  const [homeStats, setHomeStats] = useState({
    possession: "",
    shots: "",
    shotsOnTarget: "",
    corners: "",
    fouls: "",
    yellowCards: "",
    redCards: "",
    offsides: "",
    passes: "",
    successfulPass: "",
    freeKicks: "",
    crosses: "",
    interceptions: "",
    tackles: "",
    saves: "",
  });

  const [awayStats, setAwayStats] = useState({ ...homeStats });

  // Filtering / sorting / grouping
  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("status");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("asc");

  // Inline edit
  const [editingId, setEditingId] = useState(null);
  const [editFx, setEditFx] = useState(null);

  // Add fixture locally
  const addFixture = () => {
    if (!newFixture.home_team || !newFixture.away_team || !newFixture.date) {
      return toast({
        title: "Error",
        description: "Home, Away and Date are required",
        variant: "destructive",
      });
    }
    if (newFixture.home_team === newFixture.away_team) {
      return toast({
        title: "Error",
        description: "Home and Away teams must be different",
        variant: "destructive",
      });
    }

    const matchDateIso = new Date(
      `${newFixture.date}T${newFixture.time || "00:00"}:00`
    ).toISOString();

    const payload = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      ...newFixture,
      match_date: matchDateIso,
      home_goal_scorers: homeScorers.filter((s) => s.playerName && s.goals),
      away_goal_scorers: awayScorers.filter((s) => s.playerName && s.goals),
      home_team_stats: Object.fromEntries(
        Object.entries(homeStats).map(([k, v]) => [k, v === "" ? 0 : Number(v)])
      ),
      away_team_stats: Object.fromEntries(
        Object.entries(awayStats).map(([k, v]) => [k, v === "" ? 0 : Number(v)])
      ),
    };

    setFixtures((prev) => [...prev, payload]);
    setNewFixture({
      home_team: "",
      away_team: "",
      date: "",
      time: "",
      venue: "",
      round: "",
      status: "scheduled",
      competition: "",
      group_name: "",
      home_score: "",
      away_score: "",
    });
    setHomeScorers([]);
    setAwayScorers([]);
    setHomeStats({ ...homeStats, ...Object.fromEntries(Object.keys(homeStats).map(k => [k, ""])) });
    setAwayStats({ ...awayStats, ...Object.fromEntries(Object.keys(awayStats).map(k => [k, ""])) });
    toast({ title: "Fixture added successfully" });
  };

  const deleteFixture = (id) => {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
    toast({ title: "Fixture deleted locally" });
  };

  const updateFixtureStatus = (id, status) => {
    setFixtures((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    toast({ title: `Fixture marked as ${status} (local)` });
  };

  const startEdit = (fx) => {
    setEditingId(fx.id);
    const d = fx.match_date ? new Date(fx.match_date) : null;
    const yyyy = d ? d.toISOString().slice(0, 10) : "";
    const hhmm = d ? d.toISOString().slice(11, 16) : "";
    setEditFx({ ...fx, date: yyyy, time: hhmm });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFx(null);
  };

  const saveEdit = () => {
    if (!editingId || !editFx) return;
    if (!editFx.home_team || !editFx.away_team || !editFx.date) {
      return toast({
        title: "Error",
        description: "Home, Away and Date are required",
        variant: "destructive",
      });
    }
    if (editFx.home_team === editFx.away_team) {
      return toast({
        title: "Error",
        description: "Home and Away teams must be different",
        variant: "destructive",
      });
    }

    const matchDateIso = new Date(`${editFx.date}T${editFx.time || "00:00"}:00`).toISOString();
    setFixtures((prev) =>
      prev.map((f) =>
        f.id === editingId ? { ...f, ...editFx, match_date: matchDateIso } : f
      )
    );
    cancelEdit();
    toast({ title: "Fixture updated (local)" });
  };

  const filteredFixtures = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return fixtures;
    return fixtures.filter((f) => {
      const hn = f.home_team?.name?.toLowerCase() || "";
      const an = f.away_team?.name?.toLowerCase() || "";
      const rv = (f.round || "").toLowerCase();
      const sv = (f.status || "").toLowerCase();
      return hn.includes(term) || an.includes(term) || rv.includes(term) || sv.includes(term);
    });
  }, [fixtures, search]);

  const sortedFixtures = useMemo(() => {
    const list = [...filteredFixtures];
    const dir = sortDir === "asc" ? 1 : -1;
    const getDate = (x) => (x.match_date ? new Date(x.match_date).getTime() : 0);
    const getStr = (s) => (s || "").toString().toLowerCase();
    list.sort((a, b) => {
      switch (sortBy) {
        case "home": return getStr(a.home_team?.name) > getStr(b.home_team?.name) ? dir : -dir;
        case "away": return getStr(a.away_team?.name) > getStr(b.away_team?.name) ? dir : -dir;
        case "round": return ((parseInt(a.round) || 0) - (parseInt(b.round) || 0)) * dir;
        case "status": return getStr(a.status) > getStr(b.status) ? dir : -dir;
        case "date":
        default: return (getDate(a) - getDate(b)) * dir;
      }
    });
    return list;
  }, [filteredFixtures, sortBy, sortDir]);

  const grouped = useMemo(() => {
    const map = new Map();
    sortedFixtures.forEach((f) => {
      let key = groupBy === "status" ? f.status || "Unknown" : f.round || "No Round";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return map;
  }, [sortedFixtures, groupBy]);

  return (
    <Card className="glass-card shadow-2xl">
      {/* --- Header, Filters, Forms, Scores, Stats, Listing --- */}
      {/* UI code unchanged, same as your original version */}
    </Card>
  );
};

export default FixturesManager;
