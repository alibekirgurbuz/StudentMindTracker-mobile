import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert
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
        colors={['#667eea', '#764ba2']}
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
                value="12"
                icon="happy-outline"
                color="#2196F3"
                onPress={() => Alert.alert('Kurslar', 'Kurs listesi açılacak')}
              />
              <StatCard
                title="Tamamlanan Test"
                value="45"
                icon="clipboard-outline"
                color="#FF9800"
                onPress={() => Alert.alert('Testler', 'Test listesi açılacak')}
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
                onPress={() => Alert.alert('Hafıza Kartı', 'Hafıza kartı oyunu başlatılacak')}
              />
              <QuickAction
                title="Balonu Şişir"
                icon="balloon-outline"
                color="#2196F3"
                onPress={() => Alert.alert('Balonu Şişir', 'Balonu şişir oyunu başlatılacak')}
              />
              <QuickAction
                title="Problem Çözme"
                icon="bulb-outline"
                color="#FF9800"
                onPress={() => Alert.alert('Problem Çözme', 'Problem çözme oyunu başlatılacak')}
              />
              <QuickAction
                title="İngilizce Kelime"
                icon="book-outline"
                color="#9C27B0"
                onPress={() => Alert.alert('İngilizce Kelime', 'İngilizce kelime oyunu başlatılacak')}
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
                  <Text style={styles.activityTitle}>Yeni öğrenci eklendi</Text>
                  <Text style={styles.activityTime}>2 saat önce</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="clipboard" size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Matematik testi tamamlandı</Text>
                  <Text style={styles.activityTime}>4 saat önce</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="trophy" size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Yüksek puan alındı</Text>
                  <Text style={styles.activityTime}>6 saat önce</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
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
    marginTop: -24, // MotivationMessage'ı header'a yaklaştırmak için
  },
  scrollContent: {
    paddingBottom: 20,
  },
  motivationWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
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
});

export default MainScreen;
