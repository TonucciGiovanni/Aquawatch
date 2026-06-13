import { StyleSheet, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { theme } from '../theme';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function MiniChart({
  data,
  width = 96,
  height = 34,
  color = theme.colors.primary,
}: MiniChartProps) {
  if (data.length === 0) {
    return <View style={[styles.container, { width, height }]} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;

      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});