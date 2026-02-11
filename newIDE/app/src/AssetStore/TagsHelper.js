// @flow
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

const indexOfOccurrence = (
  haystack: Array<string>,
  needle: string,
  occurrence: number
) => {
  var counter = 0;
  var index = -1;
  do {
    index = haystack.indexOf(needle, index + 1);
  } while (index !== -1 && ++counter < occurrence);
  return index;
};

export const getFolderTagsFromAssetShortHeaders = ({
  assetShortHeaders,
  selectedFolders,
}: {|
  assetShortHeaders: Array<AssetShortHeader>,
  selectedFolders: Array<string>,
|}): Array<string> => {
  const assetTagsAfterPackTag: string[][] = [];
  const allTagsAfterPackTag = new Set();
  // We are in a pack, calculate first level folders based on asset tags.
  // Tags are stored from top to bottom, in the list of tags of an asset.
  // We first detect where the chosen category is, as this is the pack, and
  // remove this tags and the others before (that could be bundles).

  assetShortHeaders.forEach(assetShortHeader => {
    const allAssetTags = assetShortHeader.tags;
    const lastSelectedFolder = selectedFolders[selectedFolders.length - 1];
    const occurencesOfLastSelectedFolderInSelectedFolders = selectedFolders.filter(
      folder => folder === lastSelectedFolder
    ).length;
    const lastSelectedFolderIndex = indexOfOccurrence(
      allAssetTags,
      selectedFolders[selectedFolders.length - 1],
      occurencesOfLastSelectedFolderInSelectedFolders
    );
    if (lastSelectedFolderIndex === -1) return allAssetTags; // This shouldn't happen, but just in case.
    const tagsAfterPackTags = allAssetTags.filter(
      (tag, index) => index > lastSelectedFolderIndex
    );
    if (tagsAfterPackTags.length > 0)
      assetTagsAfterPackTag.push(tagsAfterPackTags);
    tagsAfterPackTags.forEach(tag => allTagsAfterPackTag.add(tag));
  });

  // Then we remove the tags that are present in all assets, they're not useful, or not a folder.
  // (For example: "pixel art")
  const tagsPresentInAllAssets = Array.from(allTagsAfterPackTag).filter(
    tag =>
      assetTagsAfterPackTag.filter(tags => tags.includes(tag)).length ===
      assetTagsAfterPackTag.length
  );
  const assetTagsAfterPackTagWithoutNonFolderTags = assetTagsAfterPackTag.map(
    tags => tags.filter(tag => !tagsPresentInAllAssets.includes(tag))
  );

  // Then we create the folders list, corresponding to the first level tags.
  const firstLevelTags = new Set();
  assetTagsAfterPackTagWithoutNonFolderTags.forEach(
    tags => firstLevelTags.add(tags[0]) // Only add the top one, as this will be the first folder.
  );

  return Array.from(firstLevelTags).filter(Boolean);
};
