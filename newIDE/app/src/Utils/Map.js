// @flow
export function getOrCreate<K, V>(
  map: Map<K, V>,
  key: K,
  createValue: () => V
): V {
  let value = map.get(key);
  if (!value) {
    value = createValue();
    map.set(key, value);
  }
  return value;
}
