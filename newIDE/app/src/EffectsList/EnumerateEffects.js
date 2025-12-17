// @flow
import { mapFor } from '../Utils/MapFor';
import { type Schema } from '../CompactPropertiesEditor';
import flatten from 'lodash/flatten';
import { effectPropertiesMapToSchema } from '../PropertiesEditor/PropertiesMapToSchema';

export type EnumeratedEffectMetadata = {|
  extension: gdPlatformExtension,
  effectMetadata: gdEffectMetadata,
  type: string,
  fullName: string,
  description: string,
  parametersSchema: Schema,
  isMarkedAsNotWorkingForObjects: boolean,
  isMarkedAsOnlyWorkingFor2D: boolean,
  isMarkedAsOnlyWorkingFor3D: boolean,
|};

/**
 * Fetch all the effects available for a project, and convert them
 * to a format easier to use.
 */
export const enumerateEffectsMetadata = (
  project: gdProject
): Array<EnumeratedEffectMetadata> => {
  const platform = project.getCurrentPlatform();
  const extensionsList = platform.getAllPlatformExtensions();

  return flatten(
    mapFor(0, extensionsList.size(), i => {
      const extension = extensionsList.at(i);

      return extension
        .getExtensionEffectTypes()
        .toJSArray()
        .map(type => extension.getEffectMetadata(type))
        .map((effectMetadata: gdEffectMetadata) => {
          const effectType = effectMetadata.getType();

          // Convert the effect type properties to a PropertiesEditor Schema.
          const parametersSchema: Schema = effectPropertiesMapToSchema({
            defaultValueProperties: effectMetadata.getProperties(),
            getProperties: instance => effectMetadata.getProperties(),
          });
          return {
            extension,
            type: effectType,
            effectMetadata,
            fullName: effectMetadata.getFullName(),
            description: effectMetadata.getDescription(),
            isMarkedAsNotWorkingForObjects: effectMetadata.isMarkedAsNotWorkingForObjects(),
            isMarkedAsOnlyWorkingFor2D: effectMetadata.isMarkedAsOnlyWorkingFor2D(),
            isMarkedAsOnlyWorkingFor3D: effectMetadata.isMarkedAsOnlyWorkingFor3D(),
            parametersSchema,
          };
        });
    })
  ).sort(
    (
      enumeratedEffectMetadata1: EnumeratedEffectMetadata,
      enumeratedEffectMetadata2: EnumeratedEffectMetadata
    ) => {
      return enumeratedEffectMetadata1.fullName.localeCompare(
        enumeratedEffectMetadata2.fullName
      );
    }
  );
};

export const enumerateEffectNames = (
  effectsContainer: gdEffectsContainer
): Array<string> => {
  return mapFor(0, effectsContainer.getEffectsCount(), (i: number) => {
    const effect: gdEffect = effectsContainer.getEffectAt(i);
    return effect.getName();
  });
};

export const setEffectDefaultParameters = (
  effect: gdEffect,
  effectMetadata: gdEffectMetadata
) => {
  effect.clearParameters();

  const properties = effectMetadata.getProperties();
  const parameterNames = properties.keys().toJSArray();
  parameterNames.forEach((parameterName: string) => {
    const property = properties.get(parameterName);
    const valueType = property.getType().toLowerCase();

    if (valueType === 'number') {
      effect.setDoubleParameter(
        parameterName,
        parseFloat(property.getValue()) || 0
      );
    } else if (valueType === 'boolean') {
      effect.setBooleanParameter(parameterName, property.getValue() === 'true');
    } else {
      effect.setStringParameter(parameterName, property.getValue());
    }
  });
};
