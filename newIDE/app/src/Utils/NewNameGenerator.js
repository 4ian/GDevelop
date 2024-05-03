// @flow

const newNameGenerator = (
  name /*:string */,
  exists /*:(string) => boolean */,
  prefix /*: string */ = ''
): string => {
  if (!exists(name)) return name;
  if (prefix && !exists(prefix + name)) return prefix + name;

  const [radix, numberSuffix] = splitNameAndNumberSuffix(prefix + name);
  const startingNumberSuffix = numberSuffix === null ? 2 : numberSuffix + 1;
  let potentialName = radix + startingNumberSuffix;
  for (let i = startingNumberSuffix + 1; exists(potentialName); ++i) {
    potentialName = radix + i;
  }
  return potentialName;
};

export const splitNameAndNumberSuffix = (
  text: string
): [string, number | null] => {
  for (let i = 0; i < text.length; i++) {
    const suffix = text.slice(i, text.length);
    if (suffix.startsWith('0')) continue;

    // parseInt cannot be used since parseInt('3D4') returns 3.
    const numberSuffix = Number(suffix);
    if (numberSuffix === Math.floor(numberSuffix)) {
      return [text.slice(0, i), numberSuffix];
    }
  }
  return [text, null];
};

export default newNameGenerator;
