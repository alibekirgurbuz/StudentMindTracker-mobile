import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://studentmindtracker-server-1.onrender.com';

// Async thunks
export const saveAnketSonuc = createAsyncThunk(
  'anketSonuc/saveAnketSonuc',
  async ({ ogrenciId, anketId, sonuc }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/save-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ogrenciId,
          anketId,
          sonuc
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket sonucu kaydedilemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAnketSonuclari = createAsyncThunk(
  'anketSonuc/getAnketSonuclari',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${anketId}/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket sonuçları alınamadı');
      }

      return data;
    } catch (error) {
      console.error('Anket sonuçları yükleme hatası:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getOgrenciAnketSonuclari = createAsyncThunk(
  'anketSonuc/getOgrenciAnketSonuclari',
  async (ogrenciId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ogrenci/${ogrenciId}/anket-sonuclari`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Öğrenci anket sonuçları alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRehberAnketSonuclari = createAsyncThunk(
  'anketSonuc/getRehberAnketSonuclari',
  async (rehberId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rehber/${rehberId}/anket-sonuclari`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Rehber anket sonuçları alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAnketIstatistikleri = createAsyncThunk(
  'anketSonuc/getAnketIstatistikleri',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/${anketId}/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket istatistikleri alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSinifBazliIstatistikler = createAsyncThunk(
  'anketSonuc/getSinifBazliIstatistikler',
  async ({ anketId, sinif }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/${anketId}/class-stats/${sinif}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sınıf bazlı istatistikler alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const exportAnketSonuclari = createAsyncThunk(
  'anketSonuc/exportAnketSonuclari',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/${anketId}/export`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket sonuçları dışa aktarılamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  anketSonuclari: {}, // Object olarak değiştirildi - anketId -> results mapping
  ogrenciSonuclari: [],
  rehberSonuclari: [],
  anketIstatistikleri: {
    toplamKatilim: 0,
    benzersizOgrenci: 0,
    sinifIstatistikleri: {},
    ortalamaPuan: 0,
    enYuksekPuan: 0,
    enDusukPuan: 0
  },
  sinifBazliIstatistikler: {},
  exportData: null,
  isLoading: false,
  error: null
};

const anketSonucSlice = createSlice({
  name: 'anketSonuc',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnketSonucData: (state) => {
      state.anketSonuclari = [];
      state.ogrenciSonuclari = [];
      state.rehberSonuclari = [];
      state.anketIstatistikleri = {
        toplamKatilim: 0,
        benzersizOgrenci: 0,
        sinifIstatistikleri: {},
        ortalamaPuan: 0,
        enYuksekPuan: 0,
        enDusukPuan: 0
      };
      state.sinifBazliIstatistikler = {};
      state.exportData = null;
    },
    updateAnketIstatistikleri: (state, action) => {
      state.anketIstatistikleri = { ...state.anketIstatistikleri, ...action.payload };
    },
    clearExportData: (state) => {
      state.exportData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Save Anket Sonuc
      .addCase(saveAnketSonuc.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveAnketSonuc.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketSonuclari.push(action.payload.data);
        state.error = null;
      })
      .addCase(saveAnketSonuc.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Anket Sonuclari
      .addCase(getAnketSonuclari.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnketSonuclari.fulfilled, (state, action) => {
        state.isLoading = false;
        // anketId'ye göre sonuçları sakla
        const anketId = action.meta.arg;
        state.anketSonuclari[anketId] = action.payload.data.results;
        state.anketIstatistikleri = action.payload.data.statistics;
        state.error = null;
      })
      .addCase(getAnketSonuclari.rejected, (state, action) => {
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
        state.ogrenciSonuclari = action.payload.data;
        state.error = null;
      })
      .addCase(getOgrenciAnketSonuclari.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Rehber Anket Sonuclari
      .addCase(getRehberAnketSonuclari.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRehberAnketSonuclari.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rehberSonuclari = action.payload.data;
        state.error = null;
      })
      .addCase(getRehberAnketSonuclari.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Anket Istatistikleri
      .addCase(getAnketIstatistikleri.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnketIstatistikleri.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketIstatistikleri = action.payload.data;
        state.error = null;
      })
      .addCase(getAnketIstatistikleri.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Sinif Bazli Istatistikler
      .addCase(getSinifBazliIstatistikler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSinifBazliIstatistikler.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sinifBazliIstatistikler[action.meta.arg.sinif] = action.payload.data;
        state.error = null;
      })
      .addCase(getSinifBazliIstatistikler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Export Anket Sonuclari
      .addCase(exportAnketSonuclari.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportAnketSonuclari.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exportData = action.payload.data;
        state.error = null;
      })
      .addCase(exportAnketSonuclari.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearAnketSonucData,
  updateAnketIstatistikleri,
  clearExportData
} = anketSonucSlice.actions;
export default anketSonucSlice.reducer;
