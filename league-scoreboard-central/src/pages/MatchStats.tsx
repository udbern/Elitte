import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, Target, Users } from "lucide-react";
import { getTeamLogo } from "@/utils/teamLogos";
import client, { urlFor } from "@/lib/sanityClient";

const MatchStats = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId) return;
      const data = await client.fetch(
        `*[_type=="fixture" && _id==$matchId][0]{
          _id,
          matchDate,
          status,
          venue,
          homeScore,
          awayScore,
          attendance,
          homeTeam->{name, logo},
          awayTeam->{name, logo},
          goalScorers[]{playerName, minute, team},
          homeTeamStats{possession, shots, shotsOnTarget, corners, fouls, yellowCards, redCards},
          awayTeamStats{possession, shots, shotsOnTarget, corners, fouls, yellowCards, redCards}
        }`,
        { matchId }
      );
      setMatch(data);
    };
    fetchMatch();
  }, [matchId]);

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match not found</h2>
          <Link to="/fixtures">
            <Button>Back to Fixtures</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = match.homeTeamStats && match.awayTeamStats ? {
    possession: { home: match.homeTeamStats.possession, away: match.awayTeamStats.possession },
    shots: { home: match.homeTeamStats.shots, away: match.awayTeamStats.shots },
    shotsOnTarget: { home: match.homeTeamStats.shotsOnTarget, away: match.awayTeamStats.shotsOnTarget },
    corners: { home: match.homeTeamStats.corners, away: match.awayTeamStats.corners },
    fouls: { home: match.homeTeamStats.fouls, away: match.awayTeamStats.fouls },
    yellowCards: { home: match.homeTeamStats.yellowCards, away: match.awayTeamStats.yellowCards },
    redCards: { home: match.homeTeamStats.redCards, away: match.awayTeamStats.redCards },
  } : {};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/fixtures">
          <Button variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Fixtures
          </Button>
        </Link>

        {/* Match Header */}
        <Card className="bg-elite-card border-border/50 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{match.status?.toUpperCase()}</Badge>
              <span className="text-sm text-muted-foreground">{match.venue}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="text-center flex-1">
                <img
                  src={match.homeTeam?.logo ? urlFor(match.homeTeam.logo).url() : getTeamLogo(match.homeTeam.name)}
                  alt={match.homeTeam.name}
                  className="w-16 h-16 mx-auto mb-2 rounded-full"
                />
                <p className="font-semibold">{match.homeTeam.name}</p>
              </div>

              {/* Score */}
              <div className="text-center px-8">
                <div className="text-4xl font-bold">
                  <span className="text-primary">{match.homeScore ?? 0}</span>
                  <span className="text-muted-foreground mx-4">-</span>
                  <span className="text-primary">{match.awayScore ?? 0}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : "TBD"}
                </p>
              </div>

              {/* Away Team */}
              <div className="text-center flex-1">
                <img
                  src={match.awayTeam?.logo ? urlFor(match.awayTeam.logo).url() : getTeamLogo(match.awayTeam.name)}
                  alt={match.awayTeam.name}
                  className="w-16 h-16 mx-auto mb-2 rounded-full"
                />
                <p className="font-semibold">{match.awayTeam.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Statistics */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Match Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats).map(([stat, values]: any) => (
                  <div key={stat} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{values.home}</span>
                      <span className="capitalize font-medium">{stat.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{values.away}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-l-full"
                        style={{ width: `${(values.home / (values.home + values.away)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Timeline */}
          <Card className="bg-elite-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {match.goalScorers?.map((goal: any, index: number) => {
                  const teamName = goal.team === match.homeTeam.name ? match.homeTeam.name : match.awayTeam.name;
                  const teamLogo = goal.team === match.homeTeam.name
                    ? (match.homeTeam.logo ? urlFor(match.homeTeam.logo).url() : getTeamLogo(teamName))
                    : (match.awayTeam.logo ? urlFor(match.awayTeam.logo).url() : getTeamLogo(teamName));

                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <Badge variant="outline" className="w-12 text-center">{goal.minute}′</Badge>
                      <div className="flex items-center space-x-2">
                        <img src={teamLogo} alt={teamName} className="w-6 h-6 rounded-full" />
                        <span className="font-medium">{goal.playerName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Match Info */}
        <Card className="bg-elite-card border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Match Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-semibold">{match.venue}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="font-semibold">{match.attendance?.toLocaleString() || "TBD"}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{match.matchDate ? new Date(match.matchDate).toLocaleDateString() : "TBD"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchStats;
