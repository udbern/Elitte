import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { getTeamLogo } from "@/utils/teamLogos";
import { Link } from "react-router-dom";
import { useSeason } from "@/hooks/contexts/SeasonContext";
import { useCompetition } from "@/lib/CompetitionProvider";
import client from "@/lib/sanityClient";

const Teams = () => {
  const { selectedSeason } = useSeason();
  const { selectedCompetition } = useCompetition();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSeason?._id || !selectedCompetition?._id) {
      setTeams([]);
      return;
    }

    const fetchTeams = async () => {
      setLoading(true);
      try {
        // Fetch all teams that have played in fixtures for this season/competition
        const fixtures = await client.fetch(
          `*[_type == "fixture" 
            && season._ref == $seasonId 
            && competition._ref == $competitionId]{
            homeTeam->{_id, name, logo},
            awayTeam->{_id, name, logo}
          }`,
          {
            seasonId: selectedSeason._id,
            competitionId: selectedCompetition._id,
          }
        );

        // Extract unique teams
        const teamsMap = new Map();
        fixtures.forEach(fixture => {
          if (fixture.homeTeam) {
            teamsMap.set(fixture.homeTeam._id, {
              id: fixture.homeTeam._id,
              name: fixture.homeTeam.name,
              logo_url: fixture.homeTeam.logo,
            });
          }
          if (fixture.awayTeam) {
            teamsMap.set(fixture.awayTeam._id, {
              id: fixture.awayTeam._id,
              name: fixture.awayTeam.name,
              logo_url: fixture.awayTeam.logo,
            });
          }
        });

        const uniqueTeams = Array.from(teamsMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setTeams(uniqueTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedSeason, selectedCompetition]);

  const slugifyName = (name) => {
    return name.toLowerCase().replace(/\s+/g, "-");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">
            {teams.length} {teams.length === 1 ? "team" : "teams"}
          </p>
        </div>
        
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No teams found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <Link 
                key={team.id} 
                to={`/team/${slugifyName(team.name)}`}
                className="block"
              >
                <Card className="bg-elite-card border-border/50 hover:bg-muted/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <img 
                        src={team.logo_url || getTeamLogo(team.name)} 
                        alt={team.name}
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          e.target.src = getTeamLogo(team.name);
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-bold">{team.name}</h3>
                        {team.short_name && (
                          <p className="text-sm text-muted-foreground mt-1">{team.short_name}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;