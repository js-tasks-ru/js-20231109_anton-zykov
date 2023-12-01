/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (obj) {
    const keys = path.split('.');
    let currentObj = obj;
    for (let i = 0; i < keys.length; i++) {
      if (currentObj === undefined) {
        return undefined;
      }
      currentObj = currentObj[keys[i]];
    }
    return currentObj;
  };
}
