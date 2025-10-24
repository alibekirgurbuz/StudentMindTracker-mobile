import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QuickAction = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <LinearGradient
      colors={[color + '20', color + '10']}
      style={styles.quickActionGradient}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
      <View style={[styles.quickActionIndicator, { backgroundColor: color }]} />
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quickAction: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickActionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default QuickAction;
