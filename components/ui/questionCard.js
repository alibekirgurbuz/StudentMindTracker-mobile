import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestionCard = ({ question, index, onUpdateQuestion, onUpdateOption, onRemoveQuestion, onAddOption, onRemoveOption, canRemove }) => (
  <View style={styles.questionCard}>
    <View style={styles.questionHeader}>
      <Text style={styles.questionNumber}>Soru {index + 1}</Text>
      {canRemove && (
        <TouchableOpacity 
          onPress={() => onRemoveQuestion(question.id)}
          style={styles.removeButton}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
    
    <TextInput
      style={styles.questionInput}
      placeholder="Sorunuzu yazın..."
      value={question.text}
      onChangeText={(text) => onUpdateQuestion(question.id, 'text', text)}
      multiline
    />

    <View style={styles.optionsSection}>
      <View style={styles.optionsHeader}>
        <Text style={styles.optionsTitle}>Seçenekler:</Text>
        <TouchableOpacity 
          onPress={() => onAddOption(question.id)}
          style={styles.addOptionButton}
        >
          <Ionicons name="add" size={16} color="#667eea" />
          <Text style={styles.addOptionText}>Seçenek Ekle</Text>
        </TouchableOpacity>
      </View>
      
      {question.options.map((option, optionIndex) => (
        <View key={optionIndex} style={styles.optionContainer}>
          <TextInput
            style={styles.optionInput}
            placeholder={`Seçenek ${optionIndex + 1}`}
            value={option}
            onChangeText={(text) => onUpdateOption(question.id, optionIndex, text)}
          />
          {question.options.length > 2 && (
            <TouchableOpacity 
              onPress={() => onRemoveOption(question.id, optionIndex)}
              style={styles.removeOptionButton}
            >
              <Ionicons name="close" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  removeButton: {
    padding: 4,
  },
  questionInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionsSection: {
    marginTop: 16,
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  addOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  removeOptionButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
});

export default QuestionCard;
