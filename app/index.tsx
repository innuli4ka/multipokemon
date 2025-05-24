import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withDelay } from 'react-native-reanimated';
import { Play } from 'lucide-react-native';

export default function HomeScreen() {
  const { state, dispatch } = useGame();
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    // Start animations
    scale.value = withRepeat(
      withSequence(
        withDelay(500, withSpring(1.1, { damping: 2 })),
        withSpring(1, { damping: 2 })
      ),
      -1, // infinite repeat
      true // reverse
    );
    
    rotation.value = withRepeat(
      withSequence(
        withDelay(1000, withSpring(-0.05, { damping: 3 })),
        withSpring(0.05, { damping: 3 }),
        withSpring(0, { damping: 3 })
      ),
      -1, // infinite repeat
      false // don't reverse
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ],
    };
  });
  
  const handleStart = () => {
    // Navigate to choose screen
    router.replace('/choose');
  };
  
  const handleContinue = () => {
    // If there's a selected Pokémon, go to the table selection
    router.replace('/choose');
  };
  
  const handleReset = () => {
    // Reset the game state
    dispatch({ type: 'RESET_GAME' });
  };
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.titlePart1}>Pokémon</Text>
        <Text style={styles.titlePart2}>Multiplication</Text>
        <Image
          source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      
      <View style={styles.buttonContainer}>
        {state.selectedPokemon ? (
          <>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Play size={24} color="#fff" />
              <Text style={styles.buttonText}>Continue Training</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Game</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Play size={24} color="#fff" />
            <Text style={styles.buttonText}>Start Training</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Learn multiplication tables with your favorite Pokémon!
        </Text>
        <Text style={styles.footerSubtext}>
          Complete tables to evolve your Pokémon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  titlePart1: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B4CCA',
    textShadowColor: '#FFDE00',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    ...(Platform.OS === 'web' && {
      fontFamily: 'Pokemon-Solid, system-ui',
    }),
  },
  titlePart2: {
    fontSize: 28,
    color: '#FF0000',
    marginBottom: 20,
    fontWeight: 'bold',
    ...(Platform.OS === 'web' && {
      fontFamily: 'Pokemon-Hollow, system-ui',
    }),
  },
  logo: {
    width: 200,
    height: 200,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 40,
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 10,
  },
  resetButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});