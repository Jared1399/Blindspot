from math import sin, cos, radians, degrees, atan2, asin

EARTH_DIAMETER = 6371000  # en metros


def displace_location(initial_lat, initial_lng, distance_meters, degrees):
    distancia_angular = distance_meters / EARTH_DIAMETER
    path_rad = radians(degrees)

    lat_rad = radians(initial_lat)
    lng_rad = radians(initial_lng)

    new_lat_rad = asin(
        sin(lat_rad) * cos(distancia_angular) +
        cos(lat_rad) * sin(distancia_angular) * cos(path_rad)
    )

    new_lng_rad = lng_rad + atan2(
        sin(path_rad) * sin(distancia_angular) * cos(lat_rad),
        cos(distancia_angular) - sin(lat_rad) * sin(new_lat_rad)
    )

    new_lat = degrees(new_lat_rad)
    new_lng = degrees(new_lng_rad)

    return {"lat": new_lat, "lng": new_lng}
