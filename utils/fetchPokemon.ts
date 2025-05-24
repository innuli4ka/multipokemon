import { Pokemon, PokemonSpecies, EvolutionChain } from '@/types/pokemon';

// Base URL for PokeAPI
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Function to fetch a list of starter Pokémon
export const fetchStarterPokemon = async (): Promise<Pokemon[]> => {
  try {
    // Starter Pokémon IDs (simplified for our app)
    const starterIds = [1, 4, 7, 25, 133]; // Bulbasaur, Charmander, Squirtle, Pikachu, Eevee

    const pokemonPromises = starterIds.map(async (id) => {
      const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
      const data = await response.json();
      
      // Get species data to access evolution chain
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();
      
      return {
        id: data.id,
        name: capitalizeFirstLetter(data.name),
        imageUrl: data.sprites.other['official-artwork'].front_default,
        evolutionChainUrl: speciesData.evolution_chain.url,
      };
    });

    return await Promise.all(pokemonPromises);
  } catch (error) {
    console.error('Error fetching starter Pokémon:', error);
    return [];
  }
};

// Function to get a Pokémon's evolution chain
export const fetchEvolutionChain = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
};

// Function to get Pokémon data by name
export const fetchPokemonByName = async (name: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon ${name}:`, error);
    return null;
  }
};

// Helper function to extract evolution stages from an evolution chain
export const extractEvolutionStages = async (evolutionChain: EvolutionChain): Promise<Pokemon[]> => {
  const stages: Pokemon[] = [];
  
  // Process the chain recursively
  const processChain = async (chain: any): Promise<void> => {
    if (!chain) return;
    
    // Get Pokémon data for this stage
    const pokemonName = chain.species.name;
    const pokemonData = await fetchPokemonByName(pokemonName);
    
    if (pokemonData) {
      stages.push({
        id: pokemonData.id,
        name: capitalizeFirstLetter(pokemonData.name),
        imageUrl: pokemonData.sprites.other['official-artwork'].front_default,
      });
    }
    
    // Process the next evolution if it exists
    if (chain.evolves_to && chain.evolves_to.length > 0) {
      await processChain(chain.evolves_to[0]);
    }
  };
  
  await processChain(evolutionChain.chain);
  return stages;
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}