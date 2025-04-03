export interface Wallet {
  address: string;
  name: string;
}

export interface Club {
  id: number;
  name: string;
  city: string;
  ownerId: number;
  pattern: string;
  colours: string[];
  isInactive: boolean;
  description?: string;
}

export interface Tournament {
  name: string;
  type: string;
}

export interface ClubTournament {
  tournament: Tournament;
  position: number;
}

export interface ClubStats {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goals: number;
  goalsAgainst: number;
}

export interface ClubWithDetails extends Club {
  tournaments: ClubTournament[];
  stats: ClubStats[];
  currentTournament?: ClubTournament;
  walletName?: string; // Add wallet name for tracking which wallet owns this club
}

export interface AppState {
  wallets: Wallet[];
  selectedWalletIndex: number;
  clubs: ClubWithDetails[];
  isLoading: boolean;
  error: string | null;
}

export interface LiveMatch {
  homeClubId: number;
  homeScore: number;
  awayClubId: number;
  awayScore: number;
  homeClubScorers: string[];
  awayClubScorers: string[];
  keyEvents: LiveMatchEvent[];
  timestamp: number;
  matchTime: string;
  periodStates: PeriodState[];
}

export interface LiveMatchEvent {
  type: number; // 0 for goal, 2 for card, etc.
  clubId: number;
  timestamp: number;
  scorerPlayerId?: string;
  assisterPlayerId?: string;
  card?: number; // 0 for yellow, 1 for red
  playerId?: string;
}

export interface PeriodState {
  period: number;
  isBreak: boolean;
  injuryTime: number;
  isInInjuryTime: boolean;
  startTimestamp: number;
}

export interface PlayerInfo {
  surname: string;
  fullName: string;
}
