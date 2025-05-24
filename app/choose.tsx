import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import PokemonCard from '@/components/PokemonCard';
import TableCard from '@/components/TableCard';
import { fetchStarterPokemon } from '@/utils/fetchPokemon';
import { Pokemon } from '@/types/pokemon';
import { starterPokemons, availableTables } from '@/data/pokemons';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import shopPokemons from the shop file or define it here if not exported
const shopPokemons = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    name: `Pokemon #${id}`,
    imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    price: 100 + (id % 5) * 20, // Vary price a bit
  };
});

export default function ChooseScreen() {
  const { state, dispatch } = useGame();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'pokemon' | 'table'>(
    state.selectedPokemon ? 'table' : 'pokemon'
  );

  console.log('Evolved Pokemons:', state.evolvedPokemons);

  // Show all owned Pokémon (starter + shop)
  useEffect(() => {
    setLoading(true);
    // Get all owned Pokémon IDs
    const ownedIds = state.ownedPokemons ?? [];
    // Get Pokémon details from starterPokemons and shopPokemons
    const allPokemons = [...starterPokemons, ...shopPokemons];
    const ownedPokemons = allPokemons.filter(p => ownedIds.includes(p.id));
    setPokemons(ownedPokemons);
    setLoading(false);
  }, [state.ownedPokemons]);

  // Handle Pokémon selection
  const handleSelectPokemon = (pokemon: Pokemon) => {
    dispatch({ type: 'SELECT_POKEMON', payload: pokemon });
    setStep('table');
  };

  // Handle table selection
  const handleSelectTable = (table: number) => {
    dispatch({ type: 'SET_CURRENT_TABLE', payload: table });
    router.push('/table');
  };

  // Go back to Pokémon selection
  const handleBackToPokemon = () => {
    setStep('pokemon');
  };

  // Navigate to summary
  const handleGoToSummary = () => {
    router.push('/summary');
  };

  // Render a loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </View>
    );
  }

  const numColumns = Platform.OS === 'web' ? 4 : 2;

  return (
    <SafeAreaView style={styles.container}>
      {step === 'pokemon' ? (
        // Pokémon selection step
        <>
          <Text style={styles.title}>Choose Your Pokémon</Text>
          <Text style={styles.subtitle}>
            Select a Pokémon to start your multiplication training
          </Text>

          <FlatList
            data={pokemons}
            renderItem={({ item }) => (
              <PokemonCard
                pokemon={item}
                onSelect={() => handleSelectPokemon(item)}
                isSelected={state.selectedPokemon?.id === item.id}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            numColumns={Platform.OS === 'web' ? 3 : 2}
            key={numColumns}
            contentContainerStyle={styles.pokemonList}
          />
        </>
      ) : (
        // Table selection step
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToPokemon}
            >
              <ArrowLeft size={24} color="#333" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.summaryButton}
              onPress={handleGoToSummary}
            >
              <Text style={styles.summaryButtonText}>Progress</Text>
              <ArrowRight size={20} color="#4285F4" />
            </TouchableOpacity>
          </View>

          <View style={styles.pokemonPreview}>
            {state.selectedPokemon && (() => {
              // Find the latest evolution for the selected Pokémon
              const evolutions = state.evolvedPokemons.filter(
                evo => evo.pokemonId === state.selectedPokemon!.id
              );
              const latestEvolution = evolutions.length > 0 ? evolutions[evolutions.length - 1] : null;
              const displayPokemon = latestEvolution
                ? { ...state.selectedPokemon, name: latestEvolution.to.name, imageUrl: latestEvolution.to.imageUrl }
                : state.selectedPokemon;

              return (
                <PokemonCard 
                  pokemon={displayPokemon}
                  size="small"
                />
              );
            })()}
            <View style={styles.instructionContainer}>
              <Text style={styles.title}>Choose a Table</Text>
              <Text style={styles.subtitle}>
                Complete tables to help your Pokémon evolve!
              </Text>
            </View>
          </View>

          <FlatList
            data={availableTables}
            renderItem={({ item }) => (
              <TableCard
                table={item}
                isCompleted={state.completedTables.includes(item)}
                onSelect={handleSelectTable}
              />
            )}
            keyExtractor={(item) => item.toString()}
            numColumns={Platform.OS === 'web' ? 3 : 2}
            contentContainerStyle={styles.tableList}
          />
        </>
      )}
      {/* Bottom bar: Points and My Pokémon button aligned */}
      <View style={styles.bottomBar}>
        <View style={styles.ellipseButton}>
          <Text style={styles.ellipseButtonText}>Points: {isNaN(Number(state.points)) ? 0 : state.points}</Text>
        </View>
        <TouchableOpacity style={styles.ellipseButton} onPress={() => router.push('/mypokemon')}>
          <Text style={styles.ellipseButtonText}>My Pokémon</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  pokemonList: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  tableList: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#333',
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryButtonText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 4,
  },
  pokemonPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  instructionContainer: {
    flex: 1,
    marginLeft: 16,
  },
  ellipseButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B4CCA',
    height: 48,
    flex: 1,
    marginHorizontal: 6,
  },
  ellipseButtonText: {
    color: '#3B4CCA',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
});