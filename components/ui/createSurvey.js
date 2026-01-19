import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CreateSurvey = ({ onPress }) => (
  <TouchableOpacity style={styles.createSurveyCard} onPress={onPress}>
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      style={styles.createSurveyGradient}
    >
      <View style={styles.createSurveyContent}>
        <View style={styles.createSurveyIcon}>
          <Ionicons name="add-circle" size={32} color="#fff" />
        </View>
        <View style={styles.createSurveyText}>
          <Text style={styles.createSurveyTitle}>Yeni Anket Oluştur</Text>
          <Text style={styles.createSurveySubtitle}>Öğrenciler için anket hazırla</Text>
        </View>
        <View style={styles.createSurveyArrow}>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  createSurveyCard: {
    width: width - 40,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createSurveyGradient: {
    borderRadius: 16,
    padding: 20,
  },
  createSurveyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createSurveyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createSurveyText: {
    flex: 1,
  },
  createSurveyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  createSurveySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  createSurveyArrow: {
    marginLeft: 8,
  },
});

export default CreateSurvey;
