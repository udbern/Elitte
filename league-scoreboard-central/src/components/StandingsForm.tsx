import { useEffect, useState } from "react";
import { fetchFixtures, calculateStandings, StandingRow } from "@/lib/standingsHelpers";
import { Link } from "react-router-dom";
import { getTeamLogo } from "@/utils/teamLogos";

interface Props {
  seasonId: string;
  competitionId: string;
}

export default function StandingsForm({ seasonId, competitionId }: Props) {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId || !competitionId) return;

    async function load() {
      setLoading(true);
      const fixtures = await fetchFixtures(seasonId, competitionId);
      const calculated = calculateStandings(fixtures);
      setStandings(calculated);
      setLoading(false);
    }

    load();
  }, [seasonId, competitionId]);

  if (loading)
    return <p className="text-center py-6 text-muted-foreground">Loading standings...</p>;
  if (!standings.length)
    return <p className="text-center py-6 text-muted-foreground">No completed fixtures yet.</p>;

  return (
    <div className="overflow-x-auto bg-elite-card rounded-lg border border-border/50">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_120px] text-xs uppercase text-muted-foreground font-semibold border-b border-border/50 px-2 py-2">
        <span className="text-center">Pos</span>
        <span>Team</span>
        <span className="text-center">Form</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-border/30">
        {standings.map((team) => (
          <Link
            key={team.team_id}
            to={`/team/${team.team_name.toLowerCase().replace(/\s+/g, "-")}`}
            className="grid grid-cols-[40px_1fr_120px] items-center p-2 hover:bg-muted/30 transition-colors rounded-lg"
          >
            {/* Position */}
            <span className="text-center font-bold text-primary">{team.position}</span>

            {/* Team Name + Logo */}
            <div className="flex items-center space-x-2 truncate">
              <img
                src={team.team_logo || getTeamLogo(team.team_name)}
                alt={team.team_name}
                className="w-6 h-6 object-contain rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getTeamLogo(team.team_name);
                }}
              />
              <span className="font-semibold truncate">{team.team_name}</span>
            </div>

            {/* Last 5 Form */}
            <div className="flex justify-center space-x-1">
              {(team.form_last5 || "").split("").map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs ${
                    res === "W" ? "bg-green-600" : res === "D" ? "bg-yellow-500" : "bg-red-600"
                  }`}
                >
                  {res}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
