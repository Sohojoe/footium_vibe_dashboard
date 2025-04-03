import React from 'react';
import useLiveMatches from '../hooks/useLiveMatches';
import { useApp } from '../contexts/AppContext';

interface LiveMatchesProps {
  matchId?: string; // Optional prop to specify which match to display
}

const LiveMatches: React.FC<LiveMatchesProps> = ({ matchId = "1-7-0" }) => {
  const { liveMatch, isLoading, error } = useLiveMatches(matchId);
  const { state } = useApp();
  
  // Find club names from our existing club data
  const getClubName = (clubId: number) => {
    const club = state.clubs.find(c => c.id === clubId);
    return club ? club.name : `Club #${clubId}`;
  };
  
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p>Loading live match data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p>Error: {error}</p>
          <button className="btn btn-primary mt-2">Retry</button>
        </div>
      </div>
    );
  }
  
  if (!liveMatch) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p>No live match data available</p>
        </div>
      </div>
    );
  }
  
  const { homeClubId, awayClubId, homeScore, awayScore, homeClubScorers, awayClubScorers, matchTime } = liveMatch;
  
  return (
    <div className="card">
      <div className="card-body">
        <h3 className="section-header mb-4">Live Match</h3>
        
        <div className="match-score-container">
          <div className="match-teams">
            <div className="team home-team">
              <h4>{getClubName(homeClubId)}</h4>
              <div className="team-score">{homeScore}</div>
            </div>
            
            <div className="match-status">
              <span className="match-time">{matchTime}</span>
            </div>
            
            <div className="team away-team">
              <h4>{getClubName(awayClubId)}</h4>
              <div className="team-score">{awayScore}</div>
            </div>
          </div>
          
          <div className="scorers-container mt-4">
            <div className="home-scorers">
              {homeClubScorers.map((scorer, index) => (
                <div key={`home-${index}`} className="scorer">{scorer}</div>
              ))}
            </div>
            
            <div className="away-scorers">
              {awayClubScorers.map((scorer, index) => (
                <div key={`away-${index}`} className="scorer">{scorer}</div>
              ))}
            </div>
          </div>
          
          {/* Key Events Section */}
          <div className="key-events-container mt-4">
            <h5>Key Events</h5>
            <div className="events-timeline">
              {liveMatch.keyEvents.map((event, index) => {
                // Format timestamp to minutes
                const eventTime = new Date(event.timestamp);
                const matchStartTime = new Date(liveMatch.periodStates[0].startTimestamp);
                const minutesElapsed = Math.floor((eventTime.getTime() - matchStartTime.getTime()) / 60000);
                
                return (
                  <div key={index} className="event-item">
                    <span className="event-time">{minutesElapsed}'</span>
                    <span className="event-icon">
                      {event.type === 0 ? '⚽' : event.type === 2 ? '🟨' : '📝'}
                    </span>
                    <span className="event-team">{getClubName(event.clubId)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatches;
