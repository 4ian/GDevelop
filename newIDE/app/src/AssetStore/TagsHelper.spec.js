// @flow
import { fakeAssetShortHeader1 } from '../fixtures/GDevelopServicesTestData';
const { getFolderTagsFromAssetShortHeaders } = require('./TagsHelper');

describe('getFolderTagsFromAssetShortHeaders', () => {
  it('should return an empty array if no assets', () => {
    const selectedFolders = ['pack-tag'];
    const assetShortHeaders = [];
    const result = getFolderTagsFromAssetShortHeaders({
      selectedFolders,
      assetShortHeaders,
    });
    expect(result).toEqual([]);
  });

  it('should return the top level tags of assets in a pack', () => {
    const selectedFolders = ['pack-tag'];
    const assetShortHeader1 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag2'],
    };
    const assetShortHeader2 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4', 'tag5'],
    };
    const assetShortHeader3 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4'],
    };
    const assetShortHeader4 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4', 'tag6'],
    };
    const assetShortHeaders = [
      assetShortHeader1,
      assetShortHeader2,
      assetShortHeader3,
      assetShortHeader4,
    ];

    const result = getFolderTagsFromAssetShortHeaders({
      selectedFolders,
      assetShortHeaders,
    });
    expect(result).toEqual(['tag2', 'tag4']); // no pack-tag, as it's the pack, no tag1 as it matches all assets.
  });

  it('should return the top level tags after navigating inside a folder', () => {
    const selectedFolders = ['pack-tag', 'tag4']; // navigate inside tag4
    const assetShortHeader1 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag2'],
    };
    const assetShortHeader2 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4', 'tag5'],
    };
    const assetShortHeader3 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4'],
    };
    const assetShortHeader4 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag4', 'tag6'],
    };
    const assetShortHeaders = [
      assetShortHeader1,
      assetShortHeader2,
      assetShortHeader3,
      assetShortHeader4,
    ];

    const result = getFolderTagsFromAssetShortHeaders({
      selectedFolders,
      assetShortHeaders,
    });
    expect(result).toEqual(['tag5', 'tag6']); // no pack-tag, as it's the pack, no tag1 as it matches all assets.
  });

  it('works if a tag is duplicated', () => {
    const selectedFolders = ['pack-tag']; // root of pack.
    const assetShortHeader1 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag1'], // tag1 is duplicated because inside a folder of the same name.
    };
    const assetShortHeader2 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag1', 'tag2'],
    };
    const assetShortHeader3 = {
      ...fakeAssetShortHeader1,
      tags: ['pack-tag', 'tag3'],
    };
    const assetShortHeaders = [
      assetShortHeader1,
      assetShortHeader2,
      assetShortHeader3,
    ];

    const result = getFolderTagsFromAssetShortHeaders({
      selectedFolders,
      assetShortHeaders,
    });
    expect(result).toEqual(['tag1', 'tag3']); // tag1 is a folder at the root of pack.

    const result2 = getFolderTagsFromAssetShortHeaders({
      selectedFolders: ['pack-tag', 'tag1'], // inside tag1 folder
      assetShortHeaders,
    });
    expect(result2).toEqual(['tag1', 'tag2']); // tag1 is a folder inside tag1 folder.
  });
});
