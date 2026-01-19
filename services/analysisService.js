import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from './authService';

// ==================== HATA YÖNETİMİ YAPISI ====================

// Hata tipleri enum
const ErrorType = {
  NO_NEW_RESULTS: 'NO_NEW_RESULTS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN'
};

// Özel hata sınıfları
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class NoNewSurveyResultsError extends AppError {
  constructor(message, details = {}) {
    super(message, ErrorType.NO_NEW_RESULTS, details);
    this.name = 'NoNewSurveyResultsError';
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Sunucuya bağlanılamadı') {
    super(message, ErrorType.NETWORK_ERROR);
    this.name = 'NetworkError';
  }
}

// Hata kontrolü için yardımcı fonksiyon
export const isAppError = (error) => {
  return error instanceof AppError || 
         error?.name === 'AppError' || 
         error?.name === 'NoNewSurveyResultsError' || 
         error?.name === 'NetworkError';
};

// Hata yönetimi yardımcı fonksiyonları
const handleError = (error, showAlert = true) => {
  // Eğer zaten işlenmiş bir AppError ise, direkt döndür
  if (error instanceof AppError) {
    if (showAlert && !error.alertShown) {
      showErrorAlert(error);
      error.alertShown = true;
    }
    return error;
  }

  // Network hatası kontrolü
  if (error.message === 'Network request failed' || 
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      !error.message) {
    const networkError = new NetworkError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    if (showAlert) {
      showErrorAlert(networkError);
      networkError.alertShown = true;
    }
    return networkError;
  }

  // Bilinmeyen hatalar
  const appError = new AppError(
    error.message || 'Beklenmeyen bir hata oluştu',
    ErrorType.UNKNOWN
  );
  
  if (showAlert) {
    showErrorAlert(appError);
    appError.alertShown = true;
  }
  
  return appError;
};

// Alert gösterimi
const showErrorAlert = (error) => {
  let title = 'Hata';
  let message = error.message || 'Bir hata oluştu';

  switch (error.type) {
    case ErrorType.NO_NEW_RESULTS:
      title = 'Yeni Analiz Sonucu Yok';
      const details = error.details;
      const lastAnalysisDateStr = details?.lastAnalysisDate
        ? new Date(details.lastAnalysisDate).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'henüz analiz yapılmamış';
      
      message = `${message}\n\n${details?.info || ''}\n\nSon analiz: ${lastAnalysisDateStr}\nToplam anket sonucu: ${details?.totalSurveyResults || 0}\nDaha önce analiz edilmiş: ${details?.usedSurveyResults || 0}\n\nYeni anket sonuçları ekledikten sonra tekrar deneyin.`;
      break;
    
    case ErrorType.NETWORK_ERROR:
      title = 'Bağlantı Hatası';
      break;
    
    case ErrorType.NOT_FOUND:
      title = 'Bulunamadı';
      if (message.includes('analiz')) {
        title = 'Analiz Bulunamadı';
      }
      break;
    
    case ErrorType.AUTH_ERROR:
      title = 'Yetkilendirme Hatası';
      break;
    
    case ErrorType.SERVER_ERROR:
      title = 'Sunucu Hatası';
      break;
    
    default:
      title = 'Hata';
  }

  Alert.alert(title, message, [{ text: 'Tamam', style: 'default' }]);
};

// Başarı mesajı gösterimi
const showSuccessAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'Tamam', style: 'default' }]);
};

// Token'ı AsyncStorage'dan al
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new AppError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', ErrorType.AUTH_ERROR);
    }
    return token;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Token alınırken hata:', error);
    throw new AppError('Token alınırken bir hata oluştu', ErrorType.UNKNOWN);
  }
};

// API isteği yardımcı fonksiyonu
const makeApiRequest = async (url, options = {}) => {
  try {
    const token = await getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    // JSON parse işlemi
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      throw new AppError('Sunucudan gelen yanıt işlenemedi', ErrorType.SERVER_ERROR);
    }

    return { response, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw handleError(error, false);
  }
};

// Öğrenci anket sonuçlarını analiz et
export const analyzeStudentSurveys = async (rehberId) => {
  try {
    const { response, data } = await makeApiRequest(
      `${API_BASE_URL}/api/analysis/${rehberId}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      // Yeni sonuç bulunamadı hatası (400 status code)
      if (response.status === 400 && data.info && data.totalSurveyResults !== undefined) {
        const error = new NoNewSurveyResultsError(
          data.message || 'Yeni analiz edilecek anket sonucu bulunamadı',
          {
            info: data.info,
            lastAnalysisDate: data.lastAnalysisDate,
            totalSurveyResults: data.totalSurveyResults,
            usedSurveyResults: data.usedSurveyResults
          }
        );
        throw handleError(error, true);
      }
      
      // Diğer hatalar
      const errorMessage = data.message || 'Analiz oluşturulurken hata oluştu';
      const error = new AppError(
        errorMessage + (data.info ? `\n\n${data.info}` : ''),
        response.status === 401 || response.status === 403 
          ? ErrorType.AUTH_ERROR 
          : response.status >= 500 
          ? ErrorType.SERVER_ERROR 
          : ErrorType.UNKNOWN,
        {
          status: response.status,
          info: data.info
        }
      );
      
      throw handleError(error, true);
    }

    // Başarılı durum
    if (data.analizBilgisi) {
      const { yeniAnketSonucSayisi, toplamAnketSonucSayisi } = data.analizBilgisi;
      showSuccessAlert(
        'Başarılı',
        `Analiz başarıyla tamamlandı!\n\nYeni analiz edilen sonuç: ${yeniAnketSonucSayisi}\nToplam sonuç: ${toplamAnketSonucSayisi}`
      );
    }

    return data;
  } catch (error) {
    // Hata zaten handleError ile işlendi, sadece log tut ve fırlat
    if (!(error instanceof AppError)) {
      console.error('Analiz hatası (beklenmeyen):', error);
    }
    throw error;
  }
};

// Rehberin analiz geçmişini getir
export const getAnalysisHistory = async (rehberId) => {
  try {
    const { response, data } = await makeApiRequest(
      `${API_BASE_URL}/api/analysis/${rehberId}/history`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = new AppError(
        data.message || 'Analiz geçmişi alınırken hata oluştu',
        response.status === 404 ? ErrorType.NOT_FOUND : ErrorType.UNKNOWN
      );
      // Sessiz hata - liste yükleme hatası için alert gösterme
      console.error('Analiz geçmişi hatası:', error.message);
      throw error;
    }

    return data;
  } catch (error) {
    // Hata zaten handle edildi, sadece log tut
    if (!(error instanceof AppError)) {
      const handledError = handleError(error, false);
      console.error('Analiz geçmişi hatası:', handledError.message);
      throw handledError;
    }
    throw error;
  }
};

// Belirli bir analizi getir
export const getAnalysisById = async (rehberId, analizId) => {
  try {
    const { response, data } = await makeApiRequest(
      `${API_BASE_URL}/api/analysis/${rehberId}/${analizId}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = new AppError(
        response.status === 404 
          ? 'İstediğiniz analiz bulunamadı. Lütfen analiz listesinden tekrar seçin.'
          : data.message || 'Analiz alınırken hata oluştu',
        response.status === 404 ? ErrorType.NOT_FOUND : ErrorType.UNKNOWN
      );
      throw handleError(error, true);
    }

    return data;
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Analiz detay hatası (beklenmeyen):', error);
    }
    throw error;
  }
};

// Analizi sil (opsiyonel - backend'de endpoint yoksa eklenebilir)
export const deleteAnalysis = async (rehberId, analizId) => {
  try {
    const { response, data } = await makeApiRequest(
      `${API_BASE_URL}/api/analysis/${rehberId}/${analizId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      const error = new AppError(
        data.message || 'Analiz silinirken hata oluştu',
        response.status === 404 ? ErrorType.NOT_FOUND : ErrorType.UNKNOWN
      );
      throw handleError(error, true);
    }

    // Başarılı silme için bilgilendirme
    showSuccessAlert('Başarılı', 'Analiz başarıyla silindi.');

    return data;
  } catch (error) {
    if (!(error instanceof AppError)) {
      console.error('Analiz silme hatası (beklenmeyen):', error);
    }
    throw error;
  }
};
