import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { submitAnketSonuc } from '../../redux/slice/ogrenciSlice';

const QuestionsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user || {});
  const { anketData } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [anketCevaplari, setAnketCevaplari] = useState({});

  const currentSoru = anketData.sorular[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === anketData.sorular.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleCevapVer = (soruIndex, cevap) => {
    console.log('=== DEBUG: handleCevapVer ===');
    console.log('Soru index:', soruIndex);
    console.log('Cevap:', cevap);
    
    setAnketCevaplari(prev => {
      const newCevaplar = {
        ...prev,
        [soruIndex]: cevap
      };
      console.log('Güncel cevaplar:', newCevaplar);
      return newCevaplar;
    });
  };

  const handleSonrakiSoru = () => {
    if (currentQuestionIndex < anketData.sorular.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleOncekiSoru = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnketiTamamla = async () => {
    try {
      // Tüm soruların cevaplanıp cevaplanmadığını kontrol et
      const cevaplanmamisSorular = [];
      anketData.sorular.forEach((soru, index) => {
        if (!anketCevaplari[index]) {
          cevaplanmamisSorular.push(index + 1);
        }
      });

      if (cevaplanmamisSorular.length > 0) {
        Alert.alert(
          'Eksik Cevaplar',
          `Lütfen tüm soruları cevaplayın. Cevaplanmamış sorular: ${cevaplanmamisSorular.join(', ')}`,
          [{ text: 'Tamam' }]
        );
        return;
      }

      // Cevapları soru bilgileriyle birlikte hazırla
      const cevaplarWithQuestions = anketData.sorular.map((soru, index) => ({
        soru: soru.soru,
        secenekler: soru.secenekler,
        cevap: anketCevaplari[index]
      }));
      
      const result = await dispatch(submitAnketSonuc({
        ogrenciId: currentUser.id,
        anketId: anketData.id,
        cevaplar: cevaplarWithQuestions
      })).unwrap();
      
      Alert.alert('Başarılı', 'Anket başarıyla tamamlandı!', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Anket tamamlama hatası:', error);
      Alert.alert('Hata', 'Anket tamamlanırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Anketi Kapat',
      'Anket henüz tamamlanmadı. Çıkmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{anketData.baslik}</Text>
            <Text style={styles.headerSubtitle}>
              Soru {currentQuestionIndex + 1} / {anketData.sorular.length}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / anketData.sorular.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Soru Kartı */}
      <View style={styles.content}>
        <View style={styles.soruCard}>
          <View style={styles.soruNumberContainer}>
            <Text style={styles.soruNumber}>Soru {currentQuestionIndex + 1}</Text>
          </View>
          <Text style={styles.soruText}>{currentSoru.soru}</Text>
        </View>

        {/* Seçenekler */}
        <View style={styles.seceneklerContainer}>
          {currentSoru.secenekler?.map((secenek, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.secenekButton,
                anketCevaplari[currentQuestionIndex] === secenek && styles.secenekButtonSelected
              ]}
              onPress={() => handleCevapVer(currentQuestionIndex, secenek)}
            >
              <View style={styles.secenekContent}>
                <View style={[
                  styles.radioButton,
                  anketCevaplari[currentQuestionIndex] === secenek && styles.radioButtonSelected
                ]}>
                  {anketCevaplari[currentQuestionIndex] === secenek && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={[
                  styles.secenekText,
                  anketCevaplari[currentQuestionIndex] === secenek && styles.secenekTextSelected
                ]}>
                  {secenek}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Navigation Butonları */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, styles.geriButton, isFirstQuestion && styles.disabledButton]}
          onPress={handleOncekiSoru}
          disabled={isFirstQuestion}
        >
          <Ionicons 
            name="arrow-back" 
            size={20} 
            color={isFirstQuestion ? '#999' : '#fff'} 
          />
          <Text style={[styles.navButtonText, isFirstQuestion && styles.disabledButtonText]}>
            Geri
          </Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[styles.navButton, styles.tamamlaButton]}
            onPress={handleAnketiTamamla}
          >
            <Text style={styles.navButtonText}>Tamamla</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.ileriButton]}
            onPress={handleSonrakiSoru}
          >
            <Text style={styles.navButtonText}>İleri</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  placeholder: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  soruCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  soruNumberContainer: {
    marginBottom: 16,
  },
  soruNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  soruText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
  },
  seceneklerContainer: {
    gap: 12,
  },
  secenekButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  secenekButtonSelected: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
  },
  secenekContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
  },
  secenekText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  secenekTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  geriButton: {
    backgroundColor: '#6c757d',
  },
  ileriButton: {
    backgroundColor: '#667eea',
  },
  tamamlaButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default QuestionsScreen;


