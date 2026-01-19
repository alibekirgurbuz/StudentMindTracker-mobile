import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserData } from '../../redux/slice/adminSlice';
import { getUserById } from '../../services/authService';

// InfoField component'ini component dışına çıkar
const InfoField = memo(({ label, value, icon, editable, field, error, isEditing, loading, handleInputChange }) => (
    <View style={styles.infoField}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldWrapper, error && styles.fieldWrapperError]}>
            <Ionicons name={icon} size={20} color={error ? "#F44336" : "#49b66f"} style={styles.fieldIcon} />
            {editable && isEditing ? (
                <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={(text) => handleInputChange(field, text)}
                    placeholder={label}
                    placeholderTextColor="#999"
                    editable={!loading}
                    autoCorrect={false}
                    autoCapitalize={field === 'email' ? 'none' : 'words'}
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    textContentType={field === 'email' ? 'emailAddress' : 'none'}
                    returnKeyType="done"
                    blurOnSubmit={false}
                />
            ) : (
                <Text style={styles.fieldValue}>{value}</Text>
            )}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
));

const PersonalInformation = ({ navigation }) => {
    const dispatch = useDispatch();
    const { currentUser, token, userId } = useSelector(state => state.user || {});
    const userRole = currentUser?.role;

    const [formData, setFormData] = useState({
        ad: '',
        soyad: '',
        email: '',
    });
    const [readOnlyData, setReadOnlyData] = useState({
        rehber: '',
        sinif: '',
        yas: '',
        siniflar: [],
    });
    const [errors, setErrors] = useState({
        ad: '',
        soyad: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);

            // Form verilerini doldur
            setFormData({
                ad: currentUser?.ad || '',
                soyad: currentUser?.soyad || '',
                email: currentUser?.email || '',
            });

            // Rol bazlı read-only verileri yükle
            if (userRole === 'Öğrenci' && currentUser?.ogrenciDetay) {
                // Rehber bilgisini getir
                let rehberAd = 'Atanmamış';
                if (currentUser.ogrenciDetay.rehberID) {
                    try {
                        const rehberData = await getUserById(token, currentUser.ogrenciDetay.rehberID);
                        rehberAd = `${rehberData.ad} ${rehberData.soyad}`;
                    } catch (error) {
                        console.error('Rehber bilgisi alınamadı:', error);
                    }
                }

                setReadOnlyData({
                    rehber: rehberAd,
                    sinif: currentUser.ogrenciDetay.sinif || 'Belirtilmemiş',
                    yas: currentUser.ogrenciDetay.yas || 'Belirtilmemiş',
                    siniflar: [],
                });
            } else if (userRole === 'Rehber' && currentUser?.rehberDetay) {
                setReadOnlyData({
                    rehber: '',
                    sinif: '',
                    yas: '',
                    siniflar: currentUser.rehberDetay.siniflar || [],
                });
            }
        } catch (error) {
            console.error('Kullanıcı verileri yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser, token, userRole]);

    useEffect(() => {
        if (currentUser) {
            loadUserData();
        }
    }, [currentUser?.id, loadUserData]);

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

    const validateForm = () => {
        const newErrors = {
            ad: '',
            soyad: '',
            email: '',
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

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userData = {
                ad: formData.ad.trim(),
                soyad: formData.soyad.trim(),
                email: formData.email.trim().toLowerCase(),
            };

            await dispatch(updateUserData({ userId: currentUser.id, userData })).unwrap();

            Alert.alert(
                'Başarılı',
                'Bilgileriniz başarıyla güncellendi',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            setIsEditing(false);
                            // Güncel verileri yeniden yükle
                            loadUserData();
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Bilgiler güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Formu orijinal değerlere geri döndür
        setFormData({
            ad: currentUser?.ad || '',
            soyad: currentUser?.soyad || '',
            email: currentUser?.email || '',
        });
        setErrors({
            ad: '',
            soyad: '',
            email: '',
        });
    };


    if (loading && !isEditing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#49b66f" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
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
                    {/* Düzenlenebilir Alanlar */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>

                        <InfoField
                            label="Ad"
                            value={formData.ad}
                            icon="person-outline"
                            editable={true}
                            field="ad"
                            error={errors.ad}
                            isEditing={isEditing}
                            loading={loading}
                            handleInputChange={handleInputChange}
                        />

                        <InfoField
                            label="Soyad"
                            value={formData.soyad}
                            icon="person-outline"
                            editable={true}
                            field="soyad"
                            error={errors.soyad}
                            isEditing={isEditing}
                            loading={loading}
                            handleInputChange={handleInputChange}
                        />

                        <InfoField
                            label="Email"
                            value={formData.email}
                            icon="mail-outline"
                            editable={true}
                            field="email"
                            error={errors.email}
                            isEditing={isEditing}
                            loading={loading}
                            handleInputChange={handleInputChange}
                        />
                    </View>

                    {/* Öğrenci için Ek Bilgiler */}
                    {userRole === 'Öğrenci' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Öğrenci Bilgileri</Text>

                            <InfoField
                                label="Rehber Öğretmen"
                                value={readOnlyData.rehber}
                                icon="school-outline"
                                editable={false}
                                isEditing={isEditing}
                                loading={loading}
                                handleInputChange={handleInputChange}
                            />

                            <InfoField
                                label="Sınıf"
                                value={readOnlyData.sinif}
                                icon="business-outline"
                                editable={false}
                                isEditing={isEditing}
                                loading={loading}
                                handleInputChange={handleInputChange}
                            />

                            <InfoField
                                label="Yaş"
                                value={readOnlyData.yas.toString()}
                                icon="calendar-outline"
                                editable={false}
                                isEditing={isEditing}
                                loading={loading}
                                handleInputChange={handleInputChange}
                            />
                        </View>
                    )}

                    {/* Rehber için Ek Bilgiler */}
                    {userRole === 'Rehber' && readOnlyData.siniflar.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sorumlu Sınıflarım</Text>
                            <View style={styles.classesContainer}>
                                {readOnlyData.siniflar.map((sinif, index) => (
                                    <View key={index} style={styles.classChip}>
                                        <Ionicons name="school" size={16} color="#49b66f" />
                                        <Text style={styles.classChipText}>{sinif}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Düzenleme Butonları */}
                    <View style={styles.buttonContainer}>
                        {!isEditing ? (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <LinearGradient
                                    colors={['#49b66f', '#1db4e2']}
                                    style={styles.buttonGradient}
                                >
                                    <Ionicons name="create-outline" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Düzenle</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.editButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.cancelButton]}
                                    onPress={handleCancel}
                                    disabled={loading}
                                >
                                    <Ionicons name="close-outline" size={20} color="#666" />
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.saveButton]}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#ccc', '#999'] : ['#49b66f', '#1db4e2']}
                                        style={styles.buttonGradient}
                                    >
                                        <Ionicons name="checkmark-outline" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>
                                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
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
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    infoField: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    fieldWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingHorizontal: 16,
        minHeight: 50,
    },
    fieldWrapperError: {
        borderColor: '#F44336',
        borderWidth: 2,
    },
    fieldIcon: {
        marginRight: 12,
    },
    fieldValue: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    fieldInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
    },
    errorText: {
        color: '#F44336',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    classesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    classChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    classChipText: {
        fontSize: 14,
        color: '#49b66f',
        fontWeight: '600',
    },
    buttonContainer: {
        marginTop: 20,
    },
    editButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#49b66f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    editButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    saveButton: {
        shadowColor: '#49b66f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default PersonalInformation;
