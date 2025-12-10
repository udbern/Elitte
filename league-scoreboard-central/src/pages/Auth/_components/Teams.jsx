import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getTeamLogo } from "@/utils/teamLogos";

// Props: teams (array) and setTeams (setter) are provided from Admin.
const TeamsManager = ({ teams, setTeams }) => {
  const { toast } = useToast();

  // Unified modern field styling for inputs/selects
  const fieldClass = "h-11 rounded-lg bg-card/50 border-input/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-colors";

  // Create form
  const [newTeam, setNewTeam] = useState({ name: "", short_name: "", manager: "", logo_url: "" });
  const [newLogoFile, setNewLogoFile] = useState(null);
  const LOGOS_BUCKET = "team-logos";

  // Edit form
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeam, setEditTeam] = useState({ name: "", short_name: "", manager: "", logo_url: "" });
  const [editLogoFile, setEditLogoFile] = useState(null);

  // UI state
  const [teamSort, setTeamSort] = useState("asc");
  const [groupBy, setGroupBy] = useState("season"); // season | month | none
  const [search, setSearch] = useState("");

  // Auxiliary data
  const [seasons, setSeasons] = useState([]);
  const [seasonMap, setSeasonMap] = useState(new Map()); // teamId -> Set(seasonId)

  // Fetch seasons and team-season mapping from standings_by_season
  useEffect(() => {
    const loadMeta = async () => {
      // TODO: load seasons & standings_by_season from Appwrite if needed.
      setSeasons([]);
      const map = new Map();
      setSeasonMap(map);
    };
    loadMeta();
  }, []);

  // Actions
  const addTeam = async () => {
    if (!newTeam.name) return toast({ title: "Error", description: "Team name is required", variant: "destructive" });

    let logoUrl = newTeam.logo_url || null;
    if (newLogoFile) {
      // TODO: upload team logo to Appwrite storage; currently not wired.
    }

    const payload = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      name: newTeam.name,
      logo_url: logoUrl,
      short_name: newTeam.short_name || null,
      manager: newTeam.manager || null,
    };

    setTeams((prev) => [...prev, payload]);
    setNewTeam({ name: "", short_name: "", manager: "", logo_url: "" });
    setNewLogoFile(null);
    toast({ title: "Team added successfully" });
  };

  const startEdit = (team) => {
    setEditingTeamId(team.id);
    setEditTeam({ name: team.name || "", short_name: team.short_name || "", manager: team.manager || "", logo_url: team.logo_url || "" });
    setEditLogoFile(null);
  };

  const cancelEdit = () => {
    setEditingTeamId(null);
    setEditTeam({ name: "", short_name: "", manager: "", logo_url: "" });
  };

  const saveEdit = async () => {
    if (!editingTeamId) return;

    let logoUrl = editTeam.logo_url || null;
    if (editLogoFile) {
      // TODO: upload updated logo to Appwrite storage; currently not wired.
    }

    const payload = {
      name: editTeam.name,
      short_name: editTeam.short_name || null,
      manager: editTeam.manager || null,
      logo_url: logoUrl,
    };
    setTeams((prev) => prev.map((t) => (t.id === editingTeamId ? { ...t, ...payload } : t)));
    cancelEdit();
    toast({ title: "Team updated (local only)" });
  };

  const deleteTeam = async (id) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
    toast({ title: "Team deleted locally" });
  };

  const toggleSort = () => setTeamSort((s) => (s === "asc" ? "desc" : "asc"));

  // Derived data
  const filteredTeams = useMemo(() => {
    const list = Array.isArray(teams) ? teams : [];
    const byName = search.trim().toLowerCase();
    const filtered = byName ? list.filter((t) => t.name.toLowerCase().includes(byName)) : list;
    return [...filtered].sort((a, b) => (teamSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [teams, search, teamSort]);

  const teamsBySeason = useMemo(() => {
    // Build map seasonId -> array of teams
    const map = new Map();
    filteredTeams.forEach((t) => {
      const seasonsForTeam = seasonMap.get(t.id);
      if (!seasonsForTeam || seasonsForTeam.size === 0) {
        // Put in "Unassigned" bucket
        const key = "__unassigned__";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(t);
      } else {
        seasonsForTeam.forEach((sid) => {
          if (!map.has(sid)) map.set(sid, []);
          map.get(sid).push(t);
        });
      }
    });
    return map;
  }, [filteredTeams, seasonMap]);

  const teamsByMonth = useMemo(() => {
    // Group by created_at month (YYYY-MM)
    const map = new Map();
    filteredTeams.forEach((t) => {
      const d = t.created_at ? new Date(t.created_at) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    // Sort keys descending (newest first)
    return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  }, [filteredTeams]);

  // Render helpers
  const Section = ({ title, children }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );

  const TeamCard = ({ team }) => (
    <div className="p-4 glass-card rounded-xl border border-border/40 hover:border-primary/40 transition-colors">
      {editingTeamId === team.id ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_1fr_1fr_auto_auto] items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={editTeam.name} onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Short</Label>
            <Input value={editTeam.short_name} onChange={(e) => setEditTeam({ ...editTeam, short_name: e.target.value.toUpperCase() })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Manager</Label>
            <Input value={editTeam.manager} onChange={(e) => setEditTeam({ ...editTeam, manager: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Logo URL</Label>
            <Input value={editTeam.logo_url} onChange={(e) => setEditTeam({ ...editTeam, logo_url: e.target.value })} className={fieldClass} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Logo File</Label>
            <Input type="file" accept="image/*" onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)} className={fieldClass} />
          </div>
          <Button variant="outline" onClick={saveEdit} title="Save">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={cancelEdit} title="Cancel">
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={team.logo_url || getTeamLogo(team.name)} alt={team.name} className="w-8 h-8 rounded" />
            <div>
              <div className="font-medium">{team.name}</div>
              {team.short_name && <div className="text-xs text-muted-foreground">{team.short_name}</div>}
              {team.manager && <div className="text-xs text-muted-foreground">Manager: {team.manager}</div>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => startEdit(team)} title="Edit">
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTeam(team.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Sections by grouping
  const renderContent = () => {
    if (groupBy === "season") {
      const entries = Array.from(teamsBySeason.entries());
      // Sort: active season first, then by created_at asc; "Unassigned" last
      const seasonMeta = new Map(seasons.map((s) => [s.id, s]));
      entries.sort((a, b) => {
        const [sa, ta] = a;
        const [sb, tb] = b;
        if (sa === "__unassigned__") return 1;
        if (sb === "__unassigned__") return -1;
        const A = seasonMeta.get(sa);
        const B = seasonMeta.get(sb);
        if (A?.is_active && !B?.is_active) return -1;
        if (!A?.is_active && B?.is_active) return 1;
        return (A?.created_at || "").localeCompare(B?.created_at || "");
      });

      return (
        <div className="space-y-8  p-3">
          {entries.map(([sid, list]) => {
            const s = seasons.find((x) => x.id === sid);
            const title = sid === "__unassigned__" ? "Unassigned" : `${s?.name ?? "Season"}`;
            return (
              <Section key={sid} title={title}>
                {list.map((t) => (
                  <TeamCard key={t.id} team={t} />
                ))}
              </Section>
            );
          })}
        </div>
      );
    }

    if (groupBy === "month") {
      const entries = Array.from(teamsByMonth.entries());
      return (
        <div className="space-y-8">
          {entries.map(([month, list]) => (
            <Section key={month} title={month}>
              {list.map((t) => (
                <TeamCard key={t.id} team={t} />
              ))}
            </Section>
          ))}
        </div>
      );
    }

    // none
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTeams.map((t) => (
          <TeamCard key={t.id} team={t} />
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card shadow-2xl ">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage Teams</CardTitle>
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:items-center sm:gap-2 sm:w-auto">
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full sm:w-48 ${fieldClass}`}
            />
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className={`w-full sm:w-40 ${fieldClass}`}>
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Group by Season</SelectItem>
                <SelectItem value="month">Group by Created Month</SelectItem>
                <SelectItem value="none">No Grouping</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={toggleSort} title="Toggle sort by name" className="w-full sm:w-auto">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {/* Create form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add New Team</h3>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Team Name</Label>
              <Input
                placeholder="Enter team name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Short Name</Label>
              <Input
                placeholder="e.g., MCI, ARS"
                value={newTeam.short_name}
                onChange={(e) => setNewTeam({ ...newTeam, short_name: e.target.value.toUpperCase() })}
                className={fieldClass}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Manager</Label>
              <Input
                placeholder="Team manager's name"
                value={newTeam.manager}
                onChange={(e) => setNewTeam({ ...newTeam, manager: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Logo URL (Optional)</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={newTeam.logo_url}
                onChange={(e) => setNewTeam({ ...newTeam, logo_url: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Logo (Optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setNewLogoFile(e.target.files?.[0] || null)} className={fieldClass} />
            </div>
          </div>
          <div className="flex  justify-end pt-2">
            <Button onClick={addTeam} className="w-full  sm:w-auto ">
              <Plus className="w-4 h-4 mr-2" /> Add Team
            </Button>
          </div>
        </div>

        {/* Listing */}
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default TeamsManager;
