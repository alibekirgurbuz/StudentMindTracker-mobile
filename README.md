StudentMindTracker Mobile (Expo)
===============================

Bu klasör, StudentMindTracker'ın mobil (React Native + Expo) istemcisidir.

Ön Koşullar
-----------
- Node.js 18+ ve npm
- Expo CLI (gerekirse: `npm install -g expo-cli`)
- Cihazda Expo Go ya da Android/iOS emulator

Kurulum
------
```bash
npm install
```

Çalıştırma
----------
- Genel: `npm run start`
- Android: `npm run android`
- iOS: `npm run ios`
- Web önizleme: `npm run web`

Dizin Yapısı (özet)
-------------------
- `App.js` ve `index.js`: Uygulama girişi
- `components/`: Ortak bileşenler
- `navigation/`: Sekme ve kök yönlendirme
- `redux/`: Store ve slice'lar
- `screens/`: Sayfa/senaryo ekranları
- `services/`: API ve soket servisleri

Notlar
------
- Çevresel değişken gereksinimi yok; varsayılan config ile çalışır.
- GitHub'da repo adı: `StudentMindTracker-mobile`.
