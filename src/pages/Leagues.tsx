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
            <div key={league.name} className="league-card" style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' }}>
              <div 
                className="league-header" 
                style={{ 
                  background: 'linear-gradient(135deg, #293170, #1a2048)',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '3px solid var(--footium-orange)'
                }}
              >
                <h2 
                  className="league-name" 
                  style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: '700' 
                  }}
                >
                  {league.name}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="league-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(41, 49, 112, 0.3)' }}>
                      <th style={{ width: '10%', padding: '0.85rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Pos</th>
                      <th style={{ width: '40%', padding: '0.85rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Club</th>
                      <th style={{ width: '30%', padding: '0.85rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>City</th>
                      <th style={{ width: '20%', padding: '0.85rem 1.25rem', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {league.clubs.map((club) => (
                      <tr 
                        key={club.id} 
                        style={{
                          backgroundColor: club.isOwned ? 'rgba(255, 124, 52, 0.15)' : 'transparent',
                          transition: 'background-color 0.2s ease',
                          borderTop: '1px solid var(--border-color)'
                        }}
                        className="league-table-row"
                      >
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: club.position <= 3 ? 'var(--footium-blue)' : 'rgba(0, 0, 0, 0.2)',
                            color: club.position <= 3 ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}>
                            {club.position}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>{club.name}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{club.city}</td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                          {club.isOwned ? (
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: 'var(--footium-orange)',
                              color: 'white',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.8rem',
                              letterSpacing: '0.5px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                            }}>
                              YOUR CLUB
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Rival</span>
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
