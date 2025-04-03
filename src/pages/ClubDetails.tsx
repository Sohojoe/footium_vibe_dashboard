import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useApp } from '../contexts/AppContext';
import { GET_CLUB_DETAILS } from '../services/queries';
import { ClubWithDetails } from '../types';

const ClubDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const client = useApolloClient();
  const [club, setClub] = useState<ClubWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        // First, check if the club is already in our state
        const existingClub = state.clubs.find(c => c.id === parseInt(id));
        if (existingClub) {
          setClub(existingClub);
        }

        // Fetch club details from API regardless to get the latest data
        const { data } = await client.query({
          query: GET_CLUB_DETAILS,
          variables: { 
            clubId: parseInt(id)
          },
          fetchPolicy: 'network-only' // Force fresh data
        });

        if (data.club) {
          // If we already had the club, merge the new data
          if (existingClub) {
            setClub({
              ...existingClub,
              stats: data.club.stats || [],
              currentTournament: data.club.clubTournaments && data.club.clubTournaments.length > 0 
                ? data.club.clubTournaments[0] 
                : existingClub.currentTournament,
              tournaments: data.club.clubTournaments || existingClub.tournaments || []
            });
          } else {
            // Otherwise create a new object with minimal data
            setClub({
              id: data.club.id,
              name: data.club.name,
              city: '', // These might be missing in the club details query
              ownerId: 0,
              pattern: '',
              colours: [],
              isInactive: false,
              stats: data.club.stats || [],
              tournaments: data.club.clubTournaments || [],
              currentTournament: data.club.clubTournaments && data.club.clubTournaments.length > 0 
                ? data.club.clubTournaments[0] 
                : null
            });
          }
        }
      } catch (error) {
        console.error('Error fetching club details:', error);
        setError('Failed to fetch club details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubDetails();
  }, [id, client, state.clubs]);

  // Get stats from season 8 only
  const season8Stats = club?.stats?.filter(
    (stat: any) => stat.clubTournament?.tournament?.seasonId === 8
  ) || [];
  
  // Get the latest season 8 stats
  const latestStats = season8Stats.length > 0 ? season8Stats[0] : null;

  // Creating gradient with club colors
  const colorGradient = club?.colours && club.colours.length >= 2 
    ? `linear-gradient(135deg, ${club.colours[0]}, ${club.colours[1]})`
    : 'linear-gradient(135deg, #293170, #FF7C34)';

  if (isLoading) {
    return (
      <div className="container">
        <div className="text-center p-4">
          <p>Loading club details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card p-4">
          <p className="text-center">{error}</p>
          <div className="text-center mt-4">
            <Link to="/clubs" className="btn btn-secondary">
              Back to Clubs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container">
        <div className="card p-4">
          <p className="text-center">Club not found.</p>
          <div className="text-center mt-4">
            <Link to="/clubs" className="btn btn-secondary">
              Back to Clubs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <Link to="/clubs" className="btn-link">
          &larr; Back to All Clubs
        </Link>
      </div>

      {/* Club header */}
      <div className="card mb-8" style={{ overflow: 'hidden' }}>
        <div style={{ 
          height: '120px', 
          background: colorGradient,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '1rem'
        }}>
          <div>
            <h1 className="section-header" style={{ margin: 0, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {club.name}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>{club.city}</p>
          </div>
        </div>
        
        <div className="card-body">
          {/* Basic Info */}
          <div className="mb-4">
            {club.walletName && (
              <div className="mb-2">
                <span className="text-muted">Wallet: </span>
                <span>{club.walletName}</span>
              </div>
            )}
            
            {club.currentTournament && (
              <div className="mb-2">
                <span className="text-muted">League: </span>
                <span>{club.currentTournament.tournament.name}</span>
              </div>
            )}
            
            {club.currentTournament && (
              <div className="mb-2">
                <span className="text-muted">Position: </span>
                <span>{club.currentTournament.position}</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          {latestStats && (
            <div>
              <h2 className="mb-4">Current Season Stats</h2>
              <div className="summary-grid">
                <div className="summary-card">
                  <h3 className="summary-label">Games</h3>
                  <p className="summary-value">{latestStats.games}</p>
                </div>
                <div className="summary-card">
                  <h3 className="summary-label">Record</h3>
                  <p className="summary-value">{latestStats.wins}W-{latestStats.draws}D-{latestStats.losses}L</p>
                </div>
                <div className="summary-card">
                  <h3 className="summary-label">Points</h3>
                  <p className="summary-value">{latestStats.points}</p>
                </div>
                <div className="summary-card">
                  <h3 className="summary-label">Goals</h3>
                  <p className="summary-value">{latestStats.goals} / {latestStats.goalsAgainst}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Club description if available */}
      {club.description && (
        <div className="card mb-8">
          <div className="card-body">
            <h2 className="mb-4">About</h2>
            <p>{club.description}</p>
          </div>
        </div>
      )}

      {/* League standings link */}
      {club.currentTournament && (
        <div className="text-center mt-4 mb-8">
          <Link to="/leagues" className="btn btn-primary">
            View League Standings
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClubDetails;
