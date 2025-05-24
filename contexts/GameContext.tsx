import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon, Evolution } from '@/types/pokemon';

// Define the game state type
interface GameState {
  selectedPokemon: Pokemon | null;
  completedTablesByPokemon: { [pokemonId: number]: number[] };
  currentTable: number | null;
  evolvedPokemons: Evolution[];
  isLoading: boolean;
  points: number;
  ownedPokemons: number[]; // store by id
}

// Define the actions for the reducer
type GameAction =
  | { type: 'SELECT_POKEMON'; payload: Pokemon }
  | { type: 'SET_CURRENT_TABLE'; payload: number }
  | { type: 'COMPLETE_TABLE'; payload: { pokemonId: number, table: number } }
  | { type: 'ADD_EVOLUTION'; payload: Evolution }
  | { type: 'RESET_GAME' }
  | { type: 'RESTORE_STATE'; payload: GameState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'SPEND_POINTS'; payload: number }
  | { type: 'ADD_OWNED_POKEMON'; payload: number };

// Initial state
const initialState: GameState = {
  selectedPokemon: null,
  completedTablesByPokemon: {},
  currentTable: null,
  evolvedPokemons: [],
  isLoading: true,
  points: 0,
  ownedPokemons: [1, 4, 7, 25, 133], // Give all starters by default
};

// Create the context
const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer function
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_POKEMON':
      return {
        ...state,
        selectedPokemon: action.payload,
      };
    case 'SET_CURRENT_TABLE':
      return {
        ...state,
        currentTable: action.payload,
      };
    case 'COMPLETE_TABLE': {
      const { pokemonId, table } = action.payload;
      const prev = state.completedTablesByPokemon[pokemonId] || [];
      return {
        ...state,
        completedTablesByPokemon: {
          ...state.completedTablesByPokemon,
          [pokemonId]: prev.includes(table) ? prev : [...prev, table],
        },
      };
    }
    case 'ADD_EVOLUTION':
      return {
        ...state,
        evolvedPokemons: [...state.evolvedPokemons, action.payload],
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'RESTORE_STATE':
      return {
        ...action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'ADD_POINTS':
      return {
        ...state,
        points: state.points + action.payload,
      };
    case 'SPEND_POINTS':
      return {
        ...state,
        points: Math.max(0, state.points - action.payload),
      };
    case 'ADD_OWNED_POKEMON':
      return {
        ...state,
        ownedPokemons: state.ownedPokemons.includes(action.payload)
          ? state.ownedPokemons
          : [...state.ownedPokemons, action.payload],
      };
    default:
      return state;
  }
};

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('gameState');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          // MIGRATION: Ensure completedTablesByPokemon is always an object
          if (!parsed.completedTablesByPokemon || typeof parsed.completedTablesByPokemon !== 'object') {
            parsed.completedTablesByPokemon = {};
          }
          dispatch({
            type: 'RESTORE_STATE',
            payload: parsed,
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      const saveState = async () => {
        try {
          await AsyncStorage.setItem('gameState', JSON.stringify(state));
        } catch (error) {
          console.error('Failed to save state:', error);
        }
      };

      saveState();
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);