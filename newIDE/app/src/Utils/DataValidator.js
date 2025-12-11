// @flow

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

export const ensureObjectHasProperty = ({
  data,
  propertyName,
  endpointName,
}: {|
  data: any,
  propertyName: string,
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
  return data;
};

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
