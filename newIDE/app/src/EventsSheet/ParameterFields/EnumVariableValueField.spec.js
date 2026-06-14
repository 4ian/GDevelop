// @flow
import { makeTestProject } from '../../fixtures/TestProject';
import { getEnumVariableForEditedValue } from './EnumVariableValueResolver';

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
});
