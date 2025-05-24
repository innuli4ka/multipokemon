import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';

export default function PokemonDetailsScreen() {
  const { id, name, imageUrl, price } = useLocalSearchParams();
  const { state, dispatch } = useGame();
  const points = state.points || 0;
  const ownedIds = state.ownedPokemons ?? [];
  const owned = ownedIds.includes(Number(id));

  const handleBuy = () => {
    if (points < Number(price)) {
      Alert.alert('Not enough points', `You need ${price} points to buy ${name}.`);
      return;
    }
    if (owned) {
      Alert.alert('Already owned', `You already own ${name}.`);
      return;
    }
    dispatch({ type: 'SPEND_POINTS', payload: Number(price) });
    dispatch({ type: 'ADD_OWNED_POKEMON', payload: Number(id) });
    Alert.alert('Purchased!', `You bought ${name}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>Points: {points}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: imageUrl as string }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pokemon ID:</Text>
            <Text style={styles.detailValue}>#{id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{price} points</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About this Pokemon</Text>
            <Text style={styles.description}>
              This Pokemon is available in the shop for purchase. Once you buy it, 
              it will be added to your collection and you can use it for training.
            </Text>
          </View>

          {owned ? (
            <Text style={styles.owned}>Owned</Text>
          ) : (
            <TouchableOpacity
              style={[styles.buyButton, points < Number(price) && styles.disabledButton]}
              onPress={handleBuy}
              disabled={points < Number(price)}
            >
              <Text style={styles.buyButtonText}>
                {points < Number(price) ? 'Not enough points' : 'Buy'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 40,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#3B4CCA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pointsText: {
    color: '#3B4CCA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  pokemonImage: {
    width: '100%',
    height: 300,
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buyButton: {
    backgroundColor: '#4285F4',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  owned: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
}); 