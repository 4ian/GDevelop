// @flow
import { makeTestProject } from '../../fixtures/TestProject';
import { getEnumVariableForEditedValue } from './EnumVariableValueResolver';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const addEnumVariable = (
  variablesContainer: gdVariablesContainer,
  variableName: string
) => {
  const variable = new gd.Variable();
  variable.setString('Idle');
  variable.castTo('enum');
  const enumValues = new gd.VectorString();
  enumValues.push_back('Idle');
  enumValues.push_back('Running');
  variable.setEnumValues(enumValues);
  enumValues.delete();
  variablesContainer.insert(variableName, variable, 0);
  variable.delete();
};

const makeStringObjectVariableInstruction = (instructionType: string) => {
  const instruction = new gd.Instruction();
  instruction.setType(instructionType);
  instruction.setParametersCount(4);
  instruction.setParameter(0, 'MySpriteObject');
  instruction.setParameter(1, 'State');
  instruction.setParameter(2, '=');
  instruction.setParameter(3, '"Idle"');
  return instruction;
};

const makeStringVariableInstruction = (instructionType: string) => {
  const instruction = new gd.Instruction();
  instruction.setType(instructionType);
  instruction.setParametersCount(3);
  instruction.setParameter(0, 'State');
  instruction.setParameter(1, '=');
  instruction.setParameter(2, '"Idle"');
  return instruction;
};

describe('EnumVariableValueField', () => {
  it('finds enum values for current object variable string instructions', () => {
    const testProject = makeTestProject(gd);
    addEnumVariable(testProject.spriteObject.getVariables(), 'State');

    for (const instructionType of [
      'SetStringObjectVariable',
      'StringObjectVariable',
    ]) {
      const enumVariable = getEnumVariableForEditedValue(
        ({
          instruction: makeStringObjectVariableInstruction(instructionType),
          parameterIndex: 3,
          globalObjectsContainer: testProject.project.getObjects(),
          objectsContainer: testProject.testLayout.getObjects(),
          projectScopedContainersAccessor:
            testProject.testSceneProjectScopedContainersAccessor,
        }: any)
      );

      expect(enumVariable).not.toBe(null);
      expect(enumVariable && enumVariable.enumValues).toEqual([
        'Idle',
        'Running',
      ]);
    }
  });

  it('finds enum values for behavior choice properties edited as variables', () => {
    const testProject = makeTestProject(gd);
    const extension = testProject.project.insertNewEventsFunctionsExtension(
      'MyExtension',
      0
    );
    const eventsBasedBehavior = extension
      .getEventsBasedBehaviors()
      .insertNew('MyBehavior', 0);
    const eventsFunction = eventsBasedBehavior
      .getEventsFunctions()
      .insertNewEventsFunction('MyFunction', 0);

    const property = eventsBasedBehavior
      .getPropertyDescriptors()
      .insertNew('State', 0);
    property.setType('Choice');
    property.addChoice('Idle', 'Idle');
    property.addChoice('Running', 'Running');

    gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
      extension,
      eventsBasedBehavior
    );

    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project: testProject.project,
        eventsFunctionsExtension: extension,
        eventsBasedBehavior,
        eventsFunction,
      },
      new gd.ObjectsContainer(gd.ObjectsContainer.Function),
      new gd.VariablesContainer(gd.VariablesContainer.Parameters),
      new gd.VariablesContainer(gd.VariablesContainer.Properties),
      new gd.ResourcesContainer(gd.ResourcesContainer.Parameters),
      new gd.ResourcesContainer(gd.ResourcesContainer.Properties)
    );

    const enumVariable = getEnumVariableForEditedValue(
      ({
        instruction: makeStringVariableInstruction('SetStringVariable'),
        parameterIndex: 2,
        globalObjectsContainer: testProject.project.getObjects(),
        objectsContainer: testProject.testLayout.getObjects(),
        projectScopedContainersAccessor,
      }: any)
    );

    expect(enumVariable).not.toBe(null);
    expect(enumVariable && enumVariable.enumValues).toEqual([
      'Idle',
      'Running',
    ]);
  });
});
