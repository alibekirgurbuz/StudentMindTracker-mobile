import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAnketler, deleteAnket, toggleAnketStatus } from '../../redux/slice/anketSlice';
import { getAnketSonuclari } from '../../redux/slice/anketSonucSlice';
import { getAdminStatistics, getAdminDashboardData } from '../../redux/slice/adminSlice';
import QuestionCard from '../../components/ui/questionCard';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

// Dairesel Progress Bar Bileşeni
const CircularProgress = ({ percentage, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (percentage / 100) * circumference;
  
  // Renk belirleme
  const getColor = () => {
    if (percentage >= 70) return '#10b981'; // Yeşil
    if (percentage >= 40) return '#f59e0b'; // Turuncu
    return '#ef4444'; // Kırmızı
  };
  
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* Arka plan çemberi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress çemberi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: size / 4.5, fontWeight: 'bold', color: '#374151' }}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

// AdminStatCard Bileşeni
const AdminStatCard = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statContent}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  </View>
);

const AdminSurveyView = ({ navigation }) => {
  const dispatch = useDispatch();
  const { allAnketler, anketIstatistikleri, isLoading, error } = useSelector(state => state.anket);
  const { anketSonuclari, anketIstatistikleri: sonucIstatistikleri } = useSelector(state => state.anketSonuc);
  const { currentUser } = useSelector(state => state.user || {});
  const { dashboardData, statistics } = useSelector(state => state.admin);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnket, setSelectedAnket] = useState(null);

  useEffect(() => {
    console.log('AdminSurveyView mounted');
    console.log('Current User:', currentUser);
    loadAnketler();
    dispatch(getAdminStatistics());
    dispatch(getAdminDashboardData());
  }, []);

  const loadAnketler = async () => {
    try {
      console.log('🔄 loadAnketler başlatıldı');
      const result = await dispatch(getAllAnketler());
      console.log('📦 getAllAnketler result:', JSON.stringify(result, null, 2));
      
      if (result.payload?.data) {
        console.log('📊 Anket sayısı:', result.payload.data.length);
        console.log('📊 İlk anket completedCount:', result.payload.data[0]?.completedCount);
        console.log('📊 İlk anket rehberBilgisi:', result.payload.data[0]?.rehberBilgisi);
      }
    } catch (error) {
      console.error('❌ loadAnketler hata:', error);
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnketler();
    await dispatch(getAdminStatistics());
    await dispatch(getAdminDashboardData());
    setRefreshing(false);
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
          onPress: () => dispatch(deleteAnket(anketId))
        }
      ]
    );
  };

  const handleAnketDurumDegistir = (anketId, isActive) => {
    dispatch(toggleAnketStatus({ anketId, isActive: !isActive }));
  };

  const handleAnketSonuclari = async (anketId) => {
    try {
      await dispatch(getAnketSonuclari(anketId));
      setSelectedAnket(anketId);
      // Sonuçlar sayfasına yönlendir
      navigation.navigate('AnketSonuclari', { anketId });
    } catch (error) {
      Alert.alert('Hata', 'Anket sonuçları yüklenirken bir hata oluştu');
    }
  };

  // Katılım oranı hesapla
  const calculateParticipationRate = (anket) => {
    console.log('\n📊 [Mobile] Katılım Hesaplaması:', anket.baslik);
    
    if (!anket.rehberBilgisi) {
      console.log('❌ Rehber bilgisi yok');
      return 0;
    }
    
    // Rehbere ait toplam öğrenci sayısı
    const allUsers = dashboardData?.allUsers || [];
    console.log('👥 Toplam kullanıcı sayısı:', allUsers.length);
    
    const totalStudents = allUsers.filter(
      u => u.role === 'Öğrenci' && 
      u.ogrenciDetay?.rehberID && 
      (u.ogrenciDetay.rehberID.toString() === anket.rehberBilgisi.id.toString() ||
       u.ogrenciDetay.rehberID === anket.rehberBilgisi.id)
    ).length;
    
    console.log('🎓 Bu rehbere ait öğrenci sayısı:', totalStudents);
    console.log('📝 Anketi tamamlayan sayısı:', anket.completedCount || 0);
    
    if (totalStudents === 0) {
      console.log('⚠️ Bu rehbere ait öğrenci bulunamadı');
      return 0;
    }
    
    // Anketi tamamlayan öğrenci sayısı (backend'den geliyor)
    const completedCount = anket.completedCount || 0;
    
    // Yüzdeyi hesapla
    const percentage = Math.round((completedCount / totalStudents) * 100);
    
    console.log('✅ Hesaplanan yüzde:', percentage + '%\n');
    
    // 100'ü geçmemesi için kontrol
    return Math.min(percentage, 100);
  };

  const renderAnketItem = ({ item }) => {
    const participationRate = calculateParticipationRate(item);
    
    return (
      <View style={styles.anketCard}>
        {/* Header with Progress Circle */}
        <View style={styles.anketHeaderWithProgress}>
          {/* Dairesel Progress Bar */}
          <CircularProgress percentage={participationRate} size={70} />
          
          {/* Anket Bilgileri */}
          <View style={styles.anketHeaderContent}>
            <View style={styles.anketHeaderTop}>
              <Text style={styles.anketBaslik} numberOfLines={2}>{item.baslik}</Text>
              <View style={[
                styles.durumBadge,
                { backgroundColor: item.isActive ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.durumText}>
                  {item.isActive ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
            <Text style={styles.anketAciklama} numberOfLines={2}>{item.aciklama}</Text>
            
            {/* Katılım Bilgisi */}
            <View style={styles.participationInfo}>
              <Ionicons name="people" size={14} color="#666" />
              <Text style={styles.participationText}>
                {item.completedCount || 0} öğrenci katıldı
              </Text>
            </View>
          </View>
        </View>
      
      {/* Anket Detay Bilgileri */}
      <View style={styles.anketBilgileri}>
        <View style={styles.bilgiRow}>
          <Ionicons name="person" size={14} color="#888" />
          <Text style={styles.bilgiText}>
            {item.rehberBilgisi?.ad} {item.rehberBilgisi?.soyad}
          </Text>
        </View>
        <View style={styles.bilgiRow}>
          <Ionicons name="calendar" size={14} color="#888" />
          <Text style={styles.bilgiText}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={styles.bilgiRow}>
          <Ionicons name="help-circle" size={14} color="#888" />
          <Text style={styles.bilgiText}>
            {item.sorular?.length || 0} Soru
          </Text>
        </View>
      </View>

      <View style={styles.anketActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.sonucButton]}
          onPress={() => handleAnketSonuclari(item.id)}
        >
          <Text style={styles.actionButtonText}>Sonuçlar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.durumButton]}
          onPress={() => handleAnketDurumDegistir(item.id, item.isActive)}
        >
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.silButton]}
          onPress={() => handleAnketSil(item.id)}
        >
          <Text style={styles.actionButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderIstatistikler = () => {
    // Redux'tan istatistikleri al
    const sinifSayisi = statistics?.classCount || 0;
    const toplamSonuc = statistics?.resultCount || 0;

    return (
      <View style={styles.istatistikContainer}>
        <View style={styles.statsRow}>
          <AdminStatCard
            title="Rehber"
            value={dashboardData?.rehberCount || 0}
            icon="people"
            color="#9C27B0"
          />
          <AdminStatCard
            title="Öğrenci"
            value={dashboardData?.studentCount || 0}
            icon="school"
            color="#2196F3"
          />
          <AdminStatCard
            title="Sınıf"
            value={sinifSayisi}
            icon="business"
            color="#FF9800"
          />
        </View>
        <View style={styles.statsRow}>
          <AdminStatCard
            title="Anketler"
            value={statistics?.surveyCount || anketIstatistikleri.toplamAnket || 0}
            icon="clipboard"
            color="#4CAF50"
          />
          <AdminStatCard
            title="Sonuçlar"
            value={toplamSonuc}
            icon="stats-chart"
            color="#F44336"
          />
          <View style={styles.statCardPlaceholder} />
        </View>
      </View>
    );
  };

  console.log('AdminSurveyView render - allAnketler:', allAnketler);
  console.log('AdminSurveyView render - isLoading:', isLoading);
  console.log('AdminSurveyView render - error:', error);
  console.log('AdminSurveyView render - allAnketler length:', allAnketler?.length);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Anketler yükleniyorr...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderIstatistikler()}
      
      {allAnketler && allAnketler.length > 0 ? (
        <FlatList
          data={allAnketler}
          renderItem={renderAnketItem}
          keyExtractor={(item) => item.id || item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Henüz anket bulunmuyor</Text>
          <Text style={styles.emptySubtext}>Rehberler tarafından oluşturulan anketler burada görünecektir</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginTop: -20,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  istatistikContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  anketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  anketHeaderWithProgress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  anketHeaderContent: {
    flex: 1,
  },
  anketHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  anketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anketBaslik: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  participationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  participationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  durumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  anketAciklama: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  anketBilgileri: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bilgiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  bilgiText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  anketActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  sonucButton: {
    backgroundColor: '#2196F3',
  },
  durumButton: {
    backgroundColor: '#FF9800',
  },
  silButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 70,
  },
  statCardPlaceholder: {
    flex: 1,
    marginHorizontal: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statTitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AdminSurveyView;
