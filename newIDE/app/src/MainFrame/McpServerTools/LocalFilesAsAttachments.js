// @flow
import {
  getPublicApi,
  type PublicApiFunction,
} from '../../EditorFunctions/PublicApi';

// No user attaches files to an agent using the MCP server: where the GDevelop
// AI is given the ids of attached files, paths of local files are given.

const localFilePathDescription =
  'The absolute path of a file of this computer. A file already in the folder of a project saved on this computer is used where it is; any other file is copied in the project.';
const addedResourcesDescription =
  'Files of this computer to add as new resources of the project. Then, use the name of the new resource where it is needed (an object property, an effect parameter, events...).';
const replacingFileDescription = `${localFilePathDescription} It becomes the file of this resource: the resource keeps its name, so every object, effect and event using it uses the new file. The file must be of the same kind (an image for an image resource, a font for a font...).`;
const describeFunction = (description: string): string =>
  description
    .replace(
      'add the files attached by the user to the resources of the project',
      'add files of this computer to the resources of the project (`attachment_id` is then the absolute path of the file)'
    )
    .replace(
      'a file attached by the user must first be added',
      'a file of this computer must first be added'
    );

export const describeLocalFilesInsteadOfAttachments = (
  publicApiFunction: PublicApiFunction
): PublicApiFunction => {
  if (publicApiFunction.name !== 'change_project_properties_resources')
    return {
      ...publicApiFunction,
      description: describeFunction(publicApiFunction.description),
    };
  const inputSchema = JSON.parse(JSON.stringify(publicApiFunction.inputSchema));
  const { added_resources, changed_resources } = inputSchema.properties;
  added_resources.description = addedResourcesDescription;
  added_resources.items.properties.attachment_id.description = localFilePathDescription;
  changed_resources.items.properties.replace_file_with_attachment_id.description = replacingFileDescription;
  return {
    ...publicApiFunction,
    description: describeFunction(publicApiFunction.description),
    inputSchema,
  };
};

export const getScriptApiDefinitionWithLocalFiles = (): string => {
  const { scriptApiDefinition, functions } = getPublicApi();
  const resourcesFunction = functions.find(
    ({ name }) => name === 'change_project_properties_resources'
  );
  if (!resourcesFunction) return scriptApiDefinition;
  const {
    added_resources,
    changed_resources,
  } = resourcesFunction.inputSchema.properties;
  return [
    [added_resources.description, addedResourcesDescription],
    [
      added_resources.items.properties.attachment_id.description,
      localFilePathDescription,
    ],
    [
      changed_resources.items.properties.replace_file_with_attachment_id
        .description,
      replacingFileDescription,
    ],
    [
      resourcesFunction.description,
      describeFunction(resourcesFunction.description),
    ],
  ].reduce(
    (definition, [description, localFilesDescription]) =>
      definition.replace(description, localFilesDescription),
    describeFunction(scriptApiDefinition)
  );
};
