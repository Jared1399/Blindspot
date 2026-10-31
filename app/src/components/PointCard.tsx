import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  label: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  bearingDeg: number;
  color: string;
}

function formatDistance(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m.toFixed(0)} m`;
}

function formatBearing(d: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const i = Math.round(d / 45) % 8;
  return `${d.toFixed(0)}° ${dirs[i]}`;
}

function openInMaps(lat: number, lng: number) {
  const url = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}`,
    default: `https://maps.google.com/maps?daddr=${lat},${lng}`,
  });
  Linking.openURL(url);
}

export function PointCard({ label, lat, lng, distanceMeters, bearingDeg, color }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.detail, { color: colors.muted }]}>
          {formatDistance(distanceMeters)} · {formatBearing(bearingDeg)}
        </Text>
        <Text style={[styles.coords, { color: colors.muted }]}>
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color }]}
        onPress={() => openInMaps(lat, lng)}
      >
        <Text style={styles.buttonText}>Ir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  dot: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600' },
  detail: { fontSize: 13, marginTop: 2 },
  coords: { fontSize: 11, marginTop: 1 },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
