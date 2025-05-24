// Pokemon type definition
export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  evolutionChainUrl?: string;
}

// Evolution type definition
export interface Evolution {
  pokemonId: number;
  from: {
    name: string;
    imageUrl: string;
  };
  to: {
    name: string;
    imageUrl: string;
  };
  tableCompleted: number;
}

// MultiplicationTask type definition
export interface MultiplicationTask {
  id: string;
  multiplicand: number;
  multiplier: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

// PokemonSpecies type for API responses
export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
}

// EvolutionChain type for API responses
export interface EvolutionChain {
  id: number;
  chain: EvolutionChainLink;
}

export interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
}