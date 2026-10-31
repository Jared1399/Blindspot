import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

function formatRadius(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

export function RadiusSlider({ value, onChange }: Props) {
  const { colors, isDark } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Radio: {formatRadius(value)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={10000}
        step={100}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  slider: { width: '100%', height: 40 },
});
