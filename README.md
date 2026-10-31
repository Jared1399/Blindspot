# Blindspot

Generador de puntos de exploración **reproducibles** para caminar sin rumbo fijo.
A partir de tu posición, un radio y tu orientación, la app entrega dos
coordenadas: un **atractor** y un **vacío**.

Inspirado en la idea de blind spots de Randonautica, pero con un mecanismo
distinto: en vez de muestrear puntos al azar y estimar densidad, recorre un
campo de ruido procedural con una espiral áurea. Eso lo hace **determinista**:
la misma semilla devuelve el mismo par de coordenadas, así que puedes volver al
mismo lugar o compartirlo con otra persona.

> No está afiliado a Randonautica ni usa su marca, su backend ni su generador.
> Este repositorio es un experimento de algoritmos y matemática geográfica.

## Cómo funciona

1. Se arma una grilla de 100×100 celdas que cubre un cuadrado de `2 × radio`.
2. Cada celda obtiene un valor de un campo **simplex/Perlin** sembrado con el
   hash de los inputs.
3. Se recorre el campo con una **espiral áurea** (`r = e^(bθ)`, `b = ln φ / (π/2)`)
   rotada según tu orientación, así que el muestreo respeta hacia dónde miras.
4. Para cada punto visitado se compara el valor del ruido con el promedio de su
   vecindad 3×3.
5. El promedio más alto es el **atractor**; el más bajo, el **vacío**.
6. La distancia y el rumbo se convierten en coordenadas con el fórmulario
   geodésico directo sobre una esfera de 6.371 km.

### La semilla

```ts
djb2(lat | lng | heading | batteryPct | radius | deviceId | timestamp)
```

La entropía viene del dispositivo: nivel de batería, orientación de la brújula,
identificador local y milisegundos. No hay servicio externo ni "número cuántico":
es entropía de hardware, y el README lo dice en vez de insinuar lo contrario.

Como el `timestamp` entra en la semilla, cada generación es distinta, pero
cualquier resultado se puede recalcular si guardas la semilla.

## Stack

- **Expo / React Native** (SDK 54, React 19) — iOS y Android
- `react-native-maps` con proveedor Google para el mapa
- `expo-location` (posición y brújula), `expo-battery`, `expo-sensors`
- `expo-sqlite` para el historial local
- TypeScript estricto en toda la capa de algoritmo

## Estructura

```
app/
├── src/
│   ├── algorithm/
│   │   ├── generate.ts    # grilla + ruido + espiral + atractor/vacío
│   │   ├── displace.ts    # destino geodésico (haversine inverso)
│   │   └── seed.ts        # djb2 sobre los inputs
│   ├── screens/           # Home, Results, History
│   └── storage/           # SQLite: device id + historial
└── app.json
generate_points.py         # prototipo original en Python (matplotlib)
displace_location.py       # misma matemática, versión Python
```

## Correr la app

```bash
cd app
npm install
npx expo start          # luego "a" para Android o "i" para iOS
```

Necesita permisos de ubicación. En Android el mapa usa Google Maps, así que hace
falta una API key para builds propias.

## Prototipo en Python

El algoritmo nació como script de escritorio antes de portarse a TypeScript:

```bash
pip install numpy noise matplotlib
python3 generate_points.py 1234   # el argumento es la semilla
```

Imprime la distancia y el rumbo del atractor y del vacío. La visualización con
matplotlib está comentada al final del archivo.

## Limitaciones

- **El atractor no es una propiedad del mundo real.** Es un máximo local de un
  campo de ruido que nosotros mismos generamos. No hay nada "mágico" en esas
  coordenadas, y el README no pretende lo contrario: el interés está en el
  mecanismo, no en una promesa sobrenatural.
- Sin backend ni cuentas: todo es local, el historial vive en SQLite.
- Un solo usuario, sin compartir puntos entre dispositivos.
- No hay build publicada; el repositorio es el entregable.

## Licencia

MIT — ver [LICENSE](LICENSE).
