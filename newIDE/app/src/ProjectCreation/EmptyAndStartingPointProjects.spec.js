// @flow
import { filterExampleShortHeadersBySearchText } from './EmptyAndStartingPointProjects';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';

jest.mock('./NewProjectSetupDialog', () => ({
  getItemsColumns: () => 4,
}));
jest.mock('../AssetStore/ShopTiles', () => ({
  ExampleTile: 'ExampleTile',
}));

const makeExampleShortHeader = ({
  id,
  name,
  shortDescription = '',
  description = '',
  tags = [],
}: {|
  id: string,
  name: string,
  shortDescription?: string,
  description?: string,
  tags?: Array<string>,
|}): ExampleShortHeader => ({
  id,
  slug: id,
  name,
  shortDescription,
  description,
  license: 'MIT',
  tags,
  previewImageUrls: [],
  gdevelopVersion: '5.0.0',
  codeSizeLevel: 'small',
});

describe('filterExampleShortHeadersBySearchText', () => {
  const examples = [
    makeExampleShortHeader({
      id: 'platformer',
      name: 'Platformer',
      shortDescription: 'A side scrolling starter game',
      tags: ['Starting point', 'Arcade'],
    }),
    makeExampleShortHeader({
      id: 'top-down',
      name: 'Top-down',
      shortDescription: 'Move in every direction',
      tags: ['Starting point', 'Adventure'],
    }),
    makeExampleShortHeader({
      id: 'physics',
      name: 'Physics',
      description: 'A project using realistic collisions',
      tags: ['Starting point', 'Puzzle'],
    }),
  ];

  it('keeps all templates when the search text is empty', () => {
    expect(filterExampleShortHeadersBySearchText(examples, '')).toBe(examples);
    expect(filterExampleShortHeadersBySearchText(examples, '   ')).toBe(
      examples
    );
  });

  it('filters templates by name, description and tag, ignoring case', () => {
    expect(
      filterExampleShortHeadersBySearchText(examples, 'PLATFORM').map(
        exampleShortHeader => exampleShortHeader.id
      )
    ).toEqual(['platformer']);
    expect(
      filterExampleShortHeadersBySearchText(examples, 'collisions').map(
        exampleShortHeader => exampleShortHeader.id
      )
    ).toEqual(['physics']);
    expect(
      filterExampleShortHeadersBySearchText(examples, 'adventure').map(
        exampleShortHeader => exampleShortHeader.id
      )
    ).toEqual(['top-down']);
  });
});
