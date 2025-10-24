import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slice/userSlice';
import { getRehberAnketler } from '../../redux/slice/rehberSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const RehberMainScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, userEmail, currentUser } = useSelector(state => state.user || {});
  const { anketler: rehberAnketleri, isLoading: anketLoading } = useSelector(state => state.rehber || {});
  const userRole = currentUser?.role;
  
  const [refreshing, setRefreshing] = useState(false);

  // Anket verilerini yükle
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getRehberAnketler(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  // Aktif anket sayısını hesapla
  const aktifAnketSayisi = rehberAnketleri?.filter(anket => anket.isActive)?.length || 0;
  const tamamlananAnketSayisi = rehberAnketleri?.filter(anket => !anket.isActive)?.length || 0;

  // Refresh fonksiyonu
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (currentUser?.id) {
        await dispatch(getRehberAnketler(currentUser.id));
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
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

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionGradient, { backgroundColor: color + '10' }]}>
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={28} color="#fff" />
        </View>
        <Text style={styles.quickActionText}>{title}</Text>
        <View style={[styles.quickActionIndicator, { backgroundColor: color }]} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Rehber Paneli 📚</Text>
            <Text style={styles.userName}>Hoş geldiniz</Text>
            {currentUser && (
              <Text style={styles.userEmail}>{currentUser.ad} {currentUser.soyad}</Text>
            )}
            <Text style={styles.userRole}>Rol: {userRole}</Text>
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} // Tab bar için ek padding
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#667eea"
              colors={['#667eea']}
            />
          }
        >
        <View style={styles.dashboard}>
          {/* Rehber İstatistik Kartları */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <StatCard
                title="Sorumlu Öğrenci Sayısı"
                value={currentUser?.rehberDetay?.ogrenciler?.length?.toString() || "0"}
                icon="people-outline"
                color="#4CAF50"
                onPress={() => Alert.alert('Öğrenciler', 'Sorumlu öğrenci listesi açılacak')}
              />
              <StatCard
                title="Aktif Ders"
                value="8"
                icon="book-outline"
                color="#2196F3"
                onPress={() => Alert.alert('Dersler', 'Aktif ders listesi açılacak')}
              />
              <StatCard
                title="Aktif Anket Sayısı"
                value={anketLoading ? "..." : aktifAnketSayisi.toString()}
                icon="clipboard-outline"
                color="#FF9800"
                onPress={() => Alert.alert('Testler', 'Bu hafta testleri açılacak')}
              />
              <StatCard
                title="Tamamlanan Anket"
                value={anketLoading ? "..." : tamamlananAnketSayisi.toString()}
                icon="checkmark-done-outline"
                color="#9C27B0"
                onPress={() => Alert.alert('Tamamlanan Anketler', 'Tamamlanan anket listesi')}
              />
            </View>
          </View>

          {/* Rehber Hızlı Eylemler */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Rehber Eylemleri</Text>
            <View style={styles.quickActionsGrid}>
              <QuickAction
                title="Öğrenci Listesi"
                icon="people-outline"
                color="#4CAF50"
                onPress={() => Alert.alert('Öğrenci Listesi', 'Öğrenci listesi açılacak')}
              />
              <QuickAction
                title="Ders Planı"
                icon="calendar-outline"
                color="#2196F3"
                onPress={() => Alert.alert('Ders Planı', 'Ders planı açılacak')}
              />
              <QuickAction
                title="Test Oluştur"
                icon="create-outline"
                color="#FF9800"
                onPress={() => Alert.alert('Test Oluştur', 'Test oluşturma formu açılacak')}
              />
              <QuickAction
                title="Raporlar"
                icon="analytics-outline"
                color="#9C27B0"
                onPress={() => Alert.alert('Raporlar', 'Rehber raporları açılacak')}
              />
            </View>
          </View>

          {/* Son Rehber Aktiviteler */}
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Son Rehber Aktiviteler</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="person-add" size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Yeni öğrenci atandı</Text>
                  <Text style={styles.activityTime}>2 saat önce</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="book" size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Matematik dersi tamamlandı</Text>
                  <Text style={styles.activityTime}>4 saat önce</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="clipboard" size={16} color="#fff" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Test sonuçları değerlendirildi</Text>
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
  userRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    marginTop: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -34,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dashboard: {
    padding: 20,
    paddingTop: 0,
  },
  statsContainer: {
    marginBottom: 30,
    marginTop: 25,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
  quickActionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  recentContainer: {
    marginBottom: 20,
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

export default RehberMainScreen;
