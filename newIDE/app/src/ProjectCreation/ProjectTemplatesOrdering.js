// @flow
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { type SearchResult } from '../UI/Search/UseSearchStructuredItem';

export type TemplateType = 'free' | 'premium';
export type TemplateComplexity =
  | 'basic-controls'
  | 'starter-template'
  | 'full-game';

export type ProjectTemplate =
  | ExampleShortHeader
  | PrivateGameTemplateListingData;

// To remove once all starting points are properly tagged.
const isStartingPointButNotTaggedAsSuchYet = (
  exampleShortHeader: ExampleShortHeader
): boolean => {
  return (
    exampleShortHeader.slug.startsWith('starting-') &&
    !exampleShortHeader.slug.includes('-pixel')
  );
};

export const isStartingPointExampleShortHeader = (
  exampleShortHeader: ExampleShortHeader
): boolean => {
  return (
    exampleShortHeader.tags.includes('Starting point') ||
    isStartingPointButNotTaggedAsSuchYet(exampleShortHeader)
  );
};

export const isLinkedToStartingPointExampleShortHeader = (
  allExampleShortHeaders: Array<ExampleShortHeader>,
  exampleShortHeader: ExampleShortHeader
): boolean => {
  const startingPoints = allExampleShortHeaders.filter(
    isStartingPointExampleShortHeader
  );
  return startingPoints.some(startingPoint =>
    startingPoint.linkedExampleShortHeaders
      ? startingPoint.linkedExampleShortHeaders.some(
          linkedExampleShortHeader =>
            linkedExampleShortHeader.slug === exampleShortHeader.slug
        )
      : false
  );
};

const hasThumbnail = (exampleShortHeader: ExampleShortHeader): boolean =>
  !!exampleShortHeader.previewImageUrls &&
  !!exampleShortHeader.previewImageUrls[0];

// Examples that are neither a starter nor a game have no complexity.
export const getExampleComplexity = (
  exampleShortHeader: ExampleShortHeader
): ?TemplateComplexity => {
  if (exampleShortHeader.tags.includes('Starting point'))
    return 'basic-controls';
  if (isStartingPointExampleShortHeader(exampleShortHeader))
    return 'starter-template';
  if (exampleShortHeader.tags.includes('game')) return 'full-game';
  return null;
};

export const filterExamples = (
  examples: Array<SearchResult<ExampleShortHeader>>,
  templateTypes: Set<TemplateType>,
  complexities: Set<TemplateComplexity>
): Array<SearchResult<ExampleShortHeader>> => {
  if (templateTypes.size > 0 && !templateTypes.has('free')) return [];
  if (complexities.size === 0) return examples;
  return examples.filter(({ item }) => {
    const complexity = getExampleComplexity(item);
    return !!complexity && complexities.has(complexity);
  });
};

// Premium game templates are all considered as full games.
export const filterGameTemplates = (
  gameTemplates: Array<SearchResult<PrivateGameTemplateListingData>>,
  templateTypes: Set<TemplateType>,
  complexities: Set<TemplateComplexity>
): Array<SearchResult<PrivateGameTemplateListingData>> => {
  if (templateTypes.size > 0 && !templateTypes.has('premium')) return [];
  if (complexities.size > 0 && !complexities.has('full-game')) return [];
  return gameTemplates;
};

/**
 * Order the starters, free and premium templates when browsing: a first block
 * of starters, then free, premium and starter alternating, and the examples
 * without a thumbnail at the end.
 */
export const orderProjectTemplatesForBrowsing = ({
  examples,
  gameTemplates,
  firstStartersCount,
}: {|
  examples: Array<ExampleShortHeader>,
  gameTemplates: Array<PrivateGameTemplateListingData>,
  firstStartersCount: number,
|}): Array<ProjectTemplate> => {
  const starters = examples.filter(isStartingPointExampleShortHeader);
  const otherExamples = examples.filter(
    example => !isStartingPointExampleShortHeader(example)
  );
  const freeTemplates = otherExamples.filter(hasThumbnail);
  const examplesWithoutThumbnail = otherExamples.filter(
    example => !hasThumbnail(example)
  );
  const remainingStarters = starters.slice(firstStartersCount);

  const orderedTemplates: Array<ProjectTemplate> = [
    ...starters.slice(0, firstStartersCount),
  ];
  const roundsCount = Math.max(
    freeTemplates.length,
    gameTemplates.length,
    remainingStarters.length
  );
  for (let index = 0; index < roundsCount; index++) {
    if (index < freeTemplates.length)
      orderedTemplates.push(freeTemplates[index]);
    if (index < gameTemplates.length)
      orderedTemplates.push(gameTemplates[index]);
    if (index < remainingStarters.length)
      orderedTemplates.push(remainingStarters[index]);
  }

  return [...orderedTemplates, ...examplesWithoutThumbnail];
};

const getScore = <T>(searchResult: SearchResult<T>): number =>
  typeof searchResult.score === 'number' ? searchResult.score : Infinity;

/**
 * Order the search results by relevance (lower score first), whatever their
 * type, with the examples without a thumbnail at the end.
 */
export const orderProjectTemplatesForSearch = ({
  examples,
  gameTemplates,
}: {|
  examples: Array<SearchResult<ExampleShortHeader>>,
  gameTemplates: Array<SearchResult<PrivateGameTemplateListingData>>,
|}): Array<ProjectTemplate> => {
  const scoredTemplates: Array<{|
    template: ProjectTemplate,
    score: number,
  |}> = [];
  examples.forEach(searchResult => {
    if (hasThumbnail(searchResult.item))
      scoredTemplates.push({
        template: searchResult.item,
        score: getScore(searchResult),
      });
  });
  gameTemplates.forEach(searchResult => {
    scoredTemplates.push({
      template: searchResult.item,
      score: getScore(searchResult),
    });
  });
  // Sorting is stable: for the same score, examples stay first.
  scoredTemplates.sort((a, b) =>
    a.score === b.score ? 0 : a.score < b.score ? -1 : 1
  );

  return [
    ...scoredTemplates.map(({ template }) => template),
    ...examples
      .map(({ item }) => item)
      .filter(example => !hasThumbnail(example)),
  ];
};
