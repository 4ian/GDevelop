const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

// Checks that gd::MetadataProvider lookups (backed by the platform's
// gd::PlatformMetadataIndex) stay correct when extensions are added, replaced
// and removed at runtime - i.e. that the index is properly invalidated - and
// that every kind of metadata is indexed and resolved.
describe('MetadataProvider index', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const extensionName = 'MetadataIndexTestExtension';
  const prefix = extensionName + '::';
  const objectType = prefix + 'TestObject';
  const behaviorType = prefix + 'TestBehavior';
  const actionType = prefix + 'TestAction';
  const conditionType = prefix + 'TestCondition';
  const expressionType = prefix + 'TestExpression';
  const strExpressionType = prefix + 'TestStrExpression';
  // Object/behavior expression names are not namespaced (they are scoped to the
  // object/behavior type they belong to).
  const objectExpressionName = 'TestObjectExpression';
  const objectStrExpressionName = 'TestObjectStrExpression';
  const behaviorExpressionName = 'TestBehaviorExpression';
  const behaviorStrExpressionName = 'TestBehaviorStrExpression';

  const makeExtension = (objectFullName) => {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      extensionName,
      'Metadata index test extension',
      'Description',
      'Author',
      'MIT'
    );

    const objectConfiguration = new gd.ObjectJsImplementation();
    const objectMetadata = extension.addObject(
      'TestObject',
      objectFullName,
      'A test object',
      '',
      objectConfiguration
    );
    objectMetadata.addExpression(objectExpressionName, 'Obj expr', 'd', 'g', '');
    objectMetadata.addStrExpression(objectStrExpressionName, 'Obj str', 'd', 'g', '');

    const behaviorInstance = new gd.BehaviorJsImplementation();
    behaviorInstance.initializeContent = function (behaviorContent) {};
    const behaviorMetadata = extension.addBehavior(
      'TestBehavior',
      'Test behavior',
      'TestBehavior',
      'A test behavior',
      '',
      '',
      'TestBehavior',
      behaviorInstance,
      new gd.BehaviorsSharedData()
    );
    behaviorMetadata.addExpression(behaviorExpressionName, 'Beh expr', 'd', 'g', '');
    behaviorMetadata.addStrExpression(behaviorStrExpressionName, 'Beh str', 'd', 'g', '');

    extension.addAction('TestAction', 'Test action', 'Does', 'Does', '', '', '');
    extension.addCondition('TestCondition', 'Test cond', 'Is', 'Is', '', '', '');
    extension.addExpression('TestExpression', 'Test expr', 'd', 'g', '');
    extension.addStrExpression('TestStrExpression', 'Test str', 'd', 'g', '');

    return extension;
  };

  // Asserts every kind of metadata declared by makeExtension is found (when
  // expectFound) or resolves to the "bad" metadata (when not).
  const expectAllResolved = (platform, expectFound) => {
    const P = gd.MetadataProvider;
    const cases = [
      P.isBadObjectMetadata(P.getObjectMetadata(platform, objectType)),
      P.isBadBehaviorMetadata(P.getBehaviorMetadata(platform, behaviorType)),
      P.isBadInstructionMetadata(P.getActionMetadata(platform, actionType)),
      P.isBadInstructionMetadata(P.getConditionMetadata(platform, conditionType)),
      P.isBadExpressionMetadata(P.getExpressionMetadata(platform, expressionType)),
      P.isBadExpressionMetadata(P.getStrExpressionMetadata(platform, strExpressionType)),
      P.isBadExpressionMetadata(
        P.getObjectExpressionMetadata(platform, objectType, objectExpressionName)
      ),
      P.isBadExpressionMetadata(
        P.getObjectStrExpressionMetadata(platform, objectType, objectStrExpressionName)
      ),
      P.isBadExpressionMetadata(
        P.getBehaviorExpressionMetadata(platform, behaviorType, behaviorExpressionName)
      ),
      P.isBadExpressionMetadata(
        P.getBehaviorStrExpressionMetadata(platform, behaviorType, behaviorStrExpressionName)
      ),
    ];
    // When found, none should be "bad"; when not, all should be "bad".
    for (const isBad of cases) expect(isBad).toBe(!expectFound);
  };

  afterEach(() => {
    if (gd.JsPlatform.get().isExtensionLoaded(extensionName))
      gd.JsPlatform.get().removeExtension(extensionName);
  });

  it('resolves every kind of metadata after the extension is added, and none before/after removal', () => {
    const platform = gd.JsPlatform.get();

    // Build the index once first so we test invalidation, not lazy first build.
    gd.MetadataProvider.getObjectMetadata(platform, 'Sprite');

    expectAllResolved(platform, false);

    const extension = makeExtension('First name');
    platform.addNewExtension(extension);
    extension.delete();

    expectAllResolved(platform, true);

    platform.removeExtension(extensionName);

    expectAllResolved(platform, false);
  });

  it('returns updated metadata after the extension is replaced (not stale)', () => {
    const platform = gd.JsPlatform.get();

    const firstExtension = makeExtension('First name');
    platform.addNewExtension(firstExtension);
    firstExtension.delete();

    expect(
      gd.MetadataProvider.getObjectMetadata(platform, objectType).getFullName()
    ).toBe('First name');

    // Replacing goes through RemoveExtension + AddExtension and must discard the
    // cached (now dangling) metadata.
    const secondExtension = makeExtension('Second name');
    platform.addNewExtension(secondExtension);
    secondExtension.delete();

    expect(
      gd.MetadataProvider.getObjectMetadata(platform, objectType).getFullName()
    ).toBe('Second name');
  });
});
