import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowUpDown, Pencil, Check, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const LOGOS_BUCKET = "news-media"; // TODO: wire to Appwrite storage if needed

const NewsManager = ({ news, setNews }) => {
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    title: "",
    summary: "",
    content: "",
    media_type: "image", // image | video
    published_at: "",
    category: "",
  });
  const [mediaFile, setMediaFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    // TODO: ensure Appwrite bucket exists if you later move media there.
  }, []);

  const addNews = async () => {
    if (!newItem.title) return toast({ title: "Title required", variant: "destructive" });

    let media_url = null;
    let thumbnail_url = null;

    if (mediaFile) {
      // TODO: upload to Appwrite storage; for now we don't support file upload in this admin screen.
      toast({ title: "Upload not wired to Appwrite yet", variant: "destructive" });
      return;
    }

    const payload = {
      title: newItem.title,
      summary: newItem.summary || null,
      content: newItem.content || null,
      media_type: newItem.media_type,
      media_url,
      thumbnail_url,
      category: newItem.category || null,
      published_at: newItem.published_at || new Date().toISOString(),
      is_featured: false,
      id: crypto.randomUUID?.() ?? Date.now().toString(),
    };

    // No real backend write yet; just update local admin state.
    setNews((prev) => [...prev, payload]);
    setNewItem({ title: "", summary: "", content: "", media_type: "image", published_at: "", category: "" });
    setMediaFile(null);
    toast({ title: "News added" });
  };

  const startEdit = (n) => { setEditingId(n.id); setEditItem({ ...n, published_at: n.published_at?.slice(0,10) || "" }); };
  const cancelEdit = () => { setEditingId(null); setEditItem(null); };

  const saveEdit = async () => {
    if (!editingId) return;
    // Local-only update for now.
    setNews((prev) => prev.map((n) => (n.id === editingId ? { ...n, ...editItem } : n)));
    cancelEdit();
    toast({ title: "News updated (local only)" });
  };

  const deleteNews = async (id) => {
    // Local-only delete for now.
    setNews((prev) => prev.filter((n) => n.id !== id));
    toast({ title: "News deleted (local only)" });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return news.filter((n) => (n.title || "").toLowerCase().includes(q));
  }, [news, search]);
  const sorted = useMemo(() => {
    const d = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a,b) => ((new Date(a.published_at).getTime()||0) - (new Date(b.published_at).getTime()||0)) * d);
  }, [filtered, sortDir]);

  return (
    <Card className="glass-card shadow-md">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Manage News</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search news..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-56" />
            <Button variant="outline" onClick={()=>setSortDir(sortDir==='asc'?'desc':'asc')}><ArrowUpDown className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Create */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <Input placeholder="Title" value={newItem.title} onChange={(e)=>setNewItem({ ...newItem, title: e.target.value })} />
            <Input placeholder="Category (optional)" value={newItem.category} onChange={(e)=>setNewItem({ ...newItem, category: e.target.value })} />
            <Input placeholder="Summary (optional)" value={newItem.summary} onChange={(e)=>setNewItem({ ...newItem, summary: e.target.value })} />
            <Input type="date" value={newItem.published_at} onChange={(e)=>setNewItem({ ...newItem, published_at: e.target.value })} />
            <Select value={newItem.media_type} onValueChange={(v)=>setNewItem({ ...newItem, media_type: v })}>
              <SelectTrigger><SelectValue placeholder="Media type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image"><div className="flex items-center gap-2"><ImageIcon className="w-4 h-4"/>Image</div></SelectItem>
                <SelectItem value="video"><div className="flex items-center gap-2"><VideoIcon className="w-4 h-4"/>Video</div></SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Content (optional)" value={newItem.content} onChange={(e)=>setNewItem({ ...newItem, content: e.target.value })} className="md:col-span-2" />
            <Input type="file" accept={newItem.media_type==='image'?"image/*":"video/*"} onChange={(e)=>setMediaFile(e.target.files?.[0]||null)} className="md:col-span-2" />
          </div>
          <div className="flex justify-end"><Button onClick={addNews}><Plus className="w-4 h-4"/> Add News</Button></div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {sorted.map((n)=> (
              <motion.div key={n.id} layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="p-4 glass-card rounded-xl border border-border/40 hover:border-primary/40 transition-colors">
                {editingId === n.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                      <Input placeholder="Title" value={editItem?.title||""} onChange={(e)=>setEditItem({...editItem, title: e.target.value})} />
                      <Input placeholder="Category" value={editItem?.category||""} onChange={(e)=>setEditItem({...editItem, category: e.target.value})} />
                      <Input type="date" value={editItem?.published_at||""} onChange={(e)=>setEditItem({...editItem, published_at: e.target.value})} />
                      <Textarea placeholder="Summary" value={editItem?.summary||""} onChange={(e)=>setEditItem({...editItem, summary: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={saveEdit}><Check className="w-4 h-4"/></Button>
                      <Button variant="ghost" onClick={cancelEdit}><X className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">{n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={()=>startEdit(n)}><Pencil className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={()=>deleteNews(n.id)} className="text-destructive"><Trash2 className="w-4 h-4"/></Button>
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

export default NewsManager;
