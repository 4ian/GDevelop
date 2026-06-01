// @flow
import commandsList, { type CommandName } from '../CommandPalette/CommandsList';
import {
  getMcpPrompts,
  getMcpResources,
  getMcpTools,
  canCallMcpTool,
  type McpPermissionOptions,
} from './McpToolCatalog';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import { serializeToJSON } from '../Utils/Serializer';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import { mapFor } from '../Utils/MapFor';
import { type EditorCallbacks } from '../EditorFunctions';
import {
  getEventOperationReference,
  getEventsJsonExamples,
  getExactInstructionMetadata,
  searchInstructionMetadata,
  validateEventsJson,
} from './McpEventKnowledge';
import {
  createOrUpdateExtension,
  createOrUpdateExtensionBehavior,
  createOrUpdateExtensionFunction,
  createOrUpdateExtensionObject,
  createOrUpdateExtensionProperty,
  deleteExtension,
  deleteExtensionBehavior,
  deleteExtensionFunction,
  deleteExtensionObject,
  deleteExtensionProperty,
  inspectExtensionBehavior,
  inspectExtensionFunction,
  inspectExtensionObject,
  inspectExtensionProperty,
  inspectProjectExtension,
  listProjectExtensions,
} from './McpExtensionTools';

const gd: libGDevelop = global.gd;

const getDefaultProcessEditorFunctionCalls = (): Function => {
  // Lazily require the runner so focused MCP unit tests do not load the full
  // rendering stack pulled by EditorFunctionCallRunner.
  // $FlowFixMe[unsupported-syntax]
  return require('../EditorFunctions/EditorFunctionCallRunner')
    .processEditorFunctionCalls;
};

type RendererMcpRequest = {|
  method: string,
  params: any,
|};

type McpTextContent = {|
  type: 'text',
  text: string,
|};

type McpToolResult = {|
  content: Array<McpTextContent>,
  isError?: boolean,
|};

type McpEditorBridgeContext = {|
  getProject: () => ?gdProject,
  getPermissions: () => McpPermissionOptions,
  i18n: any,
  editorCallbacks: EditorCallbacks,
  processEditorFunctionCalls?: Function,
  triggerUnsavedChanges: () => void,
  runCommand: string => boolean,
  getEditorSelection?: () => Object,
  generateEvents?: Function,
  onSceneEventsModifiedOutsideEditor?: Function,
  onInstancesModifiedOutsideEditor?: Function,
  onObjectsModifiedOutsideEditor?: Function,
  onObjectGroupsModifiedOutsideEditor?: Function,
  ensureExtensionInstalled?: Function,
  onWillInstallExtension?: Function,
  onExtensionInstalled?: Function,
  searchAndInstallAsset?: Function,
  searchAndInstallResources?: Function,
  getAssetStoreTagForNewObject?: string => string | null,
|};

type McpEditorBridge = {|
  handleRendererMcpRequest: RendererMcpRequest => Promise<any>,
|};

const textResult = (payload: any): McpToolResult => ({
  content: [
    {
      type: 'text',
      text:
        typeof payload === 'string'
          ? payload
          : JSON.stringify(payload, null, 2),
    },
  ],
});

const errorResult = (message: string): McpToolResult => ({
  isError: true,
  content: [
    {
      type: 'text',
      text: message,
    },
  ],
});

const mcpDirectEventsRequiredMessage =
  'MCP add_scene_events writes events directly and does not call the GDevelop event generation service. Pass events_json or event_changes.';

const truncateText = (text: string, maxLength?: number): string => {
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(
    0,
    maxLength
  )}\n\n[Truncated by GDevelop MCP server at ${maxLength} characters.]`;
};

const getSceneNames = (project: gdProject): Array<string> =>
  mapFor(0, project.getLayoutsCount(), index =>
    project.getLayoutAt(index).getName()
  );

const getObjectNames = (objectsContainer: gdObjectsContainer): Array<string> =>
  mapFor(0, objectsContainer.getObjectsCount(), index =>
    objectsContainer.getObjectAt(index).getName()
  );

const getEditorState = (
  project: ?gdProject,
  permissions: McpPermissionOptions
) => {
  if (!project) {
    return {
      hasProject: false,
      permissions,
    };
  }

  return {
    hasProject: true,
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    sceneNames: getSceneNames(project),
    permissions,
  };
};

const getProjectSummary = (project: gdProject, sceneName?: ?string): Object => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
  return {
    projectName: project.getName(),
    projectUuid: project.getProjectUuid(),
    ...simplifiedProjectBuilder.getSimplifiedProject(project, {
      scopeToScene: sceneName || undefined,
    }),
  };
};

const getProjectExtensionsSummary = (project: gdProject): Object => {
  const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
  return simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(project);
};

const getObjectsSummary = (project: gdProject, sceneName?: ?string): Object => {
  const result: Object = {
    globalObjects: getObjectNames(project.getObjects()),
  };

  if (sceneName) {
    if (!project.hasLayoutNamed(sceneName)) {
      return {
        ...result,
        error: `Scene not found: "${sceneName}".`,
      };
    }

    const scene = project.getLayout(sceneName);
    result.sceneName = sceneName;
    result.sceneObjects = getObjectNames(scene.getObjects());
    return result;
  }

  result.scenes = getSceneNames(project).map(name => {
    const scene = project.getLayout(name);
    return {
      sceneName: name,
      sceneObjects: getObjectNames(scene.getObjects()),
    };
  });
  return result;
};

const getCommandSummaries = () =>
  Object.keys(commandsList).map(commandName => {
    const commandMetadata = commandsList[((commandName: any): CommandName)];
    const { displayText } = commandMetadata;
    return {
      commandName,
      area: commandMetadata.area,
      displayText:
        typeof displayText === 'string'
          ? displayText
          : displayText && displayText.id,
      handledByElectron: !!commandMetadata.handledByElectron,
    };
  });

const getPrompt = (name: string) => {
  const prompt = getMcpPrompts().find(prompt => prompt.name === name);
  if (!prompt) return null;

  return {
    description: prompt.description,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt.description,
        },
      },
    ],
  };
};

const getResourceContent = async (
  uri: string,
  context: McpEditorBridgeContext
) => {
  const project = context.getProject();
  const permissions = context.getPermissions();

  if (uri === 'gdevelop://editor/state') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getEditorState(project, permissions), null, 2),
    };
  }

  if (!project) {
    throw new Error('No project opened.');
  }

  if (uri === 'gdevelop://project/summary') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getProjectSummary(project), null, 2),
    };
  }

  if (uri === 'gdevelop://project/json') {
    return {
      uri,
      mimeType: 'application/json',
      text: serializeToJSON(project),
    };
  }

  if (uri === 'gdevelop://project/extensions-summary') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getProjectExtensionsSummary(project), null, 2),
    };
  }

  const sceneResourceMatch = uri.match(
    /^gdevelop:\/\/scene\/([^/]+)\/(events\.txt|instances\.json|objects\.json)$/
  );
  if (!sceneResourceMatch) {
    throw new Error(`Unknown GDevelop MCP resource: ${uri}`);
  }

  const sceneName = decodeURIComponent(sceneResourceMatch[1]);
  const resourceKind = sceneResourceMatch[2];
  if (!project.hasLayoutNamed(sceneName)) {
    throw new Error(`Scene not found: "${sceneName}".`);
  }

  if (resourceKind === 'events.txt') {
    return {
      uri,
      mimeType: 'text/plain',
      text: renderNonTranslatedEventsAsText({
        eventsList: project.getLayout(sceneName).getEvents(),
      }),
    };
  }

  if (resourceKind === 'objects.json') {
    return {
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(getObjectsSummary(project, sceneName), null, 2),
    };
  }

  const instancesResult = await callMcpTool({
    toolName: 'describe_instances',
    args: { scene_name: sceneName },
    context,
  });
  return {
    uri,
    mimeType: 'application/json',
    text: instancesResult.content[0].text,
  };
};

const callEditorFunction = async ({
  toolName,
  args,
  context,
}: {|
  toolName: string,
  args: Object,
  context: McpEditorBridgeContext,
|}): Promise<McpToolResult> => {
  const project = context.getProject();
  const processEditorFunctionCalls =
    context.processEditorFunctionCalls ||
    getDefaultProcessEditorFunctionCalls();

  const { results } = await processEditorFunctionCalls({
    project,
    i18n: context.i18n,
    editorCallbacks: context.editorCallbacks,
    toolOptions: { includeEventsJson: true },
    functionCalls: [
      {
        name: toolName,
        arguments: JSON.stringify(args || {}),
        call_id: 'mcp-call',
      },
    ],
    relatedAiRequestId: 'mcp',
    getRelatedAiRequestLastMessages: () => ({
      lastUserMessage: null,
      lastAssistantMessages: [],
    }),
    generateEvents:
      context.generateEvents ||
      (async () => ({
        generationCompleted: false,
        errorMessage: 'Event generation is not available through MCP.',
      })),
    onSceneEventsModifiedOutsideEditor:
      context.onSceneEventsModifiedOutsideEditor || (() => {}),
    onInstancesModifiedOutsideEditor:
      context.onInstancesModifiedOutsideEditor || (() => {}),
    onObjectsModifiedOutsideEditor:
      context.onObjectsModifiedOutsideEditor || (() => {}),
    onObjectGroupsModifiedOutsideEditor:
      context.onObjectGroupsModifiedOutsideEditor || (() => {}),
    ensureExtensionInstalled:
      context.ensureExtensionInstalled || (async () => {}),
    onWillInstallExtension: context.onWillInstallExtension || (() => {}),
    onExtensionInstalled: context.onExtensionInstalled || (() => {}),
    searchAndInstallAsset:
      context.searchAndInstallAsset ||
      (async () => ({
        status: 'error',
        message: 'Asset search is not available through MCP.',
        createdObjects: [],
        assetShortHeader: null,
        isTheFirstOfItsTypeInProject: false,
      })),
    searchAndInstallResources:
      context.searchAndInstallResources ||
      (async () => ({
        results: [],
      })),
    getAssetStoreTagForNewObject:
      context.getAssetStoreTagForNewObject || (() => null),
  });

  const firstResult = results[0];
  if (!firstResult) {
    return errorResult('The editor function did not return a result.');
  }

  if (firstResult.status === 'aborted') {
    return errorResult('The editor function was aborted.');
  }

  if (firstResult.status === 'working') {
    return textResult(firstResult);
  }

  if (firstResult.didModifyProject) {
    context.triggerUnsavedChanges();
  }

  return firstResult.success
    ? textResult(firstResult.output)
    : errorResult(
        firstResult.output && firstResult.output.message
          ? firstResult.output.message
          : JSON.stringify(firstResult.output || {}, null, 2)
      );
};

const callMcpTool = async ({
  toolName,
  args,
  context,
}: {|
  toolName: string,
  args: Object,
  context: McpEditorBridgeContext,
|}): Promise<McpToolResult> => {
  const permissions = context.getPermissions();
  const targetToolName =
    toolName === 'gdevelop_editor_call' && args && typeof args.name === 'string'
      ? args.name
      : toolName;
  const permission = canCallMcpTool(targetToolName, permissions);
  if (!permission.canCall) {
    return errorResult(permission.reason || 'MCP tool is not allowed.');
  }

  const project = context.getProject();

  if (toolName === 'gdevelop_get_editor_state') {
    return textResult(getEditorState(project, permissions));
  }

  if (toolName === 'gdevelop_get_editor_selection') {
    return textResult(
      context.getEditorSelection
        ? context.getEditorSelection()
        : {
            hasActiveSelectionProvider: false,
            selections: [],
            primarySelection: null,
          }
    );
  }

  if (toolName === 'gdevelop_get_project_summary') {
    if (!project) return errorResult('No project opened.');
    return textResult(getProjectSummary(project, args.sceneName));
  }

  if (toolName === 'gdevelop_read_project_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      truncateText(serializeToJSON(project), args.maxLength || undefined)
    );
  }

  if (toolName === 'gdevelop_list_scenes') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getSceneNames(project).map(sceneName => ({
        sceneName,
      }))
    );
  }

  if (toolName === 'gdevelop_list_objects') {
    if (!project) return errorResult('No project opened.');
    return textResult(getObjectsSummary(project, args.sceneName));
  }

  if (toolName === 'gdevelop_list_extensions') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(listProjectExtensions(project));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectProjectExtension(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_function') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionFunction(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_behavior') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionBehavior(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_object') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionObject(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_inspect_extension_property') {
    if (!project) return errorResult('No project opened.');
    try {
      return textResult(inspectExtensionProperty(project, args || {}));
    } catch (error) {
      return errorResult(error.message);
    }
  }

  if (toolName === 'gdevelop_list_commands') {
    return textResult(getCommandSummaries());
  }

  if (toolName === 'gdevelop_get_events_json_examples') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getEventsJsonExamples({
        project,
        sceneName:
          args && typeof args.scene_name === 'string' ? args.scene_name : null,
        includeExistingSceneEvents: !!(
          args && args.include_existing_scene_events
        ),
      })
    );
  }

  if (toolName === 'gdevelop_get_event_operation_reference') {
    return textResult(getEventOperationReference());
  }

  if (toolName === 'gdevelop_validate_events_json') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      validateEventsJson({
        project,
        sceneName:
          args && typeof args.scene_name === 'string' ? args.scene_name : null,
        eventsJson:
          args && typeof args.events_json === 'string'
            ? args.events_json
            : null,
      })
    );
  }

  if (toolName === 'gdevelop_search_instruction_metadata') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      searchInstructionMetadata({
        project,
        i18n: context.i18n,
        query: args && typeof args.query === 'string' ? args.query : null,
        kind: args && typeof args.kind === 'string' ? args.kind : null,
        limit: args && typeof args.limit === 'number' ? args.limit : null,
      })
    );
  }

  if (toolName === 'gdevelop_get_instruction_metadata') {
    if (!project) return errorResult('No project opened.');
    return textResult(
      getExactInstructionMetadata({
        project,
        type: args && typeof args.type === 'string' ? args.type : null,
        kind: args && typeof args.kind === 'string' ? args.kind : null,
      })
    );
  }

  if (toolName === 'gdevelop_run_command') {
    const commandName =
      args && typeof args.commandName === 'string' ? args.commandName : '';
    if (!commandName) return errorResult('Missing commandName.');
    const commandMetadata = commandsList[((commandName: any): CommandName)];
    if (!commandMetadata) {
      return errorResult(`Unknown command: ${commandName}.`);
    }
    const didRun = context.runCommand(commandName);
    return didRun
      ? textResult({ commandName, launched: true })
      : errorResult(`Unknown or unavailable command: ${commandName}.`);
  }

  if (toolName === 'gdevelop_editor_call') {
    if (!args || typeof args.name !== 'string') {
      return errorResult('Missing EditorFunction name.');
    }
    const editorFunctionArgs =
      args.arguments && typeof args.arguments === 'object'
        ? args.arguments
        : {};
    if (
      (args.name === 'add_scene_events' || args.name === 'generate_events') &&
      !editorFunctionArgs.events_json &&
      !editorFunctionArgs.event_changes
    ) {
      return errorResult(mcpDirectEventsRequiredMessage);
    }
    return callEditorFunction({
      toolName: args.name,
      args: editorFunctionArgs,
      context,
    });
  }

  if (
    (toolName === 'add_scene_events' || toolName === 'generate_events') &&
    !args.events_json &&
    !args.event_changes
  ) {
    return errorResult(mcpDirectEventsRequiredMessage);
  }

  let extensionWriteToolHandler = null;
  if (toolName === 'gdevelop_create_or_update_extension') {
    extensionWriteToolHandler = createOrUpdateExtension;
  } else if (toolName === 'gdevelop_delete_extension') {
    extensionWriteToolHandler = deleteExtension;
  } else if (toolName === 'gdevelop_create_or_update_extension_function') {
    extensionWriteToolHandler = createOrUpdateExtensionFunction;
  } else if (toolName === 'gdevelop_delete_extension_function') {
    extensionWriteToolHandler = deleteExtensionFunction;
  } else if (toolName === 'gdevelop_create_or_update_extension_behavior') {
    extensionWriteToolHandler = createOrUpdateExtensionBehavior;
  } else if (toolName === 'gdevelop_delete_extension_behavior') {
    extensionWriteToolHandler = deleteExtensionBehavior;
  } else if (toolName === 'gdevelop_create_or_update_extension_object') {
    extensionWriteToolHandler = createOrUpdateExtensionObject;
  } else if (toolName === 'gdevelop_delete_extension_object') {
    extensionWriteToolHandler = deleteExtensionObject;
  } else if (toolName === 'gdevelop_create_or_update_extension_property') {
    extensionWriteToolHandler = createOrUpdateExtensionProperty;
  } else if (toolName === 'gdevelop_delete_extension_property') {
    extensionWriteToolHandler = deleteExtensionProperty;
  }

  if (extensionWriteToolHandler) {
    if (!project) return errorResult('No project opened.');
    try {
      const result = extensionWriteToolHandler(project, args || {});
      context.triggerUnsavedChanges();
      return textResult(result);
    } catch (error) {
      return errorResult(error.message);
    }
  }

  return callEditorFunction({
    toolName,
    args: args || {},
    context,
  });
};

export const createMcpEditorBridge = (
  context: McpEditorBridgeContext
): McpEditorBridge => ({
  handleRendererMcpRequest: async ({
    method,
    params,
  }: RendererMcpRequest): Promise<any> => {
    const permissions = context.getPermissions();

    if (method === 'tools/list') {
      return {
        tools: getMcpTools(permissions),
      };
    }

    if (method === 'resources/list') {
      return {
        resources: getMcpResources(),
      };
    }

    if (method === 'prompts/list') {
      return {
        prompts: getMcpPrompts(),
      };
    }

    if (method === 'prompts/get') {
      const prompt = getPrompt(params && params.name);
      if (!prompt)
        throw new Error(`Unknown GDevelop MCP prompt: ${params.name}`);
      return prompt;
    }

    if (method === 'resources/read') {
      const uri = params && params.uri;
      if (typeof uri !== 'string') throw new Error('Missing resource uri.');
      const content = await getResourceContent(uri, context);
      return {
        contents: [content],
      };
    }

    if (method === 'tools/call') {
      const toolName = params && params.name;
      if (typeof toolName !== 'string') throw new Error('Missing tool name.');
      return callMcpTool({
        toolName,
        args:
          params.arguments && typeof params.arguments === 'object'
            ? params.arguments
            : {},
        context,
      });
    }

    throw new Error(`Unsupported renderer MCP method: ${method}`);
  },
});
