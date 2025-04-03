import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useApp } from '../contexts/AppContext';
import { GET_CLUBS_BY_TOURNAMENT } from '../services/queries';

interface LeagueClub {
  id: number;
  name: string;
  city: string;
  position: number;
  isOwned: boolean;
}

interface League {
  name: string;
  clubs: LeagueClub[];
}

const Leagues: React.FC = () => {
  const { state } = useApp();
  const client = useApolloClient();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeagueData = async () => {
      if (state.clubs.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get unique leagues from user's clubs
        const uniqueLeagues = Array.from(
          new Set(
            state.clubs
              .map((club) => club.currentTournament?.tournament.name)
              .filter(Boolean) as string[]
          )
        );

        if (uniqueLeagues.length === 0) {
          setLeagues([]);
          return;
        }

        const leaguesData: League[] = [];

        for (const leagueName of uniqueLeagues) {
          try {
            const { data } = await client.query({
              query: GET_CLUBS_BY_TOURNAMENT,
              variables: { 
                tournamentName: leagueName
              },
              fetchPolicy: 'network-only' // Force fetch fresh data
            });

            // Filter for tournaments with seasonId 8
            const season8Tournaments = data.tournaments?.filter(
              (tournament: any) => tournament.seasonId === 8
            ) || [];

            if (season8Tournaments.length > 0) {
              const clubs: LeagueClub[] = season8Tournaments[0].clubTournaments.map((ct: any) => ({
                id: ct.club.id,
                name: ct.club.name,
                city: ct.club.city,
                position: ct.position,
                isOwned: state.clubs.some((ownedClub) => ownedClub.id === ct.club.id),
              }));

              // Sort clubs by position
              clubs.sort((a, b) => a.position - b.position);

              leaguesData.push({
                name: leagueName,
                clubs,
              });
            }
          } catch (error) {
            console.error(`Error fetching league data for ${leagueName}:`, error);
            // Continue with other leagues instead of stopping entirely
          }
        }

        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching league data:', error);
        setError('Failed to fetch league data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueData();
  }, [client, state.clubs]);

  return (
    <div className="container">
      <h1 className="section-header">Leagues</h1>

      {isLoading ? (
        <div className="text-center p-4">
          <p>Loading league data...</p>
        </div>
      ) : error ? (
        <div className="card p-4">
          <p className="text-center">{error}</p>
        </div>
      ) : leagues.length === 0 ? (
        <div className="card p-4">
          <p className="text-center">
            No league data available. Add wallets with clubs to see league standings.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {leagues.map((league) => (
            <div key={league.name} className="league-card">
              <div className="league-header">
                <h2 className="league-name">{league.name}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="league-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Club</th>
                      <th>City</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {league.clubs.map((club) => (
                      <tr 
                        key={club.id} 
                        className={club.isOwned ? 'your-club' : ''}
                      >
                        <td>{club.position}</td>
                        <td className="font-medium">{club.name}</td>
                        <td>{club.city}</td>
                        <td className="text-center">
                          {club.isOwned ? (
                            <span className="your-club-badge">
                              YOUR CLUB
                            </span>
                          ) : (
                            <span className="text-muted">Rival</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leagues;
