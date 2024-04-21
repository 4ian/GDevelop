// @flow

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
