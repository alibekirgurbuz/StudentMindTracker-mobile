import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, clearUser } from '../../redux/slice/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatCard from '../../components/ui/StatCard';
import QuickAction from '../../components/ui/quickAction';
import MotivationMessage from '../../components/ui/motivationMessage';

const { width, height } = Dimensions.get('window');

const MainScreen = ({ navigation }) => {

  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user || {});

  // State for completed tests and mood
  const [completedTests, setCompletedTests] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodModalVisible, setMoodModalVisible] = useState(false);

  // Mood options with emojis
  const moodOptions = [
    { id: 1, emoji: '😊', label: 'Mutlu', color: '#4CAF50' },
    { id: 2, emoji: '😐', label: 'Normal', color: '#FFC107' },
    { id: 3, emoji: '😢', label: 'Üzgün', color: '#2196F3' },
    { id: 4, emoji: '😡', label: 'Kızgın', color: '#F44336' },
    { id: 5, emoji: '😴', label: 'Yorgun', color: '#9C27B0' }
  ];

  // Load completed tests count from API
  useEffect(() => {
    const fetchCompletedTests = async () => {
      try {
        if (currentUser?.id || currentUser?._id) {
          const userId = currentUser.id || currentUser._id;
          const response = await fetch(`https://studentmindtracker-server-1.onrender.com/api/ogrenci/${userId}/anket-sonuclari`);
          const data = await response.json();

          if (data.success && data.data) {
            setCompletedTests(data.data.length);
          }
        }
      } catch (error) {
        console.error('Tamamlanan anketler yüklenirken hata:', error);
        // Hata durumunda varsayılan değer
        setCompletedTests(0);
      }
    };

    fetchCompletedTests();
  }, [currentUser]);

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setMoodModalVisible(false);
    Alert.alert('Ruh Hali Kaydedildi', `Bugünkü ruh haliniz: ${mood.label} ${mood.emoji}`);
    // TODO: Save mood to API
  };

  // Güncel tarih bilgisini al
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const month = monthNames[now.getMonth()];
    return `${day} ${month}`;
  };


  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // Redux action ile logout işlemini gerçekleştir
              await dispatch(logoutUser());
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Merhaba! 👋</Text>
            <Text style={styles.userName}>Hoş geldiniz</Text>
            {currentUser && (
              <Text style={styles.userEmail}>{currentUser.ad} {currentUser.soyad}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Motivasyon Mesajı - Header'ın hemen altında */}
          <View style={styles.motivationWrapper}>
            <MotivationMessage />
          </View>

          <View style={styles.dashboard}>
            {/* İstatistik Kartları */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Genel Bakış</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  title="Bugünün Nasıldı?..."
                  value={getCurrentDate()}
                  icon="calendar-outline"
                  color="#4CAF50"
                  onPress={() => Alert.alert('Öğrenciler', 'Öğrenci listesi açılacak')}
                />
                <StatCard
                  title="Günün Ruh Hali"
                  value={selectedMood ? selectedMood.emoji : '😊'}
                  icon="happy-outline"
                  color="#2196F3"
                  onPress={() => setMoodModalVisible(true)}
                />
                <StatCard
                  title="Tamamlanan Test"
                  value={completedTests.toString()}
                  icon="clipboard-outline"
                  color="#FF9800"
                  onPress={() => Alert.alert('Testler', `${completedTests} test tamamlandı`)}
                />
                <StatCard
                  title="Dikkatni Arttır"
                  value="87.5"
                  icon="trophy-outline"
                  color="#9C27B0"
                  onPress={() => Alert.alert('Başarılar', 'Başarı grafikleri açılacak')}
                />
              </View>
            </View>

            {/* Hızlı Eylemler */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Oyunlar</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  title="Hafıza Kartı"
                  icon="layers-outline"
                  color="#4CAF50"
                  onPress={() => navigation.navigate('MemoryCard')}
                />
                <QuickAction
                  title="Kelime Bulmaca"
                  icon="git-branch-outline"
                  color="#2196F3"
                  onPress={() => navigation.navigate('DecisionGame')}
                />
                <QuickAction
                  title="Problem Çözme"
                  icon="bulb-outline"
                  color="#FF9800"
                  onPress={() => navigation.navigate('ProblemSolving')}
                />
                <QuickAction
                  title="İngilizce Kelime"
                  icon="book-outline"
                  color="#9C27B0"
                  onPress={() => navigation.navigate('EnglishWords')}
                />
              </View>
            </View>

            {/* Son Aktiviteler */}
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="person-add" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Sınıfa yeni öğrenci katıldı.</Text>
                    <Text style={styles.activityTime}>2 saat önce</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="clipboard" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Rehber yeni anket oluşturdu.</Text>
                    <Text style={styles.activityTime}>4 saat önce</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="trophy" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Adem problem çözmede birinciliğe yükseldi!</Text>
                    <Text style={styles.activityTime}>6 saat önce</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Mood Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={moodModalVisible}
        onRequestClose={() => setMoodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bugün Nasıl Hissediyorsun?</Text>
            <Text style={styles.modalSubtitle}>Ruh halini seç</Text>

            <View style={styles.moodGrid}>
              {moodOptions.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodOption,
                    selectedMood?.id === mood.id && styles.moodOptionSelected
                  ]}
                  onPress={() => handleMoodSelect(mood)}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMoodModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',

  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // StatusBar alanı için ek padding
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  userName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -47, // MotivationMessage'ı header'a yaklaştırmak için
  },
  scrollContent: {
    paddingBottom: 20,
  },
  motivationWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: -12,
  },
  dashboard: {
    padding: 20,
    paddingTop: 0, // MotivationMessage ile dashboard arasındaki boşluğu kaldırmak için
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recentContainer: {
    marginBottom: 20,
    marginBottom: 30,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionSelected: {
    borderColor: '#49b66f',
    backgroundColor: '#e8f7f1',
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#49b66f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MainScreen;
