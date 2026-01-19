import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Seviye bazlı kelime havuzları
const WORD_POOLS = {
  A1: [
    { turkish: 'Merhaba', english: 'Hello' },
    { turkish: 'Teşekkürler', english: 'Thank you' },
    { turkish: 'Evet', english: 'Yes' },
    { turkish: 'Hayır', english: 'No' },
    { turkish: 'Lütfen', english: 'Please' },
    { turkish: 'Özür dilerim', english: 'Sorry' },
    { turkish: 'Su', english: 'Water' },
    { turkish: 'Yemek', english: 'Food' },
    { turkish: 'Ev', english: 'House' },
    { turkish: 'Araba', english: 'Car' },
    { turkish: 'Kitap', english: 'Book' },
    { turkish: 'Kalem', english: 'Pen' },
    { turkish: 'Okul', english: 'School' },
    { turkish: 'Öğretmen', english: 'Teacher' },
    { turkish: 'Öğrenci', english: 'Student' },
    { turkish: 'Anne', english: 'Mother' },
    { turkish: 'Baba', english: 'Father' },
    { turkish: 'Çocuk', english: 'Child' },
    { turkish: 'Arkadaş', english: 'Friend' },
    { turkish: 'Aile', english: 'Family' },
    { turkish: 'Gün', english: 'Day' },
    { turkish: 'Gece', english: 'Night' },
    { turkish: 'Sabah', english: 'Morning' },
    { turkish: 'Akşam', english: 'Evening' },
    { turkish: 'Masa', english: 'Table' },
  ],
  A2: [
    { turkish: 'Mutlu', english: 'Happy' },
    { turkish: 'Üzgün', english: 'Sad' },
    { turkish: 'Güzel', english: 'Beautiful' },
    { turkish: 'Çirkin', english: 'Ugly' },
    { turkish: 'Hızlı', english: 'Fast' },
    { turkish: 'Yavaş', english: 'Slow' },
    { turkish: 'Büyük', english: 'Big' },
    { turkish: 'Küçük', english: 'Small' },
    { turkish: 'Sıcak', english: 'Hot' },
    { turkish: 'Soğuk', english: 'Cold' },
    { turkish: 'Yeni', english: 'New' },
    { turkish: 'Eski', english: 'Old' },
    { turkish: 'Kolay', english: 'Easy' },
    { turkish: 'Zor', english: 'Difficult' },
    { turkish: 'Ucuz', english: 'Cheap' },
    { turkish: 'Pahalı', english: 'Expensive' },
    { turkish: 'Temiz', english: 'Clean' },
    { turkish: 'Kirli', english: 'Dirty' },
    { turkish: 'Yorgun', english: 'Tired' },
    { turkish: 'Açık', english: 'Open' },
    { turkish: 'Kapalı', english: 'Closed' },
    { turkish: 'Uzun', english: 'Long' },
    { turkish: 'Kısa', english: 'Short' },
    { turkish: 'Geniş', english: 'Wide' },
    { turkish: 'Dar', english: 'Narrow' },
  ],
  B1: [
    { turkish: 'Başarı', english: 'Success' },
    { turkish: 'Başarısızlık', english: 'Failure' },
    { turkish: 'Deneyim', english: 'Experience' },
    { turkish: 'Bilgi', english: 'Knowledge' },
    { turkish: 'Beceri', english: 'Skill' },
    { turkish: 'Gelişmek', english: 'Develop' },
    { turkish: 'İlerlemek', english: 'Progress' },
    { turkish: 'Öğrenmek', english: 'Learn' },
    { turkish: 'Anlamak', english: 'Understand' },
    { turkish: 'Açıklamak', english: 'Explain' },
    { turkish: 'Tartışmak', english: 'Discuss' },
    { turkish: 'Karar vermek', english: 'Decide' },
    { turkish: 'Düşünmek', english: 'Think' },
    { turkish: 'İnanmak', english: 'Believe' },
    { turkish: 'Ummak', english: 'Hope' },
    { turkish: 'Çalışmak', english: 'Work' },
    { turkish: 'Yaratmak', english: 'Create' },
    { turkish: 'Değiştirmek', english: 'Change' },
    { turkish: 'Bulmak', english: 'Find' },
    { turkish: 'Kullanmak', english: 'Use' },
    { turkish: 'Yardım etmek', english: 'Help' },
    { turkish: 'Göstermek', english: 'Show' },
    { turkish: 'Sorun', english: 'Problem' },
    { turkish: 'Çözüm', english: 'Solution' },
    { turkish: 'Fırsat', english: 'Opportunity' },
  ],
  B2: [
    { turkish: 'Etkilemek', english: 'Influence' },
    { turkish: 'Değerlendirmek', english: 'Evaluate' },
    { turkish: 'Analiz etmek', english: 'Analyze' },
    { turkish: 'Karşılaştırmak', english: 'Compare' },
    { turkish: 'Önermek', english: 'Suggest' },
    { turkish: 'İddia etmek', english: 'Claim' },
    { turkish: 'Kanıtlamak', english: 'Prove' },
    { turkish: 'Varsaymak', english: 'Assume' },
    { turkish: 'Tahmin etmek', english: 'Predict' },
    { turkish: 'Önlemek', english: 'Prevent' },
    { turkish: 'Sağlamak', english: 'Ensure' },
    { turkish: 'Uygulamak', english: 'Implement' },
    { turkish: 'Geliştirmek', english: 'Enhance' },
    { turkish: 'Sürdürmek', english: 'Maintain' },
    { turkish: 'Başarmak', english: 'Achieve' },
    { turkish: 'Belirlemek', english: 'Determine' },
    { turkish: 'Tanımlamak', english: 'Define' },
    { turkish: 'Yorumlamak', english: 'Interpret' },
    { turkish: 'Göz önünde bulundurmak', english: 'Consider' },
    { turkish: 'Teşvik etmek', english: 'Encourage' },
    { turkish: 'Azaltmak', english: 'Reduce' },
    { turkish: 'Artırmak', english: 'Increase' },
    { turkish: 'Katkıda bulunmak', english: 'Contribute' },
    { turkish: 'Desteklemek', english: 'Support' },
    { turkish: 'Reddetmek', english: 'Reject' },
  ],
  C1: [
    { turkish: 'Anlayış', english: 'Comprehension' },
    { turkish: 'Tutarlılık', english: 'Consistency' },
    { turkish: 'Belirsizlik', english: 'Ambiguity' },
    { turkish: 'Karmaşıklık', english: 'Complexity' },
    { turkish: 'Hassasiyet', english: 'Sensitivity' },
    { turkish: 'Önyargı', english: 'Prejudice' },
    { turkish: 'Çelişki', english: 'Contradiction' },
    { turkish: 'Varsayım', english: 'Hypothesis' },
    { turkish: 'Kavram', english: 'Concept' },
    { turkish: 'İlke', english: 'Principle' },
    { turkish: 'Perspektif', english: 'Perspective' },
    { turkish: 'Bütünlük', english: 'Integrity' },
    { turkish: 'Kapsamlı', english: 'Comprehensive' },
    { turkish: 'Nitelik', english: 'Attribute' },
    { turkish: 'Ayırt etmek', english: 'Distinguish' },
    { turkish: 'Meşruiyet', english: 'Legitimacy' },
    { turkish: 'Özgünlük', english: 'Authenticity' },
    { turkish: 'Özerklik', english: 'Autonomy' },
    { turkish: 'Sürdürülebilirlik', english: 'Sustainability' },
    { turkish: 'Önemsizleştirmek', english: 'Trivialize' },
    { turkish: 'Somutlaştırmak', english: 'Substantiate' },
    { turkish: 'Çıkarsamak', english: 'Infer' },
    { turkish: 'Sentezlemek', english: 'Synthesize' },
    { turkish: 'Yaklaşım', english: 'Approach' },
    { turkish: 'Metodoloji', english: 'Methodology' },
  ],
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const GAME_DURATION = 60; // 1 dakika
const INITIAL_HEARTS = 3;
const WORDS_PER_GAME = 6;
const VISIBLE_CARDS = 6;

const EnglishWords = ({ navigation }) => {
  const [gameState, setGameState] = useState('level-select'); // 'level-select', 'playing', 'game-over'
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentWords, setCurrentWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [turkishCards, setTurkishCards] = useState([]);
  const [englishCards, setEnglishCards] = useState([]);
  const [selectedTurkish, setSelectedTurkish] = useState(null);
  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [hearts, setHearts] = useState(INITIAL_HEARTS);
  const [score, setScore] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [wrongMatches, setWrongMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef(null);

  // Seviye seçimi
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    initializeGame(level);
  };

  // Oyunu başlat
  const initializeGame = (level) => {
    const pool = WORD_POOLS[level];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const initial = shuffled.slice(0, VISIBLE_CARDS);
    const remaining = shuffled.slice(VISIBLE_CARDS);

    setCurrentWords(initial);
    setAvailableWords(remaining);
    setUsedWords(initial);

    // Türkçe kartlar - sıralı
    const turkishCardsData = initial.map((w, i) => ({
      id: `tr-${i}`,
      word: w.turkish,
      matched: false,
      position: i,
      wordPair: w
    }));

    // İngilizce kartlar - karışık ama pozisyon bilgisiyle
    const shuffledInitial = [...initial].sort(() => Math.random() - 0.5);
    const englishCardsData = shuffledInitial.map((w, i) => ({
      id: `en-${i}`,
      word: w.english,
      matched: false,
      position: i,
      wordPair: w
    }));

    setTurkishCards(turkishCardsData);
    setEnglishCards(englishCardsData);
    setMatchedPairs([]);
    setHearts(INITIAL_HEARTS);
    setScore(0);
    setCorrectMatches(0);
    setWrongMatches(0);
    setTimeLeft(GAME_DURATION);
    setSelectedTurkish(null);
    setSelectedEnglish(null);
    setGameState('playing');

    // Timer'ı başlat
    startTimer();
  };

  // Timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Türkçe kart seçimi
  const handleTurkishCardPress = (card) => {
    if (isChecking || card.matched) return;
    setSelectedTurkish(card);

    // Eğer İngilizce kart seçiliyse eşleşmeyi kontrol et
    if (selectedEnglish) {
      checkMatch(card, selectedEnglish);
    }
  };

  // İngilizce kart seçimi
  const handleEnglishCardPress = (card) => {
    if (isChecking || card.matched) return;
    setSelectedEnglish(card);

    // Eğer Türkçe kart seçiliyse eşleşmeyi kontrol et
    if (selectedTurkish) {
      checkMatch(selectedTurkish, card);
    }
  };

  // Eşleşme kontrolü
  const checkMatch = (turkishCard, englishCard) => {
    setIsChecking(true);

    const turkishWord = turkishCard.word;
    const englishWord = englishCard.word;

    // Doğru eşleşme kontrolü - wordPair karşılaştır
    const isCorrectMatch = turkishCard.wordPair.turkish === turkishWord &&
      turkishCard.wordPair.english === englishWord &&
      englishCard.wordPair.turkish === turkishWord &&
      englishCard.wordPair.english === englishWord;

    if (isCorrectMatch) {
      // Doğru eşleşme - kartları hemen matched yap
      setTurkishCards((prev) =>
        prev.map((c) => (c.id === turkishCard.id ? { ...c, matched: true } : c))
      );
      setEnglishCards((prev) =>
        prev.map((c) => (c.id === englishCard.id ? { ...c, matched: true } : c))
      );
      setMatchedPairs((prev) => [...prev, turkishCard.wordPair]);
      setScore((prev) => prev + 10);
      setCorrectMatches((prev) => prev + 1);
      setSelectedTurkish(null);
      setSelectedEnglish(null);

      // Hemen yeni kelime çifti ekle - kullanıcı beklemeden yeni seçim yapabilsin
      setTimeout(() => {
        if (availableWords.length > 0) {
          const newWord = availableWords[0];
          const remainingAvailable = availableWords.slice(1);

          setAvailableWords(remainingAvailable);
          setUsedWords((prev) => [...prev, newWord]);
          setCurrentWords((prev) => [
            ...prev.filter(w => w.turkish !== turkishWord),
            newWord
          ]);

          // Türkçe kartı güncelle - aynı pozisyonda
          setTurkishCards((prev) =>
            prev.map((c) => {
              if (c.id === turkishCard.id) {
                return {
                  id: c.id,
                  word: newWord.turkish,
                  matched: false,
                  position: c.position,
                  wordPair: newWord
                };
              }
              return c;
            })
          );

          // İngilizce kartı güncelle ve tüm İngilizce kartları rastgele karıştır
          setEnglishCards((prev) => {
            // Önce yeni kelimeyi ekle
            const updated = prev.map((c) => {
              if (c.id === englishCard.id) {
                return {
                  id: c.id,
                  word: newWord.english,
                  matched: false,
                  position: c.position,
                  wordPair: newWord
                };
              }
              return c;
            });

            // Matched olmayan kartları al ve karıştır
            const unmatchedCards = updated.filter(c => !c.matched);
            const matchedCards = updated.filter(c => c.matched);

            // Matched olmayan kartları rastgele karıştır
            const shuffled = [...unmatchedCards].sort(() => Math.random() - 0.5);

            // Pozisyonları güncelle
            const reordered = shuffled.map((c, i) => ({
              ...c,
              position: i
            }));

            // Matched kartları da ekle (sıralama için)
            return [...reordered, ...matchedCards];
          });
        } else {
          // Havuzda kelime kalmadı, eşleşenleri sil
          setTurkishCards((prev) => prev.filter(c => c.id !== turkishCard.id));
          setEnglishCards((prev) => prev.filter(c => c.id !== englishCard.id));
          setCurrentWords((prev) => prev.filter(w => w.turkish !== turkishWord));
        }
      }, 400);

      // Kullanıcı hemen yeni kelimeleri seçebilsin
      setIsChecking(false);
    } else {
      // Yanlış eşleşme - kısa süre sonra seçimi temizle
      setTimeout(() => {
        setHearts((prev) => {
          const newHearts = prev - 1;
          if (newHearts <= 0) {
            endGame();
          }
          return newHearts;
        });
        setWrongMatches((prev) => prev + 1);
        setSelectedTurkish(null);
        setSelectedEnglish(null);
        setIsChecking(false);
      }, 600);
    }
  };

  // Oyunu bitir
  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('game-over');
  };

  // Oyundan çıkış onayı
  const handleExitGame = () => {
    Alert.alert(
      'Oyundan Çık',
      'Çıkmak istediğinize emin misiniz? Oyun ilerlemeniz kaydedilmeyecek.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameState('level-select');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Kart stil belirleme
  const getCardStyle = (card, isSelected, type) => {
    if (card.matched) return [styles.card, styles.cardMatched];
    if (isSelected) {
      // Eşleşme kontrolü sırasında
      if (isChecking) {
        // Doğru eşleşme kontrolü
        const isCorrectMatch = selectedTurkish?.wordPair.turkish === selectedTurkish?.word &&
          selectedTurkish?.wordPair.english === selectedEnglish?.word &&
          selectedEnglish?.wordPair.turkish === selectedTurkish?.word &&
          selectedEnglish?.wordPair.english === selectedEnglish?.word;
        return isCorrectMatch
          ? [styles.card, styles.cardCorrect]
          : [styles.card, styles.cardWrong];
      }
      return [styles.card, styles.cardSelected];
    }
    return styles.card;
  };

  // Seviye rengi
  const getLevelColor = (level) => {
    const colors = {
      A1: '#4CAF50',
      A2: '#2196F3',
      B1: '#FF9800',
      B2: '#F44336',
      C1: '#9C27B0',
    };
    return colors[level] || '#49b66f';
  };

  // Seviye seçimi ekranı
  if (gameState === 'level-select') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

        <LinearGradient colors={['#49b66f', '#1db4e2']} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>İngilizce Kelime</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.levelSelectContainer}>
          <Text style={styles.levelSelectTitle}>Seviye Seç</Text>
          <Text style={styles.levelSelectSubtitle}>Bilgi seviyene uygun zorluk seç</Text>

          <View style={styles.levelGrid}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, { borderColor: getLevelColor(level) }]}
                onPress={() => handleLevelSelect(level)}
                activeOpacity={0.7}
              >
                <Text style={[styles.levelButtonText, { color: getLevelColor(level) }]}>
                  {level}
                </Text>
                <Text style={styles.levelButtonSubtext}>
                  {level === 'A1' && 'Başlangıç'}
                  {level === 'A2' && 'Temel'}
                  {level === 'B1' && 'Orta'}
                  {level === 'B2' && 'İyi'}
                  {level === 'C1' && 'İleri'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Oyun ekranı
  if (gameState === 'playing') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

        <LinearGradient colors={['#49b66f', '#1db4e2']} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleExitGame} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{selectedLevel} Seviyesi</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </LinearGradient>

        <SafeAreaView style={styles.gameContainer}>
          {/* Üst bilgi */}
          <View style={styles.gameInfo}>
            <View style={styles.heartsContainer}>
              {[...Array(INITIAL_HEARTS)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < hearts ? 'heart' : 'heart-outline'}
                  size={28}
                  color={i < hearts ? '#F44336' : '#ccc'}
                  style={{ marginHorizontal: 4 }}
                />
              ))}
            </View>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={24} color="#49b66f" />
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          {/* Oyun alanı */}
          <View style={styles.gameBoard}>
            {/* Türkçe kartlar */}
            <ScrollView style={styles.cardColumn} showsVerticalScrollIndicator={false}>
              {turkishCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={getCardStyle(card, selectedTurkish?.id === card.id, 'turkish')}
                  onPress={() => handleTurkishCardPress(card)}
                  disabled={card.matched || isChecking}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cardText,
                    card.matched && styles.cardTextMatched,
                    selectedTurkish?.id === card.id && styles.cardTextSelected
                  ]}>
                    {card.word}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* İngilizce kartlar */}
            <ScrollView style={styles.cardColumn} showsVerticalScrollIndicator={false}>
              {englishCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={getCardStyle(card, selectedEnglish?.id === card.id, 'english')}
                  onPress={() => handleEnglishCardPress(card)}
                  disabled={card.matched || isChecking}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.cardText,
                    card.matched && styles.cardTextMatched,
                    selectedEnglish?.id === card.id && styles.cardTextSelected
                  ]}>
                    {card.word}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Oyun bitti ekranı
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient colors={['#49b66f', '#1db4e2']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Oyun Bitti!</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.gameOverContainer}>
        <Ionicons name="trophy" size={80} color="#FFD700" />
        <Text style={styles.gameOverTitle}>Harika İş!</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Toplam Puan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{correctMatches}</Text>
            <Text style={styles.statLabel}>Doğru</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{wrongMatches}</Text>
            <Text style={styles.statLabel}>Yanlış</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timeLeft}s</Text>
            <Text style={styles.statLabel}>Kalan Süre</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => setGameState('level-select')}
        >
          <Text style={styles.playAgainButtonText}>Tekrar Oyna</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  // Seviye seçimi
  levelSelectContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  levelSelectTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  levelSelectSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  levelGrid: {
    gap: 16,
  },
  levelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  levelButtonText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  levelButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  // Oyun ekranı
  gameContainer: {
    flex: 1,
    padding: 16,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heartsContainer: {
    flexDirection: 'row',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#49b66f',
    marginLeft: 6,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 6,
  },
  gameBoard: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  cardColumn: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: '#49b66f',
    backgroundColor: '#e8f7f1',
  },
  cardCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  cardWrong: {
    borderColor: '#F44336',
    backgroundColor: '#ffebee',
  },
  cardMatched: {
    opacity: 0.1,
    backgroundColor: '#e8f5e9',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#49b66f',
  },
  cardTextMatched: {
    color: '#999',
  },
  // Oyun bitti
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#49b66f',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  playAgainButton: {
    backgroundColor: '#49b66f',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default EnglishWords;

