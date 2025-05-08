/**
 * Calcula las coordenadas de un punto en la imagen basado en su posición en píxeles
 * @param {Object} imageInfo - Información de la imagen y sus coordenadas límite
 * @param {number} imageInfo.width - Ancho de la imagen en píxeles
 * @param {number} imageInfo.height - Alto de la imagen en píxeles
 * @param {Object} imageInfo.topLeft - Coordenadas de la esquina superior izquierda
 * @param {number} imageInfo.topLeft.north - Latitud norte
 * @param {number} imageInfo.topLeft.east - Longitud este
 * @param {Object} imageInfo.bottomRight - Coordenadas de la esquina inferior derecha
 * @param {number} imageInfo.bottomRight.north - Latitud norte
 * @param {number} imageInfo.bottomRight.east - Longitud este
 * @param {Object} clickPosition - Posición del clic en píxeles
 * @param {number} clickPosition.x - Coordenada X del clic
 * @param {number} clickPosition.y - Coordenada Y del clic
 * @returns {Object} Coordenadas calculadas en formato {north: number, east: number}
 */
export function calculateCoordinates(imageInfo, clickPosition) {
  const { width, height, topLeft, bottomRight } = imageInfo;
  const { x, y } = clickPosition;

  // Calcular la proporción de la posición del clic respecto al tamaño total de la imagen
  const xRatio = x / width;
  const yRatio = y / height;

  // Calcular la diferencia entre las coordenadas límite
  const northDiff = topLeft.north - bottomRight.north;
  const eastDiff = bottomRight.east - topLeft.east;

  // Calcular las coordenadas finales
  const north = topLeft.north - (northDiff * yRatio);
  const east = topLeft.east + (eastDiff * xRatio);

  return { north, east };
}

/**
 * Formatea las coordenadas para mostrar en formato legible
 * @param {Object} coordinates - Coordenadas a formatear
 * @param {number} coordinates.north - Latitud norte
 * @param {number} coordinates.east - Longitud este
 * @returns {string} Coordenadas formateadas
 */
export function formatCoordinates(coordinates) {
  return `N: ${coordinates.north.toFixed(6)}, E: ${coordinates.east.toFixed(6)}`;
} 