import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { starterPokemons, evolutionChains } from '@/data/pokemons';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function MyPokemonScreen() {
  const { state } = useGame();

  // Helper to get current and next evolution for a pokemon
  const getEvolutionInfo = (pokemonId: number) => {
    const chain = (evolutionChains as Record<number, any[]>)[pokemonId] || [];
    const evolutions = state.evolvedPokemons.filter(evo => evo.pokemonId === pokemonId);
    let currentStageIdx = 0;
    if (evolutions.length > 0) {
      // Find the index of the latest evolution in the chain
      const latestName = evolutions[evolutions.length - 1].to.name;
      currentStageIdx = chain.findIndex((e: any) => e.name === latestName);
      if (currentStageIdx === -1) currentStageIdx = 0;
    }
    const current = chain[currentStageIdx] || chain[0];
    const next = chain[currentStageIdx + 1] || null;
    return { current, next, stage: currentStageIdx + 1, maxStage: chain.length };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Pokémon</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/shop')}>
          <Text style={styles.shopButtonText}>Shop</Text>
        </TouchableOpacity>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>
            Points: {isNaN(Number(state.points)) ? 0 : state.points}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {starterPokemons.map(pokemon => {
          const { current, next, stage, maxStage } = getEvolutionInfo(pokemon.id);
          return (
            <View key={pokemon.id} style={styles.card}>
              <Image source={{ uri: current.imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{current.name}</Text>
                <Text style={styles.detail}>Stage: {stage} / {maxStage}</Text>
                <Text style={styles.detail}>Power: {stage * 10}</Text>
                {next ? (
                  <View style={styles.nextEvolution}>
                    <Text style={styles.nextLabel}>Next Evolution:</Text>
                    <Image source={{ uri: next.imageUrl }} style={styles.nextImage} />
                    <Text style={styles.nextName}>{next.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.maxed}>Max Evolution</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B4CCA',
    marginBottom: 4,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  nextEvolution: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  nextLabel: {
    fontSize: 15,
    color: '#888',
    marginRight: 6,
  },
  nextImage: {
    width: 40,
    height: 40,
    marginHorizontal: 6,
  },
  nextName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  maxed: {
    marginTop: 8,
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF9800',
    marginLeft: 'auto',
  },
  shopButtonText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#3B4CCA',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'center',
  },
  pointsBadgeText: {
    color: '#3B4CCA',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 