// @flow
import { type McpServerTool, describeProject } from './McpServerTool';

export type McpGameTemplate = {|
  slug: string,
  name: string,
  shortDescription: string,
  tags: Array<string>,
|};

// Creates the project, opened in the editor, and saves it.
export type McpCreateProject = ({|
  name: string,
  templateSlug: string | null,
|}) => Promise<{| success: boolean, message: string |}>;

export type McpProjectCreation = {|
  listGameTemplates: () => Promise<Array<McpGameTemplate>>,
  createProject: McpCreateProject,
|};

const MAX_LISTED_GAME_TEMPLATES = 60;

const filterGameTemplates = (
  templates: Array<McpGameTemplate>,
  search: string
): Array<McpGameTemplate> => {
  const words = search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return templates;
  return templates.filter(template => {
    const text = [template.name, template.shortDescription, ...template.tags]
      .join(' ')
      .toLowerCase();
    return words.every(word => text.includes(word));
  });
};

export const makeProjectCreationTools = (
  projectCreation: McpProjectCreation
): Array<McpServerTool> => [
  {
    definition: {
      name: 'list_game_templates',
      description:
        'List the game templates (examples) a new project can start from, with `create_project`. Only useful when no project is opened in the editor.',
      inputSchema: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description:
              'Optional: only list the templates whose name, description or tags contain all these words (separated by spaces), like "platformer" or "3d racing".',
          },
        },
      },
      annotations: { readOnlyHint: true },
    },
    isAvailable: () => true,
    call: async toolArguments => {
      const templates = filterGameTemplates(
        await projectCreation.listGameTemplates(),
        typeof toolArguments.search === 'string' ? toolArguments.search : ''
      );
      return {
        value: {
          // The tags (the features used by the template) are only searched.
          templates: templates
            .slice(0, MAX_LISTED_GAME_TEMPLATES)
            .map(({ slug, name, shortDescription }) => ({
              slug,
              name,
              shortDescription,
            })),
          ...(templates.length > MAX_LISTED_GAME_TEMPLATES
            ? {
                message: `${templates.length -
                  MAX_LISTED_GAME_TEMPLATES} more templates: use \`search\` to find others.`,
              }
            : {}),
        },
        isError: false,
      };
    },
  },
  {
    definition: {
      name: 'create_project',
      description:
        'Create a new game project, opened in the editor, from a game template (see `list_game_templates`) or empty. Only possible when no project is opened in the editor (the user can open an existing one instead: ask first if they want a new game). The project is saved in the GDevelop cloud projects of the user (they must be logged in); call `save_project` afterwards to save the changes.',
      inputSchema: {
        type: 'object',
        properties: {
          project_name: {
            type: 'string',
            description: 'The name of the game.',
          },
          template_slug: {
            type: 'string',
            description:
              'Optional: the `slug` of the game template to start from, from `list_game_templates`. If not set, the project is empty (one scene).',
          },
        },
        required: ['project_name'],
      },
    },
    isAvailable: () => true,
    opensProject: true,
    noOpenedProjectHint:
      'if they want a new game, create it with `create_project`',
    call: async (toolArguments, { getOpenedProject }) => {
      const openedProject = getOpenedProject ? getOpenedProject() : null;
      if (openedProject) {
        return {
          value: {
            message: `Nothing was done: a project is already opened in the editor (${describeProject(
              openedProject
            )}). A new project can only be created when none is opened: work on this one, or ask the user to close it first.`,
          },
          isError: true,
        };
      }
      const projectName =
        typeof toolArguments.project_name === 'string'
          ? toolArguments.project_name.trim()
          : '';
      if (!projectName) {
        return { value: { message: 'Missing `project_name`.' }, isError: true };
      }
      const result = await projectCreation.createProject({
        name: projectName,
        templateSlug:
          typeof toolArguments.template_slug === 'string' &&
          toolArguments.template_slug.trim()
            ? toolArguments.template_slug.trim()
            : null,
      });
      return { value: result, isError: !result.success };
    },
  },
];
