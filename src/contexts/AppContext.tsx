import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState, Wallet } from '../types';

// Default wallets from the user's requirements
const DEFAULT_WALLETS: Wallet[] = [
  { address: '0x37a42e78a25539006ab038f17019f833b79516f9', name: 'foot-01' },
  { address: '0x2d2b91e478ea9f02f953779bdb2f52d18b589523', name: 'foot-02' },
  { address: '0xf7d4aee315cbc90ce8f8ee71adbc50806878f972', name: 'foot-03' },
  { address: '0xf791eea26f5addc07e434177f0e563712920715e', name: 'foot-04' },
  { address: '0x7e9eab5e9d38b3345f57326c96d0bd65a12b6994', name: 'Foot-05' },
  { address: '0x0A032289552D817C15C185dBfdf43B812423Ba82', name: 'debug' },
];

// Initial app state
const initialState: AppState = {
  wallets: DEFAULT_WALLETS,
  selectedWalletIndex: 0,
  clubs: [],
  isLoading: false,
  error: null,
};

// Action types
type ActionType =
  | { type: 'SET_WALLETS'; payload: Wallet[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'REMOVE_WALLET'; payload: number }
  | { type: 'SELECT_WALLET'; payload: number }
  | { type: 'SET_CLUBS'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer function
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    case 'ADD_WALLET':
      return { ...state, wallets: [...state.wallets, action.payload] };
    case 'REMOVE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter((_, index) => index !== action.payload),
        selectedWalletIndex:
          state.selectedWalletIndex >= action.payload
            ? Math.max(0, state.selectedWalletIndex - 1)
            : state.selectedWalletIndex,
      };
    case 'SELECT_WALLET':
      return { ...state, selectedWalletIndex: action.payload };
    case 'SET_CLUBS':
      return { ...state, clubs: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Create context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load wallets from localStorage on initialization
  React.useEffect(() => {
    const savedWallets = localStorage.getItem('footium_wallets');
    if (savedWallets) {
      try {
        const parsedWallets = JSON.parse(savedWallets);
        if (Array.isArray(parsedWallets) && parsedWallets.length > 0) {
          dispatch({ type: 'SET_WALLETS', payload: parsedWallets });
        }
      } catch (error) {
        console.error('Failed to parse wallets from localStorage', error);
      }
    }
  }, []);

  // Save wallets to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('footium_wallets', JSON.stringify(state.wallets));
  }, [state.wallets]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
