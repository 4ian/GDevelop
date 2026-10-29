// @flow
import { type McpServerTool } from './McpServerTool';

export type McpFoundResource = {|
  name: string,
  tags: Array<string>,
  // Like the duration of an audio file, or the alphabets of a font.
  metadata: ?Object,
|};

// Searches the free resources (sounds, musics, fonts) installed by name.
export type McpSearchResources = ({|
  searchTerms: string,
  resourceKind: 'audio' | 'font',
|}) => Promise<Array<McpFoundResource>>;

const MAX_FOUND_RESOURCES = 10;

export const makeResourceStoreTools = (
  searchResources: McpSearchResources
): Array<McpServerTool> => [
  {
    definition: {
      name: 'search_resource_store',
      description:
        'Search the GDevelop resource store for free audio files (sounds or musics) or fonts. Returns up to 10 resources with their name, tags and metadata (for audio: the duration in seconds and whether it is a `sound` or a `music`; for fonts: the supported alphabets). ' +
        'Use the exact `name` of the chosen resource where it is used (like a "play a sound" action of `generate_events`, or the font property of a text object): it is then installed in the project from the store. Only searches: it does not change the project.',
      inputSchema: {
        type: 'object',
        properties: {
          search_terms: {
            type: 'string',
            description:
              'Single words separated by commas, the most generic first. For example: `explosion, retro`, `music, calm, piano` or `pixel, bold`.',
          },
          resource_kind: {
            type: 'string',
            enum: ['audio', 'font'],
            description: '`audio` for sounds and musics, `font` for fonts.',
          },
        },
        required: ['search_terms', 'resource_kind'],
      },
      annotations: { readOnlyHint: true },
    },
    // The found resources are only useful to change the project.
    isAvailable: ({ isReadOnly }) => !isReadOnly,
    call: async toolArguments => {
      const searchTerms =
        typeof toolArguments.search_terms === 'string'
          ? toolArguments.search_terms.trim()
          : '';
      const resourceKind = toolArguments.resource_kind;
      if (!searchTerms) {
        return { value: { message: 'Missing `search_terms`.' }, isError: true };
      }
      if (resourceKind !== 'audio' && resourceKind !== 'font') {
        return {
          value: { message: '`resource_kind` must be `audio` or `font`.' },
          isError: true,
        };
      }
      const foundResources = await searchResources({
        searchTerms,
        resourceKind,
      });
      return {
        value: foundResources.length
          ? { resources: foundResources.slice(0, MAX_FOUND_RESOURCES) }
          : {
              resources: [],
              message:
                'Nothing found: try other search terms, more generic or fewer.',
            },
        isError: false,
      };
    },
  },
];
