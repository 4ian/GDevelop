// @flow
import { mapVector } from '../Utils/MapFor';

/** The JS equivalent of gdPropertyDescriptor */
type EnumeratedProperty = {|
  name: string,
  type: string,
  description: string,
  group: string,
  label: string,
  value: string,
  extraInfo: Array<string>,
  isHidden: boolean,
|};

/**
 * Transform a gdNamedPropertyDescriptorsList into a JS object.
 * **Don't use this** unless you explictely need to deal with JS objects.
 * Otherwise, prefer just iterating and using gdNamedPropertyDescriptorsList functions.
 */
export const enumerateNamedPropertyDescriptorsList = (
  namedProperties: gdNamedPropertyDescriptorsList
): Array<EnumeratedProperty> => {
  return mapVector(namedProperties, namedProperty => {
    return {
      name: namedProperty.getName(),
      type: namedProperty.getType(),
      description: namedProperty.getDescription(),
      group: namedProperty.getGroup(),
      label: namedProperty.getLabel(),
      value: namedProperty.getValue(),
      extraInfo: namedProperty.getExtraInfo().toJSArray(),
      isHidden: namedProperty.isHidden(),
    };
  });
};

export const toGdPropertyDescriptor = (
  enumeratedProperty: EnumeratedProperty,
  propertyDescriptor: gdPropertyDescriptor
): gdPropertyDescriptor => {
  propertyDescriptor
    .setType(enumeratedProperty.type)
    .setDescription(enumeratedProperty.description)
    .setGroup(enumeratedProperty.group)
    .setLabel(enumeratedProperty.label)
    .setValue(enumeratedProperty.value)
    .setHidden(enumeratedProperty.isHidden);

  enumeratedProperty.extraInfo.forEach(extraInfo => {
    propertyDescriptor.addExtraInfo(extraInfo);
  });

  return propertyDescriptor;
};
