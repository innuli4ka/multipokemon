import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, FlatList } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

// Function to fetch Pokemon data
const fetchPokemonData = async (id: number) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return {
      id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1), // Capitalize first letter
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      price: 100 + (id % 5) * 20, // Vary price a bit
    };
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    return {
      id,
      name: `Pokemon #${id}`,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      price: 100 + (id % 5) * 20,
    };
  }
};

export default function ShopScreen() {
  const { state, dispatch } = useGame();
  const ownedIds = state.ownedPokemons ?? [];
  const points = isNaN(Number(state.points)) ? 0 : state.points;
  const [shopPokemons, setShopPokemons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPokemons = async () => {
      setLoading(true);
      const pokemons = await Promise.all(
        Array.from({ length: 50 }, (_, i) => fetchPokemonData(i + 1))
      );
      setShopPokemons(pokemons);
      setLoading(false);
    };
    loadPokemons();
  }, []);

  const handleBuy = (pokemon: any) => {
    if (points < pokemon.price) {
      Alert.alert('Not enough points', `You need ${pokemon.price} points to buy ${pokemon.name}.`);
      return;
    }
    if (ownedIds.includes(pokemon.id)) {
      Alert.alert('Already owned', `You already own ${pokemon.name}.`);
      return;
    }
    dispatch({ type: 'SPEND_POINTS', payload: pokemon.price });
    dispatch({ type: 'ADD_OWNED_POKEMON', payload: pokemon.id });
    Alert.alert('Purchased!', `You bought ${pokemon.name}!`);
  };

  const renderCard = ({ item: pokemon }: { item: any }) => {
    const owned = ownedIds.includes(pokemon.id);
    return (
      <View key={pokemon.id} style={styles.card}>
        <TouchableOpacity 
          onPress={() => router.push({
            pathname: '/pokemon-details',
            params: {
              id: pokemon.id,
              name: pokemon.name,
              imageUrl: pokemon.imageUrl,
              price: pokemon.price
            }
          })}
        >
          <Image source={{ uri: pokemon.imageUrl }} style={styles.image} />
        </TouchableOpacity>
        <Text style={styles.name}>{pokemon.name}</Text>
        <Text style={styles.price}>Price: {pokemon.price} points</Text>
        {owned ? (
          <Text style={styles.owned}>Owned</Text>
        ) : (
          <TouchableOpacity
            style={[styles.buyButton, points < pokemon.price && styles.disabledButton]}
            onPress={() => handleBuy(pokemon)}
            disabled={points < pokemon.price}
          >
            <Text style={styles.buyButtonText}>{points < pokemon.price ? 'Not enough points' : 'Buy'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Pokemon...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pokémon Shop</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsText}>Points: {points}</Text>
        </View>
      </View>
      {Platform.OS === 'web' ? (
        <ScrollView horizontal contentContainerStyle={styles.carousel} showsHorizontalScrollIndicator={false}>
          {shopPokemons.map(pokemon => renderCard({ item: pokemon }))}
        </ScrollView>
      ) : (
        <FlatList
          data={shopPokemons}
          renderItem={renderCard}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.verticalList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  pointsText: {
    color: '#3B4CCA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  verticalList: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  card: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3B4CCA',
    marginBottom: 4,
    textAlign: 'center',
  },
  price: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#4285F4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  owned: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
}); 