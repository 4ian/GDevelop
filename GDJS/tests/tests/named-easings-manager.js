// @ts-check

describe('gdjs.NamedEasingsManager', () => {
  const projectNamedEasing = {
    name: 'MyBounce',
    cubicBezier: [0.34, 1.56, 0.64, 1],
  };
  const extensionNamedEasing = {
    name: 'ExtEase',
    cubicBezier: [0.25, 0.1, 0.25, 1],
  };

  /** @returns {ProjectData} */
  const createProjectDataWithNamedEasings = () => ({
    ...gdjs.createProjectData(),
    namedEasings: [projectNamedEasing],
    eventsFunctionsExtensions: [
      {
        name: 'MyExtension',
        eventsBasedObjects: [],
        globalVariables: [],
        sceneVariables: [],
        namedEasings: [extensionNamedEasing],
      },
    ],
  });

  it('resolves named easings in project scope', () => {
    const manager = new gdjs.NamedEasingsManager(
      createProjectDataWithNamedEasings()
    );
    expect(manager.resolve('MyBounce', '')).to.be(
      'cubic-bezier(0.34,1.56,0.64,1)'
    );
  });

  it('resolves named easings in extension scope', () => {
    const manager = new gdjs.NamedEasingsManager(
      createProjectDataWithNamedEasings()
    );
    expect(manager.resolve('ExtEase', 'MyExtension')).to.be(
      'cubic-bezier(0.25,0.1,0.25,1)'
    );
  });

  it('does not leak named easings between scopes', () => {
    const manager = new gdjs.NamedEasingsManager(
      createProjectDataWithNamedEasings()
    );
    expect(manager.resolve('MyBounce', 'MyExtension')).to.be('MyBounce');
    expect(manager.resolve('ExtEase', '')).to.be('ExtEase');
  });

  it('passes through built-in easing names', () => {
    const manager = new gdjs.NamedEasingsManager(gdjs.createProjectData());
    expect(manager.resolve('linear', '')).to.be('linear');
    expect(manager.resolve('easeInQuad', '')).to.be('easeInQuad');
  });

  it('passes through cubic-bezier literals', () => {
    const manager = new gdjs.NamedEasingsManager(gdjs.createProjectData());
    const literal = 'cubic-bezier(0.34,1.56,0.64,1)';
    expect(manager.resolve(literal, '')).to.be(literal);
  });

  it('returns unknown names unchanged', () => {
    const manager = new gdjs.NamedEasingsManager(gdjs.createProjectData());
    expect(manager.resolve('UnknownEasing', '')).to.be('UnknownEasing');
  });

  it('exposes NamedEasingsManager from RuntimeGame', () => {
    const runtimeGame = gdjs.getPixiRuntimeGame({
      propertiesOverrides: undefined,
    });
    const projectData = createProjectDataWithNamedEasings();
    runtimeGame.setProjectData(projectData);
    const manager = runtimeGame.getNamedEasingsManager();
    expect(manager.resolve('MyBounce', '')).to.be(
      'cubic-bezier(0.34,1.56,0.64,1)'
    );
  });
});
