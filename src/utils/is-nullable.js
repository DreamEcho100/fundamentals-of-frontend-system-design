/**
 * @param {any} value
 * @returns {value is null | undefined}
 */
export function isNullable(value) {
  return value === null || value === undefined;
}

// const test = 22;

// if (isNullable(test)) {
//   console.log("is nullable", test);
// }
