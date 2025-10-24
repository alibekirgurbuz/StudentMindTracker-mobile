import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TextInput,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateRehberAnket } from '../../redux/slice/rehberSlice';

const { width, height } = Dimensions.get('window');

const EditSurvey = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { anketData } = route.params;
  
  // Debug: Anket verilerini kontrol et
  console.log('EditSurvey - anketData:', anketData);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    baslik: anketData?.baslik || anketData?.title || '',
    aciklama: anketData?.aciklama || anketData?.description || '',
    isActive: anketData?.isActive || false,
    expiryDate: anketData?.expiryDate || '',
    targetClasses: anketData?.targetClasses || [],
    sorular: anketData?.sorular || anketData?.questions || []
  });
  
  // Debug: Form verilerini kontrol et
  console.log('EditSurvey - formData:', formData);

  const handleSave = async () => {
    try {
      // Form validasyonu
      if (!formData.baslik.trim()) {
        Alert.alert('Hata', 'Anket başlığı boş olamaz');
        return;
      }
      
      if (!formData.aciklama.trim()) {
        Alert.alert('Hata', 'Anket açıklaması boş olamaz');
        return;
      }
      
      setIsLoading(true);
      
      const updateData = {
        anketId: anketData.id,
        anketData: {
          baslik: formData.baslik.trim(),
          aciklama: formData.aciklama.trim(),
          isActive: formData.isActive,
          expiryDate: formData.expiryDate.trim(),
          targetClasses: formData.targetClasses,
          sorular: formData.sorular
        }
      };

      await dispatch(updateRehberAnket(updateData));
      
      // Alert kaldırıldı - sessiz kaydetme
      navigation.goBack();
    } catch (error) {
      console.error('Anket güncelleme hatası:', error);
      Alert.alert('Hata', 'Anket güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Değişiklikleri Kaydet',
      'Yapılan değişiklikler kaydedilmeden çıkılsın mı?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çık', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

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
                onPress={handleCancel}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Ionicons name="create-outline" size={24} color="#fff" />
              <Text style={styles.title}>Anket Düzenle</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.subtitle}>{formData.baslik}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="create-outline" size={20} color="#667eea" />
                <Text style={styles.infoTitle}>Anket Bilgilerini Düzenle</Text>
              </View>
              
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Anket Başlığı:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.baslik}
                  onChangeText={(text) => setFormData({...formData, baslik: text})}
                  placeholder="Anket başlığını girin"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Açıklama:</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={formData.aciklama}
                  onChangeText={(text) => setFormData({...formData, aciklama: text})}
                  placeholder="Anket açıklamasını girin"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Anket Durumu:</Text>
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>
                    {formData.isActive ? 'Aktif' : 'Pasif'}
                  </Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({...formData, isActive: value})}
                    trackColor={{ false: '#e9ecef', true: '#667eea' }}
                    thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>
              
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Bitiş Tarihi:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.expiryDate}
                  onChangeText={(text) => setFormData({...formData, expiryDate: text})}
                  placeholder="YYYY-MM-DD formatında girin"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputItem}>
                <Text style={styles.inputLabel}>Hedef Sınıflar:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.targetClasses.join(', ')}
                  onChangeText={(text) => setFormData({...formData, targetClasses: text.split(', ').filter(c => c.trim())})}
                  placeholder="Sınıfları virgülle ayırarak girin (örn: 6-A, 7-B)"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Soru Sayısı:</Text>
                <Text style={styles.infoValue}>{formData.sorular.length} Soru</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Ionicons name="close" size={20} color="#666" />
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputItem: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: '#667eea',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditSurvey;
