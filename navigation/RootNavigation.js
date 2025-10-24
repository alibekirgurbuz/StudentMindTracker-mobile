import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Main Screens - Role Based
import MainScreen from '../screens/Main/MainScreen'; // Öğrenci
import AdminMainScreen from '../screens/Main/AdminMainScreen'; // Admin
import RehberMainScreen from '../screens/Main/RehberMainScreen'; // Rehber

// Survey Screens
import SurveyResults from '../screens/SurveyResults/surveyResults';
import EditSurvey from '../screens/EditSurveys/EditSurvey';
import QuestionsScreen from '../screens/QuestionsScreen/QuestionsScreen';

// Tab Navigators
import TabNavigator from './TabNavigator';
import RehberTabNavigator from './RehberTabNavigator';
import AdminTabNavigator from './AdminTabNavigator';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  const { isAuthenticated, currentUser } = useSelector(state => state.user || {});
  const userRole = currentUser?.role;

  // Rol bazlı ana ekran seçimi
  const getMainScreen = () => {
    switch (userRole) {
      case 'Admin':
        return AdminTabNavigator; // Admin için Tab Navigator
      case 'Rehber':
        return RehberTabNavigator; // Rehber için Tab Navigator
      case 'Öğrenci':
      default:
        return TabNavigator; // Öğrenci için Tab Navigator
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Kullanıcı giriş yapmışsa - Rol bazlı yönlendirme
          <>
            <Stack.Screen 
              name="MainStack" 
              component={getMainScreen()} 
            />
            <Stack.Screen 
              name="SurveyResults" 
              component={SurveyResults} 
            />
            <Stack.Screen 
              name="EditSurvey" 
              component={EditSurvey} 
            />
            <Stack.Screen 
              name="QuestionsScreen" 
              component={QuestionsScreen} 
            />
          </>
        ) : (
          // Kullanıcı giriş yapmamışsa - Auth ekranları
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
