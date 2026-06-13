import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSensorStore } from '../store/useSensorStore';
import { theme } from '../theme';
import { Alert, AlertSeverity } from '../types';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AlertItemProps {
  alert: Alert;
}

const severityConfig: Record<
  AlertSeverity,
  { color: string; icon: IoniconName; backgroundColor: string }
> = {
  critical: {
    color: theme.colors.danger,
    icon: 'alert-circle-outline',
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
  warning: {
    color: theme.colors.warning,
    icon: 'warning-outline',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  info: {
    color: theme.colors.primary,
    icon: 'information-circle-outline',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
  },
};

const getRelativeTime = (timestamp: string) => {
  const elapsedMs = Math.max(Date.now() - new Date(timestamp).getTime(), 0);
  const minutes = Math.floor(elapsedMs / 60000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
};

export default function AlertItem({ alert }: AlertItemProps) {
  const acknowledgeAlert = useSensorStore((state) => state.acknowledgeAlert);
  const config = severityConfig[alert.severity];

  return (
    <View style={styles.item}>
      <View style={[styles.iconCircle, { backgroundColor: config.backgroundColor }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.sensorName}>
          {alert.sensorName}
        </Text>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.meta}>
          {alert.county} · {getRelativeTime(alert.timestamp)}
        </Text>
      </View>

      {alert.acknowledged ? (
        <View style={styles.acknowledged}>
          <Ionicons name="checkmark-done-outline" size={20} color={theme.colors.textSecondary} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => acknowledgeAlert(alert.id)}
          style={({ pressed }) => [styles.ackButton, pressed && styles.ackButtonPressed]}
        >
          <Text style={styles.ackButtonText}>Ack</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minHeight: 104,
    padding: theme.spacing.md,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  sensorName: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: theme.spacing.xs,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  ackButton: {
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  ackButtonPressed: {
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  ackButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  acknowledged: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
  },
});