// @flow
import { mapFor } from '../../Utils/MapFor';
import {
  getEventsFunctionInScope,
  makeScopeProjectScopedContainersAccessor,
  resolveScope,
  type ToolScope,
} from '../Scope';
import {
  applyParameterChanges,
  applyParameterSpecs,
  getPlannedUserParametersCount,
  planParameterChanges,
  PARAMETER_TYPES,
  type ParameterChange,
  type ParameterChangesResult,
  type ParameterSpec,
  type ParameterSpecsResult,
} from './ParameterChanges';

const gd: libGDevelop = global.gd;

/**
 * An extension with a free function using an object parameter in its events,
 * a behavior function and a custom object function (both with the implicit
 * parameters GDevelop adds).
 */
const createFakeProjectWithFunctions = () => {
  // $FlowFixMe[invalid-constructor]
  const project = new gd.ProjectHelper.createNewGDJSProject();
  const extension = project.insertNewEventsFunctionsExtension('MyExt', 0);

  const freeFunction = extension
    .getEventsFunctions()
    .insertNewEventsFunction('Explode', 0);
  freeFunction.setFunctionType(gd.EventsFunction.Action);
  freeFunction
    .getParameters()
    .addNewParameter('Target')
    .setType('objectList')
    .setExtraInfo('Sprite');
  freeFunction
    .getParameters()
    .addNewParameter('Power')
    .setType('expression');
  const event = freeFunction
    .getEvents()
    .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
  const deleteAction = new gd.Instruction();
  deleteAction.setType('Delete');
  deleteAction.setParametersCount(2);
  deleteAction.setParameter(0, 'Target');
  gd.asStandardEvent(event)
    .getActions()
    .insert(deleteAction, 0);
  deleteAction.delete();

  const eventsBasedBehavior = extension
    .getEventsBasedBehaviors()
    .insertNew('MyBehavior', 0);
  const hitFunction = eventsBasedBehavior
    .getEventsFunctions()
    .insertNewEventsFunction('Hit', 0);
  hitFunction.setFunctionType(gd.EventsFunction.Action);
  gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
    extension,
    eventsBasedBehavior
  );
  hitFunction
    .getParameters()
    .addNewParameter('Damage')
    .setType('expression');
  hitFunction
    .getParameters()
    .addNewParameter('Knockback')
    .setType('expression');

  const eventsBasedObject = extension
    .getEventsBasedObjects()
    .insertNew('MyButton', 0);
  const pressFunction = eventsBasedObject
    .getEventsFunctions()
    .insertNewEventsFunction('Press', 0);
  pressFunction.setFunctionType(gd.EventsFunction.Action);
  gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
    extension,
    eventsBasedObject
  );
  pressFunction
    .getParameters()
    .addNewParameter('Force')
    .setType('expression');

  return { project, extension, freeFunction, hitFunction, pressFunction };
};

const getParameterNames = (eventsFunction: gdEventsFunction): Array<string> => {
  const parameters = eventsFunction.getParameters();
  return mapFor(0, parameters.getParametersCount(), index =>
    parameters.getParameterAt(index).getName()
  );
};

const expectSpecsSuccess = (
  result: ParameterSpecsResult
): {|
  success: true,
  parameterNames: Array<string>,
  messages: Array<string>,
|} => {
  if (!result.success) {
    throw new Error(`Expected a success, got the failure: ${result.message}`);
  }
  return result;
};

const expectChangesSuccess = (
  result: ParameterChangesResult
): {| success: true, changedCount: number, messages: Array<string> |} => {
  if (!result.success) {
    throw new Error(`Expected a success, got the failure: ${result.message}`);
  }
  return result;
};

const expectFailureMessage = (
  result: ParameterSpecsResult | ParameterChangesResult
): string => {
  if (result.success) throw new Error('Expected a failure.');
  return result.message;
};

describe('ParameterChanges', () => {
  let project: gdProject;
  let extension: gdEventsFunctionsExtension;
  let freeFunction: gdEventsFunction;
  let hitFunction: gdEventsFunction;
  let pressFunction: gdEventsFunction;

  beforeEach(() => {
    ({
      project,
      extension,
      freeFunction,
      hitFunction,
      pressFunction,
    } = createFakeProjectWithFunctions());
  });

  afterEach(() => {
    project.delete();
  });

  // Change the parameters of a function the way the editor functions do it:
  // through the resolved scope and its project scoped containers.
  const changeParameters = (
    scope: ToolScope,
    functionName: string,
    changes: Array<ParameterChange>
  ): ParameterChangesResult => {
    const resolvedScope = resolveScope(project, scope);
    if (!resolvedScope.success) throw new Error(resolvedScope.message);
    const functionResult = getEventsFunctionInScope(
      resolvedScope,
      functionName
    );
    if (!functionResult.success) throw new Error(functionResult.message);
    const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
      project,
      resolvedScope,
      functionResult.eventsFunction
    );
    try {
      return applyParameterChanges({
        project,
        resolvedScope,
        eventsFunction: functionResult.eventsFunction,
        accessor,
        changes,
      });
    } finally {
      dispose();
    }
  };

  const extensionScope: ToolScope = {
    type: 'extension',
    extension_name: 'MyExt',
  };
  const behaviorScope: ToolScope = {
    type: 'custom_behavior',
    extension_name: 'MyExt',
    custom_behavior_name: 'MyBehavior',
  };
  const objectScope: ToolScope = {
    type: 'custom_object',
    extension_name: 'MyExt',
    custom_object_name: 'MyButton',
  };

  const getDeleteActionObjectName = (): string =>
    gd
      .asStandardEvent(freeFunction.getEvents().getEventAt(0))
      .getActions()
      .get(0)
      .getParameter(0)
      .getPlainString();

  describe('applyParameterSpecs', () => {
    const createFunctionWithSpecs = (
      specs: Array<ParameterSpec>
    ): {| eventsFunction: gdEventsFunction, result: ParameterSpecsResult |} => {
      const eventsFunction = extension
        .getEventsFunctions()
        .insertNewEventsFunction('Push', 1);
      return {
        eventsFunction,
        result: applyParameterSpecs(eventsFunction, specs),
      };
    };

    it('adds an object parameter then a behavior parameter, normalizing `object`', () => {
      const { eventsFunction, result } = createFunctionWithSpecs([
        { name: 'Target', type: 'object', extra_info: 'Sprite' },
        {
          name: 'Physics',
          type: 'behavior',
          extra_info: 'MyExt::MyBehavior',
          label: 'Physics behavior',
        },
      ]);

      expect(expectSpecsSuccess(result).parameterNames).toEqual([
        'Target',
        'Physics',
      ]);
      const parameters = eventsFunction.getParameters();
      expect(parameters.getParameterAt(0).getType()).toBe('objectList');
      expect(parameters.getParameterAt(0).getExtraInfo()).toBe('Sprite');
      expect(parameters.getParameterAt(1).getType()).toBe('behavior');
      expect(parameters.getParameterAt(1).getExtraInfo()).toBe(
        'MyExt::MyBehavior'
      );
      expect(parameters.getParameterAt(1).getDescription()).toBe(
        'Physics behavior'
      );
    });

    it('refuses a behavior parameter with no object parameter before it', () => {
      const { eventsFunction, result } = createFunctionWithSpecs([
        { name: 'Physics', type: 'behavior', extra_info: 'MyExt::MyBehavior' },
        { name: 'Target', type: 'object' },
      ]);

      const message = expectFailureMessage(result);
      expect(message).toContain('"Physics"');
      expect(message).toContain('must come after an object parameter');
      expect(eventsFunction.getParameters().getParametersCount()).toBe(0);
    });

    it('asks for the behavior type of a behavior parameter', () => {
      const { result } = createFunctionWithSpecs([
        { name: 'Target', type: 'objectList' },
        { name: 'Physics', type: 'behavior' },
      ]);

      expect(expectFailureMessage(result)).toContain(
        'needs `extra_info` with the type of the required behavior'
      );
    });

    it('makes the names safe and unique', () => {
      const { eventsFunction, result } = createFunctionWithSpecs([
        { name: 'My value!', type: 'expression' },
        { name: 'My value!', type: 'string' },
      ]);

      expect(expectSpecsSuccess(result).parameterNames).toEqual([
        'My_value_',
        'My_value_2',
      ]);
      expect(getParameterNames(eventsFunction)).toEqual([
        'My_value_',
        'My_value_2',
      ]);
    });

    it('sets the label, long description, optional flag and default value', () => {
      const { eventsFunction } = createFunctionWithSpecs([
        {
          name: 'Power',
          type: 'expression',
          label: 'Power',
          long_description: 'How strong the push is',
          optional: 'true',
          default_value: '10',
        },
      ]);

      const parameter = eventsFunction.getParameters().getParameterAt(0);
      expect(parameter.getDescription()).toBe('Power');
      expect(parameter.getLongDescription()).toBe('How strong the push is');
      expect(parameter.isOptional()).toBe(true);
      expect(parameter.getDefaultValue()).toBe('10');
    });

    it('stores a list of choices as JSON', () => {
      const { eventsFunction } = createFunctionWithSpecs([
        {
          name: 'Size',
          type: 'stringWithSelector',
          extra_info: ['Small', 'Big'],
        },
      ]);

      expect(
        eventsFunction
          .getParameters()
          .getParameterAt(0)
          .getExtraInfo()
      ).toBe('["Small","Big"]');
    });

    it('lists the allowed types when the type does not exist', () => {
      const { eventsFunction, result } = createFunctionWithSpecs([
        { name: 'Power', type: 'number' },
      ]);

      const message = expectFailureMessage(result);
      expect(message).toContain('"expression"');
      expect(message).toContain('"objectList"');
      expect(eventsFunction.getParameters().getParametersCount()).toBe(0);
    });

    it('adds nothing when one of the parameters is refused', () => {
      const { eventsFunction, result } = createFunctionWithSpecs([
        { name: 'Power', type: 'expression' },
        { name: 'Broken', type: 'notAType' },
      ]);

      expect(result.success).toBe(false);
      expect(eventsFunction.getParameters().getParametersCount()).toBe(0);
    });
  });

  describe('implicit parameters', () => {
    it('refuses to rename, retype, move or delete the Object and Behavior parameters', () => {
      const renameResult = changeParameters(behaviorScope, 'Hit', [
        { parameter_name: 'Object', new_name: 'Owner' },
      ]);
      expect(expectFailureMessage(renameResult)).toContain(
        'given to every function of custom behavior "MyExt::MyBehavior" by GDevelop'
      );
      expect(expectFailureMessage(renameResult)).toContain(
        '"Damage", "Knockback"'
      );

      expect(
        expectFailureMessage(
          changeParameters(behaviorScope, 'Hit', [
            { parameter_name: 'Behavior', type: 'expression' },
          ])
        )
      ).toContain("can't be renamed, retyped, moved or deleted");

      expect(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Behavior', delete_this_parameter: true },
        ]).success
      ).toBe(false);

      expect(
        changeParameters(objectScope, 'Press', [
          { parameter_name: 'Object', new_index: 1 },
        ]).success
      ).toBe(false);

      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Damage',
        'Knockback',
      ]);
      expect(getParameterNames(pressFunction)).toEqual(['Object', 'Force']);
    });
  });

  describe('renaming a parameter', () => {
    it('renames the parameter in the events of the function', () => {
      expect(getDeleteActionObjectName()).toBe('Target');

      const result = expectChangesSuccess(
        changeParameters(extensionScope, 'Explode', [
          { parameter_name: 'Target', new_name: 'Enemy' },
        ])
      );

      expect(result.changedCount).toBe(1);
      expect(getParameterNames(freeFunction)).toEqual(['Enemy', 'Power']);
      expect(getDeleteActionObjectName()).toBe('Enemy');
    });

    it('makes the new name safe and unique', () => {
      const result = expectChangesSuccess(
        changeParameters(extensionScope, 'Explode', [
          { parameter_name: 'Target', new_name: 'Power' },
        ])
      );

      expect(getParameterNames(freeFunction)).toEqual(['Power2', 'Power']);
      expect(result.messages.join(' ')).toContain('use "Power2"');
    });
  });

  describe('changing, creating and deleting parameters', () => {
    it('changes the type of a parameter', () => {
      expectChangesSuccess(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Damage', type: 'string', label: 'Damage kind' },
        ])
      );

      const parameter = hitFunction.getParameters().getParameter('Damage');
      expect(parameter.getType()).toBe('string');
      expect(parameter.getDescription()).toBe('Damage kind');
    });

    it('creates a parameter when the name is unknown and a type is given', () => {
      expectChangesSuccess(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Critical', type: 'yesorno' },
        ])
      );

      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Damage',
        'Knockback',
        'Critical',
      ]);
    });

    it('lists the existing parameters when no type is given for an unknown one', () => {
      const message = expectFailureMessage(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Critical', label: 'Critical hit' },
        ])
      );

      expect(message).toContain('Existing parameters: "Damage", "Knockback"');
      expect(message).toContain('Pass `type` to create it');
    });

    it('deletes a parameter and warns about the events using it', () => {
      const result = expectChangesSuccess(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Damage', delete_this_parameter: true },
        ])
      );

      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Knockback',
      ]);
      expect(result.messages.join(' ')).toContain('are now invalid');
    });
  });

  describe('reordering parameters', () => {
    it('moves a parameter to a position among the parameters of the caller', () => {
      expectChangesSuccess(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Knockback', new_index: 0 },
        ])
      );

      // The implicit parameters keep their place.
      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Knockback',
        'Damage',
      ]);
    });

    it('moves a new parameter to the position it asks for', () => {
      expectChangesSuccess(
        changeParameters(extensionScope, 'Explode', [
          { parameter_name: 'Delay', type: 'expression', new_index: 0 },
        ])
      );

      expect(getParameterNames(freeFunction)).toEqual([
        'Delay',
        'Target',
        'Power',
      ]);
    });

    it('refuses an index outside of the parameters of the caller', () => {
      const message = expectFailureMessage(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Damage', new_index: 2 },
        ])
      );

      expect(message).toContain('must be between 0 and 1');
      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Damage',
        'Knockback',
      ]);
    });
  });

  describe('behavior parameters', () => {
    it('refuses a behavior parameter that no object parameter comes before', () => {
      const message = expectFailureMessage(
        changeParameters(extensionScope, 'Explode', [
          {
            parameter_name: 'Physics',
            type: 'behavior',
            extra_info: 'MyExt::MyBehavior',
            new_index: 0,
          },
        ])
      );

      expect(message).toContain('must come after an object parameter');
      expect(getParameterNames(freeFunction)).toEqual(['Target', 'Power']);
    });

    it('accepts a behavior parameter added after an object parameter', () => {
      expectChangesSuccess(
        changeParameters(extensionScope, 'Explode', [
          {
            parameter_name: 'Physics',
            type: 'behavior',
            extra_info: 'MyExt::MyBehavior',
          },
        ])
      );

      expect(getParameterNames(freeFunction)).toEqual([
        'Target',
        'Power',
        'Physics',
      ]);
    });
  });

  describe('atomicity', () => {
    it('applies nothing when one change of the call is refused', () => {
      const message = expectFailureMessage(
        changeParameters(behaviorScope, 'Hit', [
          { parameter_name: 'Damage', new_name: 'Amount' },
          { parameter_name: 'Knockback', type: 'notAType' },
        ])
      );

      expect(message).toContain('does not exist');
      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Damage',
        'Knockback',
      ]);
    });

    it('plans the changes of a call without touching the function', () => {
      const resolvedScope = resolveScope(project, behaviorScope);
      if (!resolvedScope.success) throw new Error(resolvedScope.message);

      const result = planParameterChanges({
        resolvedScope,
        eventsFunction: hitFunction,
        changes: [
          { parameter_name: 'Damage', delete_this_parameter: true },
          { parameter_name: 'Force', type: 'expression' },
        ],
      });

      if (!result.success) throw new Error(result.message);
      // The caller checks its own rules on what the function would declare...
      expect(getPlannedUserParametersCount(result.plannedChanges)).toBe(2);
      // ...while the function is still untouched.
      expect(getParameterNames(hitFunction)).toEqual([
        'Object',
        'Behavior',
        'Damage',
        'Knockback',
      ]);
    });

    it('changes nothing when there is nothing to change', () => {
      const result = expectChangesSuccess(
        changeParameters(behaviorScope, 'Hit', [{ parameter_name: 'Damage' }])
      );

      expect(result.changedCount).toBe(0);
      expect(result.messages).toEqual([]);
    });
  });

  describe('PARAMETER_TYPES', () => {
    it('lists the types of the function editor', () => {
      expect(PARAMETER_TYPES).toContain('objectList');
      expect(PARAMETER_TYPES).toContain('behavior');
      expect(PARAMETER_TYPES).toContain('expression');
      expect(PARAMETER_TYPES).not.toContain('object');
    });
  });
});
