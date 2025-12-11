// @flow

/**
 * Validates that data is an array.
 * @returns The data passed in parameter.
 * @throws Error if data is not an array.
 */
export const ensureIsArray = <T>({
  data,
  endpointName,
}: {|
  data: T,
  endpointName: string,
|}): T => {
  if (!Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an array.`
    );
  }
  return data;
};

/**
 * Validates that data is an array or null.
 * @returns The data passed in parameter.
 * @throws Error if data is not an array and not null.
 */
export const ensureIsArrayOrNull = <T>({
  data,
  endpointName,
}: {|
  data: T,
  endpointName: string,
|}): T => {
  if (data !== null && !Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an array or null.`
    );
  }
  return data;
};

/**
 * Validates that data is an object (and not null, not an array).
 * @returns The data passed in parameter.
 * @throws Error if data is not an object.
 */
export const ensureIsObject = <T>({
  data,
  endpointName,
}: {|
  data: T,
  endpointName: string,
|}): T => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object.`
    );
  }
  return data;
};

/**
 * Validates that data is an object or null.
 * @returns The data passed in parameter.
 * @throws Error if data is not an object and not null.
 */
export const ensureIsObjectOrNull = <T>({
  data,
  endpointName,
}: {|
  data: T,
  endpointName: string,
|}): T => {
  if (data !== null && (typeof data !== 'object' || Array.isArray(data))) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object or null.`
    );
  }
  return data;
};

/**
 * Validates that data is null or an object with a specific property defined (not undefined).
 * @returns The data passed in parameter.
 * @throws Error if data is not null and is not an object with the specified property.
 */
export const ensureIsNullOrObjectHasProperty = <T>({
  data,
  propertyName,
  endpointName,
}: {|
  data: T,
  propertyName: string,
  endpointName: string,
|}): T => {
  if (data === null) {
    return data;
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object with property "${propertyName}" or null.`
    );
  }
  // $FlowFixMe - we're checking the property exists
  if (data[propertyName] === undefined) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object with property "${propertyName}".`
    );
  }
  return data;
};
