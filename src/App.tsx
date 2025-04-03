import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './services/apollo';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import Settings from './pages/Settings';
import Leagues from './pages/Leagues';
import ClubDetails from './pages/ClubDetails';
import LiveMatches from './pages/LiveMatches';

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <AppProvider>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: 'white' }}>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clubs" element={<Clubs />} />
                <Route path="/club/:id" element={<ClubDetails />} />
                <Route path="/leagues" element={<Leagues />} />
                <Route path="/live" element={<LiveMatches />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AppProvider>
    </ApolloProvider>
  );
};

export default App;
