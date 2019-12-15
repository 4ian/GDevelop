// @flow
import { mapFor } from '../Utils/MapFor';
import { type Schema } from '../PropertiesEditor';
import flatten from 'lodash/flatten';

export type EnumeratedEffectMetadata = {|
  extension: gdPlatformExtension,
  type: string,
  fullName: string,
  description: string,
  parametersSchema: Schema,
  parameterDefaultValues: Array<{|
    parameterName: string,
    defaultValue: number,
  |}>,
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
        .map(effectMetadata => {
          const effectType = effectMetadata.getType();

          // Convert the effect type properties to a PropertiesEditor Schema.
          const properties = effectMetadata.getProperties();
          const parameterNames = properties.keys().toJSArray();
          const parametersSchema: Schema = parameterNames.map(
            (parameterName: string) => {
              const property = properties.get(parameterName);
              const propertyLabel = property.getLabel();

              if (property.getType() !== 'number') {
                console.warn(
                  `Parameter "${parameterName}" of effect type "${effectType}" has a non supported type: ${property.getType()}. Only "number" is supported.`
                );
              }

              return {
                name: parameterName,
                getLabel: () => propertyLabel,
                valueType: 'number',
                getValue: (effect: gdEffect) =>
                  effect.getParameter(parameterName),
                setValue: (effect: gdEffect, newValue: number) =>
                  effect.setParameter(parameterName, newValue),
              };
            }
          );

          // Also store the default values for parameters
          const parameterDefaultValues = parameterNames.map(
            (parameterName: string) => {
              const property = properties.get(parameterName);
              return {
                parameterName,
                defaultValue: parseFloat(property.getValue()) || 0,
              };
            }
          );

          return {
            extension,
            type: effectType,
            fullName: effectMetadata.getFullName(),
            description: effectMetadata.getDescription(),
            parametersSchema,
            parameterDefaultValues,
          };
        });
    })
  );
};
