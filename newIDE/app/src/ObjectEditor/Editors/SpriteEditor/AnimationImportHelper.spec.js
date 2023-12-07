// @flow
import { groupResourcesByAnimations } from './AnimationImportHelper';
const gd = global.gd;

describe('AnimationImportHelper', () => {
  const createResources = (filePaths: Array<string>): Array<gdResource> =>
    filePaths.map(filePath => {
      const resource = new gd.ImageResource();
      resource.setFile(filePath);
      return resource;
    });

  const deleteResources = (resources: Array<gdResource>): void => {
    for (const resource of resources) {
      resource.delete();
    }
  };

  it('can handle empty resource lists', () => {
    const resources = createResources([]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(0);

    deleteResources(resources);
  });

  it('can find animation names', () => {
    const resources = createResources([
      'Assets/Player Run.png',
      'Assets/Player Jump.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect([...resourcesByAnimations.keys()]).toStrictEqual(['Run', 'Jump']);

    deleteResources(resources);
  });
});
