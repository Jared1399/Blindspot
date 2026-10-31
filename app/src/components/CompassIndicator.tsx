import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  heading: number;
}

export function CompassIndicator({ heading }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.compass, { borderColor: colors.border }]}>
      <View style={[styles.needle, { backgroundColor: colors.accent, transform: [{ rotate: `${heading}deg` }] }]} />
      <View style={[styles.center, { backgroundColor: colors.text }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  compass: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  needle: {
    width: 3,
    height: 18,
    borderRadius: 2,
    position: 'absolute',
    top: 6,
  },
  center: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
