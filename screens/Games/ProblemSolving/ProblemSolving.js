import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sorular - Her soru bir örüntü ve doğru cevap içerir
const QUESTIONS = [
  {
    id: 1,
    patternSteps: ['2 → 4', '3 → 6', '4 → ?'],
    description: 'Sayıyı 2 ile çarp',
    correctAnswer: 8,
    options: [6, 7, 8, 9],
    difficulty: 'Kolay',
  },
  {
    id: 2,
    patternSteps: ['1 → 3', '2 → 5', '3 → ?'],
    description: 'Sayıya 2 ekle',
    correctAnswer: 5,
    options: [4, 5, 6, 7],
    difficulty: 'Kolay',
  },
  {
    id: 3,
    patternSteps: ['2 → 4', '3 → 9', '4 → ?'],
    description: 'Sayının karesi',
    correctAnswer: 16,
    options: [12, 14, 16, 18],
    difficulty: 'Orta',
  },
  {
    id: 4,
    patternSteps: ['1 → 1', '2 → 4', '3 → 9', '4 → ?'],
    description: 'Kare örüntüsü',
    correctAnswer: 16,
    options: [12, 15, 16, 18],
    difficulty: 'Orta',
  },
  {
    id: 5,
    patternSteps: ['2 → 8', '3 → 27', '4 → ?'],
    description: 'Sayının küpü',
    correctAnswer: 64,
    options: [48, 54, 60, 64],
    difficulty: 'Zor',
  },
];

const ProblemSolving = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  // Cevap seçimi
  const handleAnswerSelect = (answer) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
    }

    // 1.5 saniye sonra sonraki soruya geç
    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowHint(false); // İpucu gizle
      } else {
        // Oyun bitti
        showGameOverAlert();
      }
    }, 1500);
  };

  // Oyun bitişi
  const showGameOverAlert = () => {
    const percentage = (correctAnswers / QUESTIONS.length) * 100;
    let message = '';

    if (percentage === 100) {
      message = 'Mükemmel! Tüm soruları doğru bildin! 🏆';
    } else if (percentage >= 80) {
      message = 'Harika! Çok başarılısın! 🌟';
    } else if (percentage >= 60) {
      message = 'İyi! Daha fazla pratik yapabilirsin! 👍';
    } else {
      message = 'Daha fazla çalışman gerekiyor! 💪';
    }

    Alert.alert(
      '🎉 Oyun Bitti!',
      `${message}\n\nDoğru: ${correctAnswers}/${QUESTIONS.length}\nToplam Puan: ${score}`,
      [
        { text: 'Tekrar Oyna', onPress: resetGame },
        { text: 'Çıkış', onPress: () => navigation.goBack() }
      ]
    );
  };

  // Oyunu sıfırla
  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setShowHint(false);
  };

  // Cevap butonunun stilini belirle
  const getAnswerButtonStyle = (option) => {
    if (!isAnswered) return styles.answerButton;

    if (option === currentQuestion.correctAnswer) {
      return [styles.answerButton, styles.correctAnswer];
    }

    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return [styles.answerButton, styles.wrongAnswer];
    }

    return [styles.answerButton, styles.disabledAnswer];
  };

  // Zorluk rengi
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Kolay':
        return '#4CAF50';
      case 'Orta':
        return '#FF9800';
      case 'Zor':
        return '#F44336';
      default:
        return '#49b66f';
    }
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
            <Text style={styles.headerTitle}>Problem Çözme</Text>
            <TouchableOpacity
              onPress={resetGame}
              style={styles.resetButton}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Skor ve İlerleme */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={20} color="#FF9800" />
            <Text style={styles.statLabel}>Puan</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.statLabel}>Doğru</Text>
            <Text style={styles.statValue}>{correctAnswers}/{QUESTIONS.length}</Text>
          </View>
        </View>

        {/* İlerleme Çubuğu */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Soru {currentQuestionIndex + 1}/{QUESTIONS.length}
          </Text>
        </View>

        {/* Zorluk Seviyesi */}
        <View style={styles.difficultyContainer}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(currentQuestion.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{currentQuestion.difficulty}</Text>
          </View>
        </View>

        {/* Soru Kartı */}
        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Örüntüyü Tamamla</Text>

          {/* Örüntü Adımları - Dikey */}
          <View style={styles.patternContainer}>
            {currentQuestion.patternSteps.map((step, index) => (
              <Text key={index} style={styles.questionPattern}>{step}</Text>
            ))}
          </View>

          {/* İpucu Butonu */}
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => setShowHint(!showHint)}
            activeOpacity={0.7}
          >
            <Ionicons name="bulb-outline" size={20} color="#FF9800" />
            <Text style={styles.hintButtonText}>
              {showHint ? 'İpucunu Gizle' : 'İpucu Göster'}
            </Text>
          </TouchableOpacity>

          {/* İpucu - Koşullu Render */}
          {showHint && (
            <View style={styles.hintContainer}>
              <Text style={styles.questionHint}>💡 {currentQuestion.description}</Text>
            </View>
          )}
        </View>

        {/* Cevap Seçenekleri */}
        <View style={styles.answersContainer}>
          <Text style={styles.answersLabel}>Cevabını Seç:</Text>
          <View style={styles.answersGrid}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={getAnswerButtonStyle(option)}
                onPress={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.answerText,
                  (isAnswered && option === currentQuestion.correctAnswer) && styles.answerTextCorrect,
                  (isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer) && styles.answerTextWrong,
                ]}>
                  {option}
                </Text>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" style={styles.answerIcon} />
                )}
                {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                  <Ionicons name="close-circle" size={24} color="#fff" style={styles.answerIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Geri Bildirim */}
        {isAnswered && (
          <View style={[
            styles.feedbackContainer,
            selectedAnswer === currentQuestion.correctAnswer ? styles.feedbackCorrect : styles.feedbackWrong
          ]}>
            <Ionicons
              name={selectedAnswer === currentQuestion.correctAnswer ? "happy-outline" : "sad-outline"}
              size={24}
              color="#fff"
            />
            <Text style={styles.feedbackText}>
              {selectedAnswer === currentQuestion.correctAnswer
                ? 'Doğru! Harika iş! 🎉'
                : `Yanlış! Doğru cevap: ${currentQuestion.correctAnswer}`}
            </Text>
          </View>
        )}

        {/* Nasıl Oynanır */}
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>📖 Nasıl Oynanır?</Text>
          <Text style={styles.rulesText}>
            • Verilen örüntüyü analiz et{'\n'}
            • Mantıksal ilişkiyi bul{'\n'}
            • Doğru cevabı seç{'\n'}
            • Her doğru cevap 10 puan kazandırır
          </Text>
        </View>
      </ScrollView>
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
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#49b66f',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  difficultyContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#49b66f',
  },
  questionLabel: {
    fontSize: 14,
    color: '#49b66f',
    fontWeight: '700',
    marginBottom: 8,
  },
  patternContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  questionPattern: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginVertical: 6,
    letterSpacing: 1,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  hintButtonText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 6,
  },
  hintContainer: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  questionHint: {
    fontSize: 12,
    color: '#E65100',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  answersContainer: {
    marginBottom: 16,
  },
  answersLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  answersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  answerButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  correctAnswer: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongAnswer: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  disabledAnswer: {
    opacity: 0.5,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  answerTextCorrect: {
    color: '#fff',
  },
  answerTextWrong: {
    color: '#fff',
  },
  answerIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  feedbackContainer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#4CAF50',
  },
  feedbackWrong: {
    backgroundColor: '#F44336',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  rulesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  rulesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});

export default ProblemSolving;

