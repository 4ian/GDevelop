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

    describe('scene lifecycle functions', () => {
      const addCondition = (
        project: gdProject,
        events: gdEventsList,
        type: string,
        parameters: Array<string>
      ) => {
        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          events.getEventsCount()
        );
        const condition = new gd.Instruction();
        condition.setType(type);
        condition.setParametersCount(parameters.length);
        parameters.forEach((parameter, index) =>
          condition.setParameter(index, parameter)
        );
        gd.asStandardEvent(event)
          .getConditions()
          .insert(condition, 0);
        condition.delete();
      };

      const addAction = (
        project: gdProject,
        events: gdEventsList,
        type: string,
        parameters: Array<string>
      ) => {
        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          events.getEventsCount()
        );
        const action = new gd.Instruction();
        action.setType(type);
        action.setParametersCount(parameters.length);
        parameters.forEach((parameter, index) =>
          action.setParameter(index, parameter)
        );
        gd.asStandardEvent(event)
          .getActions()
          .insert(action, 0);
        action.delete();
      };

      it('only validates unconditioned actions in sceneUpdate', () => {
        const { project, testLayout } = makeTestProject(gd);
        const lifecycleFunctions = testLayout.getLifecycleEventsFunctions();
        [
          'sceneLoad',
          'sceneSignal',
          'sceneUpdate',
          'sceneUnload',
        ].forEach(lifecycleFunctionName => {
          addAction(
            project,
            lifecycleFunctions.getByName(lifecycleFunctionName).getEvents(),
            'SetNumberVariable',
            ['Variable1', '=', '1']
          );
        });

        const unconditionedActionErrors = scanProjectForValidationErrors(
          project
        ).filter(error => error.type === 'unconditioned-action');

        expect(unconditionedActionErrors).toHaveLength(1);
        expect(unconditionedActionErrors[0].lifecycleFunctionName).toBe(
          'sceneUpdate'
        );
      });

      it('only validates unconditioned external layout creation in sceneUpdate', () => {
        const { project, testLayout } = makeTestProject(gd);
        const lifecycleFunctions = testLayout.getLifecycleEventsFunctions();
        ['sceneLoad', 'sceneUpdate'].forEach(lifecycleFunctionName => {
          addAction(
            project,
            lifecycleFunctions.getByName(lifecycleFunctionName).getEvents(),
            'BuiltinExternalLayouts::CreateObjectsFromExternalLayout',
            ['', '"Main_HUD"', '0', '0', '0']
          );
        });

        const unsafeExternalLayoutCreationErrors = scanProjectForValidationErrors(
          project
        ).filter(
          error => error.type === 'unsafe-external-layout-creation'
        );

        expect(unsafeExternalLayoutCreationErrors).toHaveLength(1);
        expect(
          unsafeExternalLayoutCreationErrors[0].lifecycleFunctionName
        ).toBe('sceneUpdate');
      });

      it('rejects SignalReceived outside sceneUpdate with role identity', () => {
        const { project, testLayout } = makeTestProject(gd);
        const lifecycleFunctions = testLayout.getLifecycleEventsFunctions();
        addCondition(
          project,
          lifecycleFunctions.getByName('sceneSignal').getEvents(),
          'SignalReceived',
          ['', '"damage"']
        );
        addCondition(
          project,
          lifecycleFunctions.getByName('sceneUpdate').getEvents(),
          'SignalReceived',
          ['', '"legacy"']
        );

        const lifecycleErrors = scanProjectForValidationErrors(project).filter(
          error =>
            error.diagnosticCode ===
            'SCENE_LIFECYCLE_FUNCTION_INVALID_SIGNAL_RECEIVED'
        );

        expect(lifecycleErrors).toHaveLength(1);
        expect(lifecycleErrors[0].lifecycleFunctionName).toBe('sceneSignal');
        expect(lifecycleErrors[0].type).toBe('lifecycle-incompatible');
      });

      it('rejects asynchronous, deferred-signal and transition actions during unload', () => {
        const { project, testLayout } = makeTestProject(gd);
        const unloadEvents = testLayout
          .getLifecycleEventsFunctions()
          .getByName('sceneUnload')
          .getEvents();
        addAction(project, unloadEvents, 'Wait', ['0.1']);
        addAction(project, unloadEvents, 'EmitSceneSignal', [
          '',
          '"closed"',
          '""',
          '',
        ]);
        addAction(project, unloadEvents, 'Scene', ['', 'NextScene', 'true']);

        const diagnosticCodes = scanProjectForValidationErrors(project)
          .filter(error => error.lifecycleFunctionName === 'sceneUnload')
          .map(error => error.diagnosticCode);

        expect(diagnosticCodes).toEqual(
          expect.arrayContaining([
            'SCENE_LIFECYCLE_FUNCTION_ASYNC_NOT_SUPPORTED',
            'SCENE_LIFECYCLE_FUNCTION_DEFERRED_SIGNAL_NOT_SUPPORTED',
            'SCENE_LIFECYCLE_FUNCTION_TRANSITION_NOT_SUPPORTED',
          ])
        );
      });

      it('applies lifecycle validation to external events functions', () => {
        const { project, testExternalEvents1 } = makeTestProject(gd);
        addAction(
          project,
          testExternalEvents1
            .getLifecycleEventsFunctions()
            .getByName('sceneUnload')
            .getEvents(),
          'Wait',
          ['0.1']
        );

        const targetError = scanProjectForValidationErrors(project).find(
          error =>
            error.diagnosticCode ===
            'SCENE_LIFECYCLE_FUNCTION_ASYNC_NOT_SUPPORTED'
        );

        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('external-events');
          expect(targetError.lifecycleFunctionName).toBe('sceneUnload');
        }
      });

      it('explains redundant first-frame checks without making them incompatible', () => {
        const { project, testLayout } = makeTestProject(gd);
        addCondition(
          project,
          testLayout
            .getLifecycleEventsFunctions()
            .getByName('sceneLoad')
            .getEvents(),
          'SceneJustBegins',
          ['']
        );

        const targetError = scanProjectForValidationErrors(project).find(
          error =>
            error.diagnosticCode ===
            'SCENE_LIFECYCLE_FUNCTION_REDUNDANT_SCENE_JUST_BEGINS'
        );

        expect(targetError).toBeDefined();
        if (targetError) expect(targetError.type).toBe('lifecycle-redundant');
      });
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

    it('diagnoses unknown literal keyboard names and accepts digit aliases', () => {
      const { project, testLayout } = makeTestProject(gd);
      const events = testLayout.getEvents();
      const event = events.insertNewEvent(
        project,
        'BuiltinCommonInstructions::Standard',
        0
      );
      const conditions = gd.asStandardEvent(event).getConditions();
      const addKeyCondition = (value: string, index: number) => {
        const condition = new gd.Instruction();
        condition.setType('KeyFromTextJustPressed');
        condition.setParametersCount(2);
        condition.setParameter(0, '');
        condition.setParameter(1, value);
        conditions.insert(condition, index);
        condition.delete();
      };
      addKeyCondition('"NotARealKey"', 0);
      addKeyCondition('"1"', 1);
      addKeyCondition('"Digit2"', 2);

      const errors = scanProjectForValidationErrors(project);
      const keyboardErrors = errors.filter(
        error => error.diagnosticCode === 'INPUT_UNKNOWN_KEY_NAME'
      );

      expect(keyboardErrors).toHaveLength(1);
      expect(keyboardErrors[0].parameterValue).toBe('"NotARealKey"');
    });

    describe('disabled events', () => {
      it('skips disabled events', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        event.setDisabled(true);
        const standardEvent = gd.asStandardEvent(event);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('Disabled::InvalidAction');
        standardEvent.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'Disabled::InvalidAction'
        );
        expect(targetError).toBeUndefined();
      });

      it('skips sub-events of disabled events', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        parentEvent.setDisabled(true);

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandard = gd.asStandardEvent(childEvent);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('DisabledChild::InvalidAction');
        childStandard.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'DisabledChild::InvalidAction'
        );
        expect(targetError).toBeUndefined();
      });
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

    describe('extension function scanning', () => {
      it('detects errors in free extension functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestExtScan',
          0
        );
        extension.setName('TestExtScan');
        const fn = extension
          .getEventsFunctions()
          .insertNewEventsFunction('FreeFunc', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('ExtFree::InvalidAction');
        standardEvent.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'ExtFree::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('extension');
          expect(targetError.extensionName).toBe('TestExtScan');
          expect(targetError.functionName).toBe('FreeFunc');
          expect(targetError.behaviorName).toBeNull();
          expect(targetError.objectName).toBeNull();
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('detects errors in behavior extension functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestExtBhvScan',
          0
        );
        extension.setName('TestExtBhvScan');
        const behavior = extension
          .getEventsBasedBehaviors()
          .insertNew('TestBehavior', 0);
        const fn = behavior
          .getEventsFunctions()
          .insertNewEventsFunction('BhvFunc', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('ExtBhv::InvalidAction');
        standardEvent.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'ExtBhv::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('extension');
          expect(targetError.extensionName).toBe('TestExtBhvScan');
          expect(targetError.functionName).toBe('BhvFunc');
          expect(targetError.behaviorName).toBe('TestBehavior');
          expect(targetError.objectName).toBeNull();
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('detects errors in object extension functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestExtObjScan',
          0
        );
        extension.setName('TestExtObjScan');
        const object = extension
          .getEventsBasedObjects()
          .insertNew('TestObject', 0);
        const fn = object
          .getEventsFunctions()
          .insertNewEventsFunction('ObjFunc', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('ExtObj::InvalidAction');
        standardEvent.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'ExtObj::InvalidAction'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.locationType).toBe('extension');
          expect(targetError.extensionName).toBe('TestExtObjScan');
          expect(targetError.functionName).toBe('ObjFunc');
          expect(targetError.behaviorName).toBeNull();
          expect(targetError.objectName).toBe('TestObject');
          expect(targetError.type).toBe('missing-instruction');
        }
      });

      it('skips store extensions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'StoreExt',
          0
        );
        extension.setName('StoreExt');
        extension.setOrigin('gdevelop-extension-store', 'StoreExt');
        const fn = extension
          .getEventsFunctions()
          .insertNewEventsFunction('StoreFunc', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const invalidAction = new gd.Instruction();
        invalidAction.setType('Store::InvalidAction');
        standardEvent.getActions().insert(invalidAction, 0);
        invalidAction.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.instructionType === 'Store::InvalidAction'
        );
        expect(targetError).toBeUndefined();
      });

      it('detects actions without conditions in project behavior per-frame lifecycle functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestLifecycleExt',
          0
        );
        extension.setName('TestLifecycleExt');
        const behavior = extension
          .getEventsBasedBehaviors()
          .insertNew('TestBehavior', 0);
        ['doStepPreEvents', 'doStepPostEvents'].forEach(
          (functionName, functionIndex) => {
            const fn = behavior
              .getEventsFunctions()
              .insertNewEventsFunction(functionName, functionIndex);
            const event = fn
              .getEvents()
              .insertNewEvent(
                project,
                'BuiltinCommonInstructions::Standard',
                0
              );
            const standardEvent = gd.asStandardEvent(event);
            const action = new gd.Instruction();
            action.setType('SetNumberVariable');
            action.setParametersCount(3);
            action.setParameter(0, 'Variable1');
            action.setParameter(1, '=');
            action.setParameter(2, '1');
            standardEvent.getActions().insert(action, 0);
            action.delete();
          }
        );

        const errors = scanProjectForValidationErrors(project);

        ['doStepPreEvents', 'doStepPostEvents'].forEach(functionName => {
          const targetError = errors.find(
            e =>
              e.type === 'unconditioned-action' &&
              e.instructionType === 'SetNumberVariable' &&
              e.extensionName === 'TestLifecycleExt' &&
              e.functionName === functionName
          );
          expect(targetError).toBeDefined();
          if (targetError) {
            expect(targetError.locationType).toBe('extension');
            expect(targetError.behaviorName).toBe('TestBehavior');
            expect(targetError.objectName).toBeNull();
          }
        });
      });

      it('detects actions without conditions in project object per-frame lifecycle functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestObjectLifecycleExt',
          0
        );
        extension.setName('TestObjectLifecycleExt');
        const object = extension
          .getEventsBasedObjects()
          .insertNew('TestObject', 0);
        ['doStepPreEvents', 'doStepPostEvents'].forEach(
          (functionName, functionIndex) => {
            const fn = object
              .getEventsFunctions()
              .insertNewEventsFunction(functionName, functionIndex);
            const event = fn
              .getEvents()
              .insertNewEvent(
                project,
                'BuiltinCommonInstructions::Standard',
                0
              );
            const standardEvent = gd.asStandardEvent(event);
            const action = new gd.Instruction();
            action.setType('SetNumberVariable');
            action.setParametersCount(3);
            action.setParameter(0, 'Variable1');
            action.setParameter(1, '=');
            action.setParameter(2, '1');
            standardEvent.getActions().insert(action, 0);
            action.delete();
          }
        );

        const errors = scanProjectForValidationErrors(project);

        ['doStepPreEvents', 'doStepPostEvents'].forEach(functionName => {
          const targetError = errors.find(
            e =>
              e.type === 'unconditioned-action' &&
              e.instructionType === 'SetNumberVariable' &&
              e.extensionName === 'TestObjectLifecycleExt' &&
              e.functionName === functionName
          );
          expect(targetError).toBeDefined();
          if (targetError) {
            expect(targetError.locationType).toBe('extension');
            expect(targetError.behaviorName).toBeNull();
            expect(targetError.objectName).toBe('TestObject');
          }
        });
      });

      it('allows actions without conditions in ordinary project extension functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestOrdinaryExt',
          0
        );
        extension.setName('TestOrdinaryExt');
        const behavior = extension
          .getEventsBasedBehaviors()
          .insertNew('TestBehavior', 0);
        const fn = behavior
          .getEventsFunctions()
          .insertNewEventsFunction('BhvFunc', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.extensionName === 'TestOrdinaryExt' &&
            e.functionName === 'BhvFunc'
        );
        expect(targetError).toBeUndefined();
      });

      it('ignores actions without conditions in free extension per-frame lifecycle functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'TestFreeLifecycleExt',
          0
        );
        extension.setName('TestFreeLifecycleExt');
        const fn = extension
          .getEventsFunctions()
          .insertNewEventsFunction('onScenePostEvents', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.extensionName === 'TestFreeLifecycleExt' &&
            e.functionName === 'onScenePostEvents'
        );
        expect(targetError).toBeUndefined();
      });

      it('ignores actions without conditions in store extension lifecycle functions', () => {
        const { project } = makeTestProject(gd);
        const extension = project.insertNewEventsFunctionsExtension(
          'StoreLifecycleExt',
          0
        );
        extension.setName('StoreLifecycleExt');
        extension.setOrigin('gdevelop-extension-store', 'StoreLifecycleExt');
        const behavior = extension
          .getEventsBasedBehaviors()
          .insertNew('TestBehavior', 0);
        const fn = behavior
          .getEventsFunctions()
          .insertNewEventsFunction('doStepPreEvents', 0);
        const event = fn
          .getEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.extensionName === 'StoreLifecycleExt'
        );
        expect(targetError).toBeUndefined();
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

      it('allows actions in a sub-event when the parent ForEach event has an enabled condition', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::ForEach',
          0
        );
        const forEachEvent = gd.asForEachEvent(parentEvent);
        forEachEvent.setObjectToPick('MySpriteObject');
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        forEachEvent.getConditions().insert(condition, 0);
        condition.delete();

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandardEvent = gd.asStandardEvent(childEvent);
        const action = new gd.Instruction();
        action.setType('Delete');
        action.setParametersCount(1);
        action.setParameter(0, 'MySpriteObject');
        childStandardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        expect(
          errors.find(
            error =>
              error.type === 'unconditioned-action' &&
              error.instructionType === 'Delete'
          )
        ).toBeUndefined();
      });

      it('detects actions in a sub-event when all parent ForEach event conditions are disabled', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::ForEach',
          0
        );
        const forEachEvent = gd.asForEachEvent(parentEvent);
        forEachEvent.setObjectToPick('MySpriteObject');
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        condition.setDisabled(true);
        forEachEvent.getConditions().insert(condition, 0);
        condition.delete();

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandardEvent = gd.asStandardEvent(childEvent);
        const action = new gd.Instruction();
        action.setType('Delete');
        action.setParametersCount(1);
        action.setParameter(0, 'MySpriteObject');
        childStandardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        expect(
          errors.find(
            error =>
              error.type === 'unconditioned-action' &&
              error.instructionType === 'Delete'
          )
        ).toBeDefined();
      });

      it('detects external layout creation in a standard event without conditions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType(
          'BuiltinExternalLayouts::CreateObjectsFromExternalLayout'
        );
        action.setParameter(1, '"Main_HUD"');
        action.setParameter(2, '0');
        action.setParameter(3, '0');
        action.setParameter(4, '0');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.type === 'unsafe-external-layout-creation'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.instructionType).toBe(
            'BuiltinExternalLayouts::CreateObjectsFromExternalLayout'
          );
          expect(targetError.isCondition).toBe(false);
          expect(targetError.locationType).toBe('scene');
          expect(targetError.locationName).toBe(testLayout.getName());
        }
      });

      it('allows external layout creation when the event has an enabled condition', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParameter(0, '');
        standardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const action = new gd.Instruction();
        action.setType(
          'BuiltinExternalLayouts::CreateObjectsFromExternalLayout'
        );
        action.setParameter(1, '"Main_HUD"');
        action.setParameter(2, '0');
        action.setParameter(3, '0');
        action.setParameter(4, '0');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e => e.type === 'unsafe-external-layout-creation'
        );
        expect(targetError).toBeUndefined();
      });

      it('allows external layout creation in a sub-event when the parent event has an enabled condition', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const parentStandardEvent = gd.asStandardEvent(parentEvent);
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        parentStandardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandardEvent = gd.asStandardEvent(childEvent);
        const action = new gd.Instruction();
        action.setType(
          'BuiltinExternalLayouts::CreateObjectsFromExternalLayout'
        );
        action.setParameter(1, '"Main_HUD"');
        action.setParameter(2, '0');
        action.setParameter(3, '0');
        action.setParameter(4, '0');
        childStandardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        expect(
          errors.find(e => e.type === 'unsafe-external-layout-creation')
        ).toBeUndefined();
        expect(
          errors.find(
            e =>
              e.type === 'unconditioned-action' &&
              e.instructionType ===
                'BuiltinExternalLayouts::CreateObjectsFromExternalLayout'
          )
        ).toBeUndefined();
      });

      it('detects actions in a standard event without enabled conditions', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.instructionType === 'SetNumberVariable'
        );
        expect(targetError).toBeDefined();
        if (targetError) {
          expect(targetError.isCondition).toBe(false);
          expect(targetError.locationType).toBe('scene');
          expect(targetError.locationName).toBe(testLayout.getName());
        }
      });

      it('detects actions when all standard event conditions are disabled', () => {
        const { project } = makeTestProject(gd);
        const events = project.getLayout('TestLayout').getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        condition.setDisabled(true);
        standardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.instructionType === 'SetNumberVariable'
        );
        expect(targetError).toBeDefined();
      });

      it('allows actions in a standard event with an enabled condition', () => {
        const { project } = makeTestProject(gd);
        const events = project.getLayout('TestLayout').getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        standardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.instructionType === 'SetNumberVariable'
        );
        expect(targetError).toBeUndefined();
      });

      it('allows actions in a sub-event when the parent event has an enabled condition', () => {
        const { project } = makeTestProject(gd);
        const events = project.getLayout('TestLayout').getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const parentStandardEvent = gd.asStandardEvent(parentEvent);
        const condition = new gd.Instruction();
        condition.setType('SceneJustBegins');
        condition.setParametersCount(1);
        condition.setParameter(0, '');
        parentStandardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandardEvent = gd.asStandardEvent(childEvent);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        childStandardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.instructionType === 'SetNumberVariable'
        );
        expect(targetError).toBeUndefined();
      });

      it('detects actions in a sub-event when the parent event has no enabled condition', () => {
        const { project } = makeTestProject(gd);
        const events = project.getLayout('TestLayout').getEvents();

        const parentEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );

        const childEvent = parentEvent
          .getSubEvents()
          .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
        const childStandardEvent = gd.asStandardEvent(childEvent);
        const action = new gd.Instruction();
        action.setType('SetNumberVariable');
        action.setParametersCount(3);
        action.setParameter(0, 'Variable1');
        action.setParameter(1, '=');
        action.setParameter(2, '1');
        childStandardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.type === 'unconditioned-action' &&
            e.instructionType === 'SetNumberVariable'
        );
        expect(targetError).toBeDefined();
      });

      it('allows all-picked object actions with multiple instances', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();
        const secondSpriteObjectInstance = testLayout
          .getInitialInstances()
          .insertNewInitialInstance();
        secondSpriteObjectInstance.setObjectName('MySpriteObject');

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('Delete');
        action.setParametersCount(1);
        action.setParameter(0, 'MySpriteObject');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.instructionType === 'Delete' &&
            e.parameterValue === 'MySpriteObject'
        );
        expect(targetError).toBeUndefined();
      });

      it('does not validate object pointer cardinality for objects created dynamically', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const createEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const createAction = new gd.Instruction();
        createAction.setType('Create');
        createAction.setParametersCount(5);
        createAction.setParameter(1, 'MySpriteObject');
        createAction.setParameter(2, '0');
        createAction.setParameter(3, '0');
        gd.asStandardEvent(createEvent)
          .getActions()
          .insert(createAction, 0);
        createAction.delete();

        const consumeEvent = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          1
        );
        const consumeAction = new gd.Instruction();
        consumeAction.setType('AddForceTowardObject');
        consumeAction.setParametersCount(4);
        consumeAction.setParameter(0, 'MySpriteObject');
        consumeAction.setParameter(1, 'MySpriteObject');
        consumeAction.setParameter(2, '100');
        consumeAction.setParameter(3, '0');
        gd.asStandardEvent(consumeEvent)
          .getActions()
          .insert(consumeAction, 0);
        consumeAction.delete();

        const errors = scanProjectForValidationErrors(project);
        const targetError = errors.find(
          error =>
            error.instructionType === 'AddForceTowardObject' &&
            error.parameterIndex === 1
        );
        expect(targetError).toBeUndefined();
      });

      it('does not model CreateByName groups for object picking cardinality', () => {
        const { project, testLayout } = makeTestProject(gd);
        const group = testLayout
          .getObjects()
          .getObjectGroups()
          .insertNew('Spawnable', 0);
        group.addObject('MySpriteObject');
        const events = testLayout.getEvents();
        const createEvent = gd.asStandardEvent(
          events.insertNewEvent(
            project,
            'BuiltinCommonInstructions::Standard',
            0
          )
        );
        const createAction = new gd.Instruction();
        createAction.setType('CreateByName');
        createAction.setParametersCount(6);
        createAction.setParameter(0, '');
        createAction.setParameter(1, 'Spawnable');
        createAction.setParameter(2, 'DynamicObjectName');
        createAction.setParameter(3, '0');
        createAction.setParameter(4, '0');
        createAction.setParameter(5, '""');
        createEvent.getActions().insert(createAction, 0);
        createAction.delete();

        const consumeEvent = gd.asStandardEvent(
          events.insertNewEvent(
            project,
            'BuiltinCommonInstructions::Standard',
            1
          )
        );
        const consumeAction = new gd.Instruction();
        consumeAction.setType('AddForceTowardObject');
        consumeAction.setParametersCount(4);
        consumeAction.setParameter(0, 'MySpriteObject');
        consumeAction.setParameter(1, 'MySpriteObject');
        consumeAction.setParameter(2, '100');
        consumeAction.setParameter(3, '0');
        consumeEvent.getActions().insert(consumeAction, 0);
        consumeAction.delete();

        const targetError = scanProjectForValidationErrors(project).find(
          error =>
            error.instructionType === 'AddForceTowardObject' &&
            error.parameterIndex === 1
        );
        expect(targetError).toBeUndefined();
      });

      it('allows object action parameters when the scene has at most one initial instance', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const action = new gd.Instruction();
        action.setType('Delete');
        action.setParametersCount(1);
        action.setParameter(0, 'MySpriteObject');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.instructionType === 'Delete' &&
            e.parameterValue === 'MySpriteObject'
        );
        expect(targetError).toBeUndefined();
      });

      it('allows object action parameters after a single-instance picking condition', () => {
        const { project, testLayout } = makeTestProject(gd);
        const events = testLayout.getEvents();

        const event = events.insertNewEvent(
          project,
          'BuiltinCommonInstructions::Standard',
          0
        );
        const standardEvent = gd.asStandardEvent(event);
        const condition = new gd.Instruction();
        condition.setType('PickRandomInstance');
        condition.setParametersCount(2);
        condition.setParameter(1, 'MySpriteObject');
        standardEvent.getConditions().insert(condition, 0);
        condition.delete();

        const action = new gd.Instruction();
        action.setType('Delete');
        action.setParametersCount(1);
        action.setParameter(0, 'MySpriteObject');
        standardEvent.getActions().insert(action, 0);
        action.delete();

        const errors = scanProjectForValidationErrors(project);

        const targetError = errors.find(
          e =>
            e.instructionType === 'Delete' &&
            typeof e.parameterIndex === 'number' &&
            e.eventPath[0] === 0
        );
        expect(targetError).toBeUndefined();
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

      // $FlowFixMe[incompatible-type]
      const grouped = groupValidationErrors(errors);

      expect(grouped.missingInstructions.size).toBe(2);
      const extAErrors = grouped.missingInstructions.get('ExtA');
      const extBErrors = grouped.missingInstructions.get('ExtB');
      expect(extAErrors && extAErrors.length).toBe(2);
      expect(extBErrors && extBErrors.length).toBe(1);
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

      // $FlowFixMe[incompatible-type]
      const grouped = groupValidationErrors(errors);

      expect(grouped.invalidParameters.size).toBe(2);
      const sceneErrors = grouped.invalidParameters.get('scene: Scene1');
      const extEventsErrors = grouped.invalidParameters.get(
        'external-events: Events1'
      );
      expect(sceneErrors && sceneErrors.length).toBe(2);
      expect(extEventsErrors && extEventsErrors.length).toBe(1);
    });

    it('groups extension errors with extension: prefix', () => {
      const errors = [
        {
          type: 'invalid-parameter',
          isCondition: false,
          instructionType: 'Action1',
          instructionSentence: 'Action 1',
          parameterIndex: 0,
          parameterValue: '',
          locationName: 'MyExt / MyFunc',
          locationType: 'extension',
          eventPath: [0],
          extensionName: 'MyExt',
          functionName: 'MyFunc',
          behaviorName: null,
          objectName: null,
        },
      ];

      // $FlowFixMe[incompatible-type]
      const grouped = groupValidationErrors(errors);

      const extErrors = grouped.invalidParameters.get(
        'extension: MyExt / MyFunc'
      );
      expect(extErrors).toBeDefined();
      expect(extErrors && extErrors.length).toBe(1);
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
