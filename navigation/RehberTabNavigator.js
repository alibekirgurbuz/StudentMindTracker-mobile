import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Screens
import RehberMainScreen from '../screens/Main/RehberMainScreen';
import ChatScreen from '../screens/ChatScreen';
import RehberChatOda from '../screens/Chat/RehberChatOda';
import SurveyScreen from '../screens/SurveyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateSurveyScreen from '../screens/CreateSurvey/CreateSurveyScreen';
import StudentList from '../screens/StudentList/StudentList';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// RehberMain Stack Navigator - CreateSurveyScreen ve StudentList'i içerir
const RehberMainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RehberMainScreen" component={RehberMainScreen} />
    <Stack.Screen name="CreateSurvey" component={CreateSurveyScreen} />
    <Stack.Screen name="StudentList" component={StudentList} />
  </Stack.Navigator>
);

// Survey Stack Navigator - CreateSurveyScreen'i içerir
const SurveyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SurveyMain" component={SurveyScreen} />
    <Stack.Screen name="CreateSurvey" component={CreateSurveyScreen} />
  </Stack.Navigator>
);

// Chat Stack Navigator - ChatScreen'i içerir
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="RehberChatOda" component={RehberChatOda} />
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
  </Stack.Navigator>
);

const RehberTabNavigator = () => {
  const insets = useSafeAreaInsets();

  // Safe area için dinamik yükseklik hesaplama
  const getTabBarHeight = () => {
    const baseHeight = 70;
    const safeAreaBottom = insets.bottom;
    return baseHeight + safeAreaBottom;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'RehberMain') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Survey') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#49b66f',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Math.max(insets.bottom, 8), // Safe area bottom padding
          paddingTop: 8,
          height: getTabBarHeight(),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="RehberMain"
        component={RehberMainStack}
        options={({ route }) => ({
          tabBarLabel: 'Ana Sayfa',
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'RehberMainScreen';
            if (routeName === 'CreateSurvey' || routeName === 'StudentList') {
              return { display: 'none' };
            }
            return {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: getTabBarHeight(),
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            };
          })(route),
        })}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={({ route }) => ({
          tabBarLabel: 'Sohbet',
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'RehberChatOda';
            if (routeName === 'ChatScreen') {
              return { display: 'none' };
            }
            return {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: getTabBarHeight(),
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            };
          })(route),
        })}
      />
      <Tab.Screen
        name="Survey"
        component={SurveyStack}
        options={{
          tabBarLabel: 'Anket',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

export default RehberTabNavigator;
