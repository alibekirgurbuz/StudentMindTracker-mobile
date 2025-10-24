import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAnketSonuclari } from '../../redux/slice/anketSonucSlice';

const { width, height } = Dimensions.get('window');

const SurveyResults = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { anketId } = route.params;
  
  const { anketSonuclari, isLoading, error } = useSelector(state => state.anketSonuc);
  const { anketler } = useSelector(state => state.rehber);
  const { currentUser } = useSelector(state => state.user || {});
  
  const [selectedAnket, setSelectedAnket] = useState(null);
  const [sonuclar, setSonuclar] = useState(null);
  const [selectedTab, setSelectedTab] = useState('sinif'); // 'sinif', 'ogrenci', 'grafik'
  const [selectedSinif, setSelectedSinif] = useState('all');

  // Debug log'ları kaldırıldı

  useEffect(() => {
    if (anketId) {
      loadAnketSonuclari();
      findAnketDetails();
    }
  }, [anketId]);

  const loadAnketSonuclari = async () => {
    try {
      await dispatch(getAnketSonuclari(anketId));
    } catch (error) {
      Alert.alert('Hata', 'Anket sonuçları yüklenirken bir hata oluştu');
    }
  };

  const findAnketDetails = () => {
    const anket = anketler.find(a => a.id === anketId);
    if (anket) {
      setSelectedAnket(anket);
    }
  };

  useEffect(() => {
    if (anketSonuclari && anketSonuclari[anketId]) {
      setSonuclar(anketSonuclari[anketId]);
    } else {
      setSonuclar(null);
    }
  }, [anketSonuclari, anketId]);

  const renderTabButtons = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'sinif' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('sinif')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'sinif' && styles.tabButtonTextActive]}>
            Sınıf
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, selectedTab === 'ogrenci' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('ogrenci')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'ogrenci' && styles.tabButtonTextActive]}>
            Öğrenci
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, styles.tabButtonInactive]}
          onPress={() => Alert.alert('Grafik', 'İstatistik grafikleri yakında eklenecek')}
        >
          <Text style={[styles.tabButtonText, styles.tabButtonTextInactive]}>
            Grafik
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderIstatistikler = () => {
    // Rehbere ait toplam öğrenci sayısı
    const toplamOgrenci = currentUser?.rehberDetay?.ogrenciler?.length || 0;
    
    // Anketi tamamlayan öğrenci sayısı
    const tamamlananSayisi = sonuclar?.length || 0;
    
    // Tamamlanma yüzdesi
    const tamamlanmaYuzdesi = toplamOgrenci > 0 
      ? Math.round((tamamlananSayisi / toplamOgrenci) * 100) 
      : 0;

    return (
      <View style={styles.statsTopContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Toplam Öğrenci</Text>
          <Text style={styles.statBoxValue}>{toplamOgrenci}</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Tamamlanan</Text>
          <Text style={styles.statBoxValue}>{tamamlananSayisi}</Text>
        </View>
        
        <View style={[styles.statBox, styles.statBoxPercentage]}>
          <Text style={styles.statBoxPercentageValue}>%{tamamlanmaYuzdesi}</Text>
        </View>
      </View>
    );
  };

  const renderSinifFiltre = () => {
    // Sonuçlardan benzersiz sınıfları çıkar
    const siniflar = [...new Set(sonuclar?.map(s => s.ogrenciInfo?.sinif).filter(Boolean))] || [];
    
    if (siniflar.length === 0) {
      return null;
    }

    return (
      <View style={styles.sinifFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sinifChip, selectedSinif === 'all' && styles.sinifChipActive]}
            onPress={() => setSelectedSinif('all')}
          >
            <Text style={[styles.sinifChipText, selectedSinif === 'all' && styles.sinifChipTextActive]}>
              Tümü
            </Text>
          </TouchableOpacity>
          
          {siniflar.map((sinif) => (
            <TouchableOpacity
              key={sinif}
              style={[styles.sinifChip, selectedSinif === sinif && styles.sinifChipActive]}
              onPress={() => setSelectedSinif(sinif)}
            >
              <Text style={[styles.sinifChipText, selectedSinif === sinif && styles.sinifChipTextActive]}>
                {sinif}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSoruSonuclari = () => {
    if (!sonuclar || sonuclar.length === 0 || !selectedAnket) return null;

    // Seçili sınıfa göre sonuçları filtrele
    const filteredSonuclar = selectedSinif === 'all' 
      ? sonuclar 
      : sonuclar.filter(s => s.ogrenciInfo?.sinif === selectedSinif);

    if (filteredSonuclar.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bu sınıf için sonuç bulunmuyor</Text>
        </View>
      );
    }

    return selectedAnket.sorular?.map((soru, soruIndex) => {
      // Filtrelenmiş sonuçlardan cevapları topla
      const soruCevaplari = filteredSonuclar.map(sonuc => {
        // cevaplar array formatında olabilir
        const cevaplarArray = sonuc.cevaplar || sonuc.sonuc || [];
        
        // Index bazlı cevapları kontrol et
        if (Array.isArray(cevaplarArray) && cevaplarArray[soruIndex]) {
          return {
            ...cevaplarArray[soruIndex],
            ogrenciInfo: sonuc.ogrenciInfo,
            completedAt: sonuc.completedAt
          };
        }
        
        return null;
      }).filter(Boolean);
      
      return (
        <View key={soruIndex} style={styles.soruCard}>
          <View style={styles.soruHeader}>
            <Text style={styles.soruNumber}>Soru {soruIndex + 1}</Text>
            <Text style={styles.soruText}>{soru.soru}</Text>
          </View>
          
          <View style={styles.cevapContainer}>
            {soruCevaplari.length > 0 ? (
              soruCevaplari.map((cevap, cevapIndex) => (
                <View key={cevapIndex} style={styles.cevapItem}>
                  <View style={styles.cevapHeader}>
                    <Text style={styles.cevapLabel}>
                      {cevap.ogrenciInfo ? `${cevap.ogrenciInfo.ad} ${cevap.ogrenciInfo.soyad}` : `Katılımcı ${cevapIndex + 1}`}
                    </Text>
                    <Text style={styles.cevapTarih}>
                      {cevap.completedAt ? new Date(cevap.completedAt).toLocaleDateString('tr-TR') : 'Tarih bilinmiyor'}
                    </Text>
                  </View>
                  <Text style={styles.cevapText}>{cevap.cevap || 'Cevap yok'}</Text>
                </View>
              ))
            ) : (
              <View style={styles.cevapItem}>
                <Text style={styles.cevapText}>Henüz cevap verilmedi</Text>
              </View>
            )}
          </View>
        </View>
      );
    });
  };

  const renderOgrenciListesi = () => {
    if (!sonuclar || sonuclar.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#999" />
          <Text style={styles.emptyTitle}>Henüz Katılımcı Yok</Text>
          <Text style={styles.emptySubtitle}>
            Öğrenciler anketi tamamladığında burada görünecek
          </Text>
        </View>
      );
    }

    // Tamamlananları ve tamamlanmayanları ayır
    const tamamlananlar = sonuclar.filter(s => s.completedAt);
    const tamamlanmayanlar = sonuclar.filter(s => !s.completedAt);

    return (
      <View style={styles.ogrenciListContainer}>
        {/* Tamamlanan öğrenciler */}
        {tamamlananlar.map((sonuc, index) => {
          const ogrenciInfo = sonuc.ogrenciInfo;
          const ogrenciAdi = ogrenciInfo 
            ? `${ogrenciInfo.ad} ${ogrenciInfo.soyad}` 
            : `Öğrenci ${index + 1}`;
          
          return (
            <View key={sonuc.id || index} style={styles.ogrenciCard}>
              <View style={styles.ogrenciLeft}>
                <View style={[styles.ogrenciIcon, { backgroundColor: '#D4EDDA' }]}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="#28a745" 
                  />
                </View>
                <View style={styles.ogrenciInfo}>
                  <Text style={styles.ogrenciName}>{ogrenciAdi}</Text>
                  <Text style={styles.ogrenciStatus}>Completed</Text>
                </View>
              </View>
              <View style={styles.ogrenciRight}>
                <Text style={[styles.ogrenciPercentage, { color: '#28a745' }]}>
                  100%
                </Text>
              </View>
            </View>
          );
        })}

        {/* Tamamlanmayan öğrenciler */}
        {tamamlanmayanlar.map((sonuc, index) => {
          const ogrenciInfo = sonuc.ogrenciInfo;
          const ogrenciAdi = ogrenciInfo 
            ? `${ogrenciInfo.ad} ${ogrenciInfo.soyad}` 
            : `Öğrenci ${index + 1}`;
          
          return (
            <View key={sonuc.id || `incomplete-${index}`} style={styles.ogrenciCard}>
              <View style={styles.ogrenciLeft}>
                <View style={[styles.ogrenciIcon, { backgroundColor: '#F8D7DA' }]}>
                  <Ionicons 
                    name="close-circle" 
                    size={20} 
                    color="#dc3545" 
                  />
                </View>
                <View style={styles.ogrenciInfo}>
                  <Text style={styles.ogrenciName}>{ogrenciAdi}</Text>
                  <Text style={styles.ogrenciStatus}>Incomplete</Text>
                </View>
              </View>
              <View style={styles.ogrenciRight}>
                <Text style={[styles.ogrenciPercentage, { color: '#dc3545' }]}>
                  0%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Anket sonuçları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="analytics-outline" size={24} color="#fff" />
              <Text style={styles.title}>Anket Sonuçları</Text>
            </View>
            {selectedAnket && (
              <View style={styles.headerRight}>
                <Text style={styles.subtitle}>{selectedAnket.baslik}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          {/* Üst İstatistik Kartları */}
          {renderIstatistikler()}
          
          {/* Tab Butonları */}
          {renderTabButtons()}
          
          {/* İçerik - Seçili Tab'a göre */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {selectedTab === 'sinif' && (
              <>
                {renderSinifFiltre()}
                {renderSoruSonuclari()}
              </>
            )}
            {selectedTab === 'ogrenci' && renderOgrenciListesi()}
            {selectedTab === 'grafik' && (
              <View style={styles.emptyContainer}>
                <Ionicons name="bar-chart-outline" size={64} color="#999" />
                <Text style={styles.emptyTitle}>Grafik Görünümü</Text>
                <Text style={styles.emptySubtitle}>
                  İstatistik grafikleri yakında eklenecek
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
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
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'right',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Yeni Üst İstatistik Kartları
  statsTopContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  statBoxValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
  },
  statBoxPercentage: {
    backgroundColor: '#28a745',
  },
  statBoxPercentageValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  // Tab Butonları
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2196F3',
  },
  tabButtonInactive: {
    backgroundColor: '#e0e0e0',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  tabButtonTextInactive: {
    color: '#999',
  },
  // Öğrenci Listesi
  ogrenciListContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  ogrenciCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ogrenciLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ogrenciIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ogrenciInfo: {
    flex: 1,
  },
  ogrenciName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ogrenciStatus: {
    fontSize: 12,
    color: '#666',
  },
  ogrenciRight: {
    marginLeft: 12,
  },
  ogrenciPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Sınıf Filtresi
  sinifFilterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sinifChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sinifChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  sinifChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sinifChipTextActive: {
    color: '#fff',
  },
  istatistikContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    color: '#333',
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  soruCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  soruHeader: {
    marginBottom: 16,
  },
  soruNumber: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 4,
  },
  soruText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    lineHeight: 22,
  },
  cevapContainer: {
    gap: 12,
  },
  cevapItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  cevapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cevapLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cevapTarih: {
    fontSize: 12,
    color: '#999',
  },
  cevapText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  katilimciContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  katilimciHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  katilimciTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  katilimciCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  katilimciInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  katilimciAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  katilimciDetails: {
    flex: 1,
  },
  katilimciName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  katilimciTarih: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  katilimciStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  puanText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SurveyResults;
123