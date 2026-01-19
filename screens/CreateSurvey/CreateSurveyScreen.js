import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { createRehberAnket } from '../../redux/slice/rehberSlice';
import QuestionCard from '../../components/ui/questionCard';

const CreateSurveyScreen = ({ navigation: propNavigation = null }) => {
  const navigation = useNavigation() || propNavigation;
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.user || {});
  const { isLoading } = useSelector(state => state.rehber || {});

  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, text: '', type: 'multiple_choice', options: ['', '', '', ''] }
  ]);
  const [isPublishing, setIsPublishing] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      text: '',
      type: 'multiple_choice',
      options: ['', '', '', '']
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.map((opt, idx) =>
            idx === optionIndex ? value : opt
          )
        }
        : q
    ));
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, ''] }
        : q
    ));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? {
          ...q,
          options: q.options.filter((_, idx) => idx !== optionIndex)
        }
        : q
    ));
  };

  const publishSurvey = async () => {
    try {
      // Form validasyonu
      if (!surveyTitle.trim()) {
        Alert.alert('Hata', 'Anket başlığı gereklidir');
        return;
      }

      const validQuestions = questions.filter(q => q.text.trim() !== '');
      if (validQuestions.length === 0) {
        Alert.alert('Hata', 'En az bir soru eklemelisiniz');
        return;
      }

      // Seçenek validasyonu
      for (const question of validQuestions) {
        const validOptions = question.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          Alert.alert('Hata', `"${question.text}" sorusu için en az 2 seçenek girmelisiniz`);
          return;
        }
      }

      setIsPublishing(true);

      // Anket verisi hazırla
      const surveyData = {
        baslik: surveyTitle.trim(),
        aciklama: surveyDescription.trim(),
        sorular: validQuestions.map(q => ({
          soru: q.text.trim(),
          secenekler: q.options.filter(opt => opt.trim() !== ''),
          tip: q.type
        })),
        isActive: true,
        createdAt: new Date().toISOString(),
        rehberId: currentUser?.id
      };

      // Redux action dispatch et
      const result = await dispatch(createRehberAnket({
        rehberId: currentUser?.id,
        anketData: surveyData
      }));

      if (result.type.endsWith('/fulfilled')) {
        Alert.alert(
          'Başarılı',
          'Anket başarıyla oluşturuldu ve öğrencilere gönderildi!',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        console.error('Redux action failed:', result);
        throw new Error(result.payload || 'Anket oluşturulamadı');
      }
    } catch (error) {
      console.error('Anket oluşturma hatası:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        data: error.data
      });

      let errorMessage = 'Anket oluşturulurken bir hata oluştu';

      if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      if (error.response?.data?.message) {
        errorMessage += `\n\nDetay: ${error.response.data.message}`;
      }

      Alert.alert('Hata', errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginBottom: -4 }} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Anket Oluştur</Text>
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Anket Başlığı</Text>
                <TextInput
                  style={styles.textInput}
                  value={surveyTitle}
                  onChangeText={setSurveyTitle}
                  placeholder="Anket başlığını girin"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Açıklama (İsteğe bağlı)</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={surveyDescription}
                  onChangeText={setSurveyDescription}
                  placeholder="Anket açıklamasını girin"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.questionsSection}>
              <View style={styles.questionsHeader}>
                <Text style={styles.sectionTitle}>Sorular</Text>
                <TouchableOpacity onPress={addQuestion} style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#4F46E5" />
                  <Text style={styles.addButtonText}>Soru Ekle</Text>
                </TouchableOpacity>
              </View>

              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdateQuestion={updateQuestion}
                  onUpdateOption={updateOption}
                  onRemoveQuestion={removeQuestion}
                  onAddOption={addOption}
                  onRemoveOption={removeOption}
                  canRemove={questions.length > 1}
                />
              ))}
            </View>

            {/* Publish Button - Scroll Content'in en altında */}
            <View style={styles.publishSection}>
              <TouchableOpacity
                onPress={publishSurvey}
                style={styles.publishButton}
                disabled={isPublishing}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.publishGradient}
                >
                  {isPublishing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                  <Text style={styles.publishButtonText}>
                    {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 36,
    marginTop: -24,
  },
  keyboardContainer: {
    flex: 1,
    marginTop: -47,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,

  },
  questionsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2c3e50',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#49b66f',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  publishSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 100,
  },
  publishButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  publishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
});

export default CreateSurveyScreen;
