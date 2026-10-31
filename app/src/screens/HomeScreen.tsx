import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { useTheme } from '../theme/ThemeContext';
import { RadiusSlider } from '../components/RadiusSlider';
import { CompassIndicator } from '../components/CompassIndicator';
import { GenerateButton } from '../components/GenerateButton';
import { generatePoints } from '../algorithm/generate';
import { getDeviceId } from '../storage/database';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState(0);
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);

      const headingResult = await Location.getHeadingAsync();
      if (headingResult) setHeading(headingResult.magHeading);
    })();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!location) {
      Alert.alert('Sin ubicación', 'Espera a que obtengamos tu posición.');
      return;
    }
    setLoading(true);
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryPct = batteryLevel >= 0 ? batteryLevel * 100 : 50;
      const deviceId = await getDeviceId();

      const result = generatePoints({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        heading,
        batteryPct,
        deviceId,
        radiusMeters: radius,
        timestamp: Date.now(),
      });

      navigation.navigate('Results', {
        result,
        userLat: location.coords.latitude,
        userLng: location.coords.longitude,
        radiusMeters: radius,
        heading,
        batteryPct,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudieron generar los puntos');
    } finally {
      setLoading(false);
    }
  }, [location, heading, radius, navigation]);

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.muted }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
          >
            <Circle
              center={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              radius={radius}
              fillColor={colors.primary + '20'}
              strokeColor={colors.primary + '40'}
              strokeWidth={2}
            />
          </MapView>
        )}
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <RadiusSlider value={radius} onChange={setRadius} />
          <CompassIndicator heading={heading} />
        </View>
        <GenerateButton loading={loading} disabled={!location} onPress={handleGenerate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapContainer: { flex: 1 },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', width: '100%' },
});
