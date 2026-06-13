import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import StatusBadge from '../components/StatusBadge';
import type { RootTabParamList } from '../navigation/AppNavigator';
import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';
import { Sensor, SensorStatus, SensorType } from '../types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const typeIcons: Record<SensorType, IoniconName> = {
  flow: 'water-outline',
  pressure: 'speedometer-outline',
  quality: 'flask-outline',
  level: 'layers-outline',
};

const formatValue = (sensor: Sensor) => {
  if (sensor.type === 'pressure' || sensor.type === 'quality') {
    return sensor.value.toFixed(1);
  }

  return Math.round(sensor.value).toString();
};

const getCountyStatus = (sensors: Sensor[]): SensorStatus => {
  if (sensors.some((sensor) => sensor.status === 'offline')) {
    return 'offline';
  }

  if (sensors.some((sensor) => sensor.status === 'warning')) {
    return 'warning';
  }

  return 'online';
};

const getStatusColor = (status: SensorStatus) => {
  if (status === 'offline') {
    return theme.colors.danger;
  }

  if (status === 'warning') {
    return theme.colors.warning;
  }

  return theme.colors.success;
};

export default function MapScreen() {
  const sensors = useSensorStore((state) => state.sensors);
  const setSelectedSensor = useSensorStore((state) => state.setSelectedSensor);
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const [expandedCounties, setExpandedCounties] = useState<Record<string, boolean>>({});

  const countyGroups = useMemo(() => {
    const groups = sensors.reduce<Record<string, Sensor[]>>((accumulator, sensor) => {
      accumulator[sensor.county] = [...(accumulator[sensor.county] ?? []), sensor];
      return accumulator;
    }, {});

    return Object.entries(groups)
      .map(([county, countySensors]) => ({
        county,
        sensors: countySensors,
        status: getCountyStatus(countySensors),
      }))
      .sort((a, b) => a.county.localeCompare(b.county));
  }, [sensors]);

  const toggleCounty = (county: string) => {
    setExpandedCounties((current) => ({
      ...current,
      [county]: !current[county],
    }));
  };

  const openSensor = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    navigation.navigate('Sensors', { sensorId: sensor.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Sensor Locations by County</Text>
          <Text style={styles.subtitle}>County grouping for field dispatch and inspection routes</Text>
        </View>

        <View style={styles.summaryGrid}>
          {countyGroups.map((group) => (
            <Pressable
              accessibilityRole="button"
              key={group.county}
              onPress={() => toggleCounty(group.county)}
              style={styles.countyCard}
            >
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(group.status) }]} />
              <Text numberOfLines={1} style={styles.countyName}>
                {group.county}
              </Text>
              <Text style={styles.countyCount}>{group.sensors.length} sensors</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.listSection}>
          {countyGroups.map((group) => {
            const expanded = expandedCounties[group.county];

            return (
              <View key={group.county} style={styles.groupCard}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => toggleCounty(group.county)}
                  style={styles.groupHeader}
                >
                  <View style={styles.groupTitleRow}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(group.status) }]} />
                    <Text style={styles.groupTitle}>{group.county}</Text>
                    <View style={styles.sensorCountBadge}>
                      <Text style={styles.sensorCountText}>{group.sensors.length}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>

                {expanded && (
                  <View style={styles.miniList}>
                    {group.sensors.map((sensor) => (
                      <Pressable
                        accessibilityRole="button"
                        key={sensor.id}
                        onPress={() => openSensor(sensor)}
                        style={({ pressed }) => [styles.miniCard, pressed && styles.miniCardPressed]}
                      >
                        <View style={styles.miniIcon}>
                          <Ionicons name={typeIcons[sensor.type]} size={18} color={theme.colors.primary} />
                        </View>
                        <View style={styles.miniBody}>
                          <Text numberOfLines={1} style={styles.miniName}>
                            {sensor.name}
                          </Text>
                          <Text style={styles.miniType}>{sensor.type.toUpperCase()}</Text>
                          <StatusBadge status={sensor.status} />
                        </View>
                        <Text style={styles.miniValue}>
                          {formatValue(sensor)} <Text style={styles.miniUnit}>{sensor.unit}</Text>
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: theme.spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  countyCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    minHeight: 88,
    padding: theme.spacing.md,
    width: '48%',
  },
  statusIndicator: {
    borderRadius: theme.borderRadius.full,
    height: 9,
    width: 9,
  },
  countyName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: theme.spacing.md,
  },
  countyCount: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  listSection: {
    gap: theme.spacing.md,
  },
  groupCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  groupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  groupTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  groupTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  sensorCountBadge: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  sensorCountText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  miniList: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  miniCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 86,
    padding: theme.spacing.md,
  },
  miniCardPressed: {
    opacity: 0.82,
  },
  miniIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    borderRadius: theme.borderRadius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  miniBody: {
    flex: 1,
    gap: theme.spacing.xs,
    minWidth: 0,
  },
  miniName: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  miniType: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '900',
  },
  miniValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    maxWidth: 82,
    textAlign: 'right',
  },
  miniUnit: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
});