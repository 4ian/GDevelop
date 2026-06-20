// @flow
import {
  collectUsedGroupEventColorKeys,
  getGroupEventColorKey,
  pickRandomUniqueGroupEventColor,
  setRandomUniqueGroupEventColor,
} from './GroupEventColorPicker';
import { type RGBColor } from '../Utils/ColorTransformer';

const gd: libGDevelop = global.gd;

const toSortedArray = (set: Set<string>): Array<string> =>
  Array.from(set).sort();

const insertGroupEvent = (
  project: gdProject,
  eventsList: gdEventsList,
  color: RGBColor
): gdGroupEvent => {
  const groupEvent = gd.asGroupEvent(
    eventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Group',
      eventsList.getEventsCount()
    )
  );
  groupEvent.setBackgroundColor(color.r, color.g, color.b);
  return groupEvent;
};

describe('EventsSheet/GroupEventColorPicker', () => {
  it('collects colors from group events in the whole events list', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsList = new gd.EventsList();

    insertGroupEvent(project, eventsList, { r: 10, g: 20, b: 30 });
    insertGroupEvent(project, eventsList, { r: 40, g: 50, b: 60 });
    const parentGroupEvent = insertGroupEvent(project, eventsList, {
      r: 70,
      g: 80,
      b: 90,
    });
    insertGroupEvent(project, parentGroupEvent.getSubEvents(), {
      r: 100,
      g: 110,
      b: 120,
    });

    expect(toSortedArray(collectUsedGroupEventColorKeys(eventsList))).toEqual([
      '100;110;120',
      '10;20;30',
      '40;50;60',
      '70;80;90',
    ]);

    eventsList.delete();
    project.delete();
  });

  it('skips non-group events while collecting nested group colors', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsList = new gd.EventsList();
    const standardEvent = eventsList.insertNewEvent(
      project,
      'BuiltinCommonInstructions::Standard',
      eventsList.getEventsCount()
    );

    insertGroupEvent(project, standardEvent.getSubEvents(), {
      r: 20,
      g: 40,
      b: 60,
    });

    expect(toSortedArray(collectUsedGroupEventColorKeys(eventsList))).toEqual([
      '20;40;60',
    ]);

    eventsList.delete();
    project.delete();
  });

  it('picks a random color when it is not already used', () => {
    expect(
      pickRandomUniqueGroupEventColor(new Set(['0;0;1']), () => 0)
    ).toEqual({
      r: 0,
      g: 0,
      b: 0,
    });
  });

  it('falls back to a nearby unused color when random colors collide', () => {
    expect(
      pickRandomUniqueGroupEventColor(new Set(['0;0;0']), () => 0)
    ).toEqual({
      r: 0,
      g: 0,
      b: 1,
    });
  });

  it('sets a non-duplicated color on a group event', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const eventsList = new gd.EventsList();

    insertGroupEvent(project, eventsList, { r: 0, g: 0, b: 0 });
    const usedColorKeys = collectUsedGroupEventColorKeys(eventsList);
    const newGroupEvent = gd.asGroupEvent(
      eventsList.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Group',
        eventsList.getEventsCount()
      )
    );

    setRandomUniqueGroupEventColor(newGroupEvent, usedColorKeys, () => 0);

    expect(getGroupEventColorKey(newGroupEvent)).toBe('0;0;1');

    eventsList.delete();
    project.delete();
  });
});
