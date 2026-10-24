// @flow
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

/**
 * Check if a parameter is used by the object of the instruction: a parameter
 * can require the object to have a capability (like the Z position of a
 * created object, only used by 3D objects). The object is the last object
 * parameter before this one, like for the behavior parameters.
 */
export const isParameterUsedByItsObject = (
  instruction: gdInstruction,
  instructionMetadata: gdInstructionMetadata,
  parameterIndex: number,
  objectsContainersList: gdObjectsContainersList
): boolean => {
  if (parameterIndex >= instructionMetadata.getParametersCount()) return true;
  const requiredCapability = instructionMetadata
    .getParameter(parameterIndex)
    .getRequiredObjectCapability();
  if (!requiredCapability) return true;

  for (let index = parameterIndex - 1; index >= 0; index--) {
    if (
      gd.ParameterMetadata.isObject(
        instructionMetadata.getParameter(index).getType()
      )
    ) {
      if (index >= instruction.getParametersCount()) return false;
      const objectName = instruction.getParameter(index).getPlainString();
      return (
        !!objectName &&
        objectsContainersList
          .getBehaviorNamesInObjectOrGroup(objectName, requiredCapability, true)
          .size() > 0
      );
    }
  }
  return false;
};

/**
 * Get the texts to show for the parts of the sentence of an instruction,
 * without the parameters not used by its object: their parts are null, as
 * well as the texts between them or after them at the end of the sentence
 * (like "(z axis)"), and the separator before them (";", "," or "x") is
 * removed.
 */
export const getSentencePartTexts = (
  formattedTexts: gdVectorPairStringTextFormatting,
  parametersCount: number,
  isParameterUsed: (parameterIndex: number) => boolean
): Array<?string> => {
  const partsCount = formattedTexts.size();
  const getParameterIndex = (partIndex: number): number | null => {
    const parameterIndex = formattedTexts
      .getTextFormatting(partIndex)
      .getUserData();
    return parameterIndex >= 0 && parameterIndex < parametersCount
      ? parameterIndex
      : null;
  };
  const isHiddenParameterPart = (partIndex: number): boolean => {
    const parameterIndex = getParameterIndex(partIndex);
    return parameterIndex !== null && !isParameterUsed(parameterIndex);
  };
  const findParameterPart = (
    fromIndex: number,
    step: number
  ): number | null => {
    for (let index = fromIndex; index >= 0 && index < partsCount; index += step)
      if (getParameterIndex(index) !== null) return index;
    return null;
  };

  return mapFor(0, partsCount, partIndex => {
    const text = formattedTexts.getString(partIndex);
    if (getParameterIndex(partIndex) !== null)
      return isHiddenParameterPart(partIndex) ? null : text;

    const previousParameterPart = findParameterPart(partIndex - 1, -1);
    const nextParameterPart = findParameterPart(partIndex + 1, 1);
    const isAfterHiddenParameter =
      previousParameterPart !== null &&
      isHiddenParameterPart(previousParameterPart);
    const isBeforeHiddenParameter =
      nextParameterPart !== null && isHiddenParameterPart(nextParameterPart);
    if (
      isAfterHiddenParameter &&
      (nextParameterPart === null || isBeforeHiddenParameter)
    )
      return null;
    return isBeforeHiddenParameter
      ? text.replace(/(\s*[;,]|\s+x)\s*$/, '')
      : text;
  });
};
