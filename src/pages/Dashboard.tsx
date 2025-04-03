import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useApp } from '../contexts/AppContext';
import { GET_CLUBS_BY_OWNER } from '../services/queries';
import ClubCard from '../components/ClubCard';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useApp();
  const client = useApolloClient();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalWins: 0,
    totalGoals: 0,
    divisions: {} as Record<string, number>,
  });

  useEffect(() => {
    const fetchAllClubs = async () => {
      if (state.wallets.length === 0) return;

      try {
        setIsLoading(true);
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Fetch clubs for all wallets
        const allClubsPromises = state.wallets.map(async (wallet) => {
          try {
            const { data } = await client.query({
              query: GET_CLUBS_BY_OWNER,
              variables: { address: wallet.address },
            });

            if (data.owners && data.owners.length > 0) {
              return data.owners[0].clubs.map((club: any) => ({
                ...club,
                tournaments: club.clubTournaments || [],
                currentTournament: club.clubTournaments && club.clubTournaments.length > 0 
                  ? club.clubTournaments[0] 
                  : null,
                stats: [],
                walletName: wallet.name, // Add wallet name for reference
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching clubs for wallet ${wallet.name}:`, error);
            return [];
          }
        });

        const clubsByWallet = await Promise.all(allClubsPromises);
        const allClubs = clubsByWallet.flat();
        
        dispatch({ type: 'SET_CLUBS', payload: allClubs });

        // Calculate stats
        const divisionMap: Record<string, number> = {};
        let wins = 0;
        let goals = 0;

        allClubs.forEach((club: any) => {
          // Count divisions
          if (club.currentTournament) {
            const division = club.currentTournament.tournament.name.split(' - ')[0];
            divisionMap[division] = (divisionMap[division] || 0) + 1;
          }

          // Aggregate stats
          if (club.stats && club.stats.length > 0) {
            wins += club.stats[0].wins || 0;
            goals += club.stats[0].goals || 0;
          }
        });

        setStats({
          totalClubs: allClubs.length,
          totalWins: wins,
          totalGoals: goals,
          divisions: divisionMap,
        });
      } catch (error) {
        console.error('Error fetching clubs:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to fetch clubs. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllClubs();
  }, [client, state.wallets, dispatch]);

  // Calculate total active wallets
  const activeWallets = state.wallets.length;

  return (
    <div className="container">
      <h1 className="section-header">Dashboard</h1>

      {/* Summary Stats */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3 className="summary-label">Total Clubs</h3>
          <p className="summary-value">{stats.totalClubs}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-label">Total Wins</h3>
          <p className="summary-value">{stats.totalWins}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-label">Total Goals</h3>
          <p className="summary-value">{stats.totalGoals}</p>
        </div>
        <div className="summary-card">
          <h3 className="summary-label">Active Wallets</h3>
          <p className="summary-value">{activeWallets}</p>
          <span 
            className="summary-wallet" 
            style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255,255,255,0.7)',
              marginTop: '0.5rem'
            }}
          >
            Managing all clubs across wallets
          </span>
        </div>
      </div>

      {/* Division Breakdown */}
      {Object.keys(stats.divisions).length > 0 && (
        <div className="mb-8">
          <h2 className="section-header">Divisions Breakdown</h2>
          <div className="division-grid">
            {Object.entries(stats.divisions)
              .sort(([divA], [divB]) => {
                // Extract division number for sorting
                const numA = parseInt(divA.replace('Division ', '')) || 0;
                const numB = parseInt(divB.replace('Division ', '')) || 0;
                return numA - numB;
              })
              .map(([division, count]) => (
                <div 
                  key={division} 
                  style={{
                    backgroundColor: 'var(--footium-blue)',
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3))',
                    borderRadius: '8px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <h3 style={{
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    margin: '0 0 0.75rem 0',
                    color: 'white'
                  }}>
                    {division}
                  </h3>
                  <p style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    margin: 0,
                    color: 'var(--footium-orange)'
                  }}>
                    {count}
                  </p>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Accessed Clubs */}
      <h2 className="section-header">Your Clubs</h2>
      {isLoading ? (
        <div className="text-center p-4">
          <p>Loading your clubs...</p>
        </div>
      ) : state.error ? (
        <div className="card p-4">
          <p className="text-center">{state.error}</p>
        </div>
      ) : (
        <>
          <div className="clubs-grid">
            {state.clubs.slice(0, 6).map((club) => (
              <Link to={`/club/${club.id}`} key={club.id} style={{ textDecoration: 'none' }}>
                <ClubCard club={club} />
              </Link>
            ))}
          </div>
          {state.clubs.length > 6 && (
            <div className="text-center mt-4">
              <Link to="/clubs" className="btn btn-secondary">
                View All {state.clubs.length} Clubs
              </Link>
            </div>
          )}
          {state.clubs.length === 0 && (
            <div className="card p-4">
              <p className="text-center">No clubs found for your wallets. Add wallets in Settings.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
