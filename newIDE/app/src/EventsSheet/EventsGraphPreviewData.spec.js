// @flow
import { makeTestProject } from '../fixtures/TestProject';
import { unserializeFromJSObject } from '../Utils/Serializer';
import {
  buildEventsGraphPreviewItems,
  filterEventsGraphPreviewItemsBySearch,
  type EventsGraphPreviewEventItem,
  type EventsGraphPreviewGroupItem,
  type EventsGraphPreviewItem,
} from './EventsGraphPreviewData';

const gd: libGDevelop = global.gd;

const makeEventsList = (
  project: gdProject,
  serializedEvents: Array<Object>
) => {
  const eventsList = new gd.EventsList();
  unserializeFromJSObject(
    eventsList,
    serializedEvents,
    'unserializeFrom',
    project
  );
  return eventsList;
};

const flattenSelectableItems = (
  items: Array<EventsGraphPreviewItem>
): Array<EventsGraphPreviewEventItem | EventsGraphPreviewGroupItem> =>
  items.reduce((allItems, item) => {
    if (item.itemType === 'event' || item.itemType === 'group') {
      allItems.push(item);
    }

    allItems.push(...flattenSelectableItems(item.children));
    return allItems;
  }, []);

const getEventItem = (
  items: Array<EventsGraphPreviewItem>,
  index: number
): EventsGraphPreviewEventItem => {
  const item = items[index];
  if (!item || item.itemType !== 'event') {
    throw new Error(`Expected event graph item at index ${index}`);
  }

  return item;
};

const getGroupItem = (
  items: Array<EventsGraphPreviewItem>,
  index: number
): EventsGraphPreviewGroupItem => {
  const item = items[index];
  if (!item || item.itemType !== 'group') {
    throw new Error(`Expected group graph item at index ${index}`);
  }

  return item;
};

describe('EventsSheet/EventsGraphPreviewData', () => {
  it('skips comments, shows groups, and includes folded selectable sub-events', () => {
    const {
      project,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [
            {
              type: { value: 'Show' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'Folded group',
          events: [
            {
              type: 'BuiltinCommonInstructions::Comment',
              comment: 'Nested note',
            },
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '3',
              conditions: [],
              actions: [],
            },
          ],
        },
      ]);
      eventsList.getEventAt(1).setFolded(true);

      const items = buildEventsGraphPreviewItems({
        eventsList,
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });
      const selectableItems = flattenSelectableItems(items);
      const groupItem = getGroupItem(items, 1);

      expect(items.map(item => item.itemType)).toEqual(['event', 'group']);
      expect(groupItem.pathString).toBe('1');
      expect(groupItem.title).toBe('Folded group');
      expect(groupItem.children.map(item => item.pathString)).toEqual(['1.1']);
      expect(selectableItems.map(item => item.pathString)).toEqual([
        '0',
        '1',
        '1.1',
      ]);
      expect(selectableItems[2].title).toBe('Repeat 3 times');

      expect(selectableItems[0].eventContext.event.ptr).toBe(
        eventsList.getEventAt(0).ptr
      );
      expect(selectableItems[0].eventContext.eventsList.ptr).toBe(
        eventsList.ptr
      );
      expect(selectableItems[1].eventContext.event.ptr).toBe(
        eventsList.getEventAt(1).ptr
      );
      expect(selectableItems[2].eventContext.eventsList.ptr).toBe(
        eventsList.getEventAt(1).getSubEvents().ptr
      );
      expect(selectableItems[2].eventContext.indexInList).toBe(1);
    } finally {
      project.delete();
    }
  });

  it('numbers visible catalog items without counting hidden comments', () => {
    const {
      project,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Hidden introduction',
        },
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'First visible group',
          events: [
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '3',
              conditions: [],
              actions: [],
            },
            {
              type: 'BuiltinCommonInstructions::Comment',
              comment: 'Hidden nested note',
            },
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [],
        },
      ]);

      const items = buildEventsGraphPreviewItems({
        eventsList,
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });
      const groupItem = getGroupItem(items, 0);
      const eventItem = getEventItem(items, 1);

      expect(groupItem.pathString).toBe('1');
      expect(groupItem.displayPath).toBe('1');
      expect(groupItem.children.map(item => item.pathString)).toEqual([
        '1.0',
        '1.2',
      ]);
      expect(groupItem.children.map(item => item.displayPath)).toEqual([
        '1.1',
        '1.2',
      ]);
      expect(eventItem.pathString).toBe('2');
      expect(eventItem.displayPath).toBe('2');
    } finally {
      project.delete();
    }
  });

  it('extracts condition text, event state and valid else links without action nodes', () => {
    const {
      project,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [
            {
              type: { value: 'PlatformBehavior::IsFalling' },
              parameters: [
                'GroupOfSpriteObjectsWithBehaviors',
                'PlatformerObject',
              ],
            },
          ],
          actions: [
            {
              type: { value: 'Hide' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Else',
          conditions: [],
          actions: [
            {
              type: { value: 'Show' },
              parameters: ['GroupOfObjects', ''],
            },
          ],
        },
      ]);
      const jsEvent = eventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::JsCode',
        2
      );
      gd.asJsCodeEvent(jsEvent).setInlineCode(
        'runtimeScene.setBackgroundColor(1, 2, 3);'
      );
      gd.asJsCodeEvent(jsEvent).setParameterObjects('MySpriteObject');
      jsEvent.setDisabled(true);

      const items = buildEventsGraphPreviewItems({
        eventsList,
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });
      const standardItem = getEventItem(items, 0);
      const elseItem = getEventItem(items, 1);
      const jsCodeItem = getEventItem(items, 2);

      expect(standardItem.disabled).toBe(false);
      expect(standardItem.summaryTitle).toBe(
        'GroupOfSpriteObjectsWithBehaviors falling'
      );
      expect(standardItem.conditionLines).toEqual([
        'GroupOfSpriteObjectsWithBehaviors is falling',
      ]);

      expect(elseItem.title).toBe('Else');
      expect(elseItem.summaryTitle).toBe('Else');
      expect(elseItem.elseOfPathString).toBe('0');
      expect(elseItem.isInvalidElse).toBe(false);
      expect(elseItem.conditionLines).toEqual([]);

      expect(jsCodeItem.title).toBe('JavaScript code');
      expect(jsCodeItem.summaryTitle).toBe('JavaScript code');
      expect(jsCodeItem.disabled).toBe(true);
      expect(jsCodeItem.conditionLines).toEqual([]);
    } finally {
      project.delete();
    }
  });

  it('keeps keyboard summaries compact when the key label already includes key', () => {
    const {
      project,
      testLayout,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const items = buildEventsGraphPreviewItems({
        eventsList: testLayout.getEvents(),
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });
      const invalidKeyItem = getEventItem(items, 0);

      expect(invalidKeyItem.conditionLines).toContain(
        'Invalid key key is pressed'
      );
      expect(invalidKeyItem.summaryTitle).toBe('Invalid key pressed');
    } finally {
      project.delete();
    }
  });

  it('filters catalog items by group, event and condition text while preserving hierarchy', () => {
    const {
      project,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'Player controls',
          events: [
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [
                {
                  type: { value: 'PlatformBehavior::IsFalling' },
                  parameters: [
                    'GroupOfSpriteObjectsWithBehaviors',
                    'PlatformerObject',
                  ],
                },
              ],
              actions: [],
            },
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '5',
              conditions: [],
              actions: [],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'Camera',
          events: [
            {
              type: 'BuiltinCommonInstructions::Repeat',
              repeatExpression: '3',
              conditions: [],
              actions: [],
            },
          ],
        },
      ]);
      const items = buildEventsGraphPreviewItems({
        eventsList,
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });

      const groupMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'player'
      );
      expect(groupMatches.map(item => item.pathString)).toEqual(['0']);
      expect(groupMatches[0].children.map(item => item.pathString)).toEqual([
        '0.0',
        '0.1',
      ]);

      const conditionMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'falling'
      );
      expect(conditionMatches.map(item => item.pathString)).toEqual(['0']);
      expect(conditionMatches[0].children.map(item => item.pathString)).toEqual(
        ['0.0']
      );

      const eventMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'repeat 5'
      );
      expect(eventMatches.map(item => item.pathString)).toEqual(['0']);
      expect(eventMatches[0].children.map(item => item.pathString)).toEqual([
        '0.1',
      ]);

      expect(filterEventsGraphPreviewItemsBySearch(items, '   ')).toBe(items);
    } finally {
      project.delete();
    }
  });

  it('searches hidden comments and shows them below the nearest visible catalog item', () => {
    const {
      project,
      testSceneProjectScopedContainersAccessor,
    } = makeTestProject(gd);
    try {
      const eventsList = makeEventsList(project, [
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Keyboard movement note',
        },
        {
          type: 'BuiltinCommonInstructions::Group',
          name: 'Player controls',
          events: [
            {
              type: 'BuiltinCommonInstructions::Comment',
              comment: 'Nested unrelated note',
            },
            {
              type: 'BuiltinCommonInstructions::Standard',
              conditions: [],
              actions: [],
            },
          ],
        },
        {
          type: 'BuiltinCommonInstructions::Standard',
          conditions: [],
          actions: [],
        },
        {
          type: 'BuiltinCommonInstructions::Comment',
          comment: 'Cleanup trailing note',
        },
      ]);
      const items = buildEventsGraphPreviewItems({
        eventsList,
        projectScopedContainersAccessor: testSceneProjectScopedContainersAccessor,
      });

      expect(items.map(item => item.pathString)).toEqual(['1', '2']);
      expect(getGroupItem(items, 0).relatedCommentLines).toEqual([
        'Keyboard movement note',
      ]);
      expect(getEventItem(items, 1).relatedCommentLines).toEqual([
        'Cleanup trailing note',
      ]);

      const commentMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'movement'
      );
      expect(commentMatches.map(item => item.pathString)).toEqual(['1']);
      expect(getGroupItem(commentMatches, 0).relatedCommentLines).toEqual([
        'Keyboard movement note',
      ]);

      const trailingCommentMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'cleanup'
      );
      expect(trailingCommentMatches.map(item => item.pathString)).toEqual([
        '2',
      ]);
      expect(
        getEventItem(trailingCommentMatches, 0).relatedCommentLines
      ).toEqual(['Cleanup trailing note']);

      const titleMatches = filterEventsGraphPreviewItemsBySearch(
        items,
        'player'
      );
      expect(titleMatches.map(item => item.pathString)).toEqual(['1']);
      expect(getGroupItem(titleMatches, 0).relatedCommentLines).toEqual([]);
      expect(
        getEventItem(getGroupItem(titleMatches, 0).children, 0)
          .relatedCommentLines
      ).toEqual([]);
    } finally {
      project.delete();
    }
  });
});
