import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { refreshSensor } from '../api/sensors';
import AlertItem from '../components/AlertItem';
import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';
import type { RootTabParamList } from '../navigation/AppNavigator';
import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';
import { Sensor, SensorType } from '../types';

type SensorDetailScreenProps = BottomTabScreenProps<RootTabParamList, 'Sensors'>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const typeIcons: Record<SensorType, IoniconName> = {
  flow: 'water-outline',
  pressure: 'speedometer-outline',
  quality: 'flask-outline',
  level: 'layers-outline',
};

const typeLabels: Record<SensorType, string> = {
  flow: 'Flow',
  pressure: 'Pressure',
  quality: 'Water Quality',
  level: 'Storage Level',
};

const formatSensorValue = (sensor: Sensor) => {
  if (sensor.type === 'pressure' || sensor.type === 'quality') {
    return sensor.value.toFixed(1);
  }

  return Math.round(sensor.value).toString();
};

const formatReadingTime = (timestamp: string) =>
  new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildHourLabels = () => {
  const now = new Date();

  return Array.from({ length: 24 }, (_, index) => {
    if (index === 23) {
      return 'now';
    }

    const hour = new Date(now.getTime() - (23 - index) * 60 * 60 * 1000).getHours();

    if (hour % 6 !== 0) {
      return '';
    }

    return `${hour.toString().padStart(2, '0')}:00`;
  });
};

const getInsight = (sensor: Sensor) => {
  if (sensor.type === 'flow' && sensor.value > 400) {
    return 'Flow rate is elevated. Check for possible pipe burst or unauthorized draw in this zone.';
  }

  if (sensor.type === 'pressure' && sensor.value < 2) {
    return 'Low pressure detected. Possible blockage or pump underperformance.';
  }

  if (sensor.type === 'quality' && (sensor.value < 6.8 || sensor.value > 8.2)) {
    return 'pH outside safe range. Flag for water quality team review.';
  }

  if (sensor.type === 'level' && sensor.value > 90) {
    return 'Tank near capacity. Consider opening secondary outlet.';
  }

  return 'Sensor readings are within normal operational parameters.';
};

function SignalDots({ strength }: { strength: number }) {
  return (
    <View style={styles.signalDots}>
      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={index}
          style={[
            styles.signalDot,
            {
              backgroundColor: index < strength ? theme.colors.primary : theme.colors.textMuted,
            },
          ]}
        />
      ))}
    </View>
  );
}

function SensorsListView() {
  const sensors = useSensorStore((state) => state.sensors);
  const loading = useSensorStore((state) => state.loading);
  const refreshing = useSensorStore((state) => state.refreshing);
  const refreshSensors = useSensorStore((state) => state.refreshSensors);

  const renderSensor = ({ item }: ListRenderItemInfo<Sensor>) => <SensorCard sensor={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sensors}
        keyExtractor={(item) => item.id}
        renderItem={renderSensor}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.screenTitle}>Sensors</Text>
            <Text style={styles.screenSubtitle}>
              {loading ? 'Loading field nodes...' : `${sensors.length} monitored stations`}
            </Text>
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No sensors available.</Text> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refreshSensors();
            }}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default function SensorDetailScreen({ route, navigation }: SensorDetailScreenProps) {
  const sensorId = route.params?.sensorId;
  const sensors = useSensorStore((state) => state.sensors);
  const selectedSensor = useSensorStore((state) => state.selectedSensor);
  const setSelectedSensor = useSensorStore((state) => state.setSelectedSensor);
  const alerts = useSensorStore((state) => state.alerts);
  const [refreshingCurrent, setRefreshingCurrent] = useState(false);

  const sensor = useMemo(() => {
    if (!sensorId) {
      return null;
    }

    return sensors.find((item) => item.id === sensorId) ?? selectedSensor;
  }, [selectedSensor, sensorId, sensors]);

  const sensorAlerts = useMemo(
    () => (sensor ? alerts.filter((alert) => alert.sensorId === sensor.id) : []),
    [alerts, sensor],
  );

  const chartWidth = Dimensions.get('window').width - theme.spacing.lg * 2;
  const chartLabels = useMemo(() => buildHourLabels(), []);

  const handleBackToList = () => {
    setSelectedSensor(null);
    navigation.setParams({ sensorId: undefined });
  };

  const handleRefreshSensor = async () => {
    if (!sensor) {
      return;
    }

    setRefreshingCurrent(true);

    try {
      const updatedSensor = await refreshSensor(sensor.id);

      useSensorStore.setState((state) => ({
        sensors: state.sensors.map((item) => (item.id === updatedSensor.id ? updatedSensor : item)),
        selectedSensor: updatedSensor,
        lastUpdated: new Date(),
      }));
    } finally {
      setRefreshingCurrent(false);
    }
  };

  if (!sensorId) {
    return <SensorsListView />;
  }

  if (!sensor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.screenTitle}>Sensor not found</Text>
          <Pressable style={styles.refreshButton} onPress={handleBackToList}>
            <Ionicons name="arrow-back-outline" size={18} color={theme.colors.textPrimary} />
            <Text style={styles.refreshButtonText}>Back to list</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <Pressable accessibilityRole="button" onPress={handleBackToList} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={22} color={theme.colors.textPrimary} />
          </Pressable>
          <View style={styles.detailHeaderText}>
            <Text numberOfLines={1} style={styles.detailTitle}>
              {sensor.name}
            </Text>
            <Text style={styles.screenSubtitle}>{sensor.county} County</Text>
          </View>
          <StatusBadge status={sensor.status} />
        </View>

        <View style={styles.metricCard}>
          <View>
            <Text style={styles.metricLabel}>Current reading</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.currentValue}>
              {formatSensorValue(sensor)} <Text style={styles.currentUnit}>{sensor.unit}</Text>
            </Text>
            <Text style={styles.lastReading}>Last reading: {formatReadingTime(sensor.lastReading)}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={refreshingCurrent}
            onPress={() => {
              void handleRefreshSensor();
            }}
            style={[styles.refreshButton, refreshingCurrent && styles.refreshButtonDisabled]}
          >
            <Ionicons name="refresh-outline" size={18} color={theme.colors.textPrimary} />
            <Text style={styles.refreshButtonText}>{refreshingCurrent ? 'Refreshing' : 'Refresh'}</Text>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Battery</Text>
            <Text style={styles.statValue}>{sensor.batteryLevel}%</Text>
            <View style={styles.batteryBar}>
              <View style={[styles.batteryFill, { width: `${sensor.batteryLevel}%` }]} />
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Signal</Text>
            <Text style={styles.statValue}>{sensor.signalStrength}/4</Text>
            <SignalDots strength={sensor.signalStrength} />
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>County</Text>
            <Text style={styles.statValue}>{sensor.county}</Text>
            <Text style={styles.statMeta}>
              {sensor.lat.toFixed(2)}, {sensor.lon.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sensor Type</Text>
            <View style={styles.typeRow}>
              <Ionicons name={typeIcons[sensor.type]} size={19} color={theme.colors.primary} />
              <Text style={styles.statValue}>{typeLabels[sensor.type]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>24-hour trend</Text>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: sensor.history }],
            }}
            width={chartWidth}
            height={180}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.card,
              backgroundGradientFrom: theme.colors.card,
              backgroundGradientTo: theme.colors.card,
              decimalPlaces: sensor.type === 'quality' || sensor.type === 'pressure' ? 1 : 0,
              color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
              labelColor: () => theme.colors.textSecondary,
              propsForBackgroundLines: {
                stroke: theme.colors.border,
                strokeDasharray: '4 8',
              },
              propsForLabels: {
                fontSize: 10,
                fontWeight: '700',
              },
            }}
            bezier
            withDots={false}
            withInnerLines
            withOuterLines={false}
            withShadow={false}
            style={styles.chart}
          />
        </View>

        <View style={styles.insightCard}>
          <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
          <Text style={styles.insightText}>{getInsight(sensor)}</Text>
        </View>

        <View style={styles.alertSection}>
          <Text style={styles.sectionTitle}>Alert history</Text>
          {sensorAlerts.length > 0 ? (
            sensorAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
          ) : (
            <Text style={styles.emptyText}>No active alerts for this sensor.</Text>
          )}
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
  listHeader: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  screenTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
  },
  screenSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  detailHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    color: theme.colors.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  currentValue: {
    color: theme.colors.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    marginTop: theme.spacing.xs,
    maxWidth: 210,
  },
  currentUnit: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    fontWeight: '800',
  },
  lastReading: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  refreshButtonDisabled: {
    opacity: 0.62,
  },
  refreshButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    minHeight: 116,
    padding: theme.spacing.md,
    width: '48%',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginTop: theme.spacing.sm,
  },
  statMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  batteryBar: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    height: 8,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
  batteryFill: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
    height: '100%',
  },
  signalDots: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  signalDot: {
    borderRadius: theme.borderRadius.full,
    height: 9,
    width: 9,
  },
  typeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chartCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.lg,
    marginLeft: -theme.spacing.md,
  },
  insightCard: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 4,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  insightText: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 20,
  },
  alertSection: {
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    paddingVertical: theme.spacing.lg,
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    gap: theme.spacing.lg,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});