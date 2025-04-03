import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useApp } from '../contexts/AppContext';
import { GET_CLUBS_BY_OWNER, GET_CLUB_DETAILS } from '../services/queries';
import ClubCard from '../components/ClubCard';
import { Link } from 'react-router-dom';

const Clubs: React.FC = () => {
  const { state, dispatch } = useApp();
  const client = useApolloClient();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
                walletName: wallet.name,
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
        
        // For each club, fetch detailed stats
        const clubsWithDetails = await Promise.all(
          allClubs.map(async (club: any) => {
            try {
              const { data: detailData } = await client.query({
                query: GET_CLUB_DETAILS,
                variables: { 
                  clubId: club.id
                },
              });
              
              // Filter stats and tournaments for season 8
              const season8Stats = detailData.club?.stats?.filter(
                (stat: any) => stat.clubTournament?.tournament?.seasonId === 8
              ) || [];
              
              const season8Tournaments = club.tournaments?.filter(
                (t: any) => t.tournament?.seasonId === 8
              ) || [];
              
              const currentTournament = season8Tournaments.length > 0 
                ? season8Tournaments[0] 
                : club.currentTournament;
              
              return {
                ...club,
                stats: season8Stats,
                tournaments: season8Tournaments,
                currentTournament: currentTournament
              };
            } catch (error) {
              console.error(`Failed to fetch details for club ${club.id}:`, error);
              return club;
            }
          })
        );

        dispatch({ type: 'SET_CLUBS', payload: clubsWithDetails });
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

  // Filter clubs based on division, search term, etc.
  const filteredClubs = state.clubs.filter((club) => {
    // Filter by search term
    if (searchTerm && !club.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by division
    if (filter !== 'all') {
      const division = club.currentTournament?.tournament.name.split(' - ')[0];
      return division === filter;
    }

    return true;
  });

  // Sort clubs
  const sortedClubs = [...filteredClubs].sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'division':
        const divA = a.currentTournament?.tournament.name || '';
        const divB = b.currentTournament?.tournament.name || '';
        return divA.localeCompare(divB);
      case 'position':
        const posA = a.currentTournament?.position || 999;
        const posB = b.currentTournament?.position || 999;
        return posA - posB;
      case 'points':
        const statsA = a.stats && a.stats.length > 0 ? a.stats[0].points : 0;
        const statsB = b.stats && b.stats.length > 0 ? b.stats[0].points : 0;
        return statsB - statsA; // Descending order
      case 'wallet':
        return (a.walletName || '').localeCompare(b.walletName || '');
      default:
        return 0;
    }
  });

  // Get unique divisions for filter dropdown
  const divisions = Array.from(
    new Set(
      state.clubs
        .map((club) => club.currentTournament?.tournament.name.split(' - ')[0])
        .filter(Boolean)
    )
  );

  return (
    <div className="container">
      <h1 className="section-header">All Clubs</h1>

      {/* Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by club name..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Division</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Divisions</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sort by</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="form-input"
              >
                <option value="name">Club Name</option>
                <option value="division">Division</option>
                <option value="position">Position</option>
                <option value="points">Points</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
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
          <div className="mb-4">
            Found {sortedClubs.length} {sortedClubs.length === 1 ? 'club' : 'clubs'}
          </div>
          <div className="clubs-grid">
            {sortedClubs.map((club) => (
              <Link to={`/club/${club.id}`} key={club.id} style={{ textDecoration: 'none' }}>
                <ClubCard club={club} />
              </Link>
            ))}
          </div>
          {sortedClubs.length === 0 && (
            <div className="card p-4">
              <p className="text-center">
                {searchTerm || filter !== 'all'
                  ? 'No clubs match your search criteria.'
                  : 'No clubs found for this wallet.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Clubs;
