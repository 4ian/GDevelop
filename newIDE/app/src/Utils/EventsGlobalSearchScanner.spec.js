// @flow
import { scanProjectForGlobalEventsSearch } from './EventsGlobalSearchScanner';
import { makeTestProject } from '../fixtures/TestProject';
import { type GlobalSearchInputs } from './EventsGlobalSearchScanner';

const gd: libGDevelop = global.gd;

const makeInputs = (overrides: { searchText: string }): GlobalSearchInputs => ({
  searchText: overrides.searchText,
  searchFilterParams: {
    matchCase: false,
    includeStoreExtensions: false,
    searchInConditions: true,
    searchInActions: true,
    searchInEventStrings: true,
    searchInEventSentences: true,
    searchInInstructionNames: false,
  },
});

describe('EventsGlobalSearchScanner', () => {
  it('returns empty groups for empty search text', () => {
    const { project } = makeTestProject(gd);
    const groups = scanProjectForGlobalEventsSearch(
      project,
      makeInputs({ searchText: '  ' })
    );
    expect(groups).toEqual([]);
  });

  it('finds matches in layout events', () => {
    const { project, testLayout } = makeTestProject(gd);
    const events = testLayout.getEvents();

    // Event 0: comment containing the needle — should match.
    const commentEvent = events.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Comment',
      0
    );
    gd.asCommentEvent(commentEvent).setComment('Needle in a comment');

    // Event 1: standard event with "Needle" in a condition parameter — should match.
    const matchingEvent = events.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      1
    );
    const matchingStd = gd.asStandardEvent(matchingEvent);
    const matchingCondition = new gd.Instruction();
    matchingCondition.setType('KeyPressed');
    matchingCondition.setParametersCount(2);
    matchingCondition.setParameter(1, 'Needle');
    matchingStd.getConditions().push_back(matchingCondition);
    matchingCondition.delete();
    const matchingAction = new gd.Instruction();
    matchingAction.setType('Delete');
    matchingAction.setParametersCount(2);
    matchingAction.setParameter(0, 'SomeObject');
    matchingStd.getActions().push_back(matchingAction);
    matchingAction.delete();

    // Event 2: standard event without the needle anywhere — should NOT match.
    const noMatchEvent = events.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      2
    );
    const noMatchStd = gd.asStandardEvent(noMatchEvent);
    const unrelatedCondition = new gd.Instruction();
    unrelatedCondition.setType('KeyPressed');
    unrelatedCondition.setParametersCount(2);
    unrelatedCondition.setParameter(1, 'Space');
    noMatchStd.getConditions().push_back(unrelatedCondition);
    unrelatedCondition.delete();
    const unrelatedAction = new gd.Instruction();
    unrelatedAction.setType('Delete');
    unrelatedAction.setParametersCount(2);
    unrelatedAction.setParameter(0, 'OtherObject');
    noMatchStd.getActions().push_back(unrelatedAction);
    unrelatedAction.delete();

    const groups = scanProjectForGlobalEventsSearch(
      project,
      makeInputs({ searchText: 'Needle' })
    );

    const layoutGroup = groups.find(g => g.targetType === 'layout');
    if (!layoutGroup) throw new Error('Layout group not found');
    expect(layoutGroup.name).toBe(testLayout.getName());

    // Only events 0 and 1 should match, not event 2.
    const matchedPaths = layoutGroup.matches.map(m => m.eventPath);
    expect(matchedPaths).toContainEqual([0]);
    expect(matchedPaths).toContainEqual([1]);
    expect(matchedPaths).not.toContainEqual([2]);

    // Verify context: comment event gets otherText, standard event gets conditionText.
    const commentMatch = layoutGroup.matches.find(m => m.eventPath[0] === 0);
    expect(commentMatch).toMatchInlineSnapshot(`
      Object {
        "context": Object {
          "actionText": "",
          "conditionText": "",
          "otherText": "Needle in a comment",
        },
        "eventPath": Array [
          0,
        ],
        "id": "0-0-0",
        "positionInList": 0,
      }
    `);
    const stdMatch = layoutGroup.matches.find(m => m.eventPath[0] === 1);
    expect(stdMatch).toMatchInlineSnapshot(`
      Object {
        "context": Object {
          "actionText": "Delete SomeObject",
          "conditionText": "Needle key is pressed",
          "otherText": "",
        },
        "eventPath": Array [
          1,
        ],
        "id": "1-1-1",
        "positionInList": 1,
      }
    `);
  });
});
