// @flow

import { normalizeString } from '../../Utils/Search';

export const getModelAnimationClipLabel = (
  animationName: string,
  animationIndex: number
): string => animationName || `Animation ${animationIndex + 1}`;

export const doesModelAnimationClipMatchSearch = (
  animationName: string,
  animationIndex: number,
  searchText: string
): boolean =>
  normalizeString(
    getModelAnimationClipLabel(animationName, animationIndex)
  ).includes(normalizeString(searchText.trim()));
