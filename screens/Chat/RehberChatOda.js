import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { getRehberOgrenciler } from '../../redux/slice/rehberSlice';

const RehberChatOda = ({ navigation }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [studentsByClass, setStudentsByClass] = useState({});

  // Redux store'dan verileri al
  const { currentUser } = useSelector(state => state.user);
  const { ogrenciler } = useSelector(state => state.rehber);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUser && currentUser.id) {
      dispatch(getRehberOgrenciler(currentUser.id));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (ogrenciler && ogrenciler.length > 0) {
      // Test User'ı filtrele ve normalize et
      const normalizedOgrenciler = ogrenciler
        .filter(student => {
          const ad = (student.ad || '').toLowerCase().trim();
          const soyad = (student.soyad || '').toLowerCase().trim();
          const fullName = `${ad} ${soyad}`.trim();

          // Test User'ı kaldır - tüm kombinasyonlar
          const isTestUser =
            ad === 'test' ||
            soyad === 'user' ||
            fullName === 'test user' ||
            fullName === 'testuser' ||
            fullName.includes('test') && fullName.includes('user') ||
            ad.includes('test') ||
            soyad.includes('user');

          return !isTestUser;
        })
        .map(student => ({
          ...student,
          id: student.id || student._id // _id'yi id'ye normalize et
        }));

      const groupedStudents = normalizedOgrenciler.reduce((acc, student) => {
        const sinif = student.ogrenciDetay?.sinif || 'Sınıf bilgisi bulunamadı';
        if (!acc[sinif]) {
          acc[sinif] = [];
        }
        acc[sinif].push(student);
        return acc;
      }, {});

      setStudentsByClass(groupedStudents);

      // İlk sınıfı seç
      const firstClass = Object.keys(groupedStudents)[0];
      if (firstClass) {
        setSelectedClass(firstClass);
      }
    }
  }, [ogrenciler]);

  const handleStudentPress = (student) => {
    // Öğrenci ile sohbet ekranına git
    navigation.navigate('ChatScreen', {
      studentId: student.id,
      studentName: `${student.ad} ${student.soyad}`,
      roomType: 'individual',
      studentInfo: student
    });
  };

  const handleClassPress = (sinif) => {
    setSelectedClass(sinif);
  };

  const renderStudentItem = ({ item }) => {
    // Test User'ı gösterme - güçlü filtreleme
    const ad = (item.ad || '').toLowerCase().trim();
    const soyad = (item.soyad || '').toLowerCase().trim();
    const fullName = `${ad} ${soyad}`.trim();

    const isTestUser =
      ad === 'test' ||
      soyad === 'user' ||
      fullName === 'test user' ||
      ad.includes('test') ||
      soyad.includes('user');

    if (isTestUser) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.studentItem}
        onPress={() => handleStudentPress(item)}
      >
        <View style={styles.studentInfo}>
          <View style={styles.studentAvatar}>
            <Text style={styles.studentInitial}>
              {item.ad.charAt(0).toUpperCase()}{item.soyad.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{item.ad} {item.soyad}</Text>
            <Text style={[
              styles.studentClass,
              !item.ogrenciDetay?.sinif && styles.noClassText
            ]}>
              {item.ogrenciDetay?.sinif || 'Sınıf bilgisi eklenmemiş'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#49b66f" />
      </TouchableOpacity>
    );
  };

  const renderClassItem = ({ item: sinif }) => (
    <TouchableOpacity
      style={[
        styles.classItem,
        selectedClass === sinif && styles.selectedClassItem
      ]}
      onPress={() => handleClassPress(sinif)}
    >
      <Text style={[
        styles.classText,
        selectedClass === sinif && styles.selectedClassText
      ]}>
        {sinif}
      </Text>
      <Text style={styles.studentCount}>
        {studentsByClass[sinif]?.length || 0} öğrenci
      </Text>
    </TouchableOpacity>
  );

  const classes = Object.keys(studentsByClass);

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
          <Text style={styles.title}>Sınıf Sohbetleri</Text>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Sınıf Listesi */}
          <View style={styles.classSection}>
            <Text style={styles.sectionTitle}>Sınıflar</Text>
            <FlatList
              data={classes}
              renderItem={renderClassItem}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.classList}
            />
          </View>

          {/* Öğrenci Listesi */}
          <View style={styles.studentSection}>
            <Text style={styles.sectionTitle}>
              {selectedClass ? `${selectedClass} Sınıfı Öğrencileri` : 'Öğrenci Seçin'}
            </Text>
            {selectedClass && studentsByClass[selectedClass] ? (
              <FlatList
                data={studentsByClass[selectedClass]}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item.id || item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.studentList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Öğrenci bulunamadı</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginLeft: 40,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 12,
    marginTop: -30,
  },
  classSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  classList: {
    paddingHorizontal: 4,
  },
  classItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedClassItem: {
    backgroundColor: '#49b66f',
  },
  classText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedClassText: {
    color: '#fff',
  },
  studentCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  studentSection: {
    flex: 1,
  },
  studentList: {
    paddingBottom: 20,
  },
  studentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#49b66f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
  },
  noClassText: {
    color: '#ff9800',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default RehberChatOda;
