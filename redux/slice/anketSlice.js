import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://studentmindtracker-server-1.onrender.com';

// Async thunks
export const getAllAnketler = createAsyncThunk(
  'anket/getAllAnketler',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 API Call: GET', `${API_BASE_URL}/api/surveys`);
      const response = await fetch(`${API_BASE_URL}/api/surveys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Anketler alınamadı');
      }
      return data;
    } catch (error) {
      console.error('❌ getAllAnketler error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const getAnketById = createAsyncThunk(
  'anket/getAnketById',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/surveys/${anketId}`, {
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

export const createAnket = createAsyncThunk(
  'anket/createAnket',
  async ({ rehberId, anketData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys`, {
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

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAnket = createAsyncThunk(
  'anket/updateAnket',
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

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAnket = createAsyncThunk(
  'anket/deleteAnket',
  async (anketId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${anketId}`, {
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

export const getAnketlerByRehberId = createAsyncThunk(
  'anket/getAnketlerByRehberId',
  async (rehberId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/rehber/${rehberId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Rehber anketleri alınamadı');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleAnketStatus = createAsyncThunk(
  'anket/toggleAnketStatus',
  async ({ anketId, isActive }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${anketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anketData: { isActive }
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Anket durumu güncellenemedi');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAktifAnketler = createAsyncThunk(
  'anket/getAktifAnketler',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Aktif anketler alınamadı');
      }

      // Sadece aktif anketleri filtrele
      const aktifAnketler = data.data.filter(anket => anket.isActive);
      return { data: aktifAnketler };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  allAnketler: [],
  seciliAnket: null,
  rehberAnketleri: [],
  aktifAnketler: [],
  anketIstatistikleri: {
    toplamAnket: 0,
    aktifAnket: 0,
    tamamlananAnket: 0,
    ortalamaKatilim: 0
  },
  isLoading: false,
  error: null
};

const anketSlice = createSlice({
  name: 'anket',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnketData: (state) => {
      state.allAnketler = [];
      state.seciliAnket = null;
      state.rehberAnketleri = [];
      state.aktifAnketler = [];
      state.anketIstatistikleri = {
        toplamAnket: 0,
        aktifAnket: 0,
        tamamlananAnket: 0,
        ortalamaKatilim: 0
      };
    },
    setSeciliAnket: (state, action) => {
      state.seciliAnket = action.payload;
    },
    clearSeciliAnket: (state) => {
      state.seciliAnket = null;
    },
    updateAnketIstatistikleri: (state, action) => {
      state.anketIstatistikleri = { ...state.anketIstatistikleri, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Anketler
      .addCase(getAllAnketler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAnketler.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend response: { success: true, data: [] }
        const surveys = action.payload.data || action.payload;
        console.log('🔵 [Mobile Redux] getAllAnketler.fulfilled:', {
          totalSurveys: surveys.length,
          firstSurvey: surveys[0],
          surveysWithCompletedCount: surveys.filter(s => s.completedCount > 0).length
        });
        state.allAnketler = surveys;

        // İstatistikleri güncelle
        const toplamAnket = surveys.length;
        const aktifAnket = surveys.filter(anket => anket.isActive).length;
        const tamamlananAnket = toplamAnket - aktifAnket;

        state.anketIstatistikleri = {
          toplamAnket,
          aktifAnket,
          tamamlananAnket,
          ortalamaKatilim: 0 // Bu değer anket sonuçlarından hesaplanacak
        };

        state.error = null;
      })
      .addCase(getAllAnketler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Anket By ID
      .addCase(getAnketById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seciliAnket = action.payload.data;
        state.error = null;
      })
      .addCase(getAnketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Anket
      .addCase(createAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allAnketler.push(action.payload.data);
        state.anketIstatistikleri.toplamAnket += 1;
        state.anketIstatistikleri.aktifAnket += 1;
        state.error = null;
      })
      .addCase(createAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Anket
      .addCase(updateAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allAnketler.findIndex(anket => anket.id === action.payload.data.id);
        if (index !== -1) {
          state.allAnketler[index] = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Anket
      .addCase(deleteAnket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAnket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allAnketler = state.allAnketler.filter(anket => anket.id !== action.payload.anketId);
        state.anketIstatistikleri.toplamAnket -= 1;
        state.anketIstatistikleri.aktifAnket = Math.max(0, state.anketIstatistikleri.aktifAnket - 1);
        state.error = null;
      })
      .addCase(deleteAnket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Anketler By Rehber ID
      .addCase(getAnketlerByRehberId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnketlerByRehberId.fulfilled, (state, action) => {
        state.isLoading = false;
        // Backend response: { success: true, anketler: [] }
        const surveys = action.payload.anketler || action.payload.data || action.payload;
        console.log('🔵 [Mobile Redux] getAnketlerByRehberId.fulfilled:', {
          totalSurveys: surveys.length,
          surveysWithCompletedCount: surveys.filter(s => s.completedCount > 0).length
        });
        state.rehberAnketleri = surveys;
        state.error = null;
      })
      .addCase(getAnketlerByRehberId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Toggle Anket Status
      .addCase(toggleAnketStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleAnketStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.allAnketler.findIndex(anket => anket.id === action.payload.data.id);
        if (index !== -1) {
          state.allAnketler[index] = action.payload.data;
        }

        // İstatistikleri güncelle
        if (action.payload.data.isActive) {
          state.anketIstatistikleri.aktifAnket += 1;
          state.anketIstatistikleri.tamamlananAnket = Math.max(0, state.anketIstatistikleri.tamamlananAnket - 1);
        } else {
          state.anketIstatistikleri.aktifAnket = Math.max(0, state.anketIstatistikleri.aktifAnket - 1);
          state.anketIstatistikleri.tamamlananAnket += 1;
        }

        state.error = null;
      })
      .addCase(toggleAnketStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Aktif Anketler
      .addCase(getAktifAnketler.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAktifAnketler.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aktifAnketler = action.payload.data;
        state.error = null;
      })
      .addCase(getAktifAnketler.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearAnketData,
  setSeciliAnket,
  clearSeciliAnket,
  updateAnketIstatistikleri
} = anketSlice.actions;
export default anketSlice.reducer;
