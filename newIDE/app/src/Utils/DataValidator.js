// @flow

/**
 * Validates that data is an object. Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {*} The data if validation passes
 * @throws {Error} If data is not an object
 */
export const ensureIsObject = ({
  data,
  endpointName,
}: {|
  data: any,
  endpointName: string,
|}): any => {
  if (!data || typeof data !== 'object') {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object.`
    );
  }
  return data;
};

/**
 * Validates that data is an object or null. Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {*} The data if validation passes
 * @throws {Error} If data is not an object or null
 */
export const ensureIsObjectOrNull = ({
  data,
  endpointName,
}: {|
  data: any,
  endpointName: string,
|}): any => {
  if (data !== null && (!data || typeof data !== 'object')) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object or null.`
    );
  }
  return data;
};

/**
 * Validates that data is null or an object with the specified property (not undefined).
 * Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.propertyName - The name of the property that must exist if data is an object
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {*} The data if validation passes
 * @throws {Error} If data is not null and doesn't have the property
 */
export const ensureIsNullOrObjectHasProperty = ({
  data,
  propertyName,
  endpointName,
}: {|
  data: any,
  propertyName: string,
  endpointName: string,
|}): any => {
  if (data !== null) {
    if (!data || typeof data !== 'object') {
      throw new Error(
        `Invalid response from endpoint ${endpointName}, was expecting an object or null.`
      );
    }
    if (data[propertyName] === undefined) {
      throw new Error(
        `Invalid response from endpoint ${endpointName}, was expecting an object with a ${propertyName} field.`
      );
    }
  }
  return data;
};

/**
 * Validates that data is an array. Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {Array<*>} The data if validation passes
 * @throws {Error} If data is not an array
 */
export const ensureIsArray = ({
  data,
  endpointName,
}: {|
  data: any,
  endpointName: string,
|}): Array<any> => {
  if (!Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an array.`
    );
  }
  return data;
};

/**
 * Validates that data is an array or null. Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {Array<*> | null} The data if validation passes
 * @throws {Error} If data is not an array or null
 */
export const ensureIsArrayOrNull = ({
  data,
  endpointName,
}: {|
  data: any,
  endpointName: string,
|}): Array<any> | null => {
  if (data !== null && !Array.isArray(data)) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an array or null.`
    );
  }
  return data;
};

/**
 * Validates that data is a string. Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {string} The data if validation passes
 * @throws {Error} If data is not a string
 */
export const ensureIsString = ({
  data,
  endpointName,
}: {|
  data: any,
  endpointName: string,
|}): string => {
  if (typeof data !== 'string') {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting a string.`
    );
  }
  return data;
};

/**
 * Validates that data is an object with a specific property of a specific type.
 * Throws an error if validation fails.
 * @param {Object} params - The parameters object
 * @param {*} params.data - The data to validate
 * @param {string} params.propertyName - The name of the property that must exist
 * @param {string} params.propertyType - The expected type of the property ('string', 'number', 'boolean', 'object', 'array')
 * @param {string} params.endpointName - The name of the endpoint for error messages
 * @returns {*} The data if validation passes
 * @throws {Error} If data is not an object or doesn't have the property with the correct type
 */
export const ensureIsObjectWithPropertyOfType = ({
  data,
  propertyName,
  propertyType,
  endpointName,
}: {|
  data: any,
  propertyName: string,
  propertyType: 'string' | 'number' | 'boolean' | 'object' | 'array',
  endpointName: string,
|}): any => {
  if (!data || typeof data !== 'object') {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object.`
    );
  }
  if (data[propertyName] === undefined) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object with a ${propertyName} field.`
    );
  }
  const propertyValue = data[propertyName];
  let isValidType = false;
  if (propertyType === 'array') {
    isValidType = Array.isArray(propertyValue);
  } else {
    isValidType = typeof propertyValue === propertyType;
  }
  if (!isValidType) {
    throw new Error(
      `Invalid response from endpoint ${endpointName}, was expecting an object with a ${propertyName} field of type ${propertyType}.`
    );
  }
  return data;
};
