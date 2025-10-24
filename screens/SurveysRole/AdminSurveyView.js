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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAnketler, deleteAnket, toggleAnketStatus } from '../../redux/slice/anketSlice';
import { getAnketSonuclari } from '../../redux/slice/anketSonucSlice';
import StatCard from '../../components/ui/StatCard';
import QuestionCard from '../../components/ui/questionCard';

const AdminSurveyView = ({ navigation }) => {
  const dispatch = useDispatch();
  const { allAnketler, anketIstatistikleri, isLoading, error } = useSelector(state => state.anket);
  const { anketSonuclari, anketIstatistikleri: sonucIstatistikleri } = useSelector(state => state.anketSonuc);
  const { currentUser } = useSelector(state => state.user || {});

  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnket, setSelectedAnket] = useState(null);

  useEffect(() => {
    loadAnketler();
  }, []);

  const loadAnketler = async () => {
    try {
      await dispatch(getAllAnketler());
    } catch (error) {
      Alert.alert('Hata', 'Anketler yüklenirken bir hata oluştu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnketler();
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

  const renderAnketItem = ({ item }) => (
    <View style={styles.anketCard}>
      <View style={styles.anketHeader}>
        <Text style={styles.anketBaslik}>{item.baslik}</Text>
        <View style={[
          styles.durumBadge,
          { backgroundColor: item.isActive ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.durumText}>
            {item.isActive ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.anketAciklama}>{item.aciklama}</Text>
      
      <View style={styles.anketBilgileri}>
        <Text style={styles.bilgiText}>
          Rehber: {item.rehberBilgisi?.ad} {item.rehberBilgisi?.soyad}
        </Text>
        <Text style={styles.bilgiText}>
          Oluşturulma: {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
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

  const renderIstatistikler = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.istatistikContainer}
    >
      <StatCard
        title="Toplam Anket"
        value={anketIstatistikleri.toplamAnket}
        icon="📊"
        color="#2196F3"
      />
      <StatCard
        title="Aktif Anket"
        value={anketIstatistikleri.aktifAnket}
        icon="✅"
        color="#4CAF50"
      />
      <StatCard
        title="Tamamlanan"
        value={anketIstatistikleri.tamamlananAnket}
        icon="🏁"
        color="#FF9800"
      />
    </ScrollView>
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
      <Text style={styles.title}>Anket Yönetimi</Text>
      
      {renderIstatistikler()}
      
      <FlatList
        data={allAnketler}
        renderItem={renderAnketItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    alignItems: 'center',
    paddingHorizontal: 8,
    // space to separate from the list below and to keep some breathing room
    marginBottom: 20,
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
});

export default AdminSurveyView;
