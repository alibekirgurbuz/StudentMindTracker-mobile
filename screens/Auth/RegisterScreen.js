import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
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
import { registerUser, clearError } from '../../redux/slice/userSlice';
import { register } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTextInput from '../../components/custom/customTextInput';
import CustomButton from '../../components/custom/customButton';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(state => state.user || {});
  
  // Local state for form
  const [registerForm, setRegisterForm] = useState({
    ad: '',
    soyad: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    adFocused: false,
    soyadFocused: false,
    emailFocused: false,
    passwordFocused: false,
    confirmPasswordFocused: false
  });
  

  const handleRegister = async () => {
    // 1. Alanların boş olup olmadığını kontrol et
    if (!registerForm.ad || !registerForm.soyad || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    // 2. Şifrelerin eşleşip eşleşmediğini kontrol et
    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    try {
      // 3. Redux action ile register işlemini gerçekleştir
      const result = await dispatch(registerUser({
        ad: registerForm.ad,
        soyad: registerForm.soyad,
        email: registerForm.email,
        password: registerForm.password,
        role: 'Öğrenci' // Varsayılan rol
      }));

      if (registerUser.fulfilled.match(result)) {
        // Başarılı kayıt - navigasyon otomatik olarak MainStack'e geçecektir
        console.log('Register successful:', result.payload);
      } else {
        // Hata durumu
        Alert.alert('Kayıt Başarısız', result.payload || 'Bilinmeyen hata');
      }

    } catch (err) {
      // 6. Hata oluşursa kullanıcıyı bilgilendir
      console.error('Register error:', err);
      Alert.alert('Kayıt Başarısız', err.message);
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
              <Text style={styles.subtitle}>Yeni Hesap Oluştur</Text>
            </View>

            {/* Form Container */}
            <View style={styles.formCard}>
              {/* Ad Girişi */}
              <CustomTextInput
                placeholder="Adınız"
                value={registerForm.ad}
                onChangeText={(text) => dispatch(setRegisterAd(text))}
                autoCapitalize="words"
                iconName="person-outline"
                focused={registerForm.adFocused}
                onFocus={() => dispatch(setRegisterAdFocused(true))}
                onBlur={() => dispatch(setRegisterAdFocused(false))}
              />

              {/* Soyad Girişi */}
              <CustomTextInput
                placeholder="Soyadınız"
                value={registerForm.soyad}
                onChangeText={(text) => dispatch(setRegisterSoyad(text))}
                autoCapitalize="words"
                iconName="person-outline"
                focused={registerForm.soyadFocused}
                onFocus={() => dispatch(setRegisterSoyadFocused(true))}
                onBlur={() => dispatch(setRegisterSoyadFocused(false))}
              />

              {/* E-posta Girişi */}
              <CustomTextInput
                placeholder="E-posta adresiniz"
                value={registerForm.email}
                onChangeText={(text) => dispatch(setRegisterEmail(text))}
                keyboardType="email-address"
                autoCapitalize="none"
                iconName="mail-outline"
                focused={registerForm.emailFocused}
                onFocus={() => dispatch(setRegisterEmailFocused(true))}
                onBlur={() => dispatch(setRegisterEmailFocused(false))}
              />

              {/* Şifre Girişi */}
              <CustomTextInput
                placeholder="Şifreniz"
                value={registerForm.password}
                onChangeText={(text) => dispatch(setRegisterPassword(text))}
                secureTextEntry={!registerForm.showPassword}
                iconName="lock-closed-outline"
                focused={registerForm.passwordFocused}
                onFocus={() => dispatch(setRegisterPasswordFocused(true))}
                onBlur={() => dispatch(setRegisterPasswordFocused(false))}
                onTogglePassword={() => dispatch(setRegisterShowPassword(!registerForm.showPassword))}
                showPassword={registerForm.showPassword}
              />

              {/* Şifre Tekrar Girişi */}
              <CustomTextInput
                placeholder="Şifreyi tekrar girin"
                value={registerForm.confirmPassword}
                onChangeText={(text) => dispatch(setRegisterConfirmPassword(text))}
                secureTextEntry={!registerForm.showConfirmPassword}
                iconName="lock-closed-outline"
                focused={registerForm.confirmPasswordFocused}
                onFocus={() => dispatch(setRegisterConfirmPasswordFocused(true))}
                onBlur={() => dispatch(setRegisterConfirmPasswordFocused(false))}
                onTogglePassword={() => dispatch(setRegisterShowConfirmPassword(!registerForm.showConfirmPassword))}
                showPassword={registerForm.showConfirmPassword}
              />

              {/* Hata Mesajı */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#ff4757" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              {/* Kayıt Butonu */}
              <CustomButton
                title="Hesap Oluştur"
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                iconName="person-add-outline"
              />
              
              {/* Giriş Sayfasına Yönlendirme */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Giriş Yapın</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
