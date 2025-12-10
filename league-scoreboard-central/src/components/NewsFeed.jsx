import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NewsFeed = ({ items = [] }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">News</h3>
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground">No news yet.</div>
      )}
      <div className="space-y-3">
        {items.map((n) => (
          <Card
            key={n.id}
            className="p-3 bg-card/80 border-border/50 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {n.thumbnail_url && (
                <img
                  src={n.thumbnail_url}
                  alt={n.title}
                  className="w-16 h-12 object-cover rounded"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{n.title}</p>
                  {n.category && (
                    <Badge variant="secondary" className="text-[10px]">
                      {n.category}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {n.summary || new Date(n.published_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
