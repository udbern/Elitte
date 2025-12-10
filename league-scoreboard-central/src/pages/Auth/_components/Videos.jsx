import { useEffect, useMemo, useState } from "react"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const VideosManager = ({ videos, setVideos }) => {
  const { toast } = useToast();

  const [newVideo, setNewVideo] = useState({
    title: "",
    thumbnail_url: "",
    description: "",
    platform: "",
    duration: "",
    published_at: "",
    team_id: "",
    fixture_id: "",
  });

  const [videoFile, setVideoFile] = useState(null);
  const [videoSort, setVideoSort] = useState("desc");
  const [sortBy, setSortBy] = useState("date");
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editVid, setEditVid] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
      // TODO: load teams & fixtures for video metadata
    };
    loadMeta();
  }, []);

  const addItem = async () => {
    if (!newVideo.title || !videoFile) {
      return toast({ title: "Error", description: "Title + video file required", variant: "destructive" });
    }

    const fileExt = videoFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // TODO: upload video to storage; not implemented
    const payload = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      title: newVideo.title,
      url: "",
      thumbnail_url: newVideo.thumbnail_url || null,
      description: newVideo.description || null,
      platform: "upload",
      duration: newVideo.duration || null,
      published_at: newVideo.published_at || null,
      team_id: newVideo.team_id || null,
      fixture_id: newVideo.fixture_id || null,
    };

    setVideos((prev) => [...prev, payload]);
    setNewVideo({ title: "", thumbnail_url: "", description: "", platform: "", duration: "", published_at: "", team_id: "", fixture_id: "" });
    setVideoFile(null);

    toast({ title: "✅ Video uploaded successfully" });
  };

  const deleteItem = async (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast({ title: "✅ Video deleted locally" });
  };

  const startEdit = (v) => {
    setEditingId(v.id);
    setEditVid({
      title: v.title || "",
      url: v.url || "",
      thumbnail_url: v.thumbnail_url || "",
      description: v.description || "",
      platform: v.platform || "",
      duration: v.duration || "",
      published_at: (v.published_at ? v.published_at.slice(0, 10) : ""),
      team_id: v.team_id || "",
      fixture_id: v.fixture_id || "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditVid(null); };

  const saveEdit = async () => {
    if (!editingId || !editVid.title) {
      return toast({ title: "Error", description: "Title required", variant: "destructive" });
    }

    const payload = { ...editVid };
    setVideos((prev) => prev.map((v) => (v.id === editingId ? { ...v, ...payload } : v)));
    cancelEdit();
    toast({ title: "✅ Video updated locally" });
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return videos.filter((v) => (v.title || "").toLowerCase().includes(term));
  }, [videos, search]);

  const sortedVideos = useMemo(() => {
    const dir = videoSort === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "") * dir;
      const ad = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bd = b.published_at ? new Date(b.published_at).getTime() : 0;
      return (ad - bd) * dir;
    });
  }, [filtered, sortBy, videoSort]);

  return (
    <Card className="glass-card shadow-md">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage Videos</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search videos..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Published date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setVideoSort(videoSort === "asc" ? "desc" : "asc")}>
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Upload Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2 items-end">
            <Input placeholder="Title" value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} />

            <Select value={newVideo.team_id} onValueChange={(val) => setNewVideo({ ...newVideo, team_id: val })}>
              <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} {t.short_name && `(${t.short_name})`}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={newVideo.fixture_id} onValueChange={(val) => setNewVideo({ ...newVideo, fixture_id: val })}>
              <SelectTrigger><SelectValue placeholder="Select fixture" /></SelectTrigger>
              <SelectContent>
                {fixtures.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.home_team?.name} vs {f.away_team?.name} — {new Date(f.match_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={newVideo.published_at} onChange={(e) => setNewVideo({ ...newVideo, published_at: e.target.value })} />

            <Input 
              type="file" 
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="sm:col-span-2"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={addItem}><Plus className="w-4 h-4" /> Add Video</Button>
          </div>
        </div>

        {/* Video List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {sortedVideos.map((video) => (
              <motion.div 
                key={video.id} 
                layout 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="p-4 glass-card rounded-xl border border-border/40 hover:border-primary/40 transition-colors"
              >
                {editingId === video.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Input placeholder="Title" value={editVid?.title || ""} onChange={(e) => setEditVid({ ...editVid, title: e.target.value })} />
                      <Input type="date" value={editVid?.published_at || ""} onChange={(e) => setEditVid({ ...editVid, published_at: e.target.value })} />
                      <Select value={editVid?.team_id || ""} onValueChange={(val) => setEditVid({ ...editVid, team_id: val })}>
                        <SelectTrigger><SelectValue placeholder="Team" /></SelectTrigger>
                        <SelectContent>
                          {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={editVid?.fixture_id || ""} onValueChange={(val) => setEditVid({ ...editVid, fixture_id: val })}>
                        <SelectTrigger><SelectValue placeholder="Fixture" /></SelectTrigger>
                        <SelectContent>
                          {fixtures.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.home_team?.name} vs {f.away_team?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Video URL" value={editVid?.url || ""} onChange={(e) => setEditVid({ ...editVid, url: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                      <Button variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{video.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Uploaded • {video.published_at ? new Date(video.published_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => startEdit(video)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteItem(video.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideosManager;
