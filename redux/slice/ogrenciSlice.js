import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://studentmindtracker-server-1.onrender.com';

// Async thunks
export const getOgrenciDetay = createAsyncThunk(
  'ogrenci/getOgrenciDetay',
  async (ogrenciId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ogrenci/${ogrenciId}/detay`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Öğrenci detayları alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOgrenciAnketler = createAsyncThunk(
  'ogrenci/getOgrenciAnketler',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anketler alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOgrenciAnket = createAsyncThunk(
  'ogrenci/getOgrenciAnket',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/${anketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitAnketSonuc = createAsyncThunk(
  'ogrenci/submitAnketSonuc',
  async ({ ogrenciId, anketId, cevaplar, sonuc }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ogrenciId,
          anketId,
          cevaplar: cevaplar || sonuc // Hem yeni hem eski formatı destekle
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket sonucu kaydedilemedi');
      }

      return data;
    } catch (error) {
      console.error('submitAnketSonuc hatası:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getOgrenciAnketSonuclari = createAsyncThunk(
  'ogrenci/getOgrenciAnketSonuclari',
  async (ogrenciId, { rejectWithValue }) => {
    try {
      console.log('=== getOgrenciAnketSonuclari API Çağrısı ===');
      console.log('Öğrenci ID:', ogrenciId);

      const response = await fetch(`${API_BASE_URL}/api/ogrenci/${ogrenciId}/anket-sonuclari`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      console.log('API Response:', data);
      console.log('Anket Sonuçları:', data.data);
      console.log('Sonuç Sayısı:', data.data?.length);

      if (!response.ok) {
        throw new Error(data.message || 'Anket sonuçları alınamadı');
      }

      return data;
    } catch (error) {
      console.error('getOgrenciAnketSonuclari hatası:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateOgrenciDetay = createAsyncThunk(
  'ogrenci/updateOgrenciDetay',
  async ({ ogrenciId, detayData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ogrenci/${ogrenciId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detayData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Öğrenci detayları güncellenemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSinifOgrencileri = createAsyncThunk(
  'ogrenci/getSinifOgrencileri',
  async (sinif, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ogrenci/sinif/${sinif}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sınıf öğrencileri alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ogrenciDetay: null,
  mevcutAnketler: [],
  seciliAnket: null,
  anketSonuclari: [],
  sinifOgrencileri: [],
  rehberBilgileri: null,
  dashboardStats: {
    toplamAnket: 0,
    tamamlananAnket: 0,
    bekleyenAnket: 0,
    sinifOgrenciSayisi: 0
  },
  isLoading: false,
  error: null
};

const ogrenciSlice = createSlice({
  name: 'ogrenci',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOgrenciData: (state) => {
      state.ogrenciDetay = null;
      state.mevcutAnketler = [];
      state.seciliAnket = null;
      state.anketSonuclari = [];
      state.sinifOgrencileri = [];
      state.rehberBilgileri = null;
      state.dashboardStats = {
        toplamAnket: 0,
        tamamlananAnket: 0,
        bekleyenAnket: 0,
        sinifOgrenciSayisi: 0
      };
    },
    setSeciliAnket: (state, action) => {
      state.seciliAnket = action.payload;
    },
    clearSeciliAnket: (state) => {
      state.seciliAnket = null;
    },
    updateDashboardStats: (state, action) => {
      state.dashboardStats = { ...state.dashboardStats, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Ogrenci Detay
      .addCase(getOgrenciDetay.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOgrenciDetay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ogrenciDetay = action.payload.data.ogrenci;
        state.rehberBilgileri = action.payload.data.ogrenci.rehberBilgileri;
        state.sinifOgrencileri = action.payload.data.sinifOgrencileri;
        state.dashboardStats.sinifOgrenciSayisi = action.payload.data.sinifOgrencileri.length;
        state.error = null;
      })
      .addCase(getOgrenciDetay.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Ogrenci Anketler
      .addCase(getOgrenciAnketler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOgrenciAnketler.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mevcutAnketler = action.payload.data;
        state.dashboardStats.toplamAnket = action.payload.data.length;
        state.error = null;
      })
      .addCase(getOgrenciAnketler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Ogrenci Anket
      .addCase(getOgrenciAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOgrenciAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seciliAnket = action.payload.data;
        state.error = null;
      })
      .addCase(getOgrenciAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit Anket Sonuc
      .addCase(submitAnketSonuc.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitAnketSonuc.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketSonuclari.push(action.payload.data);
        state.dashboardStats.tamamlananAnket += 1;
        state.dashboardStats.bekleyenAnket = Math.max(0, state.dashboardStats.bekleyenAnket - 1);
        state.error = null;
      })
      .addCase(submitAnketSonuc.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Ogrenci Anket Sonuclari
      .addCase(getOgrenciAnketSonuclari.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOgrenciAnketSonuclari.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketSonuclari = action.payload.data;
        state.dashboardStats.tamamlananAnket = action.payload.data.length;
        state.error = null;
      })
      .addCase(getOgrenciAnketSonuclari.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Ogrenci Detay
      .addCase(updateOgrenciDetay.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOgrenciDetay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ogrenciDetay = action.payload.data;
        state.error = null;
      })
      .addCase(updateOgrenciDetay.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Sinif Ogrencileri
      .addCase(getSinifOgrencileri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSinifOgrencileri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sinifOgrencileri = action.payload.data;
        state.dashboardStats.sinifOgrenciSayisi = action.payload.data.length;
        state.error = null;
      })
      .addCase(getSinifOgrencileri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearOgrenciData,
  setSeciliAnket,
  clearSeciliAnket,
  updateDashboardStats
} = ogrenciSlice.actions;
export default ogrenciSlice.reducer;
