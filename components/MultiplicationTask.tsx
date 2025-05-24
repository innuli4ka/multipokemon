import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard,
  Platform
} from 'react-native';
import { MultiplicationTask as Task } from '@/types/pokemon';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

interface MultiplicationTaskProps {
  task: Task;
  onAnswer: (task: Task, answer: number) => void;
}

const MultiplicationTask: React.FC<MultiplicationTaskProps> = ({ task, onAnswer }) => {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Reset input when task changes
  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    
    // Slight delay to ensure UI is updated before focusing
    const timer = setTimeout(() => {
      if (Platform.OS !== 'web') {
        inputRef.current?.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [task]);
  
  const handleSubmit = () => {
    if (!answer.trim()) return;
    
    const numAnswer = parseInt(answer, 10);
    const isCorrect = numAnswer === task.answer;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      // Celebration animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
    } else {
      // Shake animation for incorrect
      shake.value = withSequence(
        withTiming(-10, { duration: 100, easing: Easing.bounce }),
        withTiming(10, { duration: 100, easing: Easing.bounce }),
        withTiming(-10, { duration: 100, easing: Easing.bounce }),
        withTiming(0, { duration: 100, easing: Easing.bounce })
      );
    }
    
    // Send answer to parent component
    onAnswer(task, numAnswer);
    
    // Clear input after submission
    setAnswer('');
    
    // Auto-focus after submission on native
    if (Platform.OS !== 'web') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: shake.value },
        { scale: scale.value }
      ]
    };
  });
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.taskContainer}>
        <Text style={styles.equation}>
          {task.multiplicand} × {task.multiplier} = ?
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={answer}
          onChangeText={setAnswer}
          keyboardType="number-pad"
          maxLength={3}
          placeholder="?"
          onSubmitEditing={handleSubmit}
          accessibilityLabel={`Enter result of ${task.multiplicand} multiplied by ${task.multiplier}`}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            feedback === 'correct' ? styles.correctButton : 
            feedback === 'incorrect' ? styles.incorrectButton : null
          ]}
          onPress={handleSubmit}
          disabled={!answer.trim()}
        >
          <Text style={styles.submitButtonText}>Check</Text>
        </TouchableOpacity>
      </View>
      
      {feedback && (
        <Text 
          style={[
            styles.feedbackText,
            feedback === 'correct' ? styles.correctText : styles.incorrectText
          ]}
        >
          {feedback === 'correct' 
            ? 'Correct! Great job!' 
            : `Try again! ${task.multiplicand} × ${task.multiplier} = ${task.answer}`}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  equation: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    marginRight: 10,
    width: 100,
    color: '#333',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#F44336',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
  },
  correctText: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  incorrectText: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
});

export default MultiplicationTask;