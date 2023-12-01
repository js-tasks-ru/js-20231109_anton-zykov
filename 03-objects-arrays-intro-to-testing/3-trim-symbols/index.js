/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (typeof size !== 'number') {
    return string;
  }

  const result = [];
  let counter = size;
  let previousLetter = null;
  
  for (const s of string) {
    if (previousLetter !== s) {
      counter = size;
    }
    previousLetter = s;
    if (counter) {
      counter--;
      result.push(s);
    }
  }

  return result.join('');
}
