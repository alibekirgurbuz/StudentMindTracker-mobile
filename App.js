import { Provider } from 'react-redux';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
// Redux Store'u import ediyoruz
import store from './redux/store'; 
import { useSelector, useDispatch } from 'react-redux';
// Navigation
import RootNavigation from './navigation/RootNavigation';
// Socket Service
import socketService from './services/socketService';

// ----------------------------------------------------------------------
// 1. RootStack (Navigasyon Yapısı)
// ----------------------------------------------------------------------

// Bu bileşen, state'e göre hangi ekran setinin gösterileceğine karar verir
function RootStack() {
  // Redux state'inden kimlik doğrulama durumunu çekiyoruz
  const { isLoading, isAuthenticated, currentUser, token } = useSelector(state => state.user || {});

  // Debug: Loading durumunu kontrol et
  console.log('App.js - isLoading:', isLoading);
  console.log('App.js - isAuthenticated:', isAuthenticated);

  // Global socket yönetimi
  useEffect(() => {
    if (isAuthenticated && currentUser && token) {
      // Kullanıcı login olduğunda socket'i bağla
      console.log('🟢 Kullanıcı login oldu - Global socket başlatılıyor');
      socketService.connect(token, currentUser.id);
    } else {
      // Kullanıcı logout olduğunda socket'i kapat
      console.log('🔴 Kullanıcı logout oldu - Global socket kapatılıyor');
      socketService.disconnect();
    }

    // Cleanup
    return () => {
      // Component unmount olduğunda socket'i kapatma
      // Çünkü App component unmount olmaz
    };
  }, [isAuthenticated, currentUser, token]);

  // Sadece login/register işlemleri sırasında loading göster
  if (isLoading && !isAuthenticated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return <RootNavigation />;
}

// ----------------------------------------------------------------------
// 2. Ana Uygulama Bileşeni (Provider ile sarılı)
// ----------------------------------------------------------------------

export default function App() {
  return (
    // Uygulamanın tamamını Redux Provider ile sarıyoruz
    <Provider store={store}>
      {/* RootStack bileşeni, Redux state'ine erişerek navigasyonu yönetir */}
      <RootStack />
    </Provider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  }
});

