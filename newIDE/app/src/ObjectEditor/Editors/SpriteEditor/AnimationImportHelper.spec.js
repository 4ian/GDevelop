// @flow
import { groupResourcesByAnimations } from './AnimationImportHelper';
const gd = global.gd;

describe('AnimationImportHelper', () => {
  const createResources = (filePaths: Array<string>): Array<gdResource> =>
    filePaths.map(filePath => {
      const resource = new gd.ImageResource();
      resource.setName(filePath);
      resource.setFile(filePath);
      return resource;
    });

  const deleteResources = (resources: Array<gdResource>): void => {
    for (const resource of resources) {
      resource.delete();
    }
  };

  const getAnimationFramesCount = (
    resourcesByAnimations: Map<string, Array<gdResource>>,
    animationName: string
  ): number | null => {
    const frames = resourcesByAnimations.get(animationName);
    return frames ? frames.length : null;
  };

  const getAnimationFramesPaths = (
    resourcesByAnimations: Map<string, Array<gdResource>>,
    animationName: string
  ): Array<string> | null => {
    const frames = resourcesByAnimations.get(animationName);
    return frames ? frames.map(resource => resource.getFile()) : null;
  };

  it('can handle empty resource lists', () => {
    const resources = createResources([]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(0);

    deleteResources(resources);
  });

  it('can handle 1 frame alone', () => {
    const resources = createResources(['Assets/Player Jump.png']);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, '')).toBe(1);

    deleteResources(resources);
  });

  it('can handle 1 animation alone', () => {
    const resources = createResources([
      'Assets/Player Run 1.png',
      'Assets/Player Run 2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, '')).toBe(2);

    deleteResources(resources);
  });

  it('can find animation names without frame indexes', () => {
    const resources = createResources([
      'Assets/Player Jump.png',
      'Assets/Player Run 1.png',
      'Assets/Player Run 2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });

  it('can find animation names without object name', () => {
    const resources = createResources([
      'Assets/Jump.png',
      'Assets/Run 1.png',
      'Assets/Run 2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });

  it('can find animation names without any separator', () => {
    const resources = createResources([
      'Assets/PlayerJump.png',
      'Assets/PlayerRun1.png',
      'Assets/PlayerRun2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });

  it('can find animation names when separator contains several characters', () => {
    const resources = createResources([
      'Assets/Player - Jump.png',
      'Assets/Player - Run - 1.png',
      'Assets/Player - Run - 2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });

  it('can sort frames by numerical order', () => {
    const resources = createResources([
      'Assets/PlayerRun02.png',
      'Assets/PlayerJump.png',
      'Assets/PlayerRun1.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesPaths(resourcesByAnimations, 'Run')).toStrictEqual(
      ['Assets/PlayerRun1.png', 'Assets/PlayerRun02.png']
    );

    deleteResources(resources);
  });

  it('can sort frames by numerical order without taking "-" as a negative sign', () => {
    const resources = createResources([
      'Assets/Jump.png',
      'Assets/Run-1.png',
      'Assets/Run-2.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesPaths(resourcesByAnimations, 'Run')).toStrictEqual(
      ['Assets/Run-1.png', 'Assets/Run-2.png']
    );

    deleteResources(resources);
  });

  it('can find frame index inside parenthesis', () => {
    const resources = createResources([
      'Assets/Player Run (1).png',
      'Assets/Player Run (2).png',
      'Assets/Player Jump.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });

  it('can find animation frames when indexes have holes', () => {
    const resources = createResources([
      'Assets/Jump.png',
      'Assets/Run 0.png',
      'Assets/Run 567.png',
    ]);

    const resourcesByAnimations = groupResourcesByAnimations(resources);
    expect(resourcesByAnimations.size).toBe(2);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Jump')).toBe(1);
    expect(getAnimationFramesCount(resourcesByAnimations, 'Run')).toBe(2);

    deleteResources(resources);
  });
});
