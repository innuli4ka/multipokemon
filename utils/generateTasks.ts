import { MultiplicationTask } from '@/types/pokemon';

// Generate multiplication tasks for a specific table
export const generateMultiplicationTasks = (table: number): MultiplicationTask[] => {
  const tasks: MultiplicationTask[] = [];
  
  // Create tasks for the table (1 to 10)
  for (let i = 1; i <= 10; i++) {
    tasks.push({
      id: `${table}x${i}`,
      multiplicand: table,
      multiplier: i,
      answer: table * i,
    });
  }
  
  return tasks;
};

// Shuffle an array using Fisher-Yates algorithm
export const shuffleTasks = (tasks: MultiplicationTask[]): MultiplicationTask[] => {
  const shuffled = [...tasks];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Check if the user's answer is correct
export const checkAnswer = (
  task: MultiplicationTask, 
  userAnswer: number
): MultiplicationTask => {
  return {
    ...task,
    userAnswer,
    isCorrect: task.answer === userAnswer,
  };
};

// Filter tasks that were answered incorrectly
export const getIncorrectTasks = (
  tasks: MultiplicationTask[]
): MultiplicationTask[] => {
  return tasks.filter(task => task.isCorrect === false);
};

// Check if all tasks are completed correctly
export const areAllTasksCorrect = (tasks: MultiplicationTask[]): boolean => {
  return tasks.every(task => task.isCorrect === true);
};