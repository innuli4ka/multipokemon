import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Pokemon } from '@/types/pokemon';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect?: () => void;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const PokemonCard: React.FC<PokemonCardProps> = ({ 
  pokemon, 
  onSelect, 
  isSelected = false,
  size = 'medium' 
}) => {
  // Animation style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isSelected ? 1.05 : 1) },
      ],
    };
  });

  // Determine image size based on card size
  const getImageSize = () => {
    switch (size) {
      case 'small': return 80;
      case 'large': return 180;
      default: return 120;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onSelect}
      disabled={!onSelect}
      activeOpacity={0.8}
      style={styles.cardWrapper}
    >
      <Animated.View 
        style={[
          styles.card, 
          isSelected && styles.selectedCard,
          size === 'small' && styles.smallCard,
          size === 'large' && styles.largeCard,
          animatedStyle
        ]}
      >
        <Image 
          source={{ uri: pokemon.imageUrl }} 
          style={[styles.image, { width: getImageSize(), height: getImageSize() }]}
          resizeMode="contain"
        />
        <View style={styles.nameContainer}>
          <Text style={[
            styles.name, 
            size === 'small' && styles.smallText,
            size === 'large' && styles.largeText
          ]}>
            {pokemon.name}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    margin: 8,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: 160,
    height: 200,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'transform 0.2s',
    }),
  },
  smallCard: {
    width: 120,
    height: 150,
    padding: 8,
  },
  largeCard: {
    width: 240,
    height: 300,
    padding: 24,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#4d90fe',
    backgroundColor: '#f0f7ff',
  },
  image: {
    marginBottom: 12,
  },
  nameContainer: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: '80%',
    alignItems: 'center',
  },
  name: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 20,
  },
});

export default PokemonCard;