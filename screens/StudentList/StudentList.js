import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getRehberOgrenciler } from '../../redux/slice/rehberSlice';

const { width } = Dimensions.get('window');

const StudentList = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user || {});
  const { ogrenciler: rehberOgrencileri, isLoading: dataLoading } = useSelector(state => state.rehber || {});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('Tümü');
  const [refreshing, setRefreshing] = useState(false);

  // Rehbere ait sınıfları al
  const rehberSiniflari = currentUser?.rehberDetay?.siniflar || [];
  const classes = ['Tümü', ...rehberSiniflari];

  // Öğrenci verilerini yükle
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getRehberOgrenciler(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  // İlk yükleme ve veri değişikliğinde filtreleme
  useEffect(() => {
    applyFilters();
  }, [rehberOgrencileri, selectedClass]);

  // Filtreleme fonksiyonu
  const applyFilters = () => {
    let filtered = rehberOgrencileri || [];

    // Sınıf filtresi
    if (selectedClass !== 'Tümü') {
      filtered = filtered.filter(student => student.ogrenciDetay?.sinif === selectedClass);
    }

    setFilteredStudents(filtered);
  };

  // Refresh fonksiyonu
  const onRefresh = async () => {
    setRefreshing(true);
    if (currentUser?.id) {
      await dispatch(getRehberOgrenciler(currentUser.id));
    }
    setRefreshing(false);
  };

  const StudentCard = ({ student }) => (
    <TouchableOpacity style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>
          {student.ad?.charAt(0)}{student.soyad?.charAt(0)}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.ad} {student.soyad}</Text>
        <View style={styles.studentDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="school-outline" size={14} color="#666" />
            <Text style={styles.detailText}>{student.ogrenciDetay?.sinif || 'Sınıf belirtilmemiş'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={14} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>{student.email || 'Email yok'}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="chevron-forward" size={24} color="#49b66f" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ClassFilterButton = ({ classText }) => {
    const isActive = selectedClass === classText;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]}
        onPress={() => setSelectedClass(classText)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.filterChipText,
          isActive && styles.filterChipTextActive
        ]}>
          {classText}
        </Text>
        {isActive && (
          <View style={styles.filterChipDot} />
        )}
      </TouchableOpacity>
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Öğrenci Listesi</Text>
            <View style={styles.headerBadge}>
              <Ionicons name="people" size={14} color="#fff" />
              <Text style={styles.headerSubtitle}>
                {filteredStudents.length}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Sınıf Filtreleri */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {classes.map((classText) => (
              <ClassFilterButton key={classText} classText={classText} />
            ))}
          </ScrollView>

          {/* Öğrenci Listesi */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.studentListContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#49b66f"
                colors={['#49b66f']}
              />
            }
          >
            {dataLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#49b66f" />
                <Text style={styles.loadingText}>Öğrenciler yükleniyor...</Text>
              </View>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <StudentCard key={student.id || index} student={student} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {selectedClass !== 'Tümü'
                    ? 'Bu sınıfta öğrenci bulunamadı'
                    : 'Henüz öğrenci bulunmuyor'}
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 4,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    marginTop: -30,
  },
  filterContainer: {
    marginBottom: 16,
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    height: 36,
  },
  filterChipActive: {
    backgroundColor: '#49b66f',
    borderColor: '#49b66f',
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginLeft: 6,
  },
  studentListContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    marginBottom: 350,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#49b66f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  studentDetails: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  actionButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default StudentList;
