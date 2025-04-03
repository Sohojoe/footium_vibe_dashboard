import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useApolloClient } from '@apollo/client';

const Navbar: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const client = useApolloClient();
  
  // Check if link is active
  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  // Refresh all data
  const handleRefresh = () => {
    // Clear Apollo cache to force fresh data fetch
    client.clearStore().then(() => {
      // Trigger a re-fetch in the app context
      dispatch({ type: 'REFRESH_DATA' });
    });
  };

  return (
    <nav>
      <div className="container">
        <div>
          <Link to="/" className="logo">
            Footium Vibe
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>
            Dashboard
          </Link>
          <Link to="/clubs" className={isActive('/clubs')}>
            Clubs
          </Link>
          <Link to="/leagues" className={isActive('/leagues')}>
            Leagues
          </Link>
          <Link to="/live" className={isActive('/live')}>
            Live Matches
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            Settings
          </Link>
          
          <button 
            onClick={handleRefresh}
            className="refresh-button"
            title="Refresh all data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
