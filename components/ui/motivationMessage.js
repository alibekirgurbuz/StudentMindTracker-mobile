import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MotivationMessage = () => {
  const motivationMessages = [
    "Bugün harika bir gün olacak! 🌟",
    "Her adım seni hedefine yaklaştırıyor! 💪",
    "Sen muhteşemsin, unutma! ✨",
    "Bugün yeni bir şeyler öğreneceksin! 📚",
    "Hayallerinin peşinden git! 🚀",
    "Sen başarabilirsin! 🎯",
    "Her gün yeni bir fırsat! 🌈",
    "Pozitif düşün, pozitif yaşa! 😊"
  ];

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * motivationMessages.length);
    return motivationMessages[randomIndex];
  };

  return (
    <LinearGradient
      colors={['#49b66f', '#1db4e2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="bulb-outline" size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Günün Motivasyon Sözü</Text>
          <Text style={styles.message}>{getRandomMessage()}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
});

export default MotivationMessage;
