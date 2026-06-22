const initializeGDevelopJs = require('../../Binaries/embuild/GDevelop.js/libGD.js');

// Checks that gd::MetadataProvider lookups (backed by the platform's
// gd::PlatformMetadataIndex) stay correct when extensions are added, replaced
// and removed at runtime - i.e. that the index is properly invalidated.
describe('MetadataProvider index invalidation', () => {
  let gd = null;
  beforeAll(async () => {
    gd = await initializeGDevelopJs();
  });

  const extensionName = 'MetadataIndexTestExtension';
  const objectType = extensionName + '::IndexTestObject';
  const actionType = extensionName + '::IndexTestAction';

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
    extension.addObject(
      'IndexTestObject',
      objectFullName,
      'A test object',
      '',
      objectConfiguration
    );
    extension.addAction(
      'IndexTestAction',
      'Index test action',
      'Does something',
      'Does something',
      '',
      '',
      ''
    );
    return extension;
  };

  afterEach(() => {
    if (gd.JsPlatform.get().isExtensionLoaded(extensionName))
      gd.JsPlatform.get().removeExtension(extensionName);
  });

  it('does not find metadata before the extension is added', () => {
    const platform = gd.JsPlatform.get();
    expect(
      gd.MetadataProvider.isBadObjectMetadata(
        gd.MetadataProvider.getObjectMetadata(platform, objectType)
      )
    ).toBe(true);
    expect(
      gd.MetadataProvider.isBadInstructionMetadata(
        gd.MetadataProvider.getActionMetadata(platform, actionType)
      )
    ).toBe(true);
  });

  it('finds metadata right after the extension is added (index rebuilt)', () => {
    const platform = gd.JsPlatform.get();

    // Build the index once so the test proves it is invalidated, not just
    // lazily built for the first time.
    gd.MetadataProvider.getObjectMetadata(platform, 'Sprite');

    const extension = makeExtension('First name');
    platform.addNewExtension(extension);
    extension.delete();

    expect(
      gd.MetadataProvider.isBadObjectMetadata(
        gd.MetadataProvider.getObjectMetadata(platform, objectType)
      )
    ).toBe(false);
    expect(
      gd.MetadataProvider.getObjectMetadata(platform, objectType).getFullName()
    ).toBe('First name');
    expect(
      gd.MetadataProvider.isBadInstructionMetadata(
        gd.MetadataProvider.getActionMetadata(platform, actionType)
      )
    ).toBe(false);
  });

  it('returns updated metadata after the extension is replaced (not stale)', () => {
    const platform = gd.JsPlatform.get();

    const firstExtension = makeExtension('First name');
    platform.addNewExtension(firstExtension);
    firstExtension.delete();

    // Resolve once so the index caches the first version's metadata.
    expect(
      gd.MetadataProvider.getObjectMetadata(platform, objectType).getFullName()
    ).toBe('First name');

    // Replacing an extension goes through RemoveExtension + AddExtension, which
    // must discard the cached (now dangling) metadata.
    const secondExtension = makeExtension('Second name');
    platform.addNewExtension(secondExtension);
    secondExtension.delete();

    expect(
      gd.MetadataProvider.getObjectMetadata(platform, objectType).getFullName()
    ).toBe('Second name');
  });

  it('stops finding metadata after the extension is removed', () => {
    const platform = gd.JsPlatform.get();

    const extension = makeExtension('First name');
    platform.addNewExtension(extension);
    extension.delete();

    // Resolve once so the index is populated before removal.
    expect(
      gd.MetadataProvider.isBadObjectMetadata(
        gd.MetadataProvider.getObjectMetadata(platform, objectType)
      )
    ).toBe(false);

    platform.removeExtension(extensionName);

    expect(
      gd.MetadataProvider.isBadObjectMetadata(
        gd.MetadataProvider.getObjectMetadata(platform, objectType)
      )
    ).toBe(true);
    expect(
      gd.MetadataProvider.isBadInstructionMetadata(
        gd.MetadataProvider.getActionMetadata(platform, actionType)
      )
    ).toBe(true);
  });
});
