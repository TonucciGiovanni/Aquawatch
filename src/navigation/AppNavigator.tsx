import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';

import AlertsScreen from '../screens/AlertsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import SensorDetailScreen from '../screens/SensorDetailScreen';
import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';

export type RootTabParamList = {
  Dashboard: undefined;
  Sensors: { sensorId?: string } | undefined;
  Alerts: undefined;
  Map: undefined;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const Tab = createBottomTabNavigator<RootTabParamList>();

const icons: Record<keyof RootTabParamList, IoniconName> = {
  Dashboard: 'grid-outline',
  Sensors: 'pulse-outline',
  Alerts: 'warning-outline',
  Map: 'map-outline',
};

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.danger,
  },
};

export default function AppNavigator() {
  const alerts = useSensorStore((state) => state.alerts);
  const lastUpdated = useSensorStore((state) => state.lastUpdated);
  const loadSensors = useSensorStore((state) => state.loadSensors);
  const unacknowledgedAlertCount = alerts.filter((alert) => !alert.acknowledged).length;

  useEffect(() => {
    if (!lastUpdated) {
      void loadSensors();
    }
  }, [lastUpdated, loadSensors]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen
          name="Sensors"
          component={SensorDetailScreen}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.setParams({ sensorId: undefined });
              useSensorStore.getState().setSelectedSensor(null);
            },
          })}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            tabBarBadge: unacknowledgedAlertCount > 0 ? unacknowledgedAlertCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: theme.colors.danger,
              color: theme.colors.textPrimary,
              fontWeight: '900',
            },
          }}
        />
        <Tab.Screen name="Map" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}