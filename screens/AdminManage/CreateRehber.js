import React, { useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { createNewUser } from '../../redux/slice/adminSlice';

const CreateRehber = ({ navigation }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        ad: '',
        soyad: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Hata mesajını temizle
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            ad: '',
            soyad: '',
            email: '',
            password: '',
            confirmPassword: '',
        };
        let isValid = true;

        if (!formData.ad.trim()) {
            newErrors.ad = 'Lütfen ad giriniz';
            isValid = false;
        }
        if (!formData.soyad.trim()) {
            newErrors.soyad = 'Lütfen soyad giriniz';
            isValid = false;
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Lütfen email giriniz';
            isValid = false;
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'Lütfen geçerli bir email giriniz';
            isValid = false;
        }
        if (!formData.password) {
            newErrors.password = 'Lütfen şifre giriniz';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
            isValid = false;
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Lütfen şifreyi tekrar giriniz';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleCreateRehber = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userData = {
                ad: formData.ad.trim(),
                soyad: formData.soyad.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: 'Rehber'
            };

            await dispatch(createNewUser(userData)).unwrap();

            Alert.alert(
                'Başarılı',
                'Rehber başarıyla oluşturuldu',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            // Formu temizle
                            setFormData({
                                ad: '',
                                soyad: '',
                                email: '',
                                password: '',
                                confirmPassword: '',
                            });
                            // Ana sayfaya dön
                            navigation.goBack();
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Rehber oluşturulurken bir hata oluştu');
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
                        <Text style={styles.headerTitle}>Yeni Rehber Oluştur</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ad</Text>
                        <View style={[styles.inputWrapper, errors.ad && styles.inputWrapperError]}>
                            <Ionicons name="person-outline" size={20} color={errors.ad ? "#F44336" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Rehber adı"
                                value={formData.ad}
                                onChangeText={(value) => handleInputChange('ad', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.ad ? <Text style={styles.errorText}>{errors.ad}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Soyad</Text>
                        <View style={[styles.inputWrapper, errors.soyad && styles.inputWrapperError]}>
                            <Ionicons name="person-outline" size={20} color={errors.soyad ? "#F44336" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Rehber soyadı"
                                value={formData.soyad}
                                onChangeText={(value) => handleInputChange('soyad', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.soyad ? <Text style={styles.errorText}>{errors.soyad}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                            <Ionicons name="mail-outline" size={20} color={errors.email ? "#F44336" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ornek@email.com"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Şifre</Text>
                        <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#F44336" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="En az 6 karakter"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Şifre Tekrar</Text>
                        <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? "#F44336" : "#666"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifreyi tekrar girin"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                secureTextEntry
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.createButton, loading && styles.createButtonDisabled]}
                        onPress={handleCreateRehber}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#3a57d7ff', '#7926ccff']}
                            style={styles.createButtonGradient}
                        >
                            <Ionicons name="person-add" size={20} color="#fff" />
                            <Text style={styles.createButtonText}>
                                {loading ? 'Oluşturuluyor...' : 'Rehber Oluştur'}
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
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
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
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    createButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#49b66f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    inputWrapperError: {
        borderColor: '#F44336',
        borderWidth: 2,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default CreateRehber;
