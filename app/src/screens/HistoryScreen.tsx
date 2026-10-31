import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { getAllSessions, deleteSession } from '../storage/database';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Session } from '../types';

type Props = NativeStackScreenProps<any, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllSessions().then(setSessions).catch(() => {});
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar', '¿Eliminar esta sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(id);
          setSessions((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate('Results', {
          result: {
            attractor: {
              lat: item.attractorLat,
              lng: item.attractorLng,
              distanceMeters: item.attractorDistanceM,
              bearingDeg: item.attractorBearing,
            },
            void: {
              lat: item.voidLat,
              lng: item.voidLng,
              distanceMeters: item.voidDistanceM,
              bearingDeg: item.voidBearing,
            },
          },
          userLat: item.userLat,
          userLng: item.userLng,
          radiusMeters: item.radiusM,
        })
      }
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.date, { color: colors.text }]}>
          {new Date(item.createdAt).toLocaleDateString('es', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </Text>
        {item.locationName && (
          <Text style={[styles.location, { color: colors.muted }]}>{item.locationName}</Text>
        )}
      </View>
      <Text style={[styles.radius, { color: colors.muted }]}>
        Radio: {item.radiusM >= 1000 ? `${(item.radiusM / 1000).toFixed(1)} km` : `${item.radiusM} m`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {sessions.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.muted }}>Sin historial aún</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeader: { marginBottom: 4 },
  date: { fontSize: 15, fontWeight: '600' },
  location: { fontSize: 13, marginTop: 2 },
  radius: { fontSize: 12, marginTop: 4 },
});
