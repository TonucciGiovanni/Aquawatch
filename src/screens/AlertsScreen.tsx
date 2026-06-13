import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AlertItem from '../components/AlertItem';
import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';
import { Alert, AlertSeverity } from '../types';

type AlertFilter = 'all' | AlertSeverity;

const filters: Array<{ label: string; value: AlertFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
];

export default function AlertsScreen() {
  const alerts = useSensorStore((state) => state.alerts);
  const [filter, setFilter] = useState<AlertFilter>('all');

  const unacknowledgedCount = useMemo(
    () => alerts.filter((alert) => !alert.acknowledged).length,
    [alerts],
  );

  const filteredAlerts = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((alert) => alert.severity === filter)),
    [alerts, filter],
  );

  const renderAlert = ({ item }: ListRenderItemInfo<Alert>) => <AlertItem alert={item} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Alerts</Text>
                <Text style={styles.subtitle}>{unacknowledgedCount} unacknowledged alerts</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{unacknowledgedCount}</Text>
              </View>
            </View>

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
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={46} color={theme.colors.success} />
            <Text style={styles.emptyTitle}>All clear — no active alerts</Text>
          </View>
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: theme.colors.danger,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: theme.spacing.md,
  },
  countText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: '900',
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
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxxl,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
});