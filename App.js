import { Provider } from 'react-redux';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// Redux Store'u import ediyoruz
import store from './redux/store'; 
import { useSelector, useDispatch } from 'react-redux';
// Navigation
import RootNavigation from './navigation/RootNavigation';

// ----------------------------------------------------------------------
// 1. RootStack (Navigasyon Yapısı)
// ----------------------------------------------------------------------

// Bu bileşen, state'e göre hangi ekran setinin gösterileceğine karar verir
function RootStack() {
  // Redux state'inden kimlik doğrulama durumunu çekiyoruz
  const { isLoading, isAuthenticated, currentUser } = useSelector(state => state.user || {});

  // Debug: Loading durumunu kontrol et
  console.log('App.js - isLoading:', isLoading);
  console.log('App.js - isAuthenticated:', isAuthenticated);

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

