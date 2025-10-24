import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Role-based Survey Components
import OgrenciSurveyView from './SurveysRole/OgrenciSurveyView';
import RehberSurveyView from './SurveysRole/RehberSurveyView';
import AdminSurveyView from './SurveysRole/AdminSurveyView';

const SurveyScreen = ({ navigation }) => {
  const { currentUser } = useSelector(state => state.user || {});
const userRole = currentUser?.role;

  // Role-based component rendering
  const renderSurveyComponent = () => {
    switch (userRole) {
      case 'Admin':
        return <AdminSurveyView navigation={navigation} />;
      case 'Rehber':
        return <RehberSurveyView navigation={navigation} />;
      case 'Öğrenci':
      default:
        return <OgrenciSurveyView navigation={navigation} />;
    }
  };

  // Role-based header title
  const getHeaderTitle = () => {
    switch (userRole) {
      case 'Admin':
        return 'Admin Anketi';
      case 'Rehber':
        return 'Rehber Anketi';
      case 'Öğrenci':
      default:
        return 'Öğrenci Anketi';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginBottom: -4 }} />
            </TouchableOpacity>
            <Text style={styles.title}>{getHeaderTitle()}</Text>
          </View>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        {renderSurveyComponent()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // StatusBar alanı için ek padding
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 36,
    marginTop: -24,
  },
  content: {
    flex: 1,
    
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default SurveyScreen;
