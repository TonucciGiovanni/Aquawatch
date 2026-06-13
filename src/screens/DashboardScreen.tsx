import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
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

import SensorCard from '../components/SensorCard';
import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';
import { Sensor, SensorFilter } from '../types';

const filters: Array<{ label: string; value: SensorFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Online', value: 'online' },
  { label: 'Warning', value: 'warning' },
  { label: 'Offline', value: 'offline' },
];

const formatTime = (date: Date | null) => {
  if (!date) {
    return 'Syncing...';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.88,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 760,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonBody}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonPill} />
      </View>
      <View style={styles.skeletonReading} />
    </Animated.View>
  );
}

function LoadingSkeletons() {
  return (
    <View style={styles.skeletonList}>
      {[0, 1, 2].map((item) => (
        <SkeletonCard key={item} />
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const sensors = useSensorStore((state) => state.sensors);
  const loading = useSensorStore((state) => state.loading);
  const refreshing = useSensorStore((state) => state.refreshing);
  const lastUpdated = useSensorStore((state) => state.lastUpdated);
  const filter = useSensorStore((state) => state.filter);
  const setFilter = useSensorStore((state) => state.setFilter);
  const refreshSensors = useSensorStore((state) => state.refreshSensors);

  const filteredSensors = useMemo(
    () => (filter === 'all' ? sensors : sensors.filter((sensor) => sensor.status === filter)),
    [filter, sensors],
  );

  const metrics = useMemo(
    () => ({
      total: sensors.length,
      online: sensors.filter((sensor) => sensor.status === 'online').length,
      warning: sensors.filter((sensor) => sensor.status === 'warning').length,
      offline: sensors.filter((sensor) => sensor.status === 'offline').length,
    }),
    [sensors],
  );

  const renderSensor = ({ item }: ListRenderItemInfo<Sensor>) => <SensorCard sensor={item} />;

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>AquaWatch</Text>
          <Text style={styles.subtitle}>Field Sensor Network · Kenya</Text>
        </View>
        <View style={styles.updatedBox}>
          <Text style={styles.updatedLabel}>Updated</Text>
          <Text style={styles.updatedTime}>{formatTime(lastUpdated)}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsRow}
      >
        <MetricCard label="Total Sensors" value={metrics.total} color={theme.colors.textPrimary} />
        <MetricCard label="Online" value={metrics.online} color={theme.colors.success} />
        <MetricCard label="Warnings" value={metrics.warning} color={theme.colors.warning} />
        <MetricCard label="Offline" value={metrics.offline} color={theme.colors.danger} />
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((item) => {
          const active = filter === item.value;

          return (
            <Pressable
              accessibilityRole="button"
              key={item.value}
              onPress={() => setFilter(item.value)}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={loading ? [] : filteredSensors}
        keyExtractor={(item) => item.id}
        renderItem={renderSensor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={loading ? <LoadingSkeletons /> : <Text style={styles.emptyText}>No sensors found.</Text>}
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  updatedBox: {
    alignItems: 'flex-end',
    paddingTop: theme.spacing.xs,
  },
  updatedLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  updatedTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  metricsRow: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  metricCard: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    minWidth: 132,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  filterRow: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
  },
  filterPill: {
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextActive: {
    color: theme.colors.textPrimary,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    paddingVertical: theme.spacing.xl,
    textAlign: 'center',
  },
  skeletonList: {
    gap: theme.spacing.md,
  },
  skeletonCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    minHeight: 112,
    padding: theme.spacing.md,
  },
  skeletonIcon: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    height: 46,
    width: 46,
  },
  skeletonBody: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  skeletonLineWide: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    height: 14,
    width: '78%',
  },
  skeletonLineShort: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    height: 10,
    width: '48%',
  },
  skeletonPill: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    height: 20,
    width: 72,
  },
  skeletonReading: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    height: 42,
    width: 82,
  },
});