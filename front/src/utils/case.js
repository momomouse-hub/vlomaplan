const toCamel = (str) =>
  str.replace(/[_-]([a-z])/g, (_, c) => c.toUpperCase());

const toSnake = (str) =>
  str
    .replace(/([A-Z])/g, "_$1")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();

const isPlainObject = (v) =>
  Object.prototype.toString.call(v) === "[object Object]";

const transformKeysDeep = (input, keyFn) => {
  if (Array.isArray(input)) {
    return input.map((v) => transformKeysDeep(v, keyFn));
  }
  if (isPlainObject(input)) {
    const out = {};
    Object.keys(input).forEach((k) => {
      const nk = keyFn(k);
      const v = input[k];
      out[nk] = transformKeysDeep(v, keyFn);
    });
    return out;
  }
  return input;
};

export const camelizeKeys = (obj) => transformKeysDeep(obj, toCamel);
export const decamelizeKeys = (obj) => transformKeysDeep(obj, toSnake);
