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
import SurveyAnalysis from '../screens/SurveyAnalysis/SurveyAnalysis';

// Admin Screens
import CreateRehber from '../screens/AdminManage/CreateRehber';

// Profile Screens
import PersonalInformation from '../screens/ProfileScreenPages/PersonalInformation';
import PasswordChangingScreen from '../screens/ProfileScreenPages/PasswordChangingScreen';

// Game Screens
import MemoryCard from '../screens/Games/MemoryCard/MemoryCard';
import ProblemSolving from '../screens/Games/ProblemSolving/ProblemSolving';
import EnglishWords from '../screens/Games/EnglishWords/EnglishWords';
import DecisionGame from '../screens/Games/DecisionGame/DecisionGame';

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
            <Stack.Screen 
              name="SurveyAnalysis" 
              component={SurveyAnalysis} 
            />
            <Stack.Screen 
              name="CreateRehber" 
              component={CreateRehber} 
            />
            <Stack.Screen 
              name="PersonalInformation" 
              component={PersonalInformation} 
            />
            <Stack.Screen 
              name="PasswordChangingScreen" 
              component={PasswordChangingScreen} 
            />
            <Stack.Screen 
              name="MemoryCard" 
              component={MemoryCard} 
            />
            <Stack.Screen 
              name="ProblemSolving" 
              component={ProblemSolving} 
            />
            <Stack.Screen 
              name="EnglishWords" 
              component={EnglishWords} 
            />
            <Stack.Screen 
              name="DecisionGame" 
              component={DecisionGame} 
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
