module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Lighting',
      _('PIXI Lights'),
      _('Lights using PIXI'),
      'Harsimran Virk',
      'MIT'
    );

    var lightObject = new gd.ObjectJsImplementation();

    const object = extension
      .addObject(
        'LightObject',
        _('Light Object for testing'),
        _('This is an experimental light object'),
        'CppPlatform/Extensions/topdownmovementicon.png',
        lightObject
      )
      .setIncludeFile('Extensions/LightObject/lightruntimeobject.js')
      .addIncludeFile(
        'Extensions/LightObject/lightruntimeobject-pixi-renderer.js'
      );

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
