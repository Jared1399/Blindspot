import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../theme/ThemeContext';
import { PointCard } from '../components/PointCard';
import { saveSession } from '../storage/database';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GenerationResult } from '../types';

type Props = NativeStackScreenProps<any, 'Results'>;

export default function ResultsScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { result, userLat, userLng, radiusMeters, heading, batteryPct } = route.params as {
    result: GenerationResult;
    userLat: number;
    userLng: number;
    radiusMeters: number;
    heading: number;
    batteryPct: number;
  };
  const [locationName, setLocationName] = useState<string | null>(null);

  const region = {
    latitude: userLat,
    longitude: userLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    (async () => {
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: userLat,
          longitude: userLng,
        });
        if (addresses.length > 0) {
          const a = addresses[0];
          const parts = [a.street, a.streetNumber, a.city, a.region].filter(Boolean);
          setLocationName(parts.slice(0, 2).join(', ') || null);
        }
      } catch {}
    })();
  }, []);

  const handleSave = async () => {
    try {
      await saveSession({
        createdAt: new Date().toISOString(),
        userLat,
        userLng,
        radiusM: radiusMeters,
        locationName,
        attractorLat: result.attractor.lat,
        attractorLng: result.attractor.lng,
        attractorDistanceM: result.attractor.distanceMeters,
        attractorBearing: result.attractor.bearingDeg,
        voidLat: result.void.lat,
        voidLng: result.void.lng,
        voidDistanceM: result.void.distanceMeters,
        voidBearing: result.void.bearingDeg,
      });
      Alert.alert('Guardado', 'Puntos guardados en el historial');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation
      >
        <Marker
          coordinate={{ latitude: result.attractor.lat, longitude: result.attractor.lng }}
          title="Atractor"
          pinColor={colors.accent}
        />
        <Marker
          coordinate={{ latitude: result.void.lat, longitude: result.void.lng }}
          title="Vacío"
          pinColor={colors.accent2}
        />
      </MapView>

      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
        <PointCard
          label="Atractor"
          lat={result.attractor.lat}
          lng={result.attractor.lng}
          distanceMeters={result.attractor.distanceMeters}
          bearingDeg={result.attractor.bearingDeg}
          color={colors.accent}
        />
        <PointCard
          label="Vacío"
          lat={result.void.lat}
          lng={result.void.lng}
          distanceMeters={result.void.distanceMeters}
          bearingDeg={result.void.bearingDeg}
          color={colors.accent2}
        />
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
              Volver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.primaryBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
  },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  secondaryBtnText: { fontWeight: '600', fontSize: 15 },
});
