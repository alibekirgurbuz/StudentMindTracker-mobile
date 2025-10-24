import React, { useState, useEffect } from 'react';
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
import { logoutUser } from '../redux/slice/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById, getAllUsers } from '../services/authService';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { token, userEmail, userId, userProfile: reduxUserProfile, currentUser } = useSelector(state => state.user || {});
  const userRole = currentUser?.role;
  
  // Debug log'ları useEffect'lere taşındı
  
  const [userProfile, setUserProfile] = useState(null);
  const userProfileData = userProfile || reduxUserProfile;
  const [rehberBilgisi, setRehberBilgisi] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kullanıcı profil bilgilerini ve rehber bilgilerini yükle
  useEffect(() => {
    loadUserProfile();
  }, []);

  // currentUser değiştiğinde rehber bilgisini yükle
  useEffect(() => {
    console.log('ProfileScreen - currentUser değişti:', currentUser);
    console.log('ProfileScreen - userRole:', userRole);
    console.log('ProfileScreen - currentUser.ogrenciDetay:', currentUser?.ogrenciDetay);
    
    if (currentUser && currentUser.role === 'Öğrenci' && currentUser.ogrenciDetay && currentUser.ogrenciDetay.rehberID) {
      loadRehberBilgisi();
    }
  }, [currentUser]);

  // rehberBilgisi değiştiğinde log'la
  useEffect(() => {
    console.log('ProfileScreen - rehberBilgisi güncellendi:', rehberBilgisi);
  }, [rehberBilgisi]);

  const loadRehberBilgisi = async () => {
    try {
      if (currentUser && currentUser.ogrenciDetay && currentUser.ogrenciDetay.rehberID) {
        const rehberData = await getUserById(token, currentUser.ogrenciDetay.rehberID);
        setRehberBilgisi(rehberData);
        console.log('Rehber bilgisi yüklendi:', rehberData);
        console.log('State güncellendi, yeni rehberBilgisi:', rehberData);
      }
    } catch (rehberError) {
      console.error('Rehber bilgileri alınırken hata:', rehberError);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      if (token && userId) {
        // Mevcut kullanıcının profil bilgilerini getir
        const currentUser = await getUserById(token, userId);
        
        if (currentUser) {
          setUserProfile(currentUser);
        }
      }
    } catch (error) {
      console.error('Profil bilgileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
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
              // AsyncStorage'den token'ı temizle
              await AsyncStorage.removeItem('userToken');
              // Redux state'ini temizle
              dispatch(logoutUser());
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <Ionicons name={icon} size={24} color="#667eea" />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
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
            <Text style={styles.title}>Profil 👤</Text>
            <Text style={styles.subtitle}>Hesap bilgileriniz</Text>
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
        <View style={styles.profileContainer}>
          {/* Profil Bilgileri */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#667eea" />
              </View>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Rol: {userRole}</Text>
            </View>
            <Text style={styles.userEmail}>
              {currentUser ? `${currentUser.ad} ${currentUser.soyad}` : userEmail}
            </Text>
            
            {/* Öğrenci ise sorumlu rehber bilgisi */}
            {userRole === 'Öğrenci' && (
              <View style={styles.rehberInfo}>
                <Text style={styles.rehberLabel}>
                  {rehberBilgisi ? 
                    `Sorumlu Rehber: ${rehberBilgisi.ad} ${rehberBilgisi.soyad}` : 
                    'Rehber bilgisi yükleniyor...'
                  }
                </Text>
              </View>
            )}
            
            {/* Öğrenci detay bilgileri */}
            {userProfileData && userProfileData.role === 'Öğrenci' && userProfileData.ogrenciDetay && (
              <View style={styles.studentDetails}>
                {userProfileData.ogrenciDetay.yas && (
                  <Text style={styles.detailText}>Yaş: {userProfileData.ogrenciDetay.yas}</Text>
                )}
                {userProfileData.ogrenciDetay.sinif && (
                  <Text style={styles.detailText}>Sınıf: {userProfileData.ogrenciDetay.sinif}</Text>
                )}
              </View>
            )}
            
            {/* Rehber detay bilgileri */}
            {userProfileData && userProfileData.role === 'Rehber' && userProfileData.rehberDetay && userProfileData.rehberDetay.siniflar && (
              <View style={styles.rehberDetails}>
                <Text style={styles.detailText}>
                  Sorumlu Sınıflar: {userProfileData.rehberDetay.siniflar.join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Profil Seçenekleri */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionsList}>
              <ProfileItem
                icon="person-outline"
                title="Kişisel Bilgiler"
                subtitle="Ad, soyad ve iletişim bilgileri"
                onPress={() => Alert.alert('Kişisel Bilgiler', 'Kişisel bilgiler sayfası açılacak')}
              />
              <ProfileItem
                icon="lock-closed-outline"
                title="Şifre Değiştir"
                subtitle="Hesap güvenliğiniz için"
                onPress={() => Alert.alert('Şifre Değiştir', 'Şifre değiştirme sayfası açılacak')}
              />
              <ProfileItem
                icon="notifications-outline"
                title="Bildirimler"
                subtitle="Bildirim ayarlarınız"
                onPress={() => Alert.alert('Bildirimler', 'Bildirim ayarları açılacak')}
              />
              <ProfileItem
                icon="shield-checkmark-outline"
                title="Gizlilik"
                subtitle="Gizlilik ve güvenlik ayarları"
                onPress={() => Alert.alert('Gizlilik', 'Gizlilik ayarları açılacak')}
              />
              <ProfileItem
                icon="help-circle-outline"
                title="Yardım & Destek"
                subtitle="Sık sorulan sorular ve destek"
                onPress={() => Alert.alert('Yardım', 'Yardım sayfası açılacak')}
              />
              <ProfileItem
                icon="information-circle-outline"
                title="Hakkında"
                subtitle="Uygulama bilgileri"
                onPress={() => Alert.alert('Hakkında', 'Uygulama hakkında bilgiler')}
              />
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
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  subtitle: {
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
    marginTop: -24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#667eea',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#667eea15',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
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
  optionsContainer: {
    marginBottom: 20,
  },
  optionsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  rehberInfo: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#667eea20',
    alignItems: 'center',
  },
  rehberLabel: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    textAlign: 'center',
  },
  studentDetails: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#667eea20',
  },
  rehberDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default ProfileScreen;
