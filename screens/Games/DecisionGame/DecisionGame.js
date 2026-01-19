import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Oyun sabitleri
const CIRCLE_RADIUS = 140;
const LETTER_RADIUS = 120;
const MIN_WORD_LENGTH = 3;
const MAX_LETTERS = 6;

// Türkçe kelime listesi (en çok kullanılan 10 kelime)
const VALID_WORDS = [
  'ALİ',    // 3 harf - En yaygın
  'KAL',    // 3 harf - Yaygın
  'KİL',    // 3 harf - Yaygın
  'AKIL',   // 4 harf - Yaygın
  'KALE',   // 4 harf - Yaygın
  'LALE',   // 4 harf - Yaygın
  'KALEM',  // 5 harf - Yaygın
  'DEMİR',  // 5 harf - Yaygın (D, E, M, İ, R seti için)
  'BAL',    // 3 harf - Yaygın (B, A, L, İ, C, E seti için)
  'HAL',    // 3 harf - Yaygın (F, A, L, İ, H, E seti için)
].map(word => word.toUpperCase());

// Harf setleri (farklı zorluk seviyeleri)
const LETTER_SETS = [
  ['A', 'L', 'İ', 'K', 'E', 'M'], // Kolay
  ['B', 'A', 'L', 'İ', 'C', 'E'], // Orta
  ['D', 'E', 'M', 'İ', 'R', 'A'], // Zor
  ['F', 'A', 'L', 'İ', 'H', 'E'], // Çok Zor
];

const AnagramGame = ({ navigation }) => {
  // Oyun durumu
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLetters, setCurrentLetters] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  // Animasyonlar
  const [letterAnims] = useState(() =>
    Array(MAX_LETTERS).fill(0).map(() => new Animated.Value(1))
  );
  const pathAnim = useRef(new Animated.Value(0)).current;

  // PanResponder için ref'ler
  const panResponder = useRef(null);
  const gameAreaRef = useRef(null);
  const [gameAreaLayout, setGameAreaLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const circleCenter = useRef({ x: 0, y: 0 });
  const selectedIndicesRef = useRef([]);

  // GameArea layout'u güncellendiğinde merkezi hesapla
  useEffect(() => {
    if (gameAreaLayout.width > 0 && gameAreaLayout.height > 0) {
      circleCenter.current = {
        x: gameAreaLayout.width / 2,
        y: gameAreaLayout.height / 2,
      };
    }
  }, [gameAreaLayout]);

  // Harfleri çember üzerinde konumlandır
  const getLetterPosition = (index, total) => {
    if (circleCenter.current.x === 0 || circleCenter.current.y === 0) {
      return { x: 0, y: 0, angle: 0 };
    }
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Üstten başla
    return {
      x: circleCenter.current.x + LETTER_RADIUS * Math.cos(angle),
      y: circleCenter.current.y + LETTER_RADIUS * Math.sin(angle),
      angle,
    };
  };

  // Dokunulan harfi bul
  const findTouchedLetter = (x, y) => {
    const touchRadius = 45; // Harf dokunma alanı (artırıldı)
    for (let i = 0; i < currentLetters.length; i++) {
      const pos = getLetterPosition(i, currentLetters.length);
      const distance = Math.sqrt(
        Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
      );
      if (distance < touchRadius) {
        return i;
      }
    }
    return -1;
  };

  // PanResponder oluştur
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // GameArea içinde herhangi bir yere dokunulduğunda true döndür
        // Harf kontrolü onPanResponderGrant içinde yapılacak
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Eğer zaten bir harf seçildiyse veya harfe dokunulduysa true döndür
        if (selectedIndicesRef.current.length > 0) return true;
        const { locationX, locationY } = evt.nativeEvent;
        const index = findTouchedLetter(locationX, locationY);
        return index !== -1;
      },
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const index = findTouchedLetter(locationX, locationY);
        if (index !== -1) {
          selectedIndicesRef.current = [index];
          setSelectedIndices([index]);
          setSelectedPath([{ x: locationX, y: locationY }]);
          setCurrentWord(currentLetters[index]);

          // Harf seçim animasyonu
          Animated.sequence([
            Animated.timing(letterAnims[index], {
              toValue: 1.3,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(letterAnims[index], {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const index = findTouchedLetter(locationX, locationY);
        const currentSelected = selectedIndicesRef.current;

        // Sadece yeni bir harf seçildiyse ekle (tekrar ekleme sorununu önle)
        if (index !== -1 && !currentSelected.includes(index)) {
          // Yeni harf eklendi
          const newSelected = [...currentSelected, index];
          selectedIndicesRef.current = newSelected;
          setSelectedIndices(newSelected);
          setCurrentWord(prevWord => prevWord + currentLetters[index]);

          // Harf animasyonu
          Animated.sequence([
            Animated.timing(letterAnims[index], {
              toValue: 1.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(letterAnims[index], {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
        }

        // Sadece harf seçildiyse yolu güncelle (çizgi sorununu önle)
        if (currentSelected.length > 0) {
          setSelectedPath(prevPath => [...prevPath, { x: locationX, y: locationY }]);
        }
      },
      onPanResponderRelease: () => {
        // Kelime kontrolü
        const word = currentWord.toUpperCase();

        if (word.length < MIN_WORD_LENGTH) {
          // Çok kısa kelime
          selectedIndicesRef.current = [];
          setSelectedIndices([]);
          setSelectedPath([]);
          setCurrentWord('');
          return;
        }

        if (foundWords.includes(word)) {
          // Kelime zaten bulunmuş
          Alert.alert('Bilgi', `${word} kelimesi zaten bulundu!`);
          selectedIndicesRef.current = [];
          setSelectedIndices([]);
          setSelectedPath([]);
          setCurrentWord('');
          return;
        }

        if (!isValidWord(word)) {
          // Geçersiz kelime
          Alert.alert('Geçersiz Kelime', `${word} geçerli bir kelime değil veya mevcut harflerle oluşturulamaz.`);
          selectedIndicesRef.current = [];
          setSelectedIndices([]);
          setSelectedPath([]);
          setCurrentWord('');
          return;
        }

        // Geçerli kelime bulundu!
        const points = word.length * 10;
        setFoundWords(prev => [...prev, word]);
        setScore(prev => prev + points);

        // Başarı mesajı
        Alert.alert(
          'Harika! 🎉',
          `${word} kelimesi bulundu!\n+${points} puan kazandınız!`,
          [{ text: 'Tamam', style: 'default' }]
        );

        // Başarı animasyonu
        Animated.sequence([
          Animated.timing(pathAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(pathAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();

        // Temizle
        selectedIndicesRef.current = [];
        setSelectedIndices([]);
        setSelectedPath([]);
        setCurrentWord('');
      },
    });
  }, [currentLetters, currentWord, foundWords]);

  // Kelime geçerliliği kontrolü
  const isValidWord = (word) => {
    // Kelime listesinde var mı kontrol et
    if (!VALID_WORDS.includes(word)) {
      return false;
    }

    // Seçilen harflerden bu kelimeyi oluşturabilir miyiz?
    const wordLetters = word.split('').sort();
    const availableLetters = currentLetters.map(l => l.toUpperCase()).sort();

    // Her harf için kontrol et
    const wordLetterCounts = {};
    wordLetters.forEach(letter => {
      wordLetterCounts[letter] = (wordLetterCounts[letter] || 0) + 1;
    });

    const availableLetterCounts = {};
    availableLetters.forEach(letter => {
      availableLetterCounts[letter] = (availableLetterCounts[letter] || 0) + 1;
    });

    // Her harf için yeterli sayıda var mı?
    for (const letter in wordLetterCounts) {
      if ((availableLetterCounts[letter] || 0) < wordLetterCounts[letter]) {
        return false;
      }
    }

    return true;
  };

  // Oyunu başlat
  const startGame = () => {
    const letters = [...LETTER_SETS[level]];
    // Harfleri karıştır
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setCurrentLetters(letters);
    setGameStarted(true);
    setFoundWords([]);
    setScore(0);
    setSelectedIndices([]);
    setSelectedPath([]);
    setCurrentWord('');
  };

  // Oyunu bitir
  const finishGame = () => {
    setGameFinished(true);
  };

  // Oyunu sıfırla
  const resetGame = () => {
    Alert.alert(
      'Oyunu Yeniden Başlat',
      'Oyunu baştan başlatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Başlat',
          onPress: () => {
            setGameStarted(false);
            setGameFinished(false);
            setLevel(0);
            setFoundWords([]);
            setScore(0);
            setSelectedIndices([]);
            setSelectedPath([]);
            setCurrentWord('');
          },
        },
      ]
    );
  };

  // SVG path oluştur
  const createPath = () => {
    // Seçilen harfler arasında düz çizgiler çiz
    if (selectedIndices.length < 2) return '';

    let path = '';
    for (let i = 0; i < selectedIndices.length; i++) {
      const index = selectedIndices[i];
      const pos = getLetterPosition(index, currentLetters.length);

      if (i === 0) {
        path = `M ${pos.x} ${pos.y}`;
      } else {
        path += ` L ${pos.x} ${pos.y}`;
      }
    }
    return path;
  };

  // Başlangıç ekranı
  if (!gameStarted) {
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
              <Text style={styles.headerTitle}>Anagram Ustası</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.content} edges={['bottom']}>
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeEmoji}>🔤</Text>
              <Text style={styles.welcomeTitle}>Anagram Ustası</Text>
              <Text style={styles.welcomeSubtitle}>Swipe & Connect</Text>

              <View style={styles.infoBox}>
                <View style={styles.infoItem}>
                  <Ionicons name="bulb" size={24} color="#49b66f" />
                  <Text style={styles.infoText}>Parmağınızı kaldırmadan harfleri birleştirin</Text>
                </View>
              </View>

              <View style={styles.rulesCard}>
                <Text style={styles.rulesTitle}>📖 Nasıl Oynanır?</Text>
                <Text style={styles.rulesText}>
                  • Çember içindeki harfler üzerinde parmağınızı kaydırın{'\n'}
                  • Anlamlı kelimeler oluşturun (min. 3 harf){'\n'}
                  • Bulduğunuz kelimeler yukarıda görünecek{'\n'}
                  • Her kelime için puan kazanın!
                </Text>
              </View>

              <View style={styles.levelSelector}>
                <Text style={styles.levelTitle}>Zorluk Seviyesi</Text>
                <View style={styles.levelButtons}>
                  {[0, 1, 2, 3].map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.levelButton,
                        level === lvl && styles.levelButtonActive,
                      ]}
                      onPress={() => setLevel(lvl)}
                    >
                      <Text
                        style={[
                          styles.levelButtonText,
                          level === lvl && styles.levelButtonTextActive,
                        ]}
                      >
                        {['Kolay', 'Orta', 'Zor', 'Çok Zor'][lvl]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Oyuna Başla</Text>
                <Ionicons name="play" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Oyun bitiş ekranı
  if (gameFinished) {
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
              <Text style={styles.headerTitle}>Oyun Bitti!</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.content} edges={['bottom']}>
          <View style={styles.resultContainer}>
            <View style={styles.finalResultCard}>
              <Text style={styles.resultEmoji}>🎉</Text>
              <Text style={styles.finalResultTitle}>Tebrikler!</Text>
              <Text style={styles.finalScoreValue}>{score} Puan</Text>
              <Text style={styles.foundWordsCount}>
                {foundWords.length} kelime buldunuz
              </Text>
            </View>

            <View style={styles.wordsListCard}>
              <Text style={styles.wordsListTitle}>Bulunan Kelimeler</Text>
              <View style={styles.wordsGrid}>
                {foundWords.map((word, index) => (
                  <View key={index} style={styles.wordBadge}>
                    <Text style={styles.wordBadgeText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={resetGame}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Tekrar Oyna</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Ionicons name="home" size={20} color="#49b66f" />
                <Text style={styles.secondaryButtonText}>Ana Sayfa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Ana oyun ekranı
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
            <Text style={styles.headerTitle}>Anagram Ustası</Text>
            <TouchableOpacity
              onPress={finishGame}
              style={styles.resetButton}
            >
              <Ionicons name="checkmark" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.content} edges={['bottom']}>
        <View style={styles.gameContainer}>
          {/* Skor ve Bulunan Kelimeler */}
          <View style={styles.topSection}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Puan</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </View>
            <View style={styles.wordsBox}>
              <Text style={styles.wordsLabel}>Bulunan Kelimeler</Text>
              <View style={styles.wordsContainer}>
                {foundWords.length > 0 ? (
                  foundWords.slice(-5).map((word, index) => (
                    <View key={index} style={styles.foundWordBadge}>
                      <Text style={styles.foundWordText}>{word}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noWordsText}>Henüz kelime bulunmadı</Text>
                )}
              </View>
            </View>
          </View>

          {/* Oyun Alanı */}
          <View
            ref={gameAreaRef}
            style={styles.gameArea}
            onLayout={(event) => {
              const { width, height, x, y } = event.nativeEvent.layout;
              setGameAreaLayout({ width, height, x, y });
            }}
            {...panResponder.current.panHandlers}
          >
            {gameAreaLayout.width > 0 && gameAreaLayout.height > 0 && (
              <Svg
                style={StyleSheet.absoluteFill}
                width={gameAreaLayout.width}
                height={gameAreaLayout.height}
              >
                {/* Çember */}
                <Circle
                  cx={circleCenter.current.x}
                  cy={circleCenter.current.y}
                  r={CIRCLE_RADIUS}
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />

                {/* Seçim yolu - Harfler arasında düz çizgiler */}
                {selectedIndices.length > 1 && (
                  <Path
                    d={createPath()}
                    stroke="#49b66f"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
            )}

            {/* Harfler */}
            {currentLetters.map((letter, index) => {
              const pos = getLetterPosition(index, currentLetters.length);
              const isSelected = selectedIndices.includes(index);

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.letterContainer,
                    {
                      left: pos.x - 25,
                      top: pos.y - 25,
                      transform: [{ scale: letterAnims[index] }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.letterCircle,
                      isSelected && styles.letterCircleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.letterText,
                        isSelected && styles.letterTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* Mevcut Kelime */}
          {currentWord.length > 0 && (
            <View style={styles.currentWordBox}>
              <Text style={styles.currentWordLabel}>Mevcut Kelime:</Text>
              <Text style={styles.currentWordText}>{currentWord}</Text>
            </View>
          )}

          {/* Talimat */}
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              Parmağınızı harfler üzerinde kaydırın
            </Text>
          </View>
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
  },

  // Başlangıç Ekranı
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  rulesCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  levelSelector: {
    width: '100%',
    marginBottom: 24,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#49b66f',
    borderColor: '#49b66f',
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#49b66f',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Oyun Ekranı
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topSection: {
    marginBottom: 20,
  },
  scoreBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#49b66f',
  },
  wordsBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wordsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foundWordBadge: {
    backgroundColor: '#49b66f',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  foundWordText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  noWordsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  gameArea: {
    width: '100%',
    minHeight: CIRCLE_RADIUS * 2 + 100,
    height: CIRCLE_RADIUS * 2 + 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  letterContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  letterCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#49b66f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  letterCircleSelected: {
    backgroundColor: '#49b66f',
    borderColor: '#1db4e2',
    transform: [{ scale: 1.2 }],
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#49b66f',
  },
  letterTextSelected: {
    color: '#fff',
  },
  currentWordBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentWordLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  currentWordText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#49b66f',
  },
  instructionBox: {
    backgroundColor: '#49b66f',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Sonuç Ekranı
  resultContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  finalResultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  finalResultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  finalScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#49b66f',
    marginBottom: 8,
  },
  foundWordsCount: {
    fontSize: 16,
    color: '#666',
  },
  wordsListCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  wordsListTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordBadge: {
    backgroundColor: '#49b66f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wordBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#49b66f',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#49b66f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#49b66f',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default AnagramGame;
