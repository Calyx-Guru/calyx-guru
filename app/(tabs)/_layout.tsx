import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useContext } from 'react';

import HomeScreen from './home';
import ProfileScreen from './profile';
import SettingsScreen from './settings';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <Tab.Navigator
      screenOptions={
        {
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          tabBarStyle: {
            backgroundColor: colors.surfaceVariant,
            borderTopColor: colors.outline,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.primaryContainer,
        } as BottomTabNavigationOptions
      }
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
