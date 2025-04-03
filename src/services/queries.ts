import { gql } from '@apollo/client';

// Query to get all clubs owned by a specific wallet address
export const GET_CLUBS_BY_OWNER = gql`
  query GetClubsByOwnerAddress($address: String!) {
    owners(where: { address: { equals: $address, mode: insensitive } }) {
      clubs {
        id
        name
        city
        description
        ownerId
        pattern
        colours
        isInactive
        clubTournaments {
          tournament {
            name
            type
            seasonId
          }
          position
        }
      }
    }
  }
`;

// Query to get detailed information about a specific club
export const GET_CLUB_DETAILS = gql`
  query GetClubDetails($clubId: Int!) {
    club(where: { id: $clubId }) {
      id
      name
      stats {
        games
        wins
        draws
        losses
        points
        goals
        goalsAgainst
        clubTournament {
          tournament {
            seasonId
          }
        }
      }
      clubTournaments {
        position
        tournament {
          name
          seasonId
        }
      }
    }
  }
`;

// Query to get all clubs in a specific division/league
export const GET_CLUBS_BY_TOURNAMENT = gql`
  query GetClubsByTournament($tournamentName: String!) {
    tournaments(where: { name: { equals: $tournamentName } }) {
      id
      name
      seasonId
      clubTournaments {
        position
        club {
          id
          name
          city
        }
      }
    }
  }
`;
