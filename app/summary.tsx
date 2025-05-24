import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import PokemonCard from '@/components/PokemonCard';
import { availableTables } from '@/data/pokemons';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SummaryScreen() {
  const { state, dispatch } = useGame();

  // Calculate progress
  const totalTables = availableTables.length;
  const completedTables = state.completedTables.length;
  const progressPercentage = Math.round((completedTables / totalTables) * 100);

  // Format completion date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_GAME' });
    router.replace('/');
  };

  const handleBackToTables = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackToTables}
        >
          <ArrowLeft size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Your Progress</Text>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Pokemon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Pokémon</Text>
          
          {state.selectedPokemon ? (
            <View style={styles.pokemonContainer}>
              <PokemonCard 
                pokemon={state.selectedPokemon} 
                size="medium"
              />
              
              <View style={styles.statsContainer}>
                <Text style={styles.statTitle}>Completed Tables: {completedTables}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  <Text style={styles.progressText}>{progressPercentage}%</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No Pokémon selected yet.</Text>
          )}
        </View>

        {/* Completed Tables Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Tables</Text>
          
          {state.completedTables.length > 0 ? (
            <View style={styles.tablesGrid}>
              {availableTables.map((table) => (
                <View 
                  key={table}
                  style={[
                    styles.tableItem,
                    state.completedTables.includes(table) && styles.completedTableItem
                  ]}
                >
                  <Text 
                    style={[
                      styles.tableText,
                      state.completedTables.includes(table) && styles.completedTableText
                    ]}
                  >
                    {table}×
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tables completed yet.</Text>
          )}
        </View>

        {/* Evolution History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolution History</Text>
          
          {state.evolvedPokemons.length > 0 ? (
            <FlatList
              data={state.evolvedPokemons}
              keyExtractor={(item, index) => `evolution-${index}`}
              renderItem={({ item }) => (
                <View style={styles.evolutionItem}>
                  <View style={styles.evolutionPokemon}>
                    <Image 
                      source={{ uri: item.from.imageUrl }} 
                      style={styles.evolutionImage} 
                      resizeMode="contain"
                    />
                    <Text style={styles.evolutionName}>{item.from.name}</Text>
                  </View>
                  
                  <View style={styles.evolutionArrow}>
                    <Text style={styles.evolutionTable}>Table {item.tableCompleted}×</Text>
                    <Text style={styles.arrowText}>➔</Text>
                  </View>
                  
                  <View style={styles.evolutionPokemon}>
                    <Image 
                      source={{ uri: item.to.imageUrl }} 
                      style={styles.evolutionImage}
                      resizeMode="contain" 
                    />
                    <Text style={styles.evolutionName}>{item.to.name}</Text>
                  </View>
                </View>
              )}
              horizontal={false}
              scrollEnabled={false}
              style={styles.evolutionList}
            />
          ) : (
            <Text style={styles.emptyText}>No evolutions yet.</Text>
          )}
        </View>

        {/* Reset Game Button */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 16,
    marginLeft: 4,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  pokemonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statsContainer: {
    flex: 1,
    marginLeft: 16,
    minWidth: 200,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 24,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tableItem: {
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedTableItem: {
    backgroundColor: '#4CAF50',
  },
  tableText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  completedTableText: {
    color: '#fff',
  },
  evolutionList: {
    width: '100%',
  },
  evolutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  evolutionPokemon: {
    alignItems: 'center',
    width: '35%',
  },
  evolutionImage: {
    width: 80,
    height: 80,
  },
  evolutionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  evolutionArrow: {
    alignItems: 'center',
    width: '30%',
  },
  evolutionTable: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  arrowText: {
    fontSize: 24,
    color: '#4285F4',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  resetButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 20,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});