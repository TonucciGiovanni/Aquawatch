import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootTabParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { Sensor, SensorType } from '../types';
import MiniChart from './MiniChart';
import StatusBadge from './StatusBadge';
import { useSensorStore } from '../store/useSensorStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorCardProps {
  sensor: Sensor;
  onPress?: (sensor: Sensor) => void;
}

const typeIcons: Record<SensorType, IoniconName> = {
  flow: 'water-outline',
  pressure: 'speedometer-outline',
  quality: 'flask-outline',
  level: 'layers-outline',
};

const typeColors: Record<SensorType, string> = {
  flow: theme.colors.primary,
  pressure: '#38bdf8',
  quality: '#a78bfa',
  level: '#2dd4bf',
};

const statusBorderColors = {
  online: theme.colors.primary,
  warning: theme.colors.warning,
  offline: theme.colors.danger,
} as const;

const formatValue = (sensor: Sensor) => {
  if (sensor.type === 'pressure' || sensor.type === 'quality') {
    return sensor.value.toFixed(1);
  }

  return Math.round(sensor.value).toString();
};

const getBatteryIcon = (level: number): IoniconName => {
  if (level > 70) {
    return 'battery-full-outline';
  }

  if (level > 30) {
    return 'battery-half-outline';
  }

  return 'battery-dead-outline';
};

export default function SensorCard({ sensor, onPress }: SensorCardProps) {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const setSelectedSensor = useSensorStore((state) => state.setSelectedSensor);
  const iconColor = typeColors[sensor.type];

  const handlePress = () => {
    setSelectedSensor(sensor);

    if (onPress) {
      onPress(sensor);
      return;
    }

    navigation.navigate('Sensors', { sensorId: sensor.id });
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          borderLeftColor: statusBorderColors[sensor.status],
          opacity: sensor.status === 'offline' ? 0.7 : pressed ? 0.84 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={typeIcons[sensor.type]} size={23} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.sensorName}>
          {sensor.name}
        </Text>
        <Text style={styles.county}>{sensor.county}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={sensor.status} />
          <MiniChart data={sensor.history.slice(-12)} />
        </View>
      </View>

      <View style={styles.reading}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.value}>
          {formatValue(sensor)} <Text style={styles.unit}>{sensor.unit}</Text>
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name={getBatteryIcon(sensor.batteryLevel)} size={14} color={theme.colors.textSecondary} />
          <Text style={styles.metaText}>{sensor.batteryLevel}%</Text>
        </View>
        <View style={styles.signalRow}>
          {Array.from({ length: 4 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.signalDot,
                {
                  backgroundColor:
                    index < sensor.signalStrength ? theme.colors.primary : theme.colors.textMuted,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minHeight: 114,
    padding: theme.spacing.md,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  sensorName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  county: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  reading: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    width: 96,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    maxWidth: 96,
  },
  unit: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  metaText: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  signalRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  signalDot: {
    borderRadius: theme.borderRadius.full,
    height: 6,
    width: 6,
  },
});