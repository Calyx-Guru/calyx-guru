import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';

import NewHomeScreen from './new-home';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
   const { colors } = useContext(AppAppearanceContext);

   return (
      <Tab.Navigator
         screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
            tabBarStyle: {
               display: 'none',
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.neutralInverse,
         }}
      >
         <Tab.Screen
            name="home"
            component={NewHomeScreen}
            options={{
               title: 'Home',
               tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
         />
      </Tab.Navigator>
   );
}
