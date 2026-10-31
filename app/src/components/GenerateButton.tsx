import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}

export function GenerateButton({ loading, disabled, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled || loading ? colors.muted : colors.primary,
        },
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>GENERAR</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  text: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 2 },
});
