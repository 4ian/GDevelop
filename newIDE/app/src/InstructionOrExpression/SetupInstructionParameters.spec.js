// @flow
import {
  enumerateObjectAndBehaviorsInstructions,
  enumerateFreeInstructions,
} from './EnumerateInstructions';
import {
  setupInstructionParameters,
  resetParametersAfterSwitch,
} from './SetupInstructionParameters';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

// Helper: build an instruction with the given type and parameter values.
const makeInstruction = (type: string, params: Array<string>) => {
  const instruction = new gd.Instruction();
  instruction.setType(type);
  instruction.setParametersCount(params.length);
  params.forEach((p, i) => instruction.setParameter(i, p));
  return instruction;
};

// $FlowFixMe[incompatible-type]
// $FlowFixMe[missing-local-annot]
// $FlowFixMe[cannot-resolve-name]
const makeFakeI18n = (fakeI18n): I18nType => ({
  ...fakeI18n,
  _: message => message.id,
});

describe('setupInstructionParameters', () => {
  it('sets the proper number of parameters', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    layout.getObjects().insertNewObject(project, 'Sprite', objectName, 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction
    const enumeratedInstructions = enumerateFreeInstructions(
      false,
      makeFakeI18n()
    );
    const playMusicInstruction = enumeratedInstructions.find(
      enumeratedInstruction => enumeratedInstruction.type === 'PlayMusic'
    );

    if (!playMusicInstruction) {
      throw new Error('PlayMusic action was not found');
    }

    const instruction = new gd.Instruction();
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      playMusicInstruction.metadata
    );

    // Check that parameters were created
    expect(instruction.getParametersCount()).toBe(5);
    expect(instruction.getParameter(0).getPlainString()).toBe('');
    expect(instruction.getParameter(1).getPlainString()).toBe('');
    expect(instruction.getParameter(2).getPlainString()).toBe('');
    expect(instruction.getParameter(3).getPlainString()).toBe('');
    expect(instruction.getParameter(4).getPlainString()).toBe('');
  });

  it('sets the proper number of parameters and the object name', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    const behaviorName = 'Animation';
    layout.getObjects().insertNewObject(project, 'Sprite', objectName, 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction for the object
    const enumeratedInstructions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      objectName,
      makeFakeI18n()
    );
    const setAnimationNameInstruction = enumeratedInstructions.find(
      enumeratedInstruction =>
        enumeratedInstruction.type ===
        'AnimatableCapability::AnimatableBehavior::SetName'
    );

    if (!setAnimationNameInstruction) {
      throw new Error('SetAnimationName action was not found');
    }

    const instruction = new gd.Instruction();
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      setAnimationNameInstruction.metadata,
      objectName
    );

    // Check that parameters were created and the object name set
    expect(instruction.getParametersCount()).toBe(4);
    expect(instruction.getParameter(0).getPlainString()).toBe(objectName);
    expect(instruction.getParameter(1).getPlainString()).toBe(behaviorName);
    // Operator - defaults to '=' when not set
    expect(instruction.getParameter(2).getPlainString()).toBe('=');
    // Operand
    expect(instruction.getParameter(3).getPlainString()).toBe('');
  });

  it('sets the proper parameters for a behavior', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', objectName, 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'PlatformerObject'
    );
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction of the object behavior
    const enumeratedInstructions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      objectName,
      makeFakeI18n()
    );
    const jumpSpeedInstruction = enumeratedInstructions.find(
      enumeratedInstruction =>
        enumeratedInstruction.type === 'PlatformBehavior::JumpSpeed'
    );

    if (!jumpSpeedInstruction) {
      throw new Error('PlatformBehavior::JumpSpeed action was not found');
    }

    const instruction = new gd.Instruction();
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      jumpSpeedInstruction.metadata,
      objectName
    );

    // Check that parameters were created, the object name and behavior set
    expect(instruction.getParametersCount()).toBe(4);
    expect(instruction.getParameter(0).getPlainString()).toBe(objectName);
    expect(instruction.getParameter(1).getPlainString()).toBe(
      'PlatformerObject'
    );
    expect(instruction.getParameter(2).getPlainString()).toBe('='); // Operator defaults to '='
    expect(instruction.getParameter(3).getPlainString()).toBe('');
  });

  it('sets the proper parameters for a behavior, selecting the first behavior if multiple', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', objectName, 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'FirstPlatformerObject'
    );
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'OtherPlatformerObject'
    );
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction of the object behavior
    const enumeratedInstructions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      objectName,
      makeFakeI18n()
    );
    const jumpSpeedInstruction = enumeratedInstructions.find(
      enumeratedInstruction =>
        enumeratedInstruction.type === 'PlatformBehavior::JumpSpeed'
    );

    if (!jumpSpeedInstruction) {
      throw new Error('PlatformBehavior::JumpSpeed action was not found');
    }

    const instruction = new gd.Instruction();
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      jumpSpeedInstruction.metadata,
      objectName
    );

    // Check that parameters were created, the object name and behavior set
    expect(instruction.getParametersCount()).toBe(4);
    expect(instruction.getParameter(0).getPlainString()).toBe(objectName);
    expect(instruction.getParameter(1).getPlainString()).toBe(
      'FirstPlatformerObject'
    );
  });

  it('sets the proper parameters for a behavior, changing it if a wrong behavior name is entered', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', objectName, 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'FirstPlatformerObject'
    );
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'OtherPlatformerObject'
    );
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction of the object behavior
    const enumeratedInstructions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      objectName,
      makeFakeI18n()
    );
    const jumpSpeedInstruction = enumeratedInstructions.find(
      enumeratedInstruction =>
        enumeratedInstruction.type === 'PlatformBehavior::JumpSpeed'
    );

    if (!jumpSpeedInstruction) {
      throw new Error('PlatformBehavior::JumpSpeed action was not found');
    }

    const instruction = new gd.Instruction();
    instruction.setParametersCount(4);
    instruction.setParameter(0, objectName);
    instruction.setParameter(1, 'WrongName');
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      jumpSpeedInstruction.metadata,
      objectName
    );

    // Check that parameters were created, the object name and behavior set
    expect(instruction.getParametersCount()).toBe(4);
    expect(instruction.getParameter(0).getPlainString()).toBe(objectName);
    expect(instruction.getParameter(1).getPlainString()).toBe(
      'FirstPlatformerObject'
    );
  });

  it('normalizes an invalid relationalOperator to the first valid one', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      'NumberVariable'
    );

    // Simulate a NumberVariable instruction that has a stale string operator
    // (e.g. "startsWith") left after switching from StringVariable.
    const instruction = makeInstruction('NumberVariable', [
      'myVar',
      'startsWith',
      '0',
    ]);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('=');

    project.delete();
  });

  it('normalizes an invalid operator to the first valid one', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getActionMetadata(
      project.getCurrentPlatform(),
      'SetStringVariable'
    );

    // Simulate a SetStringVariable instruction with "-" left from SetNumberVariable.
    const instruction = makeInstruction('SetStringVariable', [
      'myVar',
      '-',
      '"hello"',
    ]);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('=');

    project.delete();
  });

  it('normalizes an invalid trueorfalse value to "False" (backward compat)', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      'BooleanVariable'
    );

    // A saved BooleanVariable condition that still has "=" from before the
    // C++ fixer was in place: it evaluated as False in the runtime and showed
    // False in the UI, so we preserve that behavior.
    const instruction = makeInstruction('BooleanVariable', ['myVar', '=']);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('False');

    project.delete();
  });

  it('sets the proper parameters for a behavior, letting an existing behavior name if it is valid', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const objectName = 'MySpriteObject';
    const object = layout
      .getObjects()
      .insertNewObject(project, 'Sprite', objectName, 0);
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'FirstPlatformerObject'
    );
    object.addNewBehavior(
      project,
      'PlatformBehavior::PlatformerObjectBehavior',
      'OtherPlatformerObject'
    );
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    // Simulate that we select an instruction of the object behavior
    const enumeratedInstructions = enumerateObjectAndBehaviorsInstructions(
      false,
      project.getObjects(),
      layout.getObjects(),
      objectName,
      makeFakeI18n()
    );
    const jumpSpeedInstruction = enumeratedInstructions.find(
      enumeratedInstruction =>
        enumeratedInstruction.type === 'PlatformBehavior::JumpSpeed'
    );

    if (!jumpSpeedInstruction) {
      throw new Error('PlatformBehavior::JumpSpeed action was not found');
    }

    const instruction = new gd.Instruction();
    instruction.setParametersCount(4);
    instruction.setParameter(0, objectName);
    instruction.setParameter(1, 'OtherPlatformerObject');
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      jumpSpeedInstruction.metadata,
      objectName
    );

    // Check that parameters were created, the object name and behavior set
    expect(instruction.getParametersCount()).toBe(4);
    expect(instruction.getParameter(0).getPlainString()).toBe(objectName);
    expect(instruction.getParameter(1).getPlainString()).toBe(
      'OtherPlatformerObject'
    );
  });

  it('preserves valid "True" for trueorfalse parameter (not overwritten to "False")', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      'BooleanVariable'
    );

    const instruction = makeInstruction('BooleanVariable', ['myVar', 'True']);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('True');

    project.delete();
  });

  it('preserves valid "Toggle" for SetBooleanVariable operator parameter', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getActionMetadata(
      project.getCurrentPlatform(),
      'SetBooleanVariable'
    );

    const instruction = makeInstruction('SetBooleanVariable', [
      'myVar',
      'Toggle',
      '',
    ]);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('Toggle');

    project.delete();
  });

  it('reset then setup: switching to BooleanVariable with stale "=" ends up as "True"', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      { project, layout }
    );
    const instructionMetadata = gd.MetadataProvider.getConditionMetadata(
      project.getCurrentPlatform(),
      'BooleanVariable'
    );

    // Simulate the type-switch flow: resetParametersAfterSwitch runs first
    // (sets "=" → "True"), then setupInstructionParameters runs and must leave
    // "True" intact rather than normalizing it back to "False".
    const instruction = makeInstruction('BooleanVariable', ['myVar', '=']);
    resetParametersAfterSwitch(instruction);
    setupInstructionParameters(
      project,
      projectScopedContainersAccessor,
      instruction,
      instructionMetadata
    );
    expect(instruction.getParameter(1).getPlainString()).toBe('True');

    project.delete();
  });
});

describe('resetParametersAfterSwitch', () => {
  describe('scene variable conditions', () => {
    it('BooleanVariable: resets stale relational operator to "True"', () => {
      const instruction = makeInstruction('BooleanVariable', ['myVar', '=']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('True');
    });

    it('BooleanVariable: keeps valid "True"', () => {
      const instruction = makeInstruction('BooleanVariable', ['myVar', 'True']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('True');
    });

    it('BooleanVariable: keeps valid "False"', () => {
      const instruction = makeInstruction('BooleanVariable', [
        'myVar',
        'False',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('False');
    });

    it('NumberVariable: resets "True" (stale from boolean) to "="', () => {
      const instruction = makeInstruction('NumberVariable', [
        'myVar',
        'True',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('NumberVariable: resets "startsWith" (stale from string) to "="', () => {
      const instruction = makeInstruction('NumberVariable', [
        'myVar',
        'startsWith',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('NumberVariable: keeps valid "="', () => {
      const instruction = makeInstruction('NumberVariable', [
        'myVar',
        '=',
        '42',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('NumberVariable: keeps valid "<"', () => {
      const instruction = makeInstruction('NumberVariable', [
        'myVar',
        '<',
        '42',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('<');
    });

    it('StringVariable: resets "True" (stale from boolean) to "="', () => {
      const instruction = makeInstruction('StringVariable', [
        'myVar',
        'True',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('StringVariable: resets "<" (invalid for string) to "="', () => {
      const instruction = makeInstruction('StringVariable', [
        'myVar',
        '<',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('StringVariable: keeps valid "startsWith"', () => {
      const instruction = makeInstruction('StringVariable', [
        'myVar',
        'startsWith',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('startsWith');
    });

    it('StringVariable: keeps valid "!="', () => {
      const instruction = makeInstruction('StringVariable', [
        'myVar',
        '!=',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('!=');
    });
  });

  describe('scene variable Set actions', () => {
    it('SetBooleanVariable: resets "=" (stale from number) to "True"', () => {
      const instruction = makeInstruction('SetBooleanVariable', [
        'myVar',
        '=',
        '',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('True');
    });

    it('SetBooleanVariable: keeps valid "True"', () => {
      const instruction = makeInstruction('SetBooleanVariable', [
        'myVar',
        'True',
        '',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('True');
    });

    it('SetBooleanVariable: keeps valid "Toggle"', () => {
      const instruction = makeInstruction('SetBooleanVariable', [
        'myVar',
        'Toggle',
        '',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('Toggle');
    });

    it('SetNumberVariable: resets "True" (stale from boolean) to "="', () => {
      const instruction = makeInstruction('SetNumberVariable', [
        'myVar',
        'True',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('SetNumberVariable: keeps valid "+"', () => {
      const instruction = makeInstruction('SetNumberVariable', [
        'myVar',
        '+',
        '1',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('+');
    });

    it('SetStringVariable: resets "True" (stale from boolean) to "="', () => {
      const instruction = makeInstruction('SetStringVariable', [
        'myVar',
        'True',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('SetStringVariable: resets "-" (invalid for string) to "="', () => {
      const instruction = makeInstruction('SetStringVariable', [
        'myVar',
        '-',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('=');
    });

    it('SetStringVariable: keeps valid "+"', () => {
      const instruction = makeInstruction('SetStringVariable', [
        'myVar',
        '+',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('+');
    });
  });

  describe('scene variable Push actions', () => {
    it('PushBoolean: resets stale expression to "True"', () => {
      const instruction = makeInstruction('PushBoolean', ['myVar', '42']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('True');
    });

    it('PushBoolean: keeps valid "False"', () => {
      const instruction = makeInstruction('PushBoolean', ['myVar', 'False']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('False');
    });

    it('PushNumber: clears "True" (stale from PushBoolean)', () => {
      const instruction = makeInstruction('PushNumber', ['myVar', 'True']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('');
    });

    it('PushNumber: clears "False" (stale from PushBoolean)', () => {
      const instruction = makeInstruction('PushNumber', ['myVar', 'False']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('');
    });

    it('PushNumber: keeps a valid expression', () => {
      const instruction = makeInstruction('PushNumber', ['myVar', '42']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('42');
    });

    it('PushString: clears "True" (stale from PushBoolean)', () => {
      const instruction = makeInstruction('PushString', ['myVar', 'True']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('');
    });

    it('PushString: keeps a valid expression', () => {
      const instruction = makeInstruction('PushString', ['myVar', '"hello"']);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(1).getPlainString()).toBe('"hello"');
    });
  });

  describe('object variable conditions', () => {
    it('BooleanObjectVariable: resets stale operator at param 2 to "True"', () => {
      const instruction = makeInstruction('BooleanObjectVariable', [
        'MyObj',
        'myVar',
        '=',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('True');
    });

    it('BooleanObjectVariable: keeps valid "False" at param 2', () => {
      const instruction = makeInstruction('BooleanObjectVariable', [
        'MyObj',
        'myVar',
        'False',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('False');
    });

    it('NumberObjectVariable: resets "True" (stale from boolean) to "=" at param 2', () => {
      const instruction = makeInstruction('NumberObjectVariable', [
        'MyObj',
        'myVar',
        'True',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('=');
    });

    it('NumberObjectVariable: keeps valid "<" at param 2', () => {
      const instruction = makeInstruction('NumberObjectVariable', [
        'MyObj',
        'myVar',
        '<',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('<');
    });

    it('StringObjectVariable: resets "<" (invalid for string) to "=" at param 2', () => {
      const instruction = makeInstruction('StringObjectVariable', [
        'MyObj',
        'myVar',
        '<',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('=');
    });

    it('StringObjectVariable: keeps valid "contains" at param 2', () => {
      const instruction = makeInstruction('StringObjectVariable', [
        'MyObj',
        'myVar',
        'contains',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('contains');
    });
  });

  describe('object variable Set actions', () => {
    it('SetBooleanObjectVariable: resets "=" (stale from number) to "True" at param 2', () => {
      const instruction = makeInstruction('SetBooleanObjectVariable', [
        'MyObj',
        'myVar',
        '=',
        '',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('True');
    });

    it('SetBooleanObjectVariable: keeps valid "Toggle" at param 2', () => {
      const instruction = makeInstruction('SetBooleanObjectVariable', [
        'MyObj',
        'myVar',
        'Toggle',
        '',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('Toggle');
    });

    it('SetNumberObjectVariable: resets "True" to "=" at param 2', () => {
      const instruction = makeInstruction('SetNumberObjectVariable', [
        'MyObj',
        'myVar',
        'True',
        '0',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('=');
    });

    it('SetStringObjectVariable: resets "-" (invalid for string) to "=" at param 2', () => {
      const instruction = makeInstruction('SetStringObjectVariable', [
        'MyObj',
        'myVar',
        '-',
        '"hi"',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('=');
    });
  });

  describe('object variable Push actions', () => {
    it('PushBooleanToObjectVariable: resets stale expression to "True" at param 2', () => {
      const instruction = makeInstruction('PushBooleanToObjectVariable', [
        'MyObj',
        'myVar',
        '42',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('True');
    });

    it('PushBooleanToObjectVariable: keeps valid "False" at param 2', () => {
      const instruction = makeInstruction('PushBooleanToObjectVariable', [
        'MyObj',
        'myVar',
        'False',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('False');
    });

    it('PushNumberToObjectVariable: clears "True" (stale from PushBoolean) at param 2', () => {
      const instruction = makeInstruction('PushNumberToObjectVariable', [
        'MyObj',
        'myVar',
        'True',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('');
    });

    it('PushStringToObjectVariable: clears "False" (stale from PushBoolean) at param 2', () => {
      const instruction = makeInstruction('PushStringToObjectVariable', [
        'MyObj',
        'myVar',
        'False',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('');
    });

    it('PushNumberToObjectVariable: keeps a valid expression at param 2', () => {
      const instruction = makeInstruction('PushNumberToObjectVariable', [
        'MyObj',
        'myVar',
        '42',
      ]);
      resetParametersAfterSwitch(instruction);
      expect(instruction.getParameter(2).getPlainString()).toBe('42');
    });
  });

  describe('non-switchable instruction types', () => {
    it('does nothing for an unknown instruction type', () => {
      const instruction = makeInstruction('PlayMusic', ['', '', '', '', '']);
      resetParametersAfterSwitch(instruction);
      // No throw, and params unchanged
      expect(instruction.getParameter(0).getPlainString()).toBe('');
    });
  });
});
