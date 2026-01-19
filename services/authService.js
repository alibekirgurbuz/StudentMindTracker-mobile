import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://studentmindtracker-server-1.onrender.com';

// Token'ı AsyncStorage'dan al
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Token alınırken hata:', error);
    return null;
  }
};

// Token'ı AsyncStorage'a kaydet
const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Token kaydedilirken hata:', error);
  }
};

// Token'ı AsyncStorage'dan sil
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Token silinirken hata:', error);
  }
};

// API istekleri için header'ları hazırla
const getHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Kullanıcı kaydı
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kayıt işlemi başarısız');
    }

    // Token'ı kaydet
    if (data.token) {
      await setToken(data.token);
    }

    return data;
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
};

// Server bağlantısını test et
export const testConnection = async () => {
  try {
    // /api/test endpoint'ini kullan (sunucuda kesinlikle mevcut)
    const testUrl = `${API_BASE_URL}/api/test`;
    console.log('🔍 Test URL:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    // Önce response'un ok olup olmadığını kontrol et
    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Response text:', text);
      throw new Error(`Server yanıt vermiyor (${response.status}): ${text}`);
    }

    // JSON parse etmeyi dene
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } else {
      const text = await response.text();
      console.log('✅ Response text:', text);
      return { message: 'Server çalışıyor', response: text };
    }
  } catch (error) {
    console.error('❌ Bağlantı test hatası:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);

    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Server\'a ulaşılamıyor. URL: ' + API_BASE_URL);
    }
    throw error;
  }
};

// Kullanıcı girişi
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    // Önce response'un ok olup olmadığını kontrol et
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.message || 'Giriş işlemi başarısız');
      } else {
        const text = await response.text();
        throw new Error(`Server hatası (${response.status}): ${text.substring(0, 100)}`);
      }
    }

    // JSON parse et
    const data = await response.json();

    // Token'ı kaydet
    if (data.token) {
      await setToken(data.token);
    }

    return data;
  } catch (error) {
    console.log('⚠️ Login service error:', error.message);
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Server\'a ulaşılamıyor. İnternet bağlantınızı kontrol edin.');
    }
    throw error;
  }
};

// Kullanıcı çıkışı
export const logoutUser = async () => {
  try {
    await removeToken();
    return { success: true };
  } catch (error) {
    console.error('Çıkış hatası:', error);
    throw error;
  }
};

// Kullanıcı bilgilerini getir
export const getCurrentUser = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Token bulunamadı');
    }

    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı bilgileri alınamadı');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcı bilgileri alma hatası:', error);
    throw error;
  }
};

// Tüm kullanıcıları getir (Admin için)
export const getAllUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcılar alınamadı');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcılar alma hatası:', error);
    throw error;
  }
};

// Kullanıcı oluştur (Admin için)
export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı oluşturulamadı');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    throw error;
  }
};

// Kullanıcı güncelle
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı güncellenemedi');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcı silinemedi');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    throw error;
  }
};

// Role göre kullanıcıları getir
export const getUsersByRole = async (role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/role/${role}`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Kullanıcılar alınamadı');
    }

    return data;
  } catch (error) {
    console.error('Kullanıcılar alma hatası:', error);
    throw error;
  }
};

// Öğrenci sayısını getir
export const getStudentCount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/count/students`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Öğrenci sayısı alınamadı');
    }

    return data;
  } catch (error) {
    console.error('Öğrenci sayısı alma hatası:', error);
    throw error;
  }
};

// Token kontrolü
export const checkAuthStatus = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { isAuthenticated: false };
    }

    // Token'ın geçerli olup olmadığını kontrol et
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    if (response.ok) {
      const userData = await response.json();
      return { isAuthenticated: true, user: userData };
    } else {
      // Token geçersiz, temizle
      await removeToken();
      return { isAuthenticated: false };
    }
  } catch (error) {
    console.error('Auth durumu kontrol hatası:', error);
    await removeToken();
    return { isAuthenticated: false };
  }
};

// Belirli bir kullanıcıyı ID ile getir
export const getUserById = async (token, userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    } else {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }
  } catch (error) {
    console.error('Kullanıcı bilgisi alma hatası:', error);
    throw error;
  }
};

// Admin istatistiklerini getir
export const getAdminStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/admin/statistics`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'İstatistikler alınamadı');
    }

    return data;
  } catch (error) {
    console.error('İstatistikler alma hatası:', error);
    throw error;
  }
};

// Şifre değiştir
export const changePassword = async (token, passwordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Şifre değiştirilemedi');
    }

    return data;
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    throw error;
  }
};

// login fonksiyonu loginUser'ın alias'ı olarak export ediliyor (LoginScreen'de kullanılıyor)
export const login = loginUser;
