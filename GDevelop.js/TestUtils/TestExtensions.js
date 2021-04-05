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

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    }
  },
};
