import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://10.101.160.168:5000/api';

// Normalization fonksiyonu - farklı formatları tutarlı hale getirir
const normalizeAnket = (anket) => {
  return {
    id: anket.id,
    baslik: anket.baslik || anket.title || '',
    aciklama: anket.aciklama || anket.description || '',
    sorular: anket.sorular || anket.questions || [],
    targetClasses: anket.targetClasses || [],
    expiryDate: anket.expiryDate || '',
    isActive: anket.isActive !== undefined ? anket.isActive : true,
    createdAt: anket.createdAt || '',
    updatedAt: anket.updatedAt || '',
    rehberId: anket.rehberId || anket.createdBy || '',
    createdBy: anket.createdBy || '',
    rehberBilgisi: anket.rehberBilgisi || null
  };
};

// Async thunks
export const getRehberDashboardData = createAsyncThunk(
  'rehber/getRehberDashboardData',
  async (rehberId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rehber/${rehberId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Rehber verileri alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRehberOgrenciler = createAsyncThunk(
  'rehber/getRehberOgrenciler',
  async (rehberId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ogrenci/rehber/${rehberId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Öğrenciler alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getRehberAnketler = createAsyncThunk(
  'rehber/getRehberAnketler',
  async (rehberId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys/rehber/${rehberId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      console.log('=== DEBUG: getRehberAnketler API Response ===');
      console.log('API Response:', data);
      console.log('data.anketler:', data.anketler);
      console.log('data.anketler length:', data.anketler?.length);

      if (!response.ok) {
        throw new Error(data.message || 'Anketler alınamadı');
      }

      // Anketleri normalize et
      const normalizedAnketler = data.anketler ? data.anketler.map(normalizeAnket) : [];
      
      console.log('Normalized anketler:', normalizedAnketler);
      console.log('Normalized anketler length:', normalizedAnketler.length);
      
      return {
        ...data,
        anketler: normalizedAnketler
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRehberAnket = createAsyncThunk(
  'rehber/createRehberAnket',
  async ({ rehberId, anketData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rehberId,
          anketData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket oluşturulamadı');
      }

      // Yeni oluşturulan anketi normalize et
      const normalizedAnket = data.data ? normalizeAnket(data.data) : null;
      
      return {
        ...data,
        data: normalizedAnket
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRehberAnket = createAsyncThunk(
  'rehber/updateRehberAnket',
  async ({ anketId, anketData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys/${anketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anketData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket güncellenemedi');
      }

      // Güncellenen anketi normalize et
      const normalizedAnket = data.data ? normalizeAnket(data.data) : null;
      
      return {
        ...data,
        data: normalizedAnket
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRehberAnket = createAsyncThunk(
  'rehber/deleteRehberAnket',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys/${anketId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket silinemedi');
      }

      return { anketId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAnketSonuclari = createAsyncThunk(
  'rehber/getAnketSonuclari',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys/${anketId}/results`, {
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
      return rejectWithValue(error.message);
    }
  }
);

export const updateRehberDetay = createAsyncThunk(
  'rehber/updateRehberDetay',
  async ({ rehberId, detayData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rehber/${rehberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detayData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Rehber detayları güncellenemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  rehberInfo: null,
  ogrenciler: [],
  anketler: [],
  anketSonuclari: {},
  dashboardStats: {
    toplamOgrenci: 0,
    aktifAnket: 0,
    tamamlananAnket: 0,
    sinifSayisi: 0
  },
  isLoading: false,
  error: null
};

const rehberSlice = createSlice({
  name: 'rehber',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRehberData: (state) => {
      state.rehberInfo = null;
      state.ogrenciler = [];
      state.anketler = [];
      state.anketSonuclari = {};
      state.dashboardStats = {
        toplamOgrenci: 0,
        aktifAnket: 0,
        tamamlananAnket: 0,
        sinifSayisi: 0
      };
    },
    updateDashboardStats: (state, action) => {
      state.dashboardStats = { ...state.dashboardStats, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Rehber Dashboard Data
      .addCase(getRehberDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRehberDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rehberInfo = action.payload.data;
        state.error = null;
      })
      .addCase(getRehberDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Rehber Ogrenciler
      .addCase(getRehberOgrenciler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRehberOgrenciler.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ogrenciler = action.payload.data;
        state.dashboardStats.toplamOgrenci = action.payload.data.length;
        state.error = null;
      })
      .addCase(getRehberOgrenciler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Rehber Anketler
      .addCase(getRehberAnketler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRehberAnketler.fulfilled, (state, action) => {
        state.isLoading = false;
        // API'den anketler action.payload.anketler olarak geliyor
        state.anketler = action.payload.anketler || [];
        
        console.log('=== DEBUG: Redux State Güncelleniyor ===');
        console.log('state.anketler:', state.anketler);
        console.log('state.anketler.length:', state.anketler?.length);
        
        // İstatistikleri güncelle
        const anketlerArray = action.payload.anketler || [];
        const aktifAnket = anketlerArray.filter(anket => anket.isActive).length;
        const tamamlananAnket = anketlerArray.filter(anket => !anket.isActive).length;
        
        state.dashboardStats.aktifAnket = aktifAnket;
        state.dashboardStats.tamamlananAnket = tamamlananAnket;
        
        state.error = null;
      })
      .addCase(getRehberAnketler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Rehber Anket
      .addCase(createRehberAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRehberAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketler.push(action.payload.data);
        state.dashboardStats.aktifAnket += 1;
        state.error = null;
      })
      .addCase(createRehberAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Rehber Anket
      .addCase(updateRehberAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRehberAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.anketler.findIndex(anket => anket.id === action.payload.data.id);
        if (index !== -1) {
          state.anketler[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateRehberAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Rehber Anket
      .addCase(deleteRehberAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRehberAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.anketler = state.anketler.filter(anket => anket.id !== action.payload.anketId);
        state.dashboardStats.aktifAnket = Math.max(0, state.dashboardStats.aktifAnket - 1);
        state.error = null;
      })
      .addCase(deleteRehberAnket.rejected, (state, action) => {
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
        state.anketSonuclari[action.meta.arg] = action.payload.data;
        state.error = null;
      })
      .addCase(getAnketSonuclari.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Rehber Detay
      .addCase(updateRehberDetay.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRehberDetay.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rehberInfo = action.payload.data;
        state.error = null;
      })
      .addCase(updateRehberDetay.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearRehberData, updateDashboardStats } = rehberSlice.actions;
export default rehberSlice.reducer;
