// @flow
export const remapSentenceParamIndices = (
  sentence: string,
  oldIndex: number,
  newIndex: number,
  offset: number
): string => {
  return sentence.replace(/_PARAM(\d+)_/g, (match, digits) => {
    const index = parseInt(digits, 10);
    let finalIndex = index;
    if (index < offset) {
      finalIndex = index;
    } else if (index === oldIndex + offset) {
      finalIndex = newIndex + offset;
    } else if (index > offset + oldIndex && index <= offset + newIndex) {
      finalIndex = index - 1;
    } else if (index >= offset + newIndex && index < offset + oldIndex) {
      finalIndex = index + 1;
    }
    return `_PARAM${finalIndex}_`;
  });
};
