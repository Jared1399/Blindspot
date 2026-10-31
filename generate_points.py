import math
import sys
from datetime import datetime
import numpy as np
import matplotlib.pyplot as plt
from noise import pnoise2
import random

def main():
    #generando la matriz

    # Parámetros
    width = height = 100
    scale = 1/width*5  # Cuanto más bajo, más suaves las variaciones

    # La semilla se fija UNA vez por ejecución. Antes se recalculaba dentro del
    # doble bucle, así que cada celda podía caer en un desplazamiento distinto
    # y el campo de ruido quedaba inconsistente consigo mismo.
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else int(datetime.now().timestamp())
    random.seed(seed)
    seed_offset = seed % 10000

    # Matriz para almacenar los diccionarios
    matrix = [[{} for _ in range(width)] for _ in range(height)]

    # Generar la matriz
    for y in range(height):
        for x in range(width):
            perlin_value = pnoise2((x + seed_offset) * scale, (y + seed_offset) * scale)
            matrix[y][x] = {
                'x': x,
                'y': y,
                'perlin': perlin_value
            }

    center_x = width / 2
    center_y = height / 2
    max_radius = width / 2  # o height / 2
    phi = (1 + 5**0.5) / 2  # Proporción áurea
    b = np.log(phi) / (np.pi / 2)  # Controla el crecimiento radial

    # Generar puntos de la espiral
    spiral_x = []
    spiral_y = []

    angle_deg = random.uniform(0, 360)
    angle_rad = np.radians(angle_deg)


    theta = 0
    while True:
        r = np.exp(b * theta)
        if r > max_radius:
            break
        x = r * np.cos(theta)
        y = r * np.sin(theta)
        
        # Rotación del punto alrededor del centro
        x_rot = x * np.cos(angle_rad) - y * np.sin(angle_rad)
        y_rot = x * np.sin(angle_rad) + y * np.cos(angle_rad)
        
        # Trasladar al centro de la imagen
        spiral_x.append(center_x + x_rot)
        spiral_y.append(center_y + y_rot)
        
        theta += 0.5

    spiral_x = spiral_x[10:]
    spiral_y = spiral_y[10:]


    spiral_matches = []

    for x_f, y_f in zip(spiral_x, spiral_y):
        x = int(x_f)
        y = int(y_f)
        
        if 0 <= x < width and 0 <= y < height:
            cell = matrix[y][x]  # Acceso correcto: primero Y (fila), luego X (columna)
            spiral_matches.append({
                'x': cell['x'],
                'y': cell['y'],
                'perlin': cell['perlin']
            })


    def grid_mean(matrix, x, y):
        vecinos = []
        
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                nx, ny = x + dx, y + dy
                
                # Asegurarse de que no salimos de los límites de la matriz
                if 0 <= nx < width and 0 <= ny < height:
                    vecinos.append(matrix[ny][nx]['perlin'])

        return sum(vecinos) / len(vecinos)

    # Crear una nueva lista con los promedios
    spiral_with_avg = []

    for point in spiral_matches:
        x = point['x']
        y = point['y']
        avg = grid_mean(matrix, x, y)
        
        spiral_with_avg.append({
            'x': x,
            'y': y,
            'perlin': point['perlin'],
            'perlin_avg_3x3': avg
        })

    # Ejemplo: imprimir los primeros resultados
    min_point = min(spiral_with_avg, key=lambda p: p['perlin_avg_3x3'])

    # Punto con el valor promedio más alto
    max_point = max(spiral_with_avg, key=lambda p: p['perlin_avg_3x3'])


    center_x = width // 2
    center_y = height // 2

    distance_scale = 20

    # Coordenadas del centro
    center_x = width // 2
    center_y = height // 2

    # Coordenadas del punto mínimo
    target_x_min_perlin = min_point['x']
    target_y_min_perlin = min_point['y']

    # Coordenadas del punto maximo
    target_x_max_perlin = max_point['x']
    target_y_max_perlin = max_point['y']


    # Distancia euclidiana (en píxeles o celdas)
    dx_min = target_x_min_perlin - center_x
    dy_min = target_y_min_perlin - center_y

    dx_max = target_x_max_perlin - center_x
    dy_max = target_y_max_perlin - center_y

    distance_min_perlin = math.hypot(dx_min, dy_min)*distance_scale
    distance_max_perlin = math.hypot(dx_max, dy_max)*distance_scale


    # Ángulo de orientación (en grados, 0° hacia el este, positivo en sentido antihorario)
    angle_rad_min = math.atan2(dy_min, dx_min)
    angle_deg_min = math.degrees(angle_rad_min) % 360  # Normalizar entre 0° y 360°

    angle_rad_max = math.atan2(dy_max, dx_max)
    angle_deg_max = math.degrees(angle_rad_max) % 360  # Normalizar entre 0° y 360°

    # Mostrar resultados
    print(f"seed = {seed} (repite esta corrida con: python3 generate_points.py {seed})")
    print(f"Distancia desde el centro al min perlin: {distance_min_perlin:.2f} metros")
    print(f"Ángulo desde el centro hacia el punto mínimo: {angle_deg_min:.2f}°")


    print(f"\nDistancia desde el centro al max perlin: {distance_max_perlin:.2f} metros")
    print(f"Ángulo desde el centro hacia el punto maximo: {angle_deg_max:.2f}°")


    perlin_values = np.zeros((height, width))  # Para visualización


    for y in range(height):
        for x in range(width):
            perlin_values[y][x] = matrix[y][x]["perlin"]


    # Normalizar valores para visualización en escala de grises
"""     normalized = (perlin_values - perlin_values.min()) / (perlin_values.max() - perlin_values.min())

    # Crear la figura y mostrar el mapa de Perlin
    plt.figure(figsize=(6, 6))
    plt.imshow(normalized, cmap='gray', interpolation='nearest')

    # Dibujar la espiral encima
    plt.scatter(spiral_x, spiral_y, color='purple', s=5, label='Espiral de Fibonacci')

    plt.scatter(min_point['x'], min_point['y'], color='blue', s=40, label='Mínimo promedio 3x3')

    # 3. Dibujar el punto con mayor promedio (naranja)
    plt.scatter(max_point['x'], max_point['y'], color='orange', s=40, label='Máximo promedio 3x3')

    # Decoraciones finales
    plt.title("Mapa de Perlin con Espiral de Fibonacci")
    plt.colorbar(label='Valor normalizado')
    plt.legend()
    plt.axis('off')
    #plt.show()

    plt.savefig("./perlin_fibonacci.png", dpi=300, bbox_inches='tight') """