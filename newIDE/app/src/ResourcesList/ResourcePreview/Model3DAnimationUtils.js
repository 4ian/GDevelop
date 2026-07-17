// @flow

export const getModelAnimationClipLabel = (
  animationName: string,
  animationIndex: number
): string => animationName || `Animation ${animationIndex + 1}`;
