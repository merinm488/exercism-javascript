// @ts-check

/**
 * Generates a random starship registry number.
 *
 * @returns {string} the generated registry number.
 */
export function randomShipRegistryNumber() {
  let regNum = Math.floor(Math.random() * 10000);
  return `NCC-${regNum}`;
}

/**
 * Generates a random stardate.
 *
 * @returns {number} a stardate between 41000 (inclusive) and 42000 (exclusive).
 */
export function randomStardate() {
  let min = 41000;
  let max = 42000;
  return Math.floor(Math.random() * (max-min)+min); 
}


/**
 * Generates a random planet class.
 *
 * @returns {string} a one-letter planet class.
 */
export function randomPlanetClass() {
  const planetClass = 'DHJKLMNRTY'
  let index =  Math.floor(Math.random() * planetClass.length);
  return planetClass[index];
}
