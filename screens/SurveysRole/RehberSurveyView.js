import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getRehberAnketler,
  createRehberAnket,
  updateRehberAnket,
  deleteRehberAnket,
  getRehberDashboardData
} from '../../redux/slice/rehberSlice';
import { getAnketSonuclari } from '../../redux/slice/anketSonucSlice';
import StatCard from '../../components/ui/StatCard';
import QuestionCard from '../../components/ui/questionCard';

const { width, height } = Dimensions.get('window');

const RehberSurveyView = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    rehberInfo,
    anketler,
    dashboardStats,
    isLoading,
    error
  } = useSelector(state => state.rehber);
  const { currentUser } = useSelector(state => state.user || {});

  // Debug: Redux state'ini kontrol et
  console.log('RehberSurveyView - dashboardStats:', dashboardStats);
  console.log('RehberSurveyView - anketler:', anketler);
  console.log('RehberSurveyView - currentUser:', currentUser);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnket, setSelectedAnket] = useState(null);
  const [anketStats, setAnketStats] = useState({});

  useEffect(() => {
    if (currentUser?.id) {
      loadRehberAnketler();
    }
  }, [currentUser]);

  // Dashboard verilerini yükle
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getRehberDashboardData(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  // Anketler yüklendiğinde istatistikleri yükle
  useEffect(() => {
    if (anketler && anketler.length > 0) {
      loadAnketStats();
    }
  }, [anketler]);

  const loadRehberAnketler = async () => {
    try {
      await dispatch(getRehberAnketler(currentUser.id));
    } catch (error) {
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu');
    }
  };

  // Her anket için katılımcı sayısını hesapla
  const loadAnketStats = async () => {
    if (!anketler || anketler.length === 0) return;

    const stats = {};
    for (const anket of anketler) {
      try {
        const response = await fetch(`https://studentmindtracker-server-1.onrender.com/api/surveys/${anket.id}/results`);
        const data = await response.json();

        if (data.success && data.data) {
          stats[anket.id] = {
            katilimciSayisi: data.data.results?.length || 0,
            soruSayisi: anket.sorular?.length || 0
          };
        }
      } catch (error) {
        console.error(`Anket ${anket.id} istatistikleri yüklenirken hata:`, error);
        stats[anket.id] = {
          katilimciSayisi: 0,
          soruSayisi: anket.sorular?.length || 0
        };
      }
    }
    setAnketStats(stats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRehberAnketler();
    // Anketler yüklendikten sonra istatistikleri de yükle
    setTimeout(() => {
      loadAnketStats();
    }, 500);
    setRefreshing(false);
  };

  const handleYeniAnket = () => {
    navigation.navigate('CreateSurvey');
  };

  const handleAnketDuzenle = (anket) => {
    navigation.navigate('EditSurvey', {
      anketData: anket
    });
  };

  const handleAnketSil = (anketId) => {
    Alert.alert(
      'Anket Sil',
      'Bu anketi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => dispatch(deleteRehberAnket(anketId))
        }
      ]
    );
  };

  const handleAnketSonuclari = async (anketId) => {
    try {
      console.log('RehberSurveyView - Anket ID:', anketId);
      console.log('RehberSurveyView - Navigation objesi:', navigation);

      // Navigation kontrolü
      if (!navigation || typeof navigation.navigate !== 'function') {
        throw new Error('Navigation objesi bulunamadı veya navigate fonksiyonu yok');
      }

      const result = await dispatch(getAnketSonuclari(anketId));
      console.log('RehberSurveyView - Redux action sonucu:', result);

      if (result.type.endsWith('/rejected')) {
        throw new Error(result.payload || 'Redux action başarısız');
      }

      // Navigation'ı try-catch ile sar
      try {
        console.log('RehberSurveyView - SurveyResults sayfasına yönlendiriliyor...');
        navigation.navigate('SurveyResults', { anketId });
        console.log('RehberSurveyView - Navigation başarılı');
      } catch (navError) {
        console.error('RehberSurveyView - Navigation hatası:', navError);
        throw new Error(`Navigation hatası: ${navError.message}`);
      }
    } catch (error) {
      console.error('RehberSurveyView - Hata detayı:', error);
      Alert.alert('Hata', `Anket sonuçları yüklenirken bir hata oluştu: ${error.message}`);
    }
  };

  const handleAnketDurumDegistir = async (anketId, isActive) => {
    try {
      // Anket durumunu güncelle
      await dispatch(updateRehberAnket({
        anketId,
        anketData: { isActive: !isActive }
      }));

      // Anketler listesini yenile
      await dispatch(getRehberAnketler(currentUser.id));

      // Dashboard istatistiklerini yenile
      if (currentUser?.id) {
        await dispatch(getRehberDashboardData(currentUser.id));
      }

      // Alert mesajları kaldırıldı - sessiz işlem
    } catch (error) {
      console.error('Anket durumu değiştirilirken hata:', error);
      // Hata alert'i de kaldırıldı
    }
  };

  const renderAnketItem = ({ item }) => {
    if (!item) return null;
    return (
      <View style={styles.anketCard}>
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          style={styles.anketGradient}
        >
          <View style={styles.anketHeader}>
            <View style={styles.anketTitleContainer}>
              <Text style={styles.anketBaslik}>{item.baslik}</Text>
              <View style={styles.anketMeta}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.metaText}>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
            <View style={[
              styles.durumBadge,
              { backgroundColor: item.isActive ? '#4CAF50' : '#FF9800' }
            ]}>
              <Ionicons
                name={item.isActive ? 'checkmark-circle' : 'pause-circle'}
                size={12}
                color="#fff"
              />
              <Text style={styles.durumText}>
                {item.isActive ? 'Aktif' : 'Pasif'}
              </Text>
            </View>
          </View>

          <Text style={styles.anketAciklama}>{item.aciklama}</Text>

          <View style={styles.anketBilgileri}>
            <View style={styles.bilgiItem}>
              <Ionicons name="help-circle-outline" size={14} color="#666" />
              <Text style={styles.bilgiText}>
                {anketStats[item.id]?.soruSayisi || item.sorular?.length || 0} Soru
              </Text>
            </View>
            <View style={styles.bilgiItem}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.bilgiText}>
                {anketStats[item.id]?.katilimciSayisi || 0} Katılımcı
              </Text>
            </View>
          </View>

          <View style={styles.anketActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleAnketSonuclari(item.id)}
            >
              <Ionicons name="analytics-outline" size={14} color="#fff" />
              <Text style={styles.actionButtonText}>Sonuçlar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleAnketDuzenle(item)}
            >
              <Ionicons name="create-outline" size={14} color="#666" />
              <Text style={styles.secondaryButtonText}>Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleAnketDurumDegistir(item.id, item.isActive)}
            >
              <Ionicons
                name={item.isActive ? 'pause-outline' : 'play-outline'}
                size={14}
                color="#666"
              />
              <Text style={styles.secondaryButtonText}>
                {item.isActive ? 'Durdur' : 'Başlat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => handleAnketSil(item.id)}
            >
              <Ionicons name="trash-outline" size={14} color="#fff" />
              <Text style={styles.actionButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderIstatistikler = () => (
    <View style={styles.istatistikContainer}>
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Ionicons name="analytics-outline" size={20} color="#666" />
          <Text style={styles.statsTitle}>İstatistikler</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser?.rehberDetay?.ogrenciler?.length?.toString() || "0" || 0}</Text>
            <Text style={styles.statLabel}>Toplam Öğrenci</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dashboardStats?.aktifAnket || 0}</Text>
            <Text style={styles.statLabel}>Aktif Anket</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{dashboardStats?.tamamlananAnket || 0}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#49b66f" translucent={false} />

      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#49b66f"
              colors={['#49b66f']}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Scroll içinde Anket Yönetimi başlığı */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="clipboard-outline" size={24} color="#333" />
                <Text style={styles.title}>Anket Yönetimi</Text>
              </View>
              <TouchableOpacity
                style={styles.yeniAnketButton}
                onPress={handleYeniAnket}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.yeniAnketButtonText}>Yeni Anket</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderIstatistikler()}

          {anketler && anketler.length > 0 ? (
            <View style={styles.listContainer}>
              {anketler.map((item) => (
                <View key={item.id}>
                  {renderAnketItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyGradient}>
                <Ionicons name="clipboard-outline" size={48} color="#999" />
                <Text style={styles.emptyText}>Henüz anket bulunmuyor</Text>
                <Text style={styles.emptySubText}>
                  İlk anketinizi oluşturarak öğrencilerinizle etkileşime geçin
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleYeniAnket}
                >
                  <View style={styles.emptyButtonGradient}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.emptyButtonText}>İlk Anketinizi Oluşturun</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    marginTop: -47,
    paddingTop: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 0,
    marginTop: 0,
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 0,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#2c3e50',
    fontWeight: '700',
    marginLeft: 12,
  },
  yeniAnketButton: {
    backgroundColor: '#49b66f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  yeniAnketButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Yükleme stilleri kaldırıldı
  istatistikContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '700',
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    color: '#2c3e50',
    fontWeight: '800',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 4,
  },
  anketCard: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  anketGradient: {
    borderRadius: 20,
    padding: 24,
  },
  anketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  anketTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  anketBaslik: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 24,
  },
  anketAdi: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7f8c8d',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  anketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 6,
    fontWeight: '500',
  },
  durumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durumText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  anketAciklama: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '500',
  },
  anketBilgileri: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bilgiItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bilgiText: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    marginLeft: 6,
  },
  anketActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    minHeight: 36,
  },
  primaryButton: {
    backgroundColor: '#49b66f',
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e9ecef',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 5,
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 10,
    marginTop: -4,
  },
  emptyGradient: {
    borderRadius: 20,
    padding: 50,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    fontWeight: '500',
  },
  emptyButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#49b66f',
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RehberSurveyView;

