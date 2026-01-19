import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/slice/userSlice';
import CustomTextInput from '../../components/custom/customTextInput';
import CustomButton from '../../components/custom/customButton';

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

  const [errorMessage, setErrorMessage] = useState('');

  // XSS koruması için blacklist karakterler
  const XSS_BLACKLIST = /<|>|script|javascript:|onerror|onload|eval|alert|prompt|confirm|document\.|window\./gi;

  // Input sanitizasyon fonksiyonu
  const sanitizeInput = (input) => {
    if (!input) return input;
    // Tehlikeli karakterleri ve scriptleri temizle
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<|>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror|onload|eval|alert|prompt|confirm/gi, '')
      .trim();
  };

  // Şifre için sanitizasyon (sadece script tagları ve tehlikeli komutları engelle)
  const sanitizePassword = (input) => {
    if (!input) return input;
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/eval|alert|prompt|confirm/gi, '');
  };

  // XSS kontrolü
  const containsXSS = (input) => {
    return XSS_BLACKLIST.test(input);
  };

  // E-posta validasyonu
  const validateEmail = (email) => {
    // E-posta regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // İsim validasyonu (sadece harf, boşluk ve Türkçe karakterler)
  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    return nameRegex.test(name);
  };

  const handleRegister = async () => {
    // Önce hata mesajını temizle
    setErrorMessage('');

    // 1. Alanların boş olup olmadığını kontrol et
    if (!registerForm.ad || !registerForm.soyad || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setErrorMessage('Lütfen tüm alanları doldurun.');
      return;
    }

    // 2. XSS kontrolü - tüm alanlar için
    if (containsXSS(registerForm.ad) || containsXSS(registerForm.soyad) ||
      containsXSS(registerForm.email) || containsXSS(registerForm.password)) {
      setErrorMessage('Geçersiz karakterler tespit edildi. Lütfen düzgün bilgiler girin.');
      return;
    }

    // 3. İsim validasyonu
    if (!validateName(registerForm.ad)) {
      setErrorMessage('Ad sadece harf içermelidir.');
      return;
    }

    if (!validateName(registerForm.soyad)) {
      setErrorMessage('Soyad sadece harf içermelidir.');
      return;
    }

    // 4. E-posta validasyonu
    if (!validateEmail(registerForm.email)) {
      setErrorMessage('Geçerli bir e-posta adresi girin (örn: ornek@email.com).');
      return;
    }

    // 5. Şifre uzunluğu kontrolü
    if (registerForm.password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    // 6. Şifrelerin eşleşip eşleşmediğini kontrol et
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor.');
      return;
    }

    try {
      // 7. Redux action ile register işlemini gerçekleştir (son bir sanitizasyon)
      const result = await dispatch(registerUser({
        ad: sanitizeInput(registerForm.ad),
        soyad: sanitizeInput(registerForm.soyad),
        email: sanitizeInput(registerForm.email).toLowerCase(),
        password: sanitizePassword(registerForm.password),
        role: 'Öğrenci' // Varsayılan rol
      }));

      if (registerUser.fulfilled.match(result)) {
        // Başarılı kayıt - navigasyon otomatik olarak MainStack'e geçecektir
        console.log('Register successful:', result.payload);
      } else {
        // Hata durumu
        setErrorMessage(result.payload || 'Bilinmeyen hata');
      }

    } catch (err) {
      // 6. Hata oluşursa kullanıcıyı bilgilendir
      console.error('Register error:', err);
      setErrorMessage(err.message || 'Kayıt sırasında bir hata oluştu');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#49b66f" />

      <LinearGradient
        colors={['#49b66f', '#3dbdc2', '#1db4e2']}
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
                onChangeText={(text) => {
                  const sanitized = sanitizeInput(text);
                  setRegisterForm({ ...registerForm, ad: sanitized });
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="words"
                iconName="person-outline"
                focused={registerForm.adFocused}
                onFocus={() => setRegisterForm({
                  ...registerForm,
                  adFocused: true,
                  soyadFocused: false,
                  emailFocused: false,
                  passwordFocused: false,
                  confirmPasswordFocused: false
                })}
                onBlur={() => setRegisterForm({ ...registerForm, adFocused: false })}
              />

              {/* Soyad Girişi */}
              <CustomTextInput
                placeholder="Soyadınız"
                value={registerForm.soyad}
                onChangeText={(text) => {
                  const sanitized = sanitizeInput(text);
                  setRegisterForm({ ...registerForm, soyad: sanitized });
                  if (errorMessage) setErrorMessage('');
                }}
                autoCapitalize="words"
                iconName="person-outline"
                focused={registerForm.soyadFocused}
                onFocus={() => setRegisterForm({
                  ...registerForm,
                  adFocused: false,
                  soyadFocused: true,
                  emailFocused: false,
                  passwordFocused: false,
                  confirmPasswordFocused: false
                })}
                onBlur={() => setRegisterForm({ ...registerForm, soyadFocused: false })}
              />

              {/* E-posta Girişi */}
              <CustomTextInput
                placeholder="E-posta adresiniz"
                value={registerForm.email}
                onChangeText={(text) => {
                  const sanitized = sanitizeInput(text);
                  setRegisterForm({ ...registerForm, email: sanitized });
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                iconName="mail-outline"
                focused={registerForm.emailFocused}
                onFocus={() => setRegisterForm({
                  ...registerForm,
                  adFocused: false,
                  soyadFocused: false,
                  emailFocused: true,
                  passwordFocused: false,
                  confirmPasswordFocused: false
                })}
                onBlur={() => setRegisterForm({ ...registerForm, emailFocused: false })}
              />

              {/* Şifre Girişi */}
              <CustomTextInput
                placeholder="Şifreniz"
                value={registerForm.password}
                onChangeText={(text) => {
                  const sanitized = sanitizePassword(text);
                  setRegisterForm({ ...registerForm, password: sanitized });
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!registerForm.showPassword}
                iconName="lock-closed-outline"
                focused={registerForm.passwordFocused}
                onFocus={() => setRegisterForm({
                  ...registerForm,
                  adFocused: false,
                  soyadFocused: false,
                  emailFocused: false,
                  passwordFocused: true,
                  confirmPasswordFocused: false
                })}
                onBlur={() => setRegisterForm({ ...registerForm, passwordFocused: false })}
                onTogglePassword={() => setRegisterForm({ ...registerForm, showPassword: !registerForm.showPassword })}
                showPassword={registerForm.showPassword}
              />

              {/* Şifre Tekrar Girişi */}
              <CustomTextInput
                placeholder="Şifreyi tekrar girin"
                value={registerForm.confirmPassword}
                onChangeText={(text) => {
                  const sanitized = sanitizePassword(text);
                  setRegisterForm({ ...registerForm, confirmPassword: sanitized });
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!registerForm.showConfirmPassword}
                iconName="lock-closed-outline"
                focused={registerForm.confirmPasswordFocused}
                onFocus={() => setRegisterForm({
                  ...registerForm,
                  adFocused: false,
                  soyadFocused: false,
                  emailFocused: false,
                  passwordFocused: false,
                  confirmPasswordFocused: true
                })}
                onBlur={() => setRegisterForm({ ...registerForm, confirmPasswordFocused: false })}
                onTogglePassword={() => setRegisterForm({ ...registerForm, showConfirmPassword: !registerForm.showConfirmPassword })}
                showPassword={registerForm.showConfirmPassword}
              />

              {/* Hata Mesajı */}
              {(errorMessage || error) && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#ff4757" />
                  <Text style={styles.errorText}>{errorMessage || error}</Text>
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
    color: '#49b66f',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
