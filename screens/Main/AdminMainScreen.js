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
import { logoutUser } from '../../redux/slice/userSlice';
// clearSurveyData import removed - surveySlice not available
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllUsers, getUsersByRole } from '../../services/authService';

const { width, height } = Dimensions.get('window');

const AdminMainScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, userEmail, currentUser } = useSelector(state => state.user || {});
  const userRole = currentUser?.role;
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalOgrenciler: 0,
    totalRehberler: 0
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const [users, ogrenciler, rehberler] = await Promise.all([
          getAllUsers(token),
          getUsersByRole('Öğrenci'),
          getUsersByRole('Rehber')
        ]);

        setStats({
          totalUsers: users.length,
          totalOgrenciler: ogrenciler.length,
          totalRehberler: rehberler.length
        });
      } catch (error) {
        console.error('Admin stats yüklenemedi:', error);
      }
    };

    fetchStats();
  }, [token]);


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
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Admin Paneli 👑</Text>
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
        >
          <View style={styles.dashboard}>
            {/* Admin İstatistik Kartları */}
            <View style={styles.statsContainer}>
              <View style={styles.statsGrid}>
                <StatCard
                  title="Toplam Kullanıcı"
                  value={stats.totalUsers.toString()}
                  icon="people-outline"
                  color="#4CAF50"
                  onPress={() => Alert.alert('Kullanıcılar', 'Kullanıcı yönetimi açılacak')}
                />
                <StatCard
                  title="Aktif Rehber"
                  value={stats.totalRehberler.toString()}
                  icon="school-outline"
                  color="#2196F3"
                  onPress={() => Alert.alert('Rehberler', 'Rehber listesi açılacak')}
                />
                <StatCard
                  title="Toplam Öğrenci"
                  value={stats.totalOgrenciler.toString()}
                  icon="person-outline"
                  color="#FF9800"
                  onPress={() => Alert.alert('Öğrenciler', 'Öğrenci listesi açılacak')}
                />
                <StatCard
                  title="Sistem Durumu"
                  value="Aktif"
                  icon="checkmark-circle-outline"
                  color="#9C27B0"
                  onPress={() => Alert.alert('Sistem', 'Sistem durumu açılacak')}
                />
              </View>
            </View>

            {/* Admin Hızlı Eylemler */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Aktiviteler</Text>
              <View style={styles.quickActionsGrid}>
                <QuickAction
                  title="Rehber Ekle"
                  icon="people-outline"
                  color="#4CAF50"
                  onPress={() => navigation.navigate('CreateRehber')}
                />
                <QuickAction
                  title="Sistem Ayarları"
                  icon="settings-outline"
                  color="#2196F3"
                  onPress={() => Alert.alert('Sistem Ayarları', 'Sistem ayarları açılacak')}
                />
                <QuickAction
                  title="Raporlar"
                  icon="analytics-outline"
                  color="#FF9800"
                  onPress={() => Alert.alert('Raporlar', 'Detaylı raporlar açılacak')}
                />
                <QuickAction
                  title="Yedekleme"
                  icon="cloud-upload-outline"
                  color="#9C27B0"
                  onPress={() => Alert.alert('Yedekleme', 'Sistem yedekleme açılacak')}
                />
              </View>
            </View>

            {/* Son Admin Aktiviteler */}
            <View style={styles.recentContainer}>
              <Text style={styles.sectionTitle}>Son Admin Aktiviteler</Text>
              <View style={styles.activityList}>
                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="person-add" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Yeni rehber eklendi</Text>
                    <Text style={styles.activityTime}>1 saat önce</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#2196F3' }]}>
                    <Ionicons name="settings" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Sistem ayarları güncellendi</Text>
                    <Text style={styles.activityTime}>3 saat önce</Text>
                  </View>
                </View>

                <View style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="analytics" size={16} color="#fff" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Aylık rapor oluşturuldu</Text>
                    <Text style={styles.activityTime}>1 gün önce</Text>
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
    marginTop: -50,
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

export default AdminMainScreen;
