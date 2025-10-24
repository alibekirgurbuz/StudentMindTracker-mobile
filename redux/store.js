import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import userReducer from './slice/userSlice';
import adminReducer from './slice/adminSlice';
import rehberReducer from './slice/rehberSlice';
import ogrenciReducer from './slice/ogrenciSlice';
import anketReducer from './slice/anketSlice';
import anketSonucReducer from './slice/anketSonucSlice';

// Root reducer
const rootReducer = combineReducers({
  user: userReducer,
  admin: adminReducer,
  rehber: rehberReducer,
  ogrenci: ogrenciReducer,
  anket: anketReducer,
  anketSonuc: anketSonucReducer,
});

// Store configuration
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux persist olmadığı için bu kısım kaldırıldı
      },
    }),
  devTools: __DEV__, // Sadece development modunda devtools aktif
});

export default store;

// Root state type (TypeScript syntax removed for JavaScript compatibility)
// export type RootState = ReturnType<typeof store.getState>;

// App dispatch type (TypeScript syntax removed for JavaScript compatibility)
// export type AppDispatch = typeof store.dispatch;
