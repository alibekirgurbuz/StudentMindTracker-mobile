import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import MainScreen from '../screens/Main/MainScreen';
import ChatScreen from '../screens/ChatScreen';
import SurveyScreen from '../screens/SurveyScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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

          if (route.name === 'Main') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Survey') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
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
          marginBottom: 1,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Main" 
        component={MainScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          tabBarLabel: 'Sohbet',
          tabBarStyle: { display: 'none' }, // ChatScreen'de tab bar gizle
        }}
      />
      <Tab.Screen 
        name="Survey" 
        component={SurveyScreen}
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

export default TabNavigator;
