import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, clearUser } from '../../redux/slice/userSlice';
import { login, testConnection } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTextInput from '../../components/custom/customTextInput';
import CustomButton from '../../components/custom/customButton';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, currentUser } = useSelector(state => state.user || {});
  
  
  // Local state for form
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    showPassword: false,
    emailFocused: false,
    passwordFocused: false
  });
  

  const handleTestConnection = async () => {
    try {
      await testConnection();
      Alert.alert('Bağlantı Testi', 'Server bağlantısı başarılı!');
    } catch (error) {
      Alert.alert('Bağlantı Hatası', 'Server bağlantısı başarısız: ' + error.message);
    }
  };

  const handleLogin = async () => {
    // 1. Alanların boş olup olmadığını kontrol et
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    // 2. E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      // 3. Redux action ile login işlemini gerçekleştir
      const result = await dispatch(loginUser({
        email: loginForm.email,
        password: loginForm.password
      }));

      if (loginUser.fulfilled.match(result)) {
        // Başarılı giriş - navigasyon otomatik olarak MainStack'e geçecektir
        console.log('Login successful:', result.payload);
      } else {
        // Hata durumu
        Alert.alert('Giriş Başarısız', result.payload || 'Bilinmeyen hata');
      }

    } catch (err) {
      // 6. Hata oluşursa kullanıcıyı bilgilendir
      console.error('Login error:', err);
      Alert.alert('Giriş Başarısız', err.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Logo ve Başlık */}
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Ionicons name="school-outline" size={50} color="#fff" />
              </View>
              <Text style={styles.title}>Student Mind Tracker</Text>
              <Text style={styles.subtitle}>Hesabınıza Giriş Yapın</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formCard}>
              {/* E-posta Girişi */}
              <CustomTextInput
                placeholder="E-posta adresiniz"
                value={loginForm.email}
                onChangeText={(text) => setLoginForm({...loginForm, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                iconName="mail-outline"
                focused={loginForm.emailFocused}
                onFocus={() => setLoginForm({...loginForm, emailFocused: true})}
                onBlur={() => setLoginForm({...loginForm, emailFocused: false})}
              />

              {/* Şifre Girişi */}
              <CustomTextInput
                placeholder="Şifreniz"
                value={loginForm.password}
                onChangeText={(text) => setLoginForm({...loginForm, password: text})}
                secureTextEntry={!loginForm.showPassword}
                iconName="lock-closed-outline"
                focused={loginForm.passwordFocused}
                onFocus={() => setLoginForm({...loginForm, passwordFocused: true})}
                onBlur={() => setLoginForm({...loginForm, passwordFocused: false})}
                onTogglePassword={() => setLoginForm({...loginForm, showPassword: !loginForm.showPassword})}
                showPassword={loginForm.showPassword}
              />

              {/* Hata Mesajı */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#ff4757" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Giriş Butonu */}
              <CustomButton
                title="Giriş Yap"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                iconName="log-in-outline"
              />

              {/* Şifremi Unuttum */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              {/* Server Test Butonu */}
              <TouchableOpacity 
                style={styles.testButton}
                onPress={handleTestConnection}
              >
                <Text style={styles.testButtonText}>Server Bağlantısını Test Et</Text>
              </TouchableOpacity>
              
              {/* Kayıt Sayfasına Yönlendirme */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Hesabınız yok mu? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Kayıt Olun</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '400',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: '100%',
    backgroundColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#667eea',
  },
  eyeIcon: {
    padding: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4757',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
