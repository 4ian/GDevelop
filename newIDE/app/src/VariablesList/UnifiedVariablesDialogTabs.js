// @flow
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

export type ObjectVariableTab = {|
  id: string,
  objectName: string,
  variablesContainer: gdVariablesContainer,
  initialInstances: gdInitialInstancesContainer | null,
|};

export const enumerateObjectVariableTabs = ({
  projectScopedContainersAccessor,
  initialInstances,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  initialInstances: gdInitialInstancesContainer | null,
|}): Array<ObjectVariableTab> => {
  const objectsContainersList = projectScopedContainersAccessor
    .get()
    .getObjectsContainersList();
  const objectVariableTabs = [];

  for (
    let containerIndex = 0;
    containerIndex < objectsContainersList.getObjectsContainersCount();
    containerIndex++
  ) {
    const objectsContainer = objectsContainersList.getObjectsContainer(
      containerIndex
    );
    if (objectsContainer.getSourceType() === gd.ObjectsContainer.Function) {
      continue;
    }

    for (
      let objectIndex = 0;
      objectIndex < objectsContainer.getObjectsCount();
      objectIndex++
    ) {
      const object = objectsContainer.getObjectAt(objectIndex);
      const objectName = object.getName();
      objectVariableTabs.push({
        id: `object-variables-${containerIndex}-${objectName}`,
        objectName,
        variablesContainer: object.getVariables(),
        initialInstances,
      });
    }
  }

  return objectVariableTabs.sort(
    (firstTab, secondTab) =>
      secondTab.variablesContainer.count() - firstTab.variablesContainer.count()
  );
};
