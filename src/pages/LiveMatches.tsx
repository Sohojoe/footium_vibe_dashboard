import React from 'react';
import LiveMatchesComponent from '../components/LiveMatches';

const LiveMatchesPage: React.FC = () => {
  return (
    <div>
      <h2 className="section-header">Live Matches</h2>
      <LiveMatchesComponent />
    </div>
  );
};

export default LiveMatchesPage;
