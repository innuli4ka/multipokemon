import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

interface TableCardProps {
  table: number;
  isCompleted: boolean;
  onSelect: (table: number) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, isCompleted, onSelect }) => {
  const handlePress = () => {
    onSelect(table);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompleted ? styles.completedCard : styles.incompleteCard
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.tableText}>{table}</Text>
      <Text style={styles.timesText}>×</Text>
      {isCompleted && (
        <View style={styles.completedBadge}>
          <CheckCircle size={24} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 90,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  incompleteCard: {
    backgroundColor: '#64B5F6',
  },
  completedCard: {
    backgroundColor: '#81C784',
  },
  tableText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  timesText: {
    fontSize: 24,
    color: '#fff',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  completedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default TableCard;