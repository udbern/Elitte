import { useEffect, useState } from "react";
import { fetchFixtures, calculateStandings, StandingRow } from "@/lib/standingsHelpers";
import { getTeamLogo } from "@/utils/teamLogos"; // fallback function

interface Props {
  seasonId: string;
  competitionId: string;
}

export default function StandingsTableShort({ seasonId, competitionId }: Props) {
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

  if (loading) return <p className="text-center py-6">Loading standings...</p>;
  if (!standings.length) return <p className="text-center py-6">No completed fixtures yet.</p>;

  return (
    <div className="overflow-x-auto bg-elite-card rounded-lg border border-border/50">
      <table className="min-w-full text-sm text-muted-foreground">
        <thead className="uppercase text-xs border-b border-border/50">
          <tr>
            <th className="p-2 text-center">Pos</th>
            <th className="p-2 text-left">Team</th>
            <th className="p-2 text-center">P</th>
            <th className="p-2 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(team => (
            <tr key={team.team_id} className="hover:bg-muted/30 transition-colors border-b border-border/30">
              <td className="p-2 text-center">{team.position}</td>
              <td className="p-2 flex items-center space-x-2">
                <img
                  src={team.team_logo || getTeamLogo(team.team_name)}
                  alt={team.team_name}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getTeamLogo(team.team_name);
                  }}
                />
                <span className="truncate">{team.team_name}</span>
              </td>
              <td className="p-2 text-center">{team.played}</td>
              <td className="p-2 text-center font-bold text-green-500">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
