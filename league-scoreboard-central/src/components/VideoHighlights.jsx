import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import NewsFeed from "@/components/NewsFeed";

const mockHighlights = [
  {
    id: 1,
    title: "Manchester United vs Arsenal - Goal Highlights",
    homeTeam: "Manchester United",
    awayTeam: "Arsenal",
    duration: "3:45",
    date: "2024-03-15",
    views: "1.2M",
    thumbnail:
      "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=450&fit=crop&crop=center",
  },
  {
    id: 2,
    title: "Liverpool vs Chelsea - Best Moments",
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    duration: "4:12",
    date: "2024-03-14",
    views: "987K",
    thumbnail:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=450&fit=crop&crop=center",
  },
  {
    id: 3,
    title: "Manchester City vs Tottenham - Extended Highlights",
    homeTeam: "Manchester City",
    awayTeam: "Tottenham",
    duration: "5:23",
    date: "2024-03-13",
    views: "756K",
    thumbnail:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=450&fit=crop&crop=center",
  },
];

const VideoHighlights = () => {
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-br from-background via-muted/20 to-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Match
            </span>
            <span className="text-foreground">Highlights</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Watch the best moments from recent League matches
          </p>
        </div>

        {/* Split layout: 2 Highlights + News in one line on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
          {mockHighlights.slice(0, 2).map((highlight) => (
            <Card
              key={highlight.id}
              className="group  cursor-pointer overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_25px_-8px_hsl(var(--primary)_/_0.3)] bg-card/80 backdrop-blur-sm"
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={highlight.thumbnail}
                  alt={highlight.title}
                  className="w-full h-40 sm:h-44 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground fill-current" />
                  </div>
                </div>
                <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/70 text-white border-white/20 text-[10px] sm:text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {highlight.duration}
                </Badge>
              </div>

              {/* Card Header */}
              <CardHeader className="pb-1 sm:pb-2">
                <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
                  <img
                    src={getTeamLogo(highlight.homeTeam)}
                    alt={highlight.homeTeam}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  />
                  <span className="text-xs sm:text-sm font-medium">vs</span>
                  <img
                    src={getTeamLogo(highlight.awayTeam)}
                    alt={highlight.awayTeam}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg leading-snug text-center sm:text-left group-hover:text-primary transition-colors duration-300">
                  {highlight.title}
                </CardTitle>
              </CardHeader>

              {/* Card Footer */}
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-[11px] sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {new Date(highlight.date).toLocaleDateString()}
                  </div>
                  <span>{highlight.views} views</span>
                </div>
              </CardContent>
            </Card>
          ))}
          <div>
            <NewsFeed />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHighlights;
