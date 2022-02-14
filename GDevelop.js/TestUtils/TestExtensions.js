// Note: there are also test extensions for the IDE (for the Storybook and for the IDE tests).
// Search for "TestExtensions.js" in the codebase.

module.exports = {
  /**
   * Create dummy extensions into gd.JsPlatform
   * @param gd The GD instance to use to create the extensions and find the platform.
   */
  makeTestExtensions: (gd) => {
    const platform = gd.JsPlatform.get();

    {
      const extension = new gd.PlatformExtension();
      extension
        .setExtensionInformation(
          'AdMob',
          'AdMob',
          'Some fake extension mimicking the AdMob extension',
          'Florian Rival',
          'MIT'
        )
        .setExtensionHelpPath('/all-features/admob');

      extension
        .registerProperty('AdMobAppIdAndroid')
        .setLabel('AdMob Android App ID')
        .setDescription('ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY')
        .setType('string');

      extension
        .registerProperty('AdMobAppIdIos')
        .setLabel('AdMob iOS App ID')
        .setDescription('ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY')
        .setType('string');

      extension
        .addDependency()
        .setName('AdMob Cordova plugin')
        .setDependencyType('cordova')
        .setExportName('gdevelop-cordova-admob-plus')
        .setVersion('0.43.0')
        .setExtraSetting(
          'APP_ID_ANDROID',
          new gd.PropertyDescriptor('AdMobAppIdAndroid').setType(
            'ExtensionProperty'
          )
        )
        .setExtraSetting(
          'APP_ID_IOS',
          new gd.PropertyDescriptor('AdMobAppIdIos').setType(
            'ExtensionProperty'
          )
        )
        .onlyIfSomeExtraSettingsNonEmpty();

      extension
        .addAction(
          'ShowInterstitial',
          'Show interstitial',
          'Fake action that would show an interstitial screen.',
          'Show the loaded interstitial',
          'AdMob',
          'JsPlatform/Extensions/admobicon24.png',
          'JsPlatform/Extensions/admobicon16.png'
        )
        .getCodeExtraInformation()
        .setIncludeFile('Extensions/FakeAdMob/admobtools.js')
        .setFunctionName('gdjs.fakeAdMob.showInterstitial');

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    }
    {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'FakeObjectWithUnsupportedCapability',
        'Fake object not supporting the "effect" capability',
        'Fake object not supporting the "effect" capability',
        '',
        'MIT'
      );
      const fakeObject = new gd.ObjectJsImplementation();


      fakeObject.updateProperty = function(
        objectContent,
        propertyName,
        newValue
      ) {
        return false;
      };

      fakeObject.getProperties = function(objectContent) {
        const objectProperties = new gd.MapStringPropertyDescriptor();

        objectProperties
          .getOrCreate('text')
          .setValue(objectContent.text)
          .setType('textarea')
          .setLabel('Text');

        return objectProperties;
      };
      fakeObject.setRawJSONContent(
        JSON.stringify({
          text: 'Some text.',
        })
      );


      fakeObject.updateInitialInstanceProperty = function(
        objectContent,
        instance,
        propertyName,
        newValue,
        project,
        layout
      ) {
        return false;
      };

      fakeObject.getInitialInstanceProperties = function(
        content,
        instance,
        project,
        layout
      ) {
        var instanceProperties = new gd.MapStringPropertyDescriptor();
        return instanceProperties;
      };

      const object = extension
        .addObject(
          'FakeObjectWithUnsupportedCapability',
          'FakeObjectWithUnsupportedCapability',
          'This is FakeObjectWithUnsupportedCapability',
          '',
          fakeObject
        )
        .addUnsupportedBaseObjectCapability('effect');

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    }
  },
};
