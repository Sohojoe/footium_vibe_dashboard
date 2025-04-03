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
    ? `linear-gradient(135deg, ${club.colours[0]}, ${club.colours[1]})`
    : 'linear-gradient(135deg, #293170, #FF7C34)'; // Default Footium colors

  return (
    <div className="card hover-effect">
      {/* Improved colorful header with the club name */}
      <div 
        style={{ 
          background: colorGradient,
          padding: '1rem',
          position: 'relative'
        }}
      >
        <h3 
          className="club-name" 
          style={{ 
            margin: 0, 
            color: 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            fontSize: '1.35rem'
          }}
        >
          {club.name}
        </h3>
        <p style={{ 
          margin: '0.25rem 0 0 0', 
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.9rem'
        }}>
          {club.city}
        </p>
      </div>

      <div className="card-body">
        {/* Tournament information with improved position badge */}
        {currentTournament && (
          <div 
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <span 
                style={{
                  color: 'var(--footium-orange)',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {currentTournament.tournament.name}
              </span>
            </div>
            <div 
              style={{
                backgroundColor: 'var(--footium-blue)',
                color: 'white',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              Position: {currentTournament.position}
            </div>
          </div>
        )}

        {/* Wallet name with better contrast */}
        {club.walletName && (
          <div 
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(41, 49, 112, 0.2)',
              borderRadius: '4px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Wallet:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{club.walletName}</span>
          </div>
        )}
        
        {/* Stats with improved readability */}
        {latestStats && (
          <div className="stats-grid">
            <div className="stat-item" style={{ backgroundColor: 'rgba(41, 49, 112, 0.25)' }}>
              <p className="stat-label" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>Record</p>
              <p className="stat-value">{latestStats.wins}W-{latestStats.draws}D-{latestStats.losses}L</p>
            </div>
            <div className="stat-item" style={{ backgroundColor: 'rgba(41, 49, 112, 0.25)' }}>
              <p className="stat-label" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>Points</p>
              <p className="stat-value" style={{ color: 'var(--footium-orange)' }}>{latestStats.points}</p>
            </div>
            <div className="stat-item" style={{ backgroundColor: 'rgba(41, 49, 112, 0.25)' }}>
              <p className="stat-label" style={{ color: 'var(--text-primary)', opacity: 0.8 }}>Goals</p>
              <p className="stat-value">{latestStats.goals} / {latestStats.goalsAgainst}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubCard;
