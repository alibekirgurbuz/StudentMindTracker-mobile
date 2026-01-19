import React, { useState, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { changePassword } from '../../services/authService';

// PasswordField component'ini component dışına çıkar
const PasswordField = memo(({ label, field, placeholder, error, formData, handleInputChange, showPasswords, togglePasswordVisibility, loading }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
            <Ionicons
                name="lock-closed-outline"
                size={20}
                color={error ? "#F44336" : "#49b66f"}
                style={styles.inputIcon}
            />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={formData[field]}
                onChangeText={(value) => handleInputChange(field, value)}
                secureTextEntry={!showPasswords[field]}
                placeholderTextColor="#999"
                editable={!loading}
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="none"
                keyboardType="default"
                returnKeyType="done"
                blurOnSubmit={false}
            />
            <TouchableOpacity
                onPress={() => togglePasswordVisibility(field)}
                style={styles.eyeIcon}
            >
                <Ionicons
                    name={showPasswords[field] ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                />
            </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
));

const PasswordChangingScreen = ({ navigation }) => {
    const { currentUser, token } = useSelector(state => state.user || {});

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Hata mesajını temizle
        setErrors(prev => {
            if (prev[field]) {
                return {
                    ...prev,
                    [field]: ''
                };
            }
            return prev;
        });
    }, []);

    const togglePasswordVisibility = useCallback((field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    }, []);

    const validateForm = () => {
        const newErrors = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
        let isValid = true;

        if (!formData.oldPassword) {
            newErrors.oldPassword = 'Lütfen eski şifrenizi giriniz';
            isValid = false;
        }
        if (!formData.newPassword) {
            newErrors.newPassword = 'Lütfen yeni şifrenizi giriniz';
            isValid = false;
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Şifre en az 6 karakter olmalıdır';
            isValid = false;
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Lütfen şifreyi tekrar giriniz';
            isValid = false;
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
            isValid = false;
        }
        if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = 'Yeni şifre eski şifreden farklı olmalıdır';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await changePassword(token, {
                userId: currentUser.id,
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });

            Alert.alert(
                'Başarılı',
                'Şifreniz başarıyla değiştirildi',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            // Formu temizle
                            setFormData({
                                oldPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                            });
                            // Geri dön
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            // Eski şifre yanlış ise
            if (error.message && error.message.includes('Eski şifre')) {
                setErrors(prev => ({
                    ...prev,
                    oldPassword: 'Eski şifre yanlış'
                }));
            } else {
                Alert.alert('Hata', error.message || 'Şifre değiştirilirken bir hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            <LinearGradient
                colors={['#49b66f', '#1db4e2']}
                style={styles.header}
            >
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formContainer}>
                    {/* Bilgilendirme */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color="#49b66f" />
                        <Text style={styles.infoText}>
                            Güvenliğiniz için önce eski şifrenizi girmeniz gerekmektedir.
                        </Text>
                    </View>

                    {/* Şifre Alanları */}
                    <View style={styles.section}>
                        <PasswordField
                            label="Eski Şifre"
                            field="oldPassword"
                            placeholder="Mevcut şifrenizi giriniz"
                            error={errors.oldPassword}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            showPasswords={showPasswords}
                            togglePasswordVisibility={togglePasswordVisibility}
                            loading={loading}
                        />

                        <PasswordField
                            label="Yeni Şifre"
                            field="newPassword"
                            placeholder="En az 6 karakter"
                            error={errors.newPassword}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            showPasswords={showPasswords}
                            togglePasswordVisibility={togglePasswordVisibility}
                            loading={loading}
                        />

                        <PasswordField
                            label="Yeni Şifre Tekrar"
                            field="confirmPassword"
                            placeholder="Yeni şifrenizi tekrar giriniz"
                            error={errors.confirmPassword}
                            formData={formData}
                            handleInputChange={handleInputChange}
                            showPasswords={showPasswords}
                            togglePasswordVisibility={togglePasswordVisibility}
                            loading={loading}
                        />
                    </View>

                    {/* Şifre Gereksinimleri */}
                    <View style={styles.requirementsBox}>
                        <Text style={styles.requirementsTitle}>Şifre Gereksinimleri:</Text>
                        <View style={styles.requirementItem}>
                            <Ionicons
                                name={formData.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={formData.newPassword.length >= 6 ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.requirementText,
                                formData.newPassword.length >= 6 && styles.requirementTextValid
                            ]}>
                                En az 6 karakter
                            </Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons
                                name={formData.newPassword && formData.newPassword !== formData.oldPassword ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={formData.newPassword && formData.newPassword !== formData.oldPassword ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.requirementText,
                                formData.newPassword && formData.newPassword !== formData.oldPassword && styles.requirementTextValid
                            ]}>
                                Eski şifreden farklı olmalı
                            </Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons
                                name={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "#4CAF50" : "#999"}
                            />
                            <Text style={[
                                styles.requirementText,
                                formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && styles.requirementTextValid
                            ]}>
                                Şifreler eşleşmeli
                            </Text>
                        </View>
                    </View>

                    {/* Değiştir Butonu */}
                    <TouchableOpacity
                        style={[styles.changeButton, loading && styles.changeButtonDisabled]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#49b66f', '#1db4e2']}
                            style={styles.changeButtonGradient}
                        >
                            <Ionicons name="key-outline" size={20} color="#fff" />
                            <Text style={styles.changeButtonText}>
                                {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 8
    },
    headerTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#49b66f',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
    },
    inputWrapperError: {
        borderColor: '#F44336',
        borderWidth: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    requirementsBox: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    requirementsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    requirementText: {
        fontSize: 14,
        color: '#999',
    },
    requirementTextValid: {
        color: '#4CAF50',
        fontWeight: '500',
    },
    changeButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#49b66f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    changeButtonDisabled: {
        opacity: 0.6,
    },
    changeButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    changeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PasswordChangingScreen;
