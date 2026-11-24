// @flow
import { INSTANCE_POSITION_SEMANTICS_MESSAGE } from '../../EditorFunctions';
import { type PublicApiFunction } from '../../EditorFunctions/PublicApi';

/**
 * `describe_instances` lists every instance of a scene, which can be thousands
 * of tokens for an agent using the MCP server. Its result is made smaller here,
 * for this server only: a script (`run_script`) still gets the full output.
 * Nothing is lost: what is left out is a documented default, or is given by
 * the description, or by another call (`offset`).
 */

const DEFAULT_LISTED_INSTANCES_LIMIT = 100;

// The arguments only this server understands, removed before the call.
const MCP_ONLY_ARGUMENT_NAMES = [
  'filter_by_layer',
  'limit',
  'offset',
  'summary',
];

const mcpOnlyProperties = {
  filter_by_layer: {
    type: 'array',
    items: { type: 'string' },
    description:
      'Optional: only the instances on these layers ("" is the base layer).',
  },
  limit: {
    type: 'integer',
    description: `Optional: the maximum number of instances listed (${DEFAULT_LISTED_INSTANCES_LIMIT} by default).`,
  },
  offset: {
    type: 'integer',
    description:
      'Optional: the number of instances to skip, to list the next ones (0 by default).',
  },
  summary: {
    type: 'boolean',
    description:
      'Optional: instead of the instances, only give how many instances each object has on each layer, and the range of their positions.',
  },
};

const mcpResultDescription = `
In this server's results, numbers are rounded to 2 decimals (3 significant digits below 1), and an instance field equal to its default is left out: no \`layer\` means the base layer "", no \`angle\` means 0, no \`customSize\` means false (the instance has the default size of its object), no \`z\` means 0, and no \`depth\` (nor \`z\`) means a 2D instance or an unknown size. In \`objectSizeInfo\`, no \`depth\`, \`originZ\` or \`centerZ\` means a 2D object. At most \`limit\` instances are listed: \`moreInstances\` then tells how to get the others. A \`run_script\` script gets the full output, unrounded and with every field.
Positions: ${INSTANCE_POSITION_SEMANTICS_MESSAGE}`;

export const describeMcpDescribeInstances = (
  publicApiFunction: PublicApiFunction
): PublicApiFunction => {
  if (publicApiFunction.name !== 'describe_instances') return publicApiFunction;
  const { inputSchema } = publicApiFunction;
  return {
    ...publicApiFunction,
    description: publicApiFunction.description + mcpResultDescription,
    inputSchema: {
      ...inputSchema,
      properties: { ...inputSchema.properties, ...mcpOnlyProperties },
    },
  };
};

export const withoutMcpOnlyDescribeInstancesArguments = (toolArguments: {
  [string]: any,
}): { [string]: any } => {
  const editorFunctionArguments = { ...toolArguments };
  MCP_ONLY_ARGUMENT_NAMES.forEach(name => {
    delete editorFunctionArguments[name];
  });
  return editorFunctionArguments;
};

const roundNumber = (value: number): number => {
  if (Number.isInteger(value) || !Number.isFinite(value)) return value;
  if (Math.abs(value) >= 1) return Math.round(value * 100) / 100;
  return Number(value.toPrecision(3));
};

// The data of the user (variable values, raw JSON) are given as they are.
const UNROUNDED_FIELD_NAMES = new Set(['rawJson', 'initialVariables']);

const roundNumbers = (value: any): any => {
  if (typeof value === 'number') return roundNumber(value);
  if (Array.isArray(value)) return value.map(roundNumbers);
  if (!value || typeof value !== 'object') return value;
  const roundedValue: { [string]: any } = {};
  Object.keys(value).forEach(key => {
    roundedValue[key] = UNROUNDED_FIELD_NAMES.has(key)
      ? value[key]
      : roundNumbers(value[key]);
  });
  return roundedValue;
};

const isDefaultInstanceField = (key: string, value: any): boolean =>
  (key === 'layer' && value === '') ||
  (key === 'angle' && value === 0) ||
  (key === 'customSize' && value === false) ||
  (key === 'z' && value === 0) ||
  (key === 'depth' && value === null);

const withoutDefaultFields = (
  value: Object,
  isDefaultField: (key: string, value: any) => boolean
): Object => {
  const valueWithoutDefaults: { [string]: any } = {};
  Object.keys(value).forEach(key => {
    if (value[key] !== undefined && !isDefaultField(key, value[key]))
      valueWithoutDefaults[key] = value[key];
  });
  return valueWithoutDefaults;
};

const isDefaultObjectSizeInfoField = (key: string, value: any): boolean =>
  (key === 'depth' || key === 'originZ' || key === 'centerZ') && value === null;

const getCompactObjectSizeInfo = (objectSizeInfo: {
  [string]: ?Object,
}): { [string]: ?Object } => {
  const compactObjectSizeInfo: { [string]: ?Object } = {};
  Object.keys(objectSizeInfo).forEach(objectName => {
    const sizeInfo = objectSizeInfo[objectName];
    compactObjectSizeInfo[objectName] = sizeInfo
      ? withoutDefaultFields(sizeInfo, isDefaultObjectSizeInfoField)
      : sizeInfo;
  });
  return compactObjectSizeInfo;
};

const getRange = (values: Array<number>): ?[number, number] =>
  values.length ? [Math.min(...values), Math.max(...values)] : null;

const getInstancesSummary = (instances: Array<Object>) => {
  const countsByObjectAndLayer = new Map<string, Object>();
  instances.forEach(instance => {
    const layer = instance.layer || '';
    const key = JSON.stringify([instance.name, layer]);
    const count = countsByObjectAndLayer.get(key);
    if (count) count.count++;
    else
      countsByObjectAndLayer.set(key, {
        objectName: instance.name,
        layer,
        count: 1,
      });
  });
  const getAxisValues = (axis: string): Array<number> =>
    instances
      .map(instance => instance[axis])
      .filter(value => typeof value === 'number');
  const zRange = getRange(getAxisValues('z'));
  return {
    instancesCount: instances.length,
    instancesCountByObjectAndLayer: [...countsByObjectAndLayer.values()],
    positionsRange: {
      x: getRange(getAxisValues('x')),
      y: getRange(getAxisValues('y')),
      ...(zRange ? { z: zRange } : {}),
    },
  };
};

const getNonNegativeInteger = (value: any, defaultValue: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : defaultValue;

const getMoreInstancesMessage = ({
  offset,
  listedCount,
  totalCount,
}: {|
  offset: number,
  listedCount: number,
  totalCount: number,
|}): string =>
  `${
    listedCount
      ? `Instances ${offset + 1} to ${offset + listedCount}`
      : 'No instances'
  } of ${totalCount} are listed. Call again with \`offset: ${offset +
    listedCount}\` for the next ones, or narrow with \`filter_by_object_name\` or \`filter_by_layer\`, or count them with \`summary: true\`.`;

/**
 * The result of `describe_instances` given to the agent: filtered by layer,
 * summarized or paginated, with rounded numbers and without default values.
 */
export const shapeDescribeInstancesResultForMcp = (
  output: any,
  toolArguments: { [string]: any }
): any => {
  if (!output || !Array.isArray(output.instances)) return output;
  const {
    instances: allInstances,
    positionSemantics,
    objectSizeInfo,
    ...otherFields
  } = output;

  const layerNames = Array.isArray(toolArguments.filter_by_layer)
    ? new Set(toolArguments.filter_by_layer.map(String))
    : null;
  const instances = layerNames
    ? allInstances.filter(instance => layerNames.has(instance.layer || ''))
    : allInstances;

  // The generic position semantics are in the description of the tool: only
  // the ones of a custom object are given.
  const customPositionSemantics =
    typeof positionSemantics === 'string'
      ? positionSemantics
          .replace(INSTANCE_POSITION_SEMANTICS_MESSAGE, '')
          .trim()
      : '';
  const shapedOutput: { [string]: any } = { ...otherFields };
  if (layerNames)
    shapedOutput.instancesOnlyOnLayersNamed = [...layerNames].join(',');
  if (customPositionSemantics)
    shapedOutput.positionSemantics = customPositionSemantics;
  if (objectSizeInfo)
    shapedOutput.objectSizeInfo = getCompactObjectSizeInfo(objectSizeInfo);

  if (toolArguments.summary === true) {
    return roundNumbers({ ...shapedOutput, ...getInstancesSummary(instances) });
  }

  const offset = getNonNegativeInteger(toolArguments.offset, 0);
  const limit = getNonNegativeInteger(
    toolArguments.limit,
    DEFAULT_LISTED_INSTANCES_LIMIT
  );
  const listedInstances = instances
    .slice(offset, offset + limit)
    .map(instance => withoutDefaultFields(instance, isDefaultInstanceField));
  shapedOutput.instances = listedInstances;
  if (offset > 0 || offset + limit < instances.length)
    shapedOutput.instancesCount = instances.length;
  if (offset + limit < instances.length)
    shapedOutput.moreInstances = getMoreInstancesMessage({
      offset,
      listedCount: listedInstances.length,
      totalCount: instances.length,
    });
  return roundNumbers(shapedOutput);
};
