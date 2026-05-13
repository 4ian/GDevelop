// @flow
import Fuse from 'fuse.js';
import {
  getFuseSearchQueryForMultipleKeys,
  nullifySingleCharacterMatches,
  sortResultsUsingExactMatches,
  sharedFuseConfiguration,
  augmentSearchResult,
} from './UseSearchStructuredItem';

const facebookInstantGameSavePlayerDataAction = {
  displayedName: 'Save player data',
  description:
    'Save the content of the given scene variable in the player data, stored on Facebook Instant Games servers',
  fullGroupName: 'Third-party/Facebook Instant Games/Player data',
};

const changeVariableValueAction = {
  displayedName: 'Change variable value',
  description: 'Modify the number value of an object variable.',
  fullGroupName: 'General/Objects/Variables',
};

const triggerOnceCondition = {
  displayedName: 'Trigger once while true',
  description:
    'Run actions only once, for each time the conditions have been met.',
  fullGroupName: 'Advanced/Events and control flow',
};

const p2pOnEventCondition = {
  displayedName: 'Event triggered by peer',
  description: 'Triggers once when a connected client sends the event',
  fullGroupName: 'Network/P2P',
};

const textCondition = {
  displayedName: 'Text',
  description: 'Compare the text.',
  fullGroupName: 'General/Text capability',
};

const sceneTweenExistsCondition = {
  displayedName: 'Scene tween exists',
  description: 'Check if the scene tween exists.',
  fullGroupName: 'Visual effect/Tweening/Scene Tweens',
};

// $FlowFixMe[missing-local-annot]
const applySearch = (lowerCaseSearchText: string, instructions) => {
  const searchApi = new Fuse(instructions, {
    ...sharedFuseConfiguration,
    includeScore: true, // Use Fuse.js score to sort results that don't contain exact matches.
    keys: [
      { name: 'displayedName', weight: 5 },
      { name: 'fullGroupName', weight: 1 },
      { name: 'description', weight: 3 },
    ],
  });

  const results = searchApi
    .search(
      getFuseSearchQueryForMultipleKeys(lowerCaseSearchText, [
        'displayedName',
        'fullGroupName',
        'description',
      ])
    )
    .map(nullifySingleCharacterMatches)
    .filter(Boolean)
    .map(result => augmentSearchResult(result, lowerCaseSearchText))
    .sort(
      sortResultsUsingExactMatches([
        'displayedName',
        'description',
        'fullGroupName',
      ])
    );
  return results;
};

// Fuse.js configuration matching useSearchStructuredItem (for example/template search).
const exampleStoreFuseConfig = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'fullName', weight: 5 },
    { name: 'shortDescription', weight: 1 },
    { name: 'tags', weight: 4 },
  ],
  minMatchCharLength: 2,
  threshold: 0.35,
  includeMatches: true,
  includeScore: true,
  ignoreLocation: true,
  useExtendedSearch: true,
  findAllMatches: true,
};

/**
 * Replicates the multi-word composite scoring logic from useSearchStructuredItem:
 * runs a Fuse.js search then re-ranks results so items matching more tokens
 * always rank above items matching fewer tokens.
 */
// $FlowFixMe[missing-local-annot]
const applyMultiWordSearch = (searchText, items) => {
  const searchApi = new Fuse(items, exampleStoreFuseConfig);
  const tokens = searchText
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(t => t.length >= 2);
  const isMultiWord = tokens.length > 1;

  const results = searchApi.search(
    getFuseSearchQueryForMultipleKeys(searchText, [
      'name',
      'fullName',
      'shortDescription',
      'tags',
    ])
  );

  if (!isMultiWord) return results;

  const processed = results.map(result => {
    const matchedTokenCount = tokens.filter(
      token =>
        result.matches &&
        result.matches.some(
          match => match.value && match.value.toLowerCase().includes(token)
        )
    ).length;
    return {
      ...result,
      score: tokens.length - matchedTokenCount + (result.score || 0),
    };
  });
  processed.sort((a, b) => (a.score || 0) - (b.score || 0));
  return processed;
};

const cookieClickerItem = {
  id: 'cookie-clicker',
  name: 'Cookie Clicker',
  fullName: 'Cookie Clicker',
  shortDescription: 'An idle clicker game about cookies',
  tags: ['game', 'idle'],
};

const cookieClickerPixelArtItem = {
  id: 'cookie-clicker-pixel-art',
  name: 'Cookie Clicker Pixel Art',
  fullName: 'Cookie Clicker Pixel Art',
  shortDescription: 'A pixel art idle clicker game',
  tags: ['game', 'idle', 'pixel-art'],
};

const fruitClickerItem = {
  id: 'fruit-clicker',
  name: 'Fruit Clicker',
  fullName: 'Fruit Clicker',
  shortDescription: 'Click on fruits to score points',
  tags: ['game', 'clicker'],
};

const objectSlicerItem = {
  id: 'object-slicer',
  name: 'Object Slicer',
  fullName: 'Object Slicer',
  shortDescription: 'Slice objects before they reach the bottom',
  tags: ['game', 'arcade'],
};

describe('multi-word search with composite scoring', () => {
  it('should rank an item matching both tokens above one matching only one', () => {
    const results = applyMultiWordSearch('cookie clicker', [
      objectSlicerItem,
      fruitClickerItem,
      cookieClickerItem,
    ]);

    // Cookie Clicker matches "cookie" AND "clicker" → ranks above Fruit Clicker
    // (which only matches "clicker"). Object Slicer matches neither → excluded.
    expect(results.length).toBe(2);
    expect(results[0].item.id).toBe('cookie-clicker');
    expect(results[1].item.id).toBe('fruit-clicker');
  });

  it('should exclude items that match none of the search tokens', () => {
    const results = applyMultiWordSearch('cookie clicker', [
      objectSlicerItem,
      cookieClickerItem,
    ]);

    expect(results.map(r => r.item.id)).not.toContain('object-slicer');
  });

  it('should rank the item matching the most tokens first for a 4-word search', () => {
    const results = applyMultiWordSearch('cookie clicker pixel art', [
      objectSlicerItem,
      fruitClickerItem,
      cookieClickerItem,
      cookieClickerPixelArtItem,
    ]);

    // All 4 tokens in "Cookie Clicker Pixel Art" → score ≈ 0 → first.
    // "Cookie Clicker" matches 2 tokens ("cookie", "clicker") → second.
    // "Fruit Clicker" matches 1 token ("clicker") → third.
    // "Object Slicer" matches none → excluded.
    expect(results[0].item.id).toBe('cookie-clicker-pixel-art');
    expect(results[1].item.id).toBe('cookie-clicker');
    expect(results.some(r => r.item.id === 'object-slicer')).toBe(false);
  });

  it('should behave like a regular single-index search for one-word queries', () => {
    const results = applyMultiWordSearch('clicker', [
      objectSlicerItem,
      fruitClickerItem,
      cookieClickerItem,
    ]);

    // Both clicker games should appear; Object Slicer should not
    // (it contains "slicer" not "clicker").
    expect(results.some(r => r.item.id === 'fruit-clicker')).toBe(true);
    expect(results.some(r => r.item.id === 'cookie-clicker')).toBe(true);
    expect(results.some(r => r.item.id === 'object-slicer')).toBe(false);
  });

  it('should match partial words (prefix substring), not only whole words', () => {
    // "cook" and "click" are prefixes, not full words — include-match (')
    // treats them as substrings so "Cookie Clicker" should be a full match.
    const results = applyMultiWordSearch('cook click', [
      objectSlicerItem,
      cookieClickerItem,
    ]);

    expect(results.length).toBe(1);
    expect(results[0].item.id).toBe('cookie-clicker');
  });

  it('should count a token as matched when it appears in the tags field', () => {
    const pixelArtGame = {
      id: 'pixel-art-game',
      name: 'My Game',
      fullName: 'My Game',
      shortDescription: 'A fun game',
      tags: ['pixel-art', 'platformer'],
    };

    const results = applyMultiWordSearch('pixel art', [
      objectSlicerItem,
      pixelArtGame,
    ]);

    // "pixel" and "art" are both substrings of the "pixel-art" tag,
    // so the item should be a full 2-token match.
    expect(results.length).toBe(1);
    expect(results[0].item.id).toBe('pixel-art-game');
    // compositeScore = (2 - 2) + fuseScore ≈ 0 (all tokens matched)
    expect(results[0].score).toBeLessThan(1);
  });
});

describe('UseSearchStructuredItem', () => {
  it('should give priority to exact matches at start of word in the first ordered key', () => {
    // In the second key `description`, facebookInstantGameSavePlayerDataAction has an exact match at start of word closer than
    // changeVariableValueAction, so it could be sorted first. But changeVariableValueAction has an exact match at start of word
    // in the first key `displayedName`, so it should be sorted first.
    const results = applySearch('var', [
      facebookInstantGameSavePlayerDataAction,
      changeVariableValueAction,
    ]);

    expect(results[0].item.displayedName).toEqual(
      changeVariableValueAction.displayedName
    );
  });
  it('should give priority to exact matches at start of word that are closer to the start of the sentence', () => {
    const results = applySearch('tri', [
      p2pOnEventCondition,
      triggerOnceCondition,
    ]);

    expect(results[0].item.displayedName).toEqual(
      triggerOnceCondition.displayedName
    );
  });
  it('should give priority to the result with at least one exact match over one that has none', () => {
    const results = applySearch('rigger', [
      changeVariableValueAction,
      triggerOnceCondition,
    ]);

    expect(results[0].item.displayedName).toEqual(
      triggerOnceCondition.displayedName
    );
  });
  it('should give priority to the result with at least one exact match at start of word over one that has a match not at start of word', () => {
    const results = applySearch('ex', [
      textCondition,
      sceneTweenExistsCondition,
    ]);

    expect(results[0].item.displayedName).toEqual(
      sceneTweenExistsCondition.displayedName
    );
  });
});
