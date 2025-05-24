import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { router } from 'expo-router';
import { useGame } from '@/contexts/GameContext';
import PokemonCard from '@/components/PokemonCard';
import MultiplicationTask from '@/components/MultiplicationTask';
import { 
  generateMultiplicationTasks, 
  shuffleTasks,
  checkAnswer,
  getIncorrectTasks,
  areAllTasksCorrect
} from '@/utils/generateTasks';
import { MultiplicationTask as Task } from '@/types/pokemon';
import { ChevronLeft, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

export default function TableScreen() {
  const { state, dispatch } = useGame();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [remainingTasks, setRemainingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Animation values
  const progressWidth = useSharedValue(0);
  const successScale = useSharedValue(0);
  
  // Initialize tasks when component mounts or table changes
  useEffect(() => {
    if (!state.currentTable || !state.selectedPokemon) {
      router.replace('/choose');
      return;
    }

    const initialTasks = generateMultiplicationTasks(state.currentTable);
    const shuffledTasks = shuffleTasks(initialTasks);
    
    setTasks(shuffledTasks);
    setRemainingTasks(shuffledTasks);
    setCompletedTasks([]);
    setCurrentTaskIndex(0);
    progressWidth.value = 0;
    setShowSuccess(false);
    setIsNavigating(false);
  }, [state.currentTable, state.selectedPokemon]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Handle answer submission
  const handleAnswer = useCallback((task: Task, answer: number) => {
    if (isNavigating) return; // Prevent multiple submissions during navigation
    
    const checkedTask = checkAnswer(task, answer);
    
    // Update completed tasks
    if (checkedTask.isCorrect) {
      setCompletedTasks(prev => [...prev, checkedTask]);
      
      // Remove from remaining tasks
      const newRemainingTasks = remainingTasks.filter(t => t.id !== checkedTask.id);
      setRemainingTasks(newRemainingTasks);
      
      // Update progress animation
      const progressPercentage = (completedTasks.length + 1) / tasks.length;
      progressWidth.value = withTiming(progressPercentage, { duration: 300 });
      
      // Check if all tasks are completed
      if (newRemainingTasks.length === 0) {
        handleTableComplete();
      } else {
        // Move to next task
        setCurrentTaskIndex(0);
      }
    } else {
      // For incorrect answers, move the task to the end
      const updatedRemaining = remainingTasks.filter(t => t.id !== task.id);
      updatedRemaining.push(task);
      setRemainingTasks(updatedRemaining);
      setCurrentTaskIndex(0);
    }
  }, [tasks, remainingTasks, completedTasks, isNavigating]);

  // Handle table completion
  const handleTableComplete = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Show success animation
    setShowSuccess(true);
    successScale.value = withSequence(
      withTiming(1, { duration: 400 }),
      withSpring(1.1, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );

    // Award points for perfect or completed table
    const easyTables = [1, 2, 3, 10];
    const hardTables = [4, 5, 6, 7, 8, 9];
    const isPerfect = tasks.length > 0 && completedTasks.length === tasks.length && completedTasks.every(t => t.isCorrect);
    const completedTables = state.completedTablesByPokemon[state.selectedPokemon?.id || 0] || [];
    const isFirstTime = !completedTables.includes(state.currentTable as number);
    let earned = 0;

    if (isPerfect) {
      if (easyTables.includes(state.currentTable as number)) {
        earned = isFirstTime ? 10 : 3;
      } else if (hardTables.includes(state.currentTable as number)) {
        earned = isFirstTime ? 25 : 7;
      }
    } else {
      if (easyTables.includes(state.currentTable as number)) {
        earned = isFirstTime ? 3 : 1;
      } else if (hardTables.includes(state.currentTable as number)) {
        earned = isFirstTime ? 7 : 2;
      }
    }

    setPointsEarned(earned);
    if (earned > 0) {
      dispatch({ type: 'ADD_POINTS', payload: earned });
    }
    
    // Mark table as completed for this Pokémon
    dispatch({ 
      type: 'COMPLETE_TABLE', 
      payload: { pokemonId: state.selectedPokemon?.id ?? 0, table: state.currentTable as number }
    });
    
    // Navigate to evolution screen after delay, passing pointsEarned
    setTimeout(() => {
      router.push({ pathname: '/evolve', params: { points: earned } });
    }, 2000);
  }, [state.currentTable, isNavigating, tasks, completedTasks, dispatch, state.completedTablesByPokemon, state.selectedPokemon]);

  // Animation style for progress bar
  const progressAnimStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value * 100}%`,
    };
  });
  
  // Animation style for success message
  const successAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
      opacity: successScale.value,
    };
  });

  // Exit if no Pokémon or table selected
  if (!state.selectedPokemon || !state.currentTable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          disabled={isNavigating}
        >
          <ChevronLeft size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.tableTitle}>
          {state.currentTable}× Table
        </Text>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.replace('/choose')}
          disabled={isNavigating}
        >
          <X size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.pokemonContainer}>
          <PokemonCard 
            pokemon={state.selectedPokemon} 
            size="small"
          />
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Progress: {completedTasks.length}/{tasks.length}
          </Text>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, progressAnimStyle]} 
            />
          </View>
        </View>
        
        {remainingTasks.length > 0 && currentTaskIndex < remainingTasks.length && (
          <MultiplicationTask
            task={remainingTasks[currentTaskIndex]}
            onAnswer={handleAnswer}
          />
        )}
      </View>
      
      {showSuccess && (
        <Animated.View style={[styles.successContainer, successAnimStyle]}>
          <Text style={styles.successText}>Great Job!</Text>
          <Text style={styles.successSubtext}>
            You completed the {state.currentTable}× table!
          </Text>
          {pointsEarned > 0 && (
            <Text style={styles.pointsEarnedText}>You earned {pointsEarned} points!</Text>
          )}
        </Animated.View>
      )}
    </View>
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
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pokemonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#555',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  successText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  successSubtext: {
    fontSize: 20,
    color: '#333',
  },
  pointsEarnedText: {
    fontSize: 18,
    color: '#3B4CCA',
    fontWeight: 'bold',
    marginTop: 12,
  },
});