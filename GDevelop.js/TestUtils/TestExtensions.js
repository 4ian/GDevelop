// Note: there are also test extensions for the IDE (for the Storybook and for the IDE tests).
// Search for "TestExtensions.js" in the codebase.

module.exports = {
  /**
   * Create dummy extensions into gd.JsPlatform
   * @param gd The GD instance to use to create the extensions and find the platform.
   */
  makeTestExtensions: (gd) => {
    const platform = gd.JsPlatform.get();

    const declareFakeAdmod = () => {
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
    };
    declareFakeAdmod();

    const declareFakeObjectWithUnsupportedCapability = () => {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'FakeObjectWithUnsupportedCapability',
        'Fake object not supporting the "effect" capability',
        'Fake object not supporting the "effect" capability',
        '',
        'MIT'
      );
      const fakeObject = new gd.ObjectJsImplementation();

      fakeObject.updateProperty = function (
        objectContent,
        propertyName,
        newValue
      ) {
        return false;
      };

      fakeObject.getProperties = function (objectContent) {
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

      fakeObject.updateInitialInstanceProperty = function (
        objectContent,
        instance,
        propertyName,
        newValue,
        project,
        layout
      ) {
        return false;
      };

      fakeObject.getInitialInstanceProperties = function (
        content,
        instance,
        project,
        layout
      ) {
        var instanceProperties = new gd.MapStringPropertyDescriptor();
        return instanceProperties;
      };

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    };
    declareFakeObjectWithUnsupportedCapability();

    const declareFakeObjectWithAsyncAction = () => {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'FakeObjectWithAsyncAction',
        'Fake object with an async action',
        'Fake object with an async action',
        '',
        'MIT'
      );
      const fakeObject = new gd.ObjectJsImplementation();

      fakeObject.updateProperty = function (
        objectContent,
        propertyName,
        newValue
      ) {
        return false;
      };

      fakeObject.getProperties = function (objectContent) {
        const objectProperties = new gd.MapStringPropertyDescriptor();
        return objectProperties;
      };
      fakeObject.setRawJSONContent(JSON.stringify({}));

      fakeObject.updateInitialInstanceProperty = function (
        objectContent,
        instance,
        propertyName,
        newValue,
        project,
        layout
      ) {
        return false;
      };

      fakeObject.getInitialInstanceProperties = function (
        content,
        instance,
        project,
        layout
      ) {
        var instanceProperties = new gd.MapStringPropertyDescriptor();
        return instanceProperties;
      };

      const object = extension.addObject(
        'FakeObjectWithAsyncAction',
        'FakeObjectWithAsyncAction',
        'This is FakeObjectWithAsyncAction',
        '',
        fakeObject
      );

      object
        .addScopedAction(
          'DoAsyncAction',
          'Some async action',
          'Some async action.',
          'Do some async action with _PARAM0_',
          '',
          'res/icon.png',
          'res/icon.png'
        )
        .addParameter('object', 'Object', 'FakeObjectWithAsyncAction', false)
        .getCodeExtraInformation()
        .setAsyncFunctionName('doFakeAsyncAction');

      object
        .addScopedAction(
          'DoOptionallyAsyncAction',
          'Some optionally async action',
          'Some optionally async action.',
          'Do some optionally async action with _PARAM0_',
          '',
          'res/icon.png',
          'res/icon.png'
        )
        .addParameter('object', 'Object', 'FakeObjectWithAsyncAction', false)
        .getCodeExtraInformation()
        .setFunctionName('noop')
        .setAsyncFunctionName('doFakeAsyncAction');

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    };
    declareFakeObjectWithAsyncAction();

    const declareFakeOptionallyAsyncAction = () => {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'FakeOptionallyAsyncAction',
        'Fake optionally async action',
        'Fake optionally async action',
        '',
        'MIT'
      );

      extension
        .addAction(
          'DoOptionallyAsyncAction',
          'Some optionally async action',
          'Some optionally async action.',
          'Optionally async action with _PARAM0_',
          '',
          'res/icon.png',
          'res/icon.png'
        )
        .addParameter('expression', 'Wait time', '', false)
        .getCodeExtraInformation()
        .setFunctionName('gdjs.evtTools.runtimeScene.noop')
        .setAsyncFunctionName('gdjs.evtTools.runtimeScene.wait');

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    };
    declareFakeOptionallyAsyncAction();

    const declareFakeBehaviorWithSharedData = () => {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'FakeBehaviorWithSharedData',
        'Fake behavior with shared data',
        'Fake behavior with shared data',
        '',
        'MIT'
      );
      // Declare a behavior with shared data between the behaviors
      // In addition to the usual behavior:
      // Create a new gd.BehaviorSharedDataJsImplementation object and implement the methods
      // that are called to get and set the properties of the shared data.
      const dummyBehaviorWithSharedData = new gd.BehaviorJsImplementation();
      // $FlowExpectedError - ignore Flow warning as we're creating a behavior
      dummyBehaviorWithSharedData.updateProperty = function (
        behaviorContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'MyBehaviorProperty') {
          behaviorContent.setStringAttribute('MyBehaviorProperty', newValue);
          return true;
        }

        return false;
      };

      dummyBehaviorWithSharedData.getProperties = function (behaviorContent) {
        const behaviorProperties = new gd.MapStringPropertyDescriptor();

        behaviorProperties
          .getOrCreate('MyBehaviorProperty')
          .setValue(behaviorContent.getStringAttribute('MyBehaviorProperty'));

        return behaviorProperties;
      };

      dummyBehaviorWithSharedData.initializeContent = function (
        behaviorContent
      ) {
        behaviorContent.setStringAttribute(
          'MyBehaviorProperty',
          'Initial value 1'
        );
      };

      const sharedData = new gd.BehaviorSharedDataJsImplementation();

      sharedData.updateProperty = function (
        sharedContent,
        propertyName,
        newValue
      ) {
        if (propertyName === 'MySharedProperty') {
          sharedContent.setStringAttribute('MySharedProperty', newValue);
          return true;
        }

        return false;
      };

      sharedData.getProperties = function (sharedContent) {
        const sharedProperties = new gd.MapStringPropertyDescriptor();

        sharedProperties
          .getOrCreate('MySharedProperty')
          .setValue(sharedContent.getStringAttribute('MySharedProperty'));

        return sharedProperties;
      };

      sharedData.initializeContent = function (behaviorContent) {
        behaviorContent.setStringAttribute(
          'MySharedProperty',
          'Initial shared value 1'
        );
      };

      extension
        .addBehavior(
          'DummyBehaviorWithSharedData',
          'Dummy behavior with shared data for testing',
          'DummyBehaviorWithSharedData',
          'Do nothing but use shared data.',
          '',
          'CppPlatform/Extensions/topdownmovementicon.png',
          'DummyBehaviorWithSharedData',
          dummyBehaviorWithSharedData,
          sharedData
        )
        .setIncludeFile(
          'Extensions/ExampleJsExtension/dummywithshareddataruntimebehavior.js'
        )
        // You can optionally include more than one file when the behavior is used:
        .addIncludeFile(
          'Extensions/ExampleJsExtension/examplejsextensiontools.js'
        );

      platform.addNewExtension(extension);
      extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
    };
    declareFakeBehaviorWithSharedData();
  },
};
