import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getOgrenciAnketler,
  getOgrenciAnket,
  submitAnketSonuc,
  getOgrenciAnketSonuclari
} from '../../redux/slice/ogrenciSlice';
import { getAktifAnketler } from '../../redux/slice/anketSlice';
import { getRehberAnketler } from '../../redux/slice/rehberSlice';
import StatCard from '../../components/ui/StatCard';
import QuestionCard from '../../components/ui/questionCard';

const OgrenciSurveyView = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    mevcutAnketler,
    seciliAnket,
    anketSonuclari,
    dashboardStats,
    isLoading,
    error
  } = useSelector(state => state.ogrenci);
  const { anketler: rehberAnketleri, isLoading: rehberLoading } = useSelector(state => state.rehber || {});
  const { currentUser } = useSelector(state => state.user || {});

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnketler();
  }, []);

  // RehberID'ye göre anketleri filtrele
  const getRehberAnketleri = () => {
    console.log('=== DEBUG: getRehberAnketleri ===');
    console.log('currentUser:', currentUser);
    // rehberID (büyük harfle ID) kullanılıyor
    const rehberId = currentUser?.ogrenciDetay?.rehberID || currentUser?.ogrenciDetay?.rehberId;
    console.log('rehberId:', rehberId);
    console.log('rehberAnketleri:', rehberAnketleri);
    console.log('rehberAnketleri length:', rehberAnketleri?.length);

    if (!rehberId || !rehberAnketleri) {
      console.log('Filtreleme başarısız: rehberId veya rehberAnketleri yok');
      return [];
    }

    const filtered = rehberAnketleri.filter(anket => {
      console.log('Anket rehberId:', anket.rehberId, 'Öğrenci rehberId:', rehberId);
      console.log('ID karşılaştırması:', anket.rehberId === rehberId);
      return anket.rehberId?.toString() === rehberId?.toString();
    });

    console.log('Filtrelenmiş anketler:', filtered);
    console.log('Filtrelenmiş anket sayısı:', filtered.length);
    return filtered;
  };

  const filteredAnketler = getRehberAnketleri();

  const loadAnketler = async () => {
    try {
      console.log('=== DEBUG: loadAnketler başladı ===');
      // rehberID (büyük harfle ID) kullanılıyor
      const rehberId = currentUser?.ogrenciDetay?.rehberID || currentUser?.ogrenciDetay?.rehberId;
      console.log('currentUser.ogrenciDetay.rehberID:', currentUser?.ogrenciDetay?.rehberID);
      console.log('currentUser.ogrenciDetay.rehberId:', currentUser?.ogrenciDetay?.rehberId);
      console.log('Kullanılacak rehberId:', rehberId);

      // Öğrenci anketlerini yükle
      await dispatch(getOgrenciAnketler());

      // Öğrenci anket sonuçlarını yükle
      if (currentUser?.id) {
        console.log('Anket sonuçları yükleniyor, ogrenciId:', currentUser.id);
        await dispatch(getOgrenciAnketSonuclari(currentUser.id));
        console.log('Anket sonuçları yüklendi');
      }

      // Rehber anketlerini de yükle
      if (rehberId) {
        console.log('Rehber anketleri yükleniyor, rehberId:', rehberId);
        await dispatch(getRehberAnketler(rehberId));
        console.log('Rehber anketleri yüklendi');
      } else {
        console.log('RehberId bulunamadı, rehber anketleri yüklenmedi');
      }
    } catch (error) {
      console.error('loadAnketler hatası:', error);
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnketler();
    setRefreshing(false);
  };

  const handleAnketBaslat = async (anket) => {
    try {
      await dispatch(getOgrenciAnket(anket.id));
      setSelectedAnket(anket);
      navigation.navigate('SurveyScreen', {
        anketId: anket.id,
        anketData: anket
      });
    } catch (error) {
      Alert.alert('Hata', 'Anket yüklenirken bir hata oluştu');
    }
  };

  const handleAnketSonuclari = async () => {
    try {
      await dispatch(getOgrenciAnketSonuclari(currentUser.id));
      navigation.navigate('AnketSonuclari', {
        ogrenciId: currentUser.id
      });
    } catch (error) {
      Alert.alert('Hata', 'Anket sonuçları yüklenirken bir hata oluştu');
    }
  };

  const handleAnketTamamla = async (anketId, cevaplar) => {
    try {
      await dispatch(submitAnketSonuc({
        ogrenciId: currentUser.id,
        anketId: anketId,
        sonuc: cevaplar
      }));
      Alert.alert('Başarılı', 'Anket başarıyla tamamlandı');
      loadAnketler(); // Anketleri yenile
    } catch (error) {
      Alert.alert('Hata', 'Anket kaydedilirken bir hata oluştu');
    }
  };

  const handleAnketBasla = (anket) => {
    console.log('=== DEBUG: handleAnketBasla ===');
    console.log('Anket:', anket);
    console.log('Anket sorular:', anket.sorular);
    console.log('Soru sayısı:', anket.sorular?.length);

    // QuestionsScreen'e navigate et
    navigation.navigate('QuestionsScreen', {
      anketData: anket
    });
  };


  const renderAnketItem = ({ item }) => {
    // Öğrenci ID'sini al ve string'e çevir
    const ogrenciId = (currentUser?.id || currentUser?._id)?.toString();

    console.log('=== ANKET TAMAMLANMA KONTROLÜ ===');
    console.log('Anket ID:', item.id);
    console.log('Öğrenci ID:', ogrenciId);
    console.log('anketSonuclari:', anketSonuclari);
    console.log('anketSonuclari length:', anketSonuclari?.length);

    // Bu öğrencinin bu anketi çözüp çözmediğini kontrol et
    const tamamlandi = anketSonuclari?.some(sonuc => {
      const sonucAnketId = (sonuc.anketId || sonuc.anket_id)?.toString();
      const sonucOgrenciId = (sonuc.ogrenciId || sonuc.ogrenci_id)?.toString();

      console.log('Sonuç kontrolü:', {
        sonucAnketId,
        sonucOgrenciId,
        itemId: item.id?.toString(),
        ogrenciId,
        anketMatch: sonucAnketId === item.id?.toString(),
        ogrenciMatch: sonucOgrenciId === ogrenciId
      });

      return sonucAnketId === item.id?.toString() && sonucOgrenciId === ogrenciId;
    }) || false;

    console.log('Tamamlandı mı?', tamamlandi);

    return (
      <View style={styles.anketCard}>
        <View style={styles.anketHeader}>
          <View style={styles.anketTitleContainer}>
            <Text style={styles.anketBaslik}>{item.baslik}</Text>
            <Text style={styles.anketTarih}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={[
            styles.durumBadge,
            { backgroundColor: tamamlandi ? '#4CAF50' : item.isActive ? '#2196F3' : '#FF9800' }
          ]}>
            <Text style={styles.durumText}>
              {tamamlandi ? 'Tamamlandı' : item.isActive ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>

        <Text style={styles.anketAciklama}>{item.aciklama}</Text>

        <View style={styles.anketBilgileri}>
          <View style={styles.bilgiRow}>
            <Text style={styles.bilgiLabel}>Soru Sayısı:</Text>
            <Text style={styles.bilgiValue}>{item.sorular?.length || 0}</Text>
          </View>
          <View style={styles.bilgiRow}>
            <Text style={styles.bilgiLabel}>Durum:</Text>
            <Text style={[styles.bilgiValue, { color: tamamlandi ? '#4CAF50' : item.isActive ? '#2196F3' : '#FF9800' }]}>
              {tamamlandi ? 'Tamamlandı' : item.isActive ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>

        <View style={styles.anketActions}>
          {!tamamlandi && item.isActive ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.baslatButton]}
              onPress={() => handleAnketBasla(item)}
            >
              <Text style={styles.actionButtonText}>Anketi Başlat</Text>
            </TouchableOpacity>
          ) : tamamlandi ? (
            <View
              style={[styles.actionButton, styles.tamamlandiButton]}
            >
              <Text style={styles.actionButtonText}>Bu Anketi Çözdünüz</Text>
            </View>
          ) : (
            <View
              style={[styles.actionButton, styles.pasifButton]}
            >
              <Text style={styles.actionButtonText}>Anket Pasif</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderIstatistikler = () => (
    <View style={styles.istatistikContainer}>
      <View style={styles.istatistikCard}>
        <Text style={styles.istatistikTitle}>Toplam Anket</Text>
        <Text style={styles.istatistikValue}>{filteredAnketler.length}</Text>
      </View>
      <View style={styles.istatistikCard}>
        <Text style={styles.istatistikTitle}>Tamamlanan</Text>
        <Text style={styles.istatistikValue}>
          {filteredAnketler.filter(anket => anketSonuclari?.some(sonuc => sonuc.anketId === anket.id)).length}
        </Text>
      </View>
      <View style={styles.istatistikCard}>
        <Text style={styles.istatistikTitle}>Bekleyen</Text>
        <Text style={styles.istatistikValue}>
          {filteredAnketler.filter(anket => !anketSonuclari?.some(sonuc => sonuc.anketId === anket.id) && anket.isActive).length}
        </Text>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Anketler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Anketlerim</Text>
      </View>

      {renderIstatistikler()}

      <FlatList
        data={filteredAnketler}
        renderItem={renderAnketItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz anket bulunmuyor</Text>
            <Text style={styles.emptySubText}>
              Rehber öğretmeniniz anket oluşturduğunda burada görünecek
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: -45,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sonucButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sonucButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: -25,
  },
  listContainer: {
    paddingBottom: 20,
  },
  anketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  anketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anketBaslik: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
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
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  anketBilgileri: {
    marginBottom: 16,
  },
  bilgiText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  anketActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  baslatButton: {
    backgroundColor: '#4CAF50',
  },
  tamamlandiButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Yeni modern UI stilleri
  anketTitleContainer: {
    flex: 1,
  },
  anketTarih: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bilgiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bilgiLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bilgiValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  pasifButton: {
    backgroundColor: '#9E9E9E',
  },
  // Soru ekranı stilleri
  soruEkrani: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  soruHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  soruBaslik: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  soruSayisi: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  soruCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  soruText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
  },
  seceneklerContainer: {
    gap: 12,
  },
  secenekButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  secenekButtonSelected: {
    backgroundColor: '#49b66f',
    borderColor: '#49b66f',
  },
  secenekText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  secenekTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  soruActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  soruButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  geriButton: {
    backgroundColor: '#6c757d',
  },
  ileriButton: {
    backgroundColor: '#49b66f',
  },
  tamamlaButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  soruButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  // İstatistik kartları
  istatistikCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  istatistikTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  istatistikValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
});

export default OgrenciSurveyView;
