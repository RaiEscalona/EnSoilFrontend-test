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
 * Formats coordinates for display
 * @param {Object|Array} coordinates - The coordinates to format
 * @returns {string} Formatted coordinates string
 */
export function formatCoordinates(coordinates) {
  // Handle GeoJSON Point format
  if (coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
    const [east, north] = coordinates.coordinates;
    return `N: ${north?.toFixed(6)}, E: ${east?.toFixed(6)}`;
  }
  
  // Handle simple object format
  if (coordinates.north !== undefined && coordinates.east !== undefined) {
    return `N: ${coordinates.north.toFixed(6)}, E: ${coordinates.east.toFixed(6)}`;
  }

  // Handle array format [east, north]
  if (Array.isArray(coordinates)) {
    const [east, north] = coordinates;
    return `N: ${north.toFixed(6)}, E: ${east.toFixed(6)}`;
  }

  return 'Coordenadas no disponibles';
} 