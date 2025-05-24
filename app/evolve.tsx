import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import { fetchEvolutionChain, fetchPokemonByName, extractEvolutionStages } from '@/utils/fetchPokemon';
import { evolutionChains } from '@/data/pokemons';
import { Pokemon, Evolution } from '@/types/pokemon';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EvolveScreen() {
  const { state, dispatch } = useGame();
  const params = useLocalSearchParams();
  const points = params.points ? Number(params.points) : 0;
  const [loading, setLoading] = useState(true);
  const [evolutionStages, setEvolutionStages] = useState<Pokemon[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [nextStage, setNextStage] = useState(1);
  const [evolving, setEvolving] = useState(false);
  const [canEvolve, setCanEvolve] = useState(false);
  const [atMaxEvolution, setAtMaxEvolution] = useState(false);
  
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
  
  // Helper to get current and next evolution stage based on actual evolution history
  const getEvolutionInfo = () => {
    if (!state.selectedPokemon) return { currentStageIdx: 0, nextStageIdx: 1 };
    const evolutions = state.evolvedPokemons.filter(evo => evo.pokemonId === state.selectedPokemon!.id);
    let currentStageIdx = 0;
    if (evolutions.length > 0) {
      // Find the index of the latest evolution in the chain
      const latestName = evolutions[evolutions.length - 1].to.name;
      currentStageIdx = evolutionStages.findIndex((e) => e.name === latestName);
      if (currentStageIdx === -1) currentStageIdx = 0;
    }
    return { currentStageIdx, nextStageIdx: currentStageIdx + 1 };
  };

  // Determine if evolution is possible
  useEffect(() => {
    if (!loading && evolutionStages.length > 1) {
      const { currentStageIdx, nextStageIdx } = getEvolutionInfo();
      setAtMaxEvolution(currentStageIdx >= evolutionStages.length - 1);
      setCanEvolve(state.points >= 20 && currentStageIdx < evolutionStages.length - 1);
      setCurrentStage(currentStageIdx);
      setNextStage(nextStageIdx);
      if (currentStageIdx >= evolutionStages.length - 1) {
        setEvolving(false);
      }
    }
  }, [loading, evolutionStages, state.points, state.evolvedPokemons]);
  
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
    
    // Custom Eevee logic
    if (state.selectedPokemon?.id === 133) {
      // Get all possible evolutions (excluding Eevee itself)
      const possibleEvolutions = evolutionStages.slice(1);
      // Get already obtained evolutions for Eevee
      const obtained = state.evolvedPokemons
        .filter(evo => evo.pokemonId === 133)
        .map(evo => evo.to.name);
      // Find remaining evolutions
      const remaining = possibleEvolutions.filter(evo => !obtained.includes(evo.name));
      if (remaining.length === 0) {
        setAtMaxEvolution(true);
        setEvolving(false);
        return;
      }
      // Pick a random remaining evolution
      const nextEvo = remaining[Math.floor(Math.random() * remaining.length)];
      // Find current stage (Eevee or last evolved form)
      const evolutions = state.evolvedPokemons.filter(evo => evo.pokemonId === 133);
      let fromStage = evolutionStages[0];
      if (evolutions.length > 0) {
        const last = evolutions[evolutions.length - 1].to.name;
        fromStage = evolutionStages.find(e => e.name === last) || evolutionStages[0];
      }
      dispatch({ type: 'SPEND_POINTS', payload: 20 });
      const evolution: Evolution = {
        pokemonId: 133,
        from: {
          name: fromStage.name,
          imageUrl: fromStage.imageUrl
        },
        to: {
          name: nextEvo.name,
          imageUrl: nextEvo.imageUrl
        },
        tableCompleted: state.currentTable || 0
      };
      dispatch({ type: 'ADD_EVOLUTION', payload: evolution });
      return;
    }

    // Default logic for other Pokémon
    if (evolutionStages[currentStage] && evolutionStages[nextStage]) {
      dispatch({ type: 'SPEND_POINTS', payload: 20 });
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
    <SafeAreaView style={styles.container}>
      {/* Congrats and points earned */}
      <Text style={styles.congratsText}>🎉 Congrats!</Text>
      {points > 0 && (
        <Text style={styles.pointsEarnedText}>
          <Text style={styles.star}>⭐</Text> You earned {points} points!
        </Text>
      )}
      <Text style={styles.totalPointsText}>Total Points: {state.points}</Text>
      <Text style={styles.evolveInfoText}>You need 20 points to evolve your Pokémon.</Text>
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
        {/* To Pokémon (only show if evolving and nextStage exists) */}
        {evolving && evolutionStages[nextStage] && !atMaxEvolution && (
          <Animated.View style={[styles.pokemonContainer, styles.evolvedContainer, toStyles]}>
            <Image
              source={{ uri: evolutionStages[nextStage]?.imageUrl }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
            <Text style={styles.pokemonName}>{evolutionStages[nextStage]?.name}</Text>
          </Animated.View>
        )}
        {/* At max evolution, show the current (final) Pokémon image and name statically */}
        {atMaxEvolution && (
          <View style={[styles.pokemonContainer, styles.evolvedContainer]}>
            <Image
              source={{ uri: evolutionStages[currentStage]?.imageUrl }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
            <Text style={styles.pokemonName}>{evolutionStages[currentStage]?.name}</Text>
          </View>
        )}
      </View>
      {/* Evolve Button and Info */}
      {!atMaxEvolution && (
        <>
          <TouchableOpacity
            style={styles.evolveButton}
            onPress={startEvolution}
            disabled={!canEvolve || evolving}
          >
            {/* Loader background */}
            <View style={styles.evolveButtonLoaderBg} />
            {/* Loader fill */}
            <View
              style={[
                styles.evolveButtonLoaderFill,
                { width: `${Math.min(state.points, 20) / 20 * 100}%` }
              ]}
            />
            {/* Button text (absolute, centered) */}
            <Text style={styles.evolveButtonText}>
              Evolve (20 points)
            </Text>
          </TouchableOpacity>
          {canEvolve ? (
            <Text style={styles.evolveCostText}>Evolving will cost you 20 points.</Text>
          ) : (
            <Text style={styles.evolveCostText}>
              {state.points < 20
                ? `You need ${20 - state.points} more points to evolve.`
                : 'You cannot evolve at this time.'}
            </Text>
          )}
        </>
      )}
      {atMaxEvolution && (
        <Text style={styles.maxedEvolutionText}>Max Evolution Reached</Text>
      )}
      <TouchableOpacity 
        style={[styles.continueButton, evolving && styles.disabledButton]} 
        onPress={handleContinue}
        disabled={evolving}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
        <ArrowRight size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
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
  star: {
    fontSize: 22,
    color: '#FFD700',
    marginRight: 6,
  },
  evolveButton: {
    backgroundColor: '#cccccc',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  evolveButtonLoaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#cccccc',
    borderRadius: 30,
  },
  evolveButtonLoaderFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    left: 0,
    zIndex: 1,
  },
  evolveButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
    zIndex: 2,
    textAlign: 'center',
  },
  maxedEvolutionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalPointsText: {
    fontSize: 16,
    color: '#3B4CCA',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  evolveInfoText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  evolveCostText: {
    fontSize: 15,
    color: '#FF9800',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
});