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

describe.only('UseSearchStructuredItem', () => {
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
