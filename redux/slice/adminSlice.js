import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

// Async thunks
export const getAdminDashboardData = createAsyncThunk(
  'admin/getAdminDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const [usersResponse, studentCountResponse] = await Promise.all([
        authService.getAllUsers(),
        authService.getStudentCount()
      ]);
      
      return {
        allUsers: usersResponse,
        studentCount: studentCountResponse.count
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUsersByRole = createAsyncThunk(
  'admin/getUsersByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await authService.getUsersByRole(role);
      return { role, users: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewUser = createAsyncThunk(
  'admin/createNewUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserData = createAsyncThunk(
  'admin/updateUserData',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await authService.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserData = createAsyncThunk(
  'admin/deleteUserData',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await authService.deleteUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAdminStatistics = createAsyncThunk(
  'admin/getAdminStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getAdminStatistics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  dashboardData: {
    allUsers: [],
    studentCount: 0,
    rehberCount: 0,
    adminCount: 0
  },
  usersByRole: {
    'Öğrenci': [],
    'Rehber': [],
    'Admin': []
  },
  isLoading: false,
  error: null,
  statistics: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    classCount: 0,
    surveyCount: 0,
    resultCount: 0,
    classes: []
  }
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.dashboardData = {
        allUsers: [],
        studentCount: 0,
        rehberCount: 0,
        adminCount: 0
      };
      state.usersByRole = {
        'Öğrenci': [],
        'Rehber': [],
        'Admin': []
      };
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Admin Dashboard Data
      .addCase(getAdminDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData.allUsers = action.payload.allUsers;
        state.dashboardData.studentCount = action.payload.studentCount;
        
        // Role bazında sayıları hesapla
        const rehberCount = action.payload.allUsers.filter(user => user.role === 'Rehber').length;
        const adminCount = action.payload.allUsers.filter(user => user.role === 'Admin').length;
        
        state.dashboardData.rehberCount = rehberCount;
        state.dashboardData.adminCount = adminCount;
        state.dashboardData.totalUsers = action.payload.allUsers.length;
        
        state.error = null;
      })
      .addCase(getAdminDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Users By Role
      .addCase(getUsersByRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersByRole[action.payload.role] = action.payload.users;
        state.error = null;
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create New User
      .addCase(createNewUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData.allUsers.push(action.payload);
        state.usersByRole[action.payload.role].push(action.payload);
        state.error = null;
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update User Data
      .addCase(updateUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Dashboard data'da güncelle
        const index = state.dashboardData.allUsers.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.dashboardData.allUsers[index] = action.payload;
        }
        
        // Role bazında güncelle
        const roleIndex = state.usersByRole[action.payload.role].findIndex(user => user.id === action.payload.id);
        if (roleIndex !== -1) {
          state.usersByRole[action.payload.role][roleIndex] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete User Data
      .addCase(deleteUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Dashboard data'dan sil
        state.dashboardData.allUsers = state.dashboardData.allUsers.filter(
          user => user.id !== action.payload.userId
        );
        
        // Tüm role listelerinden sil
        Object.keys(state.usersByRole).forEach(role => {
          state.usersByRole[role] = state.usersByRole[role].filter(
            user => user.id !== action.payload.userId
          );
        });
        
        state.error = null;
      })
      .addCase(deleteUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Admin Statistics
      .addCase(getAdminStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = {
          totalUsers: action.payload.totalUsers,
          classCount: action.payload.classCount,
          surveyCount: action.payload.surveyCount,
          resultCount: action.payload.resultCount,
          classes: action.payload.classes
        };
        state.dashboardData.studentCount = action.payload.studentCount;
        state.dashboardData.rehberCount = action.payload.rehberCount;
        state.dashboardData.adminCount = action.payload.adminCount;
        state.error = null;
      })
      .addCase(getAdminStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboardData, updateStatistics } = adminSlice.actions;
export default adminSlice.reducer;
