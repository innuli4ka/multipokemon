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

export default function ChooseScreen() {
  const { state, dispatch } = useGame();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'pokemon' | 'table'>(
    state.selectedPokemon ? 'table' : 'pokemon'
  );

  // Fetch Pokémon data on component mount
  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        const fetchedPokemon = await fetchStarterPokemon();
        
        if (fetchedPokemon.length > 0) {
          setPokemons(fetchedPokemon);
        } else {
          // Use fallback data if API fails
          setPokemons(starterPokemons);
        }
      } catch (error) {
        console.error('Error loading Pokémon:', error);
        // Use fallback data
        setPokemons(starterPokemons);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, []);

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

  return (
    <View style={styles.container}>
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
            numColumns={Platform.OS === 'web' ? 4 : 2}
            contentContainerStyle={styles.pokemonList}
          />

          {state.completedTables.length > 0 && (
            <TouchableOpacity 
              style={styles.summaryButton}
              onPress={handleGoToSummary}
            >
              <Text style={styles.summaryButtonText}>View Progress</Text>
            </TouchableOpacity>
          )}
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
            {state.selectedPokemon && (
              <PokemonCard 
                pokemon={state.selectedPokemon} 
                size="small"
              />
            )}
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
            numColumns={Platform.OS === 'web' ? 6 : 3}
            contentContainerStyle={styles.tableList}
          />
        </>
      )}
    </View>
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
});