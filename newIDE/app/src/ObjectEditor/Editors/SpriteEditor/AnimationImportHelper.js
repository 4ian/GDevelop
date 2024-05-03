// @flow
import path from 'path-browserify';
import groupBy from 'lodash/groupBy';

const findCommonPrefix = (values: Array<string>): string => {
  if (values.length === 0) {
    return '';
  }
  if (values.length === 1) {
    return values[0];
  }
  let hasFoundBiggerPrefix = true;
  let prefixLength = 0;
  for (let index = 0; hasFoundBiggerPrefix; index++) {
    const character = values[0].charAt(index);
    hasFoundBiggerPrefix = values.every(
      value => value.length > index && value.charAt(index) === character
    );
    if (!hasFoundBiggerPrefix) {
      prefixLength = index;
    }
  }
  return values[0].substring(0, prefixLength);
};

const separators = [' ', '_', '-', '.'];

const trimFromSeparators = (value: string) => {
  let lowerIndex = 0;
  for (let index = 0; index < value.length; index++) {
    if (!separators.includes(value.charAt(index))) {
      lowerIndex = index - 1;
      break;
    }
  }
  let upperIndex = value.length - 1;
  for (let index = value.length - 1; index >= lowerIndex; index--) {
    if (!separators.includes(value.charAt(index))) {
      upperIndex = index + 1;
      break;
    }
  }
  return value.substring(lowerIndex, upperIndex + 1);
};

export const groupResourcesByAnimations = (
  resources: Array<gdResource>
): Map<string, Array<gdResource>> => {
  const resourcesByAnimation = new Map<string, Array<gdResource>>();

  if (resources.length === 0) {
    return resourcesByAnimation;
  }

  // Extract the frame indexes from the file names.
  const namedResources = resources.map(resource => {
    // The resource name is used instead of the resource file path because
    // cloud projects are prefixing files names with a UID.
    const basename = path.basename(
      resource.getName(),
      path.extname(resource.getName())
    );
    const indexMatches = basename.match(/\(\d+\)$|\d+$/g);
    const indexNumberMatches =
      indexMatches && indexMatches[0].match(/\(\d+\)$|\d+$/g);
    const index = indexNumberMatches ? parseInt(indexNumberMatches[0]) : null;
    let name = trimFromSeparators(
      indexMatches
        ? basename.substring(0, basename.length - indexMatches[0].length)
        : basename
    );
    if (separators.some(separator => name.endsWith(separator))) {
      name = name.substring(0, name.length - 1);
    }
    return {
      resource,
      name,
      index: isNaN(index) ? null : index,
    };
  });

  const commonPrefix = findCommonPrefix(
    namedResources.map(resources => resources.name)
  );
  // Remove the common prefix as it's probably the object name.
  for (const namedResource of namedResources) {
    namedResource.name = namedResource.name.substring(commonPrefix.length);
  }

  // Index the resources by animation names and frame indexes.
  const resourcesByName = groupBy(namedResources, ({ name }) => name);
  for (const name in resourcesByName) {
    const enumeratedResources = resourcesByName[name];
    resourcesByAnimation.set(
      name,
      enumeratedResources
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(resource => resource.resource)
    );
  }
  return resourcesByAnimation;
};
