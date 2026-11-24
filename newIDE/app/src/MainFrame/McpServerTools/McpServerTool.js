// @flow

export type McpTool = {|
  name: string,
  description: string,
  inputSchema: Object,
  annotations?: {| readOnlyHint: boolean |},
|};

export type McpOpenedProject = {|
  name: string,
  // The file path (or cloud identifier) of the project, if saved.
  location: string | null,
  // The cloud identifier means nothing to the agent: it is not shown.
  isCloudProject?: boolean,
|};

export const describeProject = (project: McpOpenedProject): string =>
  `"${project.name}"` +
  (project.isCloudProject
    ? ' (a cloud project)'
    : project.location
    ? ` (${project.location})`
    : '');

export type McpServerToolOutput = {| value: any, isError: boolean |};

/**
 * A tool of the MCP server resolved without the editor functions (which are
 * the tools of the GDevelop AI): the docs, the project creation, the search
 * of the resources... Called even when no project is opened.
 */
export type McpServerTool = {|
  definition: McpTool,
  isAvailable: ({| isReadOnly: boolean |}) => boolean,
  call: (
    toolArguments: Object,
    context: {|
      // Absent when the project can't change during the session.
      getOpenedProject: ?() => ?McpOpenedProject,
    |}
  ) => Promise<McpServerToolOutput>,
  // A successful call opens another project, which the next calls act on.
  opensProject?: boolean,
  // Told to the agent when a tool needs a project and none is opened.
  noOpenedProjectHint?: string,
|};
