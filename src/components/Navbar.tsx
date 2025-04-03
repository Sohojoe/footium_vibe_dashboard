import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Navbar: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value);
    dispatch({ type: 'SELECT_WALLET', payload: selectedIndex });
  };

  // Check if link is active
  const isActive = (path: string) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
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
          <Link to="/settings" className={isActive('/settings')}>
            Settings
          </Link>
          
          {state.wallets.length > 0 && (
            <select 
              value={state.selectedWalletIndex} 
              onChange={handleWalletChange}
              className="form-input"
              style={{ 
                width: 'auto', 
                marginLeft: '1rem', 
                background: 'rgba(0,0,0,0.3)',
                border: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                color: 'white',
                fontSize: '0.875rem'
              }}
            >
              {state.wallets.map((wallet, index) => (
                <option key={wallet.address} value={index}>
                  {wallet.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
