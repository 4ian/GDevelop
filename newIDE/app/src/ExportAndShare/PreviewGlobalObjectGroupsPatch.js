// @flow
import { serializeToJSObject } from '../Utils/Serializer';

const projectDataPrefix = 'gdjs.projectData = ';
const runtimeGameOptionsPrefix = ';\ngdjs.runtimeGameOptions = ';

const getSerializedGlobalObjectGroups = (project: gdProject): Array<any> =>
  serializeToJSObject(project.getObjects().getObjectGroups());

export const addGlobalObjectGroupsToProjectData = (
  project: gdProject,
  projectData: any
): any => {
  projectData.objectsGroups = getSerializedGlobalObjectGroups(project);
  return projectData;
};

export const addGlobalObjectGroupsToDataJs = (
  project: gdProject,
  dataJsContent: string
): string => {
  const projectDataStartIndex = dataJsContent.indexOf(projectDataPrefix);
  if (projectDataStartIndex < 0) {
    return dataJsContent;
  }

  const serializedProjectDataStartIndex =
    projectDataStartIndex + projectDataPrefix.length;
  const runtimeGameOptionsStartIndex = dataJsContent.indexOf(
    runtimeGameOptionsPrefix,
    serializedProjectDataStartIndex
  );
  if (runtimeGameOptionsStartIndex < 0) {
    return dataJsContent;
  }

  try {
    const projectData = JSON.parse(
      dataJsContent.substring(
        serializedProjectDataStartIndex,
        runtimeGameOptionsStartIndex
      )
    );
    addGlobalObjectGroupsToProjectData(project, projectData);

    return (
      dataJsContent.substring(0, serializedProjectDataStartIndex) +
      JSON.stringify(projectData) +
      dataJsContent.substring(runtimeGameOptionsStartIndex)
    );
  } catch (error) {
    console.error(
      'Unable to add global object groups to preview project data.',
      error
    );
    return dataJsContent;
  }
};
