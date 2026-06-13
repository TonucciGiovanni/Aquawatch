import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { SensorStatus } from '../types';

interface StatusBadgeProps {
  status: SensorStatus;
}

const statusConfig = {
  online: {
    label: 'Online',
    color: theme.colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
  },
  warning: {
    label: 'Warning',
    color: theme.colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
  },
  offline: {
    label: 'Offline',
    color: theme.colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
} as const;

export default function StatusBadge({ status }: StatusBadgeProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const config = statusConfig[status];
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  useEffect(() => {
    if (status !== 'warning') {
      pulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 760,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulse, status]);

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: config.color,
            transform: status === 'warning' ? [{ scale }] : [{ scale: 1 }],
          },
        ]}
      />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: theme.borderRadius.full,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});