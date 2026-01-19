import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PADDING = 20;
const CARD_GAP = 10;
const CARDS_PER_ROW = 4;
const CARD_SIZE = (width - (PADDING * 2) - (CARD_GAP * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

// Kart sembolleri (8 çift = 16 kart)
const CARD_SYMBOLS = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍒', '🥝'];

const MemoryCard = ({ navigation }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showAllCards, setShowAllCards] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);

  // Oyunu başlat
  useEffect(() => {
    initializeGame();
  }, []);

  // Oyun başlangıcında tüm kartları göster
  useEffect(() => {
    if (showAllCards && gameStarted) {
      const timer = setTimeout(() => {
        setShowAllCards(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAllCards, gameStarted]);

  // Kartları karıştır ve oyunu başlat
  const initializeGame = () => {
    const shuffledCards = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
        fadeAnim: new Animated.Value(1), // Animasyon için
        scaleAnim: new Animated.Value(1), // Animasyon için
      }));

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setShowAllCards(true);
    setGameStarted(true);
  };

  // Kart tıklama işlemi
  const handleCardPress = (index) => {
    // Kontrol aşamasındaysa veya oyun henüz başlamadıysa tıklamayı engelle
    if (isChecking || showAllCards) return;

    const card = cards[index];

    // Zaten açık veya eşleşmiş kartlara tıklanmasını engelle
    if (card.isFlipped || card.isMatched || flippedIndices.includes(index)) return;

    // İki karttan fazla açılmasını engelle
    if (flippedIndices.length >= 2) return;

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // İki kart açıldıysa kontrol et
    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);

      const [firstIndex, secondIndex] = newFlippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      // Eşleşme kontrolü
      if (firstCard.symbol === secondCard.symbol) {
        // Eşleşti!
        setTimeout(() => {
          const newCards = [...cards];
          newCards[firstIndex].isMatched = true;
          newCards[secondIndex].isMatched = true;
          setCards(newCards);
          setMatchedPairs([...matchedPairs, firstCard.symbol]);

          // Eşleşen kartlar için kaybolma animasyonu
          Animated.parallel([
            Animated.timing(newCards[firstIndex].fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(newCards[secondIndex].fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(newCards[firstIndex].scaleAnim, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(newCards[secondIndex].scaleAnim, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();

          setFlippedIndices([]);
          setIsChecking(false);

          // Oyun bitti mi kontrol et
          if (matchedPairs.length + 1 === CARD_SYMBOLS.length) {
            setTimeout(() => {
              Alert.alert(
                '🎉 Tebrikler!',
                `Oyunu ${moves + 1} hamlede tamamladınız!`,
                [
                  { text: 'Tekrar Oyna', onPress: initializeGame },
                  { text: 'Çıkış', onPress: () => navigation.goBack() }
                ]
              );
            }, 800);
          }
        }, 600);
      } else {
        // Eşleşmedi
        setTimeout(() => {
          setFlippedIndices([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Kart render
  const renderCard = (card, index) => {
    const isFlipped = flippedIndices.includes(index) || card.isMatched || showAllCards;

    return (
      <Animated.View
        key={card.id}
        style={{
          opacity: card.fadeAnim,
          transform: [{ scale: card.scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.card,
            card.isMatched && styles.cardMatched,
          ]}
          onPress={() => handleCardPress(index)}
          disabled={isFlipped || card.isMatched || showAllCards}
          activeOpacity={0.7}
        >
          <View style={[styles.cardInner, isFlipped && styles.cardFlipped]}>
            {isFlipped ? (
              <Text style={styles.cardSymbol}>{card.symbol}</Text>
            ) : (
              <Ionicons name="help-outline" size={CARD_SIZE * 0.4} color="#49b66f" />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hafıza Kartı</Text>
            <TouchableOpacity
              onPress={initializeGame}
              style={styles.resetButton}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.content}>
        {/* Skorlar */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCard}>
            <Ionicons name="trophy-outline" size={24} color="#49b66f" />
            <Text style={styles.scoreLabel}>Hamle</Text>
            <Text style={styles.scoreValue}>{moves}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.scoreLabel}>Eşleşme</Text>
            <Text style={styles.scoreValue}>{matchedPairs.length}/{CARD_SYMBOLS.length}</Text>
          </View>
        </View>

        {/* Başlangıç mesajı */}
        {showAllCards && gameStarted && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Kartları ezberlemeye başla!</Text>
          </View>
        )}

        {/* Oyun tahtası */}
        <View style={styles.gameBoard}>
          {cards.map((card, index) => renderCard(card, index))}
        </View>

        {/* Oyun kuralları */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>📖 Nasıl Oynanır?</Text>
          <Text style={styles.rulesText}>
            • Oyun başında kartlar 2 saniye gösterilir{'\n'}
            • Aynı sembollü kartları eşleştirin{'\n'}
            • En az hamlede tamamlamaya çalışın
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  messageContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#49b66f',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: CARD_GAP / 2,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: CARD_GAP / 2,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardMatched: {
    backgroundColor: '#e8f5e9',
  },
  cardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardSymbol: {
    fontSize: CARD_SIZE * 0.5, // Kart boyutuna göre dinamik
  },
  rulesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default MemoryCard;

