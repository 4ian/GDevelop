// @flow
import {
  getInitialSelection,
  getSelectedTopMostOnlyEventContexts,
  getSelectedEventContexts,
  selectEvent,
  isEventSelected,
  getLastSelectedTopMostOnlyEventContext,
  hasSelectedAtLeastOneCondition,
  hasInstructionSelected,
  hasInstructionsListSelected,
  selectInstruction,
  isInstructionSelected,
  getSelectedInstructions,
  getSelectedInstructionsLocatingEvents,
  getLastSelectedEventContext,
  getLastSelectedEventContextWhichCanHaveSubEvents,
  getLastSelectedInstructionContext,
} from './SelectionHandler';
import { makeTestProject } from '../fixtures/TestProject';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const expectProjectScopedContainersAccessor = (): ProjectScopedContainersAccessor => {
  // $FlowFixMe
  return expect.any(ProjectScopedContainersAccessor);
};

describe('SelectionHandler', () => {
  it('handles the selected events', () => {
    const topEventsList = new gd.EventsList();
    const emptyStandardEvent = new gd.StandardEvent();

    const standardEvent1 = topEventsList.insertEvent(emptyStandardEvent, 0);
    const standardEvent1_1 = standardEvent1
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent1_2 = standardEvent1
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent1_2_1 = standardEvent1_2
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent2 = topEventsList.insertEvent(emptyStandardEvent, 1);
    emptyStandardEvent.delete();

    let currentSelection = getInitialSelection();
    expect(getLastSelectedEventContext(currentSelection)).toBe(null);
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toBe(null);
    expect(getSelectedEventContexts(currentSelection)).toEqual([]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual(
      null
    );

    const { emptySceneProjectScopedContainersAccessor } = makeTestProject(gd);

    // Select a top-level event.
    currentSelection = selectEvent(currentSelection, {
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
    });
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Select a child event, but without multiselection (so the parent is removed).
    currentSelection = selectEvent(currentSelection, {
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_1,
      indexInList: 0,
      projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
    });
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Add an unrelated grand-child event to the selection, with multiselection (so the previous child
    // stays in the selection).
    currentSelection = selectEvent(
      currentSelection,
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      /*multiSelection=*/ true
    );
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1_2.getSubEvents(),
      event: standardEvent1_2_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: standardEvent1_2.getSubEvents(),
      event: standardEvent1_2_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      // Both events are returned as they are unrelated.
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1_2.getSubEvents(),
      event: standardEvent1_2_1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Restart from a empty selection, and select a parent and its child.
    currentSelection = selectEvent(
      getInitialSelection(),
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      /*multiSelection=*/ true
    );
    currentSelection = selectEvent(
      currentSelection,
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_2,
        indexInList: 1,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      /*multiSelection=*/ true
    );
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_2,
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      // Only the top-most event is returned.
      {
        eventsList: standardEvent1.getSubEvents(),
        event: standardEvent1_2,
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: standardEvent1.getSubEvents(),
      event: standardEvent1_2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Restart from a empty selection, and select a grand-parent and its grand-child.
    currentSelection = selectEvent(
      getInitialSelection(),
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      /*multiSelection=*/ true
    );
    currentSelection = selectEvent(
      currentSelection,
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      /*multiSelection=*/ true
    );
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      // Only the top-most event is returned.
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Restart from a empty selection, and select an event and a unrelated grand-child.
    currentSelection = selectEvent(
      getInitialSelection(),
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      /*multiSelection=*/ true
    );
    currentSelection = selectEvent(
      currentSelection,
      {
        eventsList: topEventsList,
        event: standardEvent2,
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      /*multiSelection=*/ true
    );
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(true);
    expect(getLastSelectedEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(
      getLastSelectedEventContextWhichCanHaveSubEvents(currentSelection)
    ).toEqual({
      eventsList: topEventsList,
      event: standardEvent2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: topEventsList,
        event: standardEvent2,
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      // Both events are returned because they are unrelated
      {
        eventsList: standardEvent1_2.getSubEvents(),
        event: standardEvent1_2_1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
      {
        eventsList: topEventsList,
        event: standardEvent2,
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent2,
      indexInList: 1,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    topEventsList.delete();
  });
  it('handles the selected events and selected instructions', () => {
    const topEventsList = new gd.EventsList();
    const emptyStandardEvent = new gd.StandardEvent();
    const defaultAction = new gd.Instruction();
    defaultAction.setType('FakeAction');
    const defaultCondition = new gd.Instruction();
    defaultCondition.setType('FakeCondition');
    emptyStandardEvent.getActions().insert(defaultAction, 0);
    emptyStandardEvent.getActions().insert(defaultAction, 1);
    emptyStandardEvent.getConditions().insert(defaultCondition, 0);
    emptyStandardEvent.getConditions().insert(defaultCondition, 1);
    defaultAction.delete();
    defaultCondition.delete();

    const standardEvent1 = topEventsList.insertEvent(emptyStandardEvent, 0);
    const standardEvent1_1 = standardEvent1
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent1_2 = standardEvent1
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent1_2_1 = standardEvent1_2
      .getSubEvents()
      .insertEvent(emptyStandardEvent, 0);
    const standardEvent2 = topEventsList.insertEvent(emptyStandardEvent, 1);
    emptyStandardEvent.delete();

    let currentSelection = getInitialSelection();
    expect(getSelectedEventContexts(currentSelection)).toEqual([]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual(
      null
    );

    const { emptySceneProjectScopedContainersAccessor } = makeTestProject(gd);

    // Select a top-level event.
    currentSelection = selectEvent(currentSelection, {
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
    });
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(hasSelectedAtLeastOneCondition(currentSelection)).toBe(false);
    expect(hasInstructionSelected(currentSelection)).toBe(false);
    expect(hasInstructionsListSelected(currentSelection)).toBe(false);
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });

    // Select a condition of a child event.
    currentSelection = selectInstruction(
      {
        event: standardEvent1_2,
        eventsList: standardEvent1.getSubEvents(),
        indexInList: 1,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      currentSelection,
      {
        isCondition: true,
        instrsList: gd.asStandardEvent(standardEvent1_2).getConditions(),
        instruction: gd
          .asStandardEvent(standardEvent1_2)
          .getConditions()
          .get(1),
        indexInList: 1,
      },
      true
    );
    // Ensure events selection is still there:
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    // Ensure the condition was selected:
    expect(hasSelectedAtLeastOneCondition(currentSelection)).toBe(true);
    expect(hasInstructionSelected(currentSelection)).toBe(true);
    expect(hasInstructionsListSelected(currentSelection)).toBe(false);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2)
          .getConditions()
          .get(0)
      )
    ).toBe(false);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2)
          .getConditions()
          .get(1)
      )
    ).toBe(true);
    expect(getSelectedInstructions(currentSelection)).toEqual([
      gd
        .asStandardEvent(standardEvent1_2)
        .getConditions()
        .get(1),
    ]);
    expect(getSelectedInstructionsLocatingEvents(currentSelection)).toEqual([
      standardEvent1_2,
    ]);
    expect(getLastSelectedInstructionContext(currentSelection)).toEqual({
      isCondition: true,
      instrsList: gd.asStandardEvent(standardEvent1_2).getConditions(),
      instruction: gd
        .asStandardEvent(standardEvent1_2)
        .getConditions()
        .get(1),
      indexInList: 1,
      eventContext: {
        event: standardEvent1_2,
        eventsList: standardEvent1.getSubEvents(),
        indexInList: 1,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    });

    // Select an action of another event.
    currentSelection = selectInstruction(
      {
        event: standardEvent1_2_1,
        eventsList: standardEvent1_2.getSubEvents(),
        indexInList: 0,
        projectScopedContainersAccessor: emptySceneProjectScopedContainersAccessor,
      },
      currentSelection,
      {
        isCondition: false,
        instrsList: gd.asStandardEvent(standardEvent1_2_1).getActions(),
        instruction: gd
          .asStandardEvent(standardEvent1_2_1)
          .getActions()
          .get(0),
        indexInList: 0,
      },
      true
    );
    // Ensure events selection is still there:
    expect(isEventSelected(currentSelection, standardEvent1)).toBe(true);
    expect(isEventSelected(currentSelection, standardEvent1_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent1_2_1)).toBe(false);
    expect(isEventSelected(currentSelection, standardEvent2)).toBe(false);
    expect(getSelectedEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getSelectedTopMostOnlyEventContexts(currentSelection)).toEqual([
      {
        eventsList: topEventsList,
        event: standardEvent1,
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    ]);
    expect(getLastSelectedTopMostOnlyEventContext(currentSelection)).toEqual({
      eventsList: topEventsList,
      event: standardEvent1,
      indexInList: 0,
      projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
    });
    // Ensure the new action is selected:
    expect(hasSelectedAtLeastOneCondition(currentSelection)).toBe(true);
    expect(hasInstructionSelected(currentSelection)).toBe(true);
    expect(hasInstructionsListSelected(currentSelection)).toBe(false);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2)
          .getConditions()
          .get(0)
      )
    ).toBe(false);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2)
          .getConditions()
          .get(1)
      )
    ).toBe(true);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2_1)
          .getActions()
          .get(0)
      )
    ).toBe(true);
    expect(
      isInstructionSelected(
        currentSelection,
        gd
          .asStandardEvent(standardEvent1_2_1)
          .getActions()
          .get(1)
      )
    ).toBe(false);
    expect(getSelectedInstructions(currentSelection)).toEqual([
      gd
        .asStandardEvent(standardEvent1_2)
        .getConditions()
        .get(1),
      gd
        .asStandardEvent(standardEvent1_2_1)
        .getActions()
        .get(0),
    ]);
    expect(getSelectedInstructionsLocatingEvents(currentSelection)).toEqual([
      standardEvent1_2,
      standardEvent1_2_1,
    ]);
    expect(getLastSelectedInstructionContext(currentSelection)).toEqual({
      isCondition: false,
      instrsList: gd.asStandardEvent(standardEvent1_2_1).getActions(),
      instruction: gd
        .asStandardEvent(standardEvent1_2_1)
        .getActions()
        .get(0),
      indexInList: 0,
      eventContext: {
        event: standardEvent1_2_1,
        eventsList: standardEvent1_2.getSubEvents(),
        indexInList: 0,
        projectScopedContainersAccessor: expectProjectScopedContainersAccessor(),
      },
    });

    topEventsList.delete();
  });
});
