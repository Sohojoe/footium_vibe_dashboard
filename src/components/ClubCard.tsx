import React from 'react';
import { ClubWithDetails } from '../types';

interface ClubCardProps {
  club: ClubWithDetails;
}

const ClubCard: React.FC<ClubCardProps> = ({ club }) => {
  // Get the current tournament (should be the first one in the tournaments array)
  const currentTournament = club.currentTournament || club.tournaments[0];
  
  // Get the latest stats (assuming it's the first one in the stats array)
  const latestStats = club.stats && club.stats.length > 0 ? club.stats[0] : null;

  // Create gradient background based on club colors
  const colorGradient = club.colours && club.colours.length >= 2 
    ? `linear-gradient(to right, ${club.colours[0]}, ${club.colours[1]})`
    : 'linear-gradient(to right, #293170, #FF7C34)'; // Default Footium colors

  return (
    <div className="card hover-effect">
      <div style={{ height: '8px', background: colorGradient }}></div>
      <div className="card-body">
        <h3 className="club-name">{club.name}</h3>
        <p className="club-city">{club.city}</p>
        
        {currentTournament && (
          <div className="tournament-info">
            <p>
              <span className="tournament-name">{currentTournament.tournament.name}</span>
              <span className="position-badge">Position: {currentTournament.position}</span>
            </p>
          </div>
        )}

        {club.walletName && (
          <div className="mb-2">
            <small className="text-muted">Wallet: {club.walletName}</small>
          </div>
        )}
        
        {latestStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-label">Record</p>
              <p className="stat-value">{latestStats.wins}W-{latestStats.draws}D-{latestStats.losses}L</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Points</p>
              <p className="stat-value">{latestStats.points}</p>
            </div>
            <div className="stat-item">
              <p className="stat-label">Goals</p>
              <p className="stat-value">{latestStats.goals} / {latestStats.goalsAgainst}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubCard;
