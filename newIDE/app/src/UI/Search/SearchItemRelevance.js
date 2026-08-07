// @flow

/**
 * Relevance scoring for searched items, ranking them in strict priority
 * "bands": an item in a higher band always outranks any item in a lower band.
 */

// What the default relevance reads on an item. Extra properties are ignored.
// An interface, so class instances (like the resources store items) are also
// accepted.
interface SearchableItemProperties {
  +name?: string;
  +tags?: Array<string>;
}

// Contravariant in SearchItem: a scorer reading only the generic searchable
// properties can be used wherever a scorer for a more specific item is needed.
export type GetSearchItemRelevance<-SearchItem> = (
  searchItem: SearchItem,
  itemText: string,
  searchText: string
) => number;

// Width of a priority band. Within-band scores stay well below this value, so
// callers can build extra bands by adding it to the default relevance.
export const SEARCH_BAND_WIDTH = 10;
// Weight of the name match, so a name match ranks above a tags-only match.
const NAME_MATCH_WEIGHT = 0.5;
// Floor of the many-tags malus, so a diluted match sinks but stays listed.
const MANY_TAGS_MALUS_FLOOR = 0.15;
// Minimum text relevance for a tag to count as matching.
const MATCHING_TAG_RELEVANCE_THRESHOLD = 0.5;

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSearchWords = (searchText: string): Array<string> =>
  searchText
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

/**
 * Text relevance of an item for the search words: whole-word match ("car" in
 * "a car") > prefix match ("car" in "cartoon") > substring ("car" in "scar").
 * Always strictly positive so a matched item is never excluded.
 */
const getTextSearchRelevance = (
  itemText: string,
  searchWords: Array<string>
): number => {
  if (searchWords.length === 0) return 1;

  const lowerCasedItemText = itemText.toLowerCase();
  let totalScore = 0;
  for (const searchWord of searchWords) {
    const escapedWord = escapeRegExp(searchWord);
    if (new RegExp(`\\b${escapedWord}\\b`).test(lowerCasedItemText)) {
      totalScore += 1; // Whole-word match.
    } else if (new RegExp(`\\b${escapedWord}`).test(lowerCasedItemText)) {
      totalScore += 0.2; // Prefix match.
    } else if (lowerCasedItemText.includes(searchWord)) {
      totalScore += 0.1; // Match inside a word.
    }
  }

  return Math.max(totalScore / searchWords.length, 0.05);
};

/**
 * Default relevance, ranking items in two bands: "exact matches" (the whole
 * search term is a complete word of the item name, or is exactly one of its
 * tags) above everything else. Within a band, items are ordered by text
 * relevance, refined by the name and diluted when few of many tags match.
 *
 * An item in the exact match band has a relevance >= SEARCH_BAND_WIDTH.
 */
export const getDefaultSearchItemRelevance: GetSearchItemRelevance<SearchableItemProperties> = (
  searchItem,
  itemText,
  searchText
) => {
  const searchWords = getSearchWords(searchText);
  let withinBandScore = getTextSearchRelevance(itemText, searchWords);

  const { name, tags } = searchItem;
  const nameRelevance = name ? getTextSearchRelevance(name, searchWords) : 0;

  // Dilute the match of an item matching through few of its many tags (e.g.
  // an aerosol tagged "car" among 30 other tags).
  if (tags && tags.length > 0) {
    const matchingTagsCount = tags.filter(
      tag =>
        getTextSearchRelevance(tag, searchWords) >=
        MATCHING_TAG_RELEVANCE_THRESHOLD
    ).length;
    withinBandScore *=
      MANY_TAGS_MALUS_FLOOR +
      (1 - MANY_TAGS_MALUS_FLOOR) * (matchingTagsCount / tags.length);
  }

  withinBandScore += NAME_MATCH_WEIGHT * nameRelevance;

  const normalizedSearchText = searchText.trim().toLowerCase();
  const hasExactMatch =
    nameRelevance >= 1 ||
    !!(
      tags &&
      tags.some(tag => tag.trim().toLowerCase() === normalizedSearchText)
    );

  return withinBandScore + (hasExactMatch ? SEARCH_BAND_WIDTH : 0);
};
