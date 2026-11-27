// @flow
import {
  filterExamples,
  filterGameTemplates,
  orderProjectTemplatesForBrowsing,
  orderProjectTemplatesForSearch,
} from './ProjectTemplatesOrdering';

const makeExample = (
  slug: string,
  { tags, noThumbnail }: {| tags?: Array<string>, noThumbnail?: boolean |} = {}
): any => ({
  id: slug,
  slug,
  name: slug,
  tags: tags || [],
  previewImageUrls: noThumbnail ? [] : ['https://example.com/preview.png'],
});
const makeGameTemplate = (id: string): any => ({ id, name: id });
const withScore = (item: any, score?: number): any => ({
  item,
  matches: [],
  score,
});
const getIds = (templates: Array<any>) => templates.map(({ id }) => id);

describe('ProjectTemplatesOrdering', () => {
  it('shows first starters, then alternates free, premium and starter', () => {
    const orderedTemplates = orderProjectTemplatesForBrowsing({
      examples: [
        makeExample('no-thumbnail', { noThumbnail: true }),
        makeExample('free-1'),
        makeExample('starting-1'),
        makeExample('starting-2'),
        makeExample('free-2'),
        makeExample('starting-3'),
        makeExample('free-3'),
      ],
      gameTemplates: [makeGameTemplate('premium-1')],
      firstStartersCount: 2,
    });

    expect(getIds(orderedTemplates)).toEqual([
      'starting-1',
      'starting-2',
      'free-1',
      'premium-1',
      'starting-3',
      'free-2',
      'free-3',
      'no-thumbnail',
    ]);
  });

  it('orders search results by score, whatever their type', () => {
    const orderedTemplates = orderProjectTemplatesForSearch({
      examples: [
        withScore(makeExample('starting-1'), 0.1),
        withScore(makeExample('no-thumbnail', { noThumbnail: true }), 0.2),
        withScore(makeExample('free-1'), 0.5),
      ],
      gameTemplates: [withScore(makeGameTemplate('premium-1'), 0.3)],
    });

    expect(getIds(orderedTemplates)).toEqual([
      'starting-1',
      'premium-1',
      'free-1',
      'no-thumbnail',
    ]);
  });

  it('filters by template type and complexity', () => {
    const examples = [
      withScore(makeExample('platformer', { tags: ['Starting point'] })),
      withScore(makeExample('starting-fps')),
      withScore(makeExample('game', { tags: ['game'] })),
      withScore(makeExample('feature')),
    ];
    const gameTemplates = [withScore(makeGameTemplate('premium-1'))];
    const getFilteredIds = (templateTypes: any, complexities: any) => [
      ...filterExamples(
        examples,
        new Set(templateTypes),
        new Set(complexities)
      ).map(({ item }) => item.id),
      ...filterGameTemplates(
        gameTemplates,
        new Set(templateTypes),
        new Set(complexities)
      ).map(({ item }) => item.id),
    ];

    expect(getFilteredIds([], [])).toHaveLength(5);
    expect(getFilteredIds(['premium'], [])).toEqual(['premium-1']);
    expect(getFilteredIds(['free'], [])).toHaveLength(4);
    expect(getFilteredIds([], ['basic-controls'])).toEqual(['platformer']);
    expect(getFilteredIds([], ['starter-template'])).toEqual(['starting-fps']);
    expect(getFilteredIds([], ['full-game'])).toEqual(['game', 'premium-1']);
    expect(getFilteredIds(['free'], ['full-game'])).toEqual(['game']);
  });
});
