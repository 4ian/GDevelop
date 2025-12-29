// @flow
import {
  scanProjectForValidationErrors,
  groupValidationErrors,
  findEventByPath,
} from './EventsValidationScanner';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('EventsValidationScanner', () => {
  describe('scanProjectForValidationErrors', () => {
    it('returns empty array for a project without events with errors', () => {
      const { project } = makeTestProject(gd);
      const errors = scanProjectForValidationErrors(project);
      // Test project has valid events, should have no or very few errors
      expect(Array.isArray(errors)).toBe(true);
    });

    it('detects missing instructions for invalid action types', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();

      // Add an event with an invalid action type
      const event = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      const standardEvent = gd.asStandardEvent(event);
      const actions = standardEvent.getActions();
      const invalidAction = new gd.Instruction();
      invalidAction.setType('NonExistentExtension::NonExistentAction');
      actions.insert(invalidAction, 0);
      invalidAction.delete();

      const errors = scanProjectForValidationErrors(project);

      const missingInstructionErrors = errors.filter(
        e => e.type === 'missing-instruction'
      );
      expect(missingInstructionErrors.length).toBeGreaterThan(0);

      const targetError = missingInstructionErrors.find(
        e => e.instructionType === 'NonExistentExtension::NonExistentAction'
      );
      expect(targetError).toBeDefined();
      if (targetError) {
        expect(targetError.isCondition).toBe(false);
        expect(targetError.locationType).toBe('scene');
        expect(targetError.locationName).toBe(testLayout.getName());
      }
    });

    it('detects missing conditions for invalid condition types', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();

      // Add an event with an invalid condition type
      const event = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      const standardEvent = gd.asStandardEvent(event);
      const conditions = standardEvent.getConditions();
      const invalidCondition = new gd.Instruction();
      invalidCondition.setType('NonExistentExtension::NonExistentCondition');
      conditions.insert(invalidCondition, 0);
      invalidCondition.delete();

      const errors = scanProjectForValidationErrors(project);

      const missingInstructionErrors = errors.filter(
        e =>
          e.type === 'missing-instruction' &&
          e.instructionType === 'NonExistentExtension::NonExistentCondition'
      );
      expect(missingInstructionErrors.length).toBeGreaterThan(0);

      const targetError = missingInstructionErrors[0];
      expect(targetError.isCondition).toBe(true);
    });

    it('includes eventPath for each error', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();

      // Add an event with an invalid action
      const event = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      const standardEvent = gd.asStandardEvent(event);
      const actions = standardEvent.getActions();
      const invalidAction = new gd.Instruction();
      invalidAction.setType('Test::InvalidAction');
      actions.insert(invalidAction, 0);
      invalidAction.delete();

      const errors = scanProjectForValidationErrors(project);

      const targetError = errors.find(
        e => e.instructionType === 'Test::InvalidAction'
      );
      expect(targetError).toBeDefined();
      if (targetError) {
        expect(Array.isArray(targetError.eventPath)).toBe(true);
        expect(targetError.eventPath.length).toBeGreaterThan(0);
        expect(targetError.eventPath[0]).toBe(0); // First event
      }
    });

    describe('external events scanning', () => {
      it('detects errors in external events', () => {
        const { project, testExternalEvents1 } = makeTestProject(gd);
        const events = testExternalEvents1.getEvents();

        // Add an event with an invalid action
        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const actions = standardEvent.getActions();
        const invalidAction = new gd.Instruction();
        invalidAction.setType('External::InvalidAction');
        actions.insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'External::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('external-events');
          expect(targetError.locationName).toBe(testExternalEvents1.getName());
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('scans external events with associated layout context', () => {
        const { project, testExternalEvents1, testLayout } = makeTestProject(
          gd
        );
        // Associate external events with a layout
        testExternalEvents1.setAssociatedLayout(testLayout.getName());

        const events = testExternalEvents1.getEvents();
        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const actions = standardEvent.getActions();
        const invalidAction = new gd.Instruction();
        invalidAction.setType('AssociatedLayout::InvalidAction');
        actions.insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'AssociatedLayout::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('external-events');
        }
      });
    });

    describe('WhileEvent scanning', () => {
      it('detects errors in WhileEvent conditions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::While',
          0
        );
        const whileEvent = gd.asWhileEvent(event);
        const conditions = whileEvent.getConditions();
        const invalidCondition = new gd.Instruction();
        invalidCondition.setType('While::InvalidCondition');
        conditions.insert(invalidCondition, 0);
        invalidCondition.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'While::InvalidCondition'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(true);
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('detects errors in WhileEvent while-conditions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::While',
          0
        );
        const whileEvent = gd.asWhileEvent(event);
        const whileConditions = whileEvent.getWhileConditions();
        const invalidCondition = new gd.Instruction();
        invalidCondition.setType('While::InvalidWhileCondition');
        whileConditions.insert(invalidCondition, 0);
        invalidCondition.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'While::InvalidWhileCondition'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(true);
        }
      });

      it('detects errors in WhileEvent actions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::While',
          0
        );
        const whileEvent = gd.asWhileEvent(event);
        const actions = whileEvent.getActions();
        const invalidAction = new gd.Instruction();
        invalidAction.setType('While::InvalidAction');
        actions.insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'While::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(false);
        }
      });
    });

    describe('ForEachEvent scanning', () => {
      it('detects errors in ForEachEvent conditions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::ForEach',
          0
        );
        const forEachEvent = gd.asForEachEvent(event);
        const conditions = forEachEvent.getConditions();
        const invalidCondition = new gd.Instruction();
        invalidCondition.setType('ForEach::InvalidCondition');
        conditions.insert(invalidCondition, 0);
        invalidCondition.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'ForEach::InvalidCondition'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(true);
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('detects errors in ForEachEvent actions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::ForEach',
          0
        );
        const forEachEvent = gd.asForEachEvent(event);
        const actions = forEachEvent.getActions();
        const invalidAction = new gd.Instruction();
        invalidAction.setType('ForEach::InvalidAction');
        actions.insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'ForEach::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(false);
        }
      });
    });
  });

  describe('groupValidationErrors', () => {
    it('groups missing instructions by extension name', () => {
      const errors = [
        {
          type: 'missing-instruction',
          isCondition: false,
          instructionType: 'ExtA::Action1',
          instructionSentence: 'Action 1',
          locationName: 'Scene1',
          locationType: 'scene',
          eventPath: [0],
        },
        {
          type: 'missing-instruction',
          isCondition: true,
          instructionType: 'ExtA::Condition1',
          instructionSentence: 'Condition 1',
          locationName: 'Scene1',
          locationType: 'scene',
          eventPath: [1],
        },
        {
          type: 'missing-instruction',
          isCondition: false,
          instructionType: 'ExtB::Action1',
          instructionSentence: 'Action B',
          locationName: 'Scene2',
          locationType: 'scene',
          eventPath: [0],
        },
      ];

      const grouped = groupValidationErrors(errors);

      expect(grouped.missingInstructions.size).toBe(2);
      expect(grouped.missingInstructions.get('ExtA')?.length).toBe(2);
      expect(grouped.missingInstructions.get('ExtB')?.length).toBe(1);
    });

    it('groups invalid parameters by location', () => {
      const errors = [
        {
          type: 'invalid-parameter',
          isCondition: false,
          instructionType: 'Action1',
          instructionSentence: 'Action 1',
          parameterIndex: 0,
          parameterValue: '',
          locationName: 'Scene1',
          locationType: 'scene',
          eventPath: [0],
        },
        {
          type: 'invalid-parameter',
          isCondition: false,
          instructionType: 'Action2',
          instructionSentence: 'Action 2',
          parameterIndex: 1,
          parameterValue: '',
          locationName: 'Scene1',
          locationType: 'scene',
          eventPath: [1],
        },
        {
          type: 'invalid-parameter',
          isCondition: false,
          instructionType: 'Action3',
          instructionSentence: 'Action 3',
          parameterIndex: 0,
          parameterValue: '',
          locationName: 'Events1',
          locationType: 'external-events',
          eventPath: [0],
        },
      ];

      const grouped = groupValidationErrors(errors);

      expect(grouped.invalidParameters.size).toBe(2);
      expect(grouped.invalidParameters.get('scene: Scene1')?.length).toBe(2);
      expect(
        grouped.invalidParameters.get('external-events: Events1')?.length
      ).toBe(1);
    });
  });

  describe('findEventByPath', () => {
    it('returns null for empty path', () => {
      const { testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();
      const result = findEventByPath(events, []);
      expect(result).toBeNull();
    });

    it('returns null for invalid index', () => {
      const { testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();
      const result = findEventByPath(events, [999]);
      expect(result).toBeNull();
    });

    it('finds event at root level', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();

      // Add an event
      events.insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);

      const result = findEventByPath(events, [0]);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.getType()).toBe('BuiltinCommonInstructions::Standard');
      }
    });

    it('finds nested event', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();

      // Add a parent event
      const parentEvent = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );

      // Add a child event
      const subEvents = parentEvent.getSubEvents();
      subEvents.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Comment',
        0
      );

      const result = findEventByPath(events, [0, 0]);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.getType()).toBe('BuiltinCommonInstructions::Comment');
      }
    });
  });
});
