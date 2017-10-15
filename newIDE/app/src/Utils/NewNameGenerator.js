export default (name, exists, prefix = '') => {
  if (!exists(name)) return name;

  let potentialName = prefix + name;
  for (let i = 2; exists(potentialName); ++i) {
    potentialName = prefix + name + i;
  }

  return potentialName;
};
