import { useDispatch, useSelector } from 'react-redux';
import { 
  getUserById, 
  getAllUsers, 
  getUsersByRole, 
  getAllRehberler, 
  getAllOgrenciler 
} from '../services/authService';
import {
  setLoading,
  setError,
  setCurrentUser,
  setAllUsers,
  setUsersByRole,
  setRehberler,
  setOgrenciler,
  setSelectedUser,
  setUserStats
} from '../redux/userSlice';

export const useUserManagement = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { 
    loading, 
    error, 
    currentUser, 
    allUsers, 
    usersByRole, 
    rehberler, 
    ogrenciler, 
    selectedUser,
    userStats 
  } = useSelector(state => state.user || {});

  // Kullanıcı bilgilerini getir
  const fetchUserById = async (userId) => {
    try {
      dispatch(setLoading(true));
      const userData = await getUserById(token, userId);
      dispatch(setCurrentUser(userData));
      return userData;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Tüm kullanıcıları getir
  const fetchAllUsers = async () => {
    try {
      dispatch(setLoading(true));
      const users = await getAllUsers(token);
      dispatch(setAllUsers(users));
      
      // İstatistikleri hesapla
      const stats = {
        totalUsers: users.length,
        adminCount: users.filter(user => user.role === 'Admin').length,
        rehberCount: users.filter(user => user.role === 'Rehber').length,
        ogrenciCount: users.filter(user => user.role === 'Öğrenci').length
      };
      dispatch(setUserStats(stats));
      
      return users;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Role göre kullanıcıları getir
  const fetchUsersByRole = async (role) => {
    try {
      dispatch(setLoading(true));
      const users = await getUsersByRole(token, role);
      dispatch(setUsersByRole(users));
      return users;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Tüm rehberleri getir
  const fetchRehberler = async () => {
    try {
      dispatch(setLoading(true));
      const rehberler = await getAllRehberler(token);
      dispatch(setRehberler(rehberler));
      return rehberler;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Tüm öğrencileri getir
  const fetchOgrenciler = async () => {
    try {
      dispatch(setLoading(true));
      const ogrenciler = await getAllOgrenciler(token);
      dispatch(setOgrenciler(ogrenciler));
      return ogrenciler;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Seçili kullanıcıyı ayarla
  const selectUser = (user) => {
    dispatch(setSelectedUser(user));
  };

  // Hata mesajını temizle
  const clearError = () => {
    dispatch(setError(null));
  };

  return {
    // State
    loading,
    error,
    currentUser,
    allUsers,
    usersByRole,
    rehberler,
    ogrenciler,
    selectedUser,
    userStats,
    
    // Actions
    fetchUserById,
    fetchAllUsers,
    fetchUsersByRole,
    fetchRehberler,
    fetchOgrenciler,
    selectUser,
    clearError
  };
};
