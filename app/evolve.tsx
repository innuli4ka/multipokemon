import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import { fetchEvolutionChain, fetchPokemonByName, extractEvolutionStages } from '@/utils/fetchPokemon';
import { evolutionChains } from '@/data/pokemons';
import { Pokemon, Evolution } from '@/types/pokemon';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';

export default function EvolveScreen() {
  const { state, dispatch } = useGame();
  const params = useLocalSearchParams();
  const points = params.points ? Number(params.points) : 0;
  const [loading, setLoading] = useState(true);
  const [evolutionStages, setEvolutionStages] = useState<Pokemon[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [nextStage, setNextStage] = useState(1);
  const [evolving, setEvolving] = useState(false);
  
  // Animation values
  const fromOpacity = useSharedValue(1);
  const toOpacity = useSharedValue(0);
  const scaleFrom = useSharedValue(1);
  const scaleTo = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  
  // Load evolution data
  useEffect(() => {
    const loadEvolutionChain = async () => {
      if (!state.selectedPokemon || !state.currentTable) {
        router.replace('/choose');
        return;
      }
      
      setLoading(true);
      
      try {
        // Try to fetch from API first
        if (state.selectedPokemon.evolutionChainUrl) {
          const evolutionChain = await fetchEvolutionChain(state.selectedPokemon.evolutionChainUrl);
          if (evolutionChain) {
            const stages = await extractEvolutionStages(evolutionChain);
            if (stages.length > 1) {
              setEvolutionStages(stages);
              setLoading(false);
              return;
            }
          }
        }
        
        // Use fallback data if API fails or no evolution chain available
        const fallbackChain = (evolutionChains as Record<number, any[]>)[state.selectedPokemon.id];
        if (fallbackChain) {
          setEvolutionStages(fallbackChain);
        }
      } catch (error) {
        console.error('Error loading evolution chain:', error);
        // Use fallback data
        const fallbackChain = (evolutionChains as Record<number, any[]>)[state.selectedPokemon.id];
        if (fallbackChain) {
          setEvolutionStages(fallbackChain);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadEvolutionChain();
  }, [state.selectedPokemon, state.currentTable]);
  
  // Start evolution animation when loaded
  useEffect(() => {
    if (!loading && evolutionStages.length > 1 && !evolving) {
      // Determine which stage to show based on completed tables
      const completedCount = state.completedTables.length;
      const maxStage = Math.min(completedCount, evolutionStages.length - 1);
      
      // If already at max evolution, show the final stage
      if (maxStage > 0) {
        setCurrentStage(maxStage - 1);
        setNextStage(maxStage);
        
        // Start evolution animation after a short delay
        setTimeout(() => startEvolution(), 1000);
      }
    }
  }, [loading, evolutionStages]);
  
  // Start the evolution animation
  const startEvolution = () => {
    setEvolving(true);
    
    // Animation sequence
    fromOpacity.value = withSequence(
      withTiming(1, { duration: 500 }),
      withDelay(1000, withTiming(0, { duration: 1000 }))
    );
    
    scaleFrom.value = withSequence(
      withTiming(1, { duration: 500 }),
      withDelay(1000, withTiming(1.2, { duration: 500 })),
      withTiming(0.8, { duration: 500 })
    );
    
    // Glow effect
    glowOpacity.value = withSequence(
      withDelay(1000, withTiming(0.8, { duration: 500 })),
      withTiming(0, { duration: 500 })
    );
    
    // Reveal the evolved form
    toOpacity.value = withSequence(
      withTiming(0, { duration: 1500 }),
      withTiming(1, { duration: 1000 })
    );
    
    scaleTo.value = withSequence(
      withTiming(0.5, { duration: 1500 }),
      withTiming(1, { duration: 1000 })
    );
    
    // Record the evolution
    if (evolutionStages[currentStage] && evolutionStages[nextStage]) {
      const evolution: Evolution = {
        pokemonId: state.selectedPokemon?.id || 0,
        from: {
          name: evolutionStages[currentStage].name,
          imageUrl: evolutionStages[currentStage].imageUrl
        },
        to: {
          name: evolutionStages[nextStage].name,
          imageUrl: evolutionStages[nextStage].imageUrl
        },
        tableCompleted: state.currentTable || 0
      };
      
      // Add to evolved Pokémon list
      dispatch({ type: 'ADD_EVOLUTION', payload: evolution });
    }
  };
  
  // Handle continue button press
  const handleContinue = () => {
    router.replace('/choose');
  };
  
  // Animation styles
  const fromStyles = useAnimatedStyle(() => {
    return {
      opacity: fromOpacity.value,
      transform: [{ scale: scaleFrom.value }],
    };
  });
  
  const toStyles = useAnimatedStyle(() => {
    return {
      opacity: toOpacity.value,
      transform: [{ scale: scaleTo.value }],
    };
  });
  
  const glowStyles = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });
  
  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Preparing evolution...</Text>
      </View>
    );
  }
  
  // No evolution available
  if (evolutionStages.length <= 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Evolution Available</Text>
        <Text style={styles.subtitle}>
          This Pokémon doesn't seem to have an evolution chain.
        </Text>
        
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {points > 0 && (
        <Text style={styles.pointsEarnedText}>You earned {points} points!</Text>
      )}
      <Text style={styles.title}>Your Pokémon is Evolving!</Text>
      <Text style={styles.subtitle}>
        You completed the {state.currentTable}× table!
      </Text>
      
      <View style={styles.evolutionContainer}>
        {/* From Pokémon */}
        <Animated.View style={[styles.pokemonContainer, fromStyles]}>
          <Image
            source={{ uri: evolutionStages[currentStage]?.imageUrl }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
          <Text style={styles.pokemonName}>{evolutionStages[currentStage]?.name}</Text>
        </Animated.View>
        
        {/* Glow effect */}
        <Animated.View style={[styles.glowEffect, glowStyles]} />
        
        {/* To Pokémon */}
        <Animated.View style={[styles.pokemonContainer, styles.evolvedContainer, toStyles]}>
          <Image
            source={{ uri: evolutionStages[nextStage]?.imageUrl }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
          <Text style={styles.pokemonName}>{evolutionStages[nextStage]?.name}</Text>
        </Animated.View>
      </View>
      
      <TouchableOpacity 
        style={[styles.continueButton, !evolving && styles.disabledButton]} 
        onPress={handleContinue}
        disabled={!evolving}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <ArrowRight size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  evolutionContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokemonContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolvedContainer: {
    zIndex: 5,
  },
  pokemonImage: {
    width: 200,
    height: 200,
  },
  pokemonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  glowEffect: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FFD700',
    zIndex: 1,
  },
  continueButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 40,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  pointsEarnedText: {
    fontSize: 18,
    color: '#3B4CCA',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});