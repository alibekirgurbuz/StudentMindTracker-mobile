import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const OgrenciChatOda = ({ navigation }) => {
  const [classmates, setClassmates] = useState([]);
  const [rehberInfo, setRehberInfo] = useState(null);

  // Redux store'dan verileri al
  const { currentUser, token, isAuthenticated } = useSelector(state => state.user);

  useEffect(() => {
    if (currentUser && currentUser.id && token && isAuthenticated) {
      loadClassroomData();
    }
  }, [currentUser, token, isAuthenticated]);

  const loadClassroomData = async () => {
    try {
      if (!token || !currentUser) {
        console.error('Token veya kullanıcı bilgisi bulunamadı');
        return;
      }

      // Önce rehber bilgisini Redux store'dan al
      const userRehberId = currentUser?.ogrenciDetay?.rehberID;

      if (userRehberId && userRehberId !== 'unknown' && userRehberId !== '') {

        // Rehber bilgisini API'den çek
        try {
          const rehberResponse = await fetch(`https://studentmindtracker-server-1.onrender.com/api/users/${userRehberId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (rehberResponse.ok) {
            const rehberData = await rehberResponse.json();
            setRehberInfo(rehberData);
          } else {
            console.error('Rehber bilgisi alınamadı');
            const fallbackInfo = {
              id: userRehberId,
              ad: 'Rehber',
              soyad: 'Öğretmen',
              role: 'Rehber'
            };
            setRehberInfo(fallbackInfo);
          }
        } catch (rehberError) {
          console.error('Rehber bilgisi yüklenirken hata:', rehberError);
          const fallbackInfo = {
            id: userRehberId,
            ad: 'Rehber',
            soyad: 'Öğretmen',
            role: 'Rehber'
          };
          setRehberInfo(fallbackInfo);
        }
      } else {
        // Rehber ID yoksa null olarak bırak
        setRehberInfo(null);
      }

      // Aynı sınıftaki öğrencileri al

      const response = await fetch('https://studentmindtracker-server-1.onrender.com/api/chat/classroom-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const classmatesData = data.classmates || [];
        const currentUserClass = currentUser.ogrenciDetay?.sinif;

        const sameClassStudents = classmatesData
          .filter(student => {
            const studentClass = student.ogrenciDetay?.sinif;

            // Sınıfı olmayan veya aynı sınıftaki öğrencileri göster
            if (!studentClass) {
              return true;
            }

            return studentClass === currentUserClass;
          })
          .map(student => ({
            ...student,
            id: student.id || student._id // _id'yi id'ye normalize et
          }));

        setClassmates(sameClassStudents);
      } else {
        const errorData = await response.json();
        console.error('Classroom API Error:', errorData);
        Alert.alert('Hata', errorData.message || 'Veriler yüklenemedi');
      }
    } catch (error) {
      console.error('Sınıf verileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  const handleStudentPress = (student) => {
    // Sınıf arkadaşı ile sohbet ekranına git
    navigation.navigate('ChatScreen', {
      studentId: student.id,
      studentName: `${student.ad} ${student.soyad}`,
      roomType: 'individual',
      studentInfo: student
    });
  };

  const handleRehberPress = () => {
    // Rehber bilgisi yoksa kullanıcıya bilgi ver
    if (!rehberInfo) {
      Alert.alert(
        'Rehber Atanmamış',
        'Henüz size bir rehber öğretmen atanmamış. Lütfen okul yönetimiyle iletişime geçin.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // Rehber ID kontrolü
    if (!rehberInfo.id || rehberInfo.id === 'unknown') {
      Alert.alert(
        'Hata',
        'Rehber bilgileri geçersiz. Lütfen okul yönetimiyle iletişime geçin.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    try {
      // Rehber ile sohbet ekranına git
      navigation.navigate('ChatScreen', {
        studentId: rehberInfo.id,
        studentName: `${rehberInfo.ad} ${rehberInfo.soyad}`,
        roomType: 'individual',
        studentInfo: rehberInfo
      });
    } catch (error) {
      console.error('Navigation hatası:', error);
      Alert.alert('Hata', 'Sohbet ekranına geçiş yapılamadı.');
    }
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


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Sınıf Sohbetleri</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Rehber Bölümü */}
          <View style={styles.rehberSection}>
            <Text style={styles.sectionTitle}>Rehber Öğretmenim</Text>
            {rehberInfo && rehberInfo.id && rehberInfo.id !== 'unknown' ? (
              <TouchableOpacity
                style={styles.rehberItem}
                onPress={handleRehberPress}
                activeOpacity={0.7}
              >
                <View style={styles.studentInfo}>
                  <View style={[styles.studentAvatar, styles.rehberAvatar]}>
                    <Text style={styles.studentInitial}>
                      {rehberInfo.ad?.charAt(0).toUpperCase()}{rehberInfo.soyad?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{rehberInfo.ad} {rehberInfo.soyad}</Text>
                    <Text style={styles.studentClass}>Rehber Öğretmen</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#49b66f" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.rehberItem, styles.rehberItemDisabled]}
                onPress={handleRehberPress}
                activeOpacity={0.6}
              >
                <View style={styles.studentInfo}>
                  <View style={[styles.studentAvatar, styles.rehberAvatarDisabled]}>
                    <Ionicons name="person-outline" size={24} color="#999" />
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, styles.disabledText]}>Rehber Öğretmen</Text>
                    <Text style={[styles.studentClass, styles.warningText]}>Henüz atanmadı</Text>
                  </View>
                </View>
                <Ionicons name="information-circle-outline" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sınıf Arkadaşları Listesi */}
          <View style={styles.studentSection}>
            <Text style={styles.sectionTitle}>Sınıf Arkadaşlarım</Text>
            {classmates.length > 0 ? (
              <FlatList
                data={classmates}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item.id || item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.studentList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Sınıf arkadaşı bulunamadı</Text>
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
    paddingTop: 50,
    paddingBottom: 13,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  rehberSection: {
    marginBottom: 20,
    marginTop: -35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#796c69d8',
    marginBottom: 12,
  },
  rehberItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#49b66f',
  },
  rehberAvatar: {
    backgroundColor: '#49b66f',
  },
  rehberItemDisabled: {
    opacity: 0.7,
    borderLeftColor: '#999',
  },
  rehberAvatarDisabled: {
    backgroundColor: '#e0e0e0',
  },
  disabledText: {
    color: '#999',
  },
  warningText: {
    color: '#ff9800',
    fontWeight: '500',
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

export default OgrenciChatOda;
