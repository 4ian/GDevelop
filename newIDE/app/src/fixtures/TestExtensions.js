// @flow
let testExtensionsAdded = false;

/**
 * Create dummy extensions into gd.JsPlatform
 * @param gd The GD instance to use to create the extensions and find the platform.
 */
export const makeTestExtensions = (gd: libGDevelop) => {
  // Be sure to only add test extensions once, as gd.JsPlatform is a singleton.
  if (testExtensionsAdded) return;
  testExtensionsAdded = true;

  const platform = gd.JsPlatform.get();

  // Add some fake effects
  {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Effects',
      'Effects',
      'Fake effects for testing.',
      '',
      'MIT'
    );

    const sepiaEffect = extension
      .addEffect('FakeSepia')
      .setFullName('Fake Sepia Effect')
      .setDescription('A fake sepia effect')
      .addIncludeFile('Extensions/Effects/fake-sepia.js');
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel('Opacity (between 0 and 1)')
      .setType('number');

    const nightEffect = extension
      .addEffect('FakeNight')
      .setFullName('Fake Night Effect')
      .setDescription('A fake night effect')
      .addIncludeFile('Extensions/Effects/fake-night.js');
    const nightProperties = nightEffect.getProperties();
    nightProperties
      .getOrCreate('intensity')
      .setValue('1')
      .setLabel('Intensity (between 0 and 1)')
      .setType('number');
    nightProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel('Opacity (between 0 and 1)')
      .setType('number');

    const variousParametersEffect = extension
      .addEffect('FakeEffectWithVariousParameters')
      .setFullName('Fake Effect With Various Parameters')
      .setDescription('A fake effect using different parameters')
      .addIncludeFile(
        'Extensions/Effects/fake-effect-with-various-parameters.js'
      );
    const variousParametersEffectProperties = variousParametersEffect.getProperties();
    variousParametersEffectProperties
      .getOrCreate('intensity')
      .setValue('1')
      .setLabel('Intensity (between 0 and 1)')
      .setType('number')
      .setDescription(
        'Some interesting description about this intensity parameter that can be used by the effect.'
      );
    variousParametersEffectProperties
      .getOrCreate('someColor')
      .setValue('1')
      .setLabel('Some color')
      .setType('color')
      .setDescription(
        'Some interesting description about this color parameter that can be used by the effect.'
      );
    variousParametersEffectProperties
      .getOrCreate('image')
      .setValue('')
      .setLabel('An image resource')
      .setType('resource')
      .addExtraInfo('image')
      .setDescription(
        'Some interesting description about this image resource that can be used by the effect.'
      );
    variousParametersEffectProperties
      .getOrCreate('someBoolean')
      .setValue('true')
      .setLabel('Some setting to enable or not for the effect')
      .setType('boolean')
      .setDescription('And some *optional* description.');

    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
  {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'FakeBehavior',
      'Fake extension with a fake behavior',
      'A fake extension with a fake behavior containing 2 properties.',
      '',
      'MIT'
    );
    const fakeBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.updateProperty = function(
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'property1') {
        behaviorContent.setStringAttribute('property1', newValue);
        return true;
      }
      if (propertyName === 'property2') {
        behaviorContent.setBoolAttribute('property2', newValue === '1');
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.getProperties = function(behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('property1')
        .setValue(behaviorContent.getStringAttribute('property1'));
      behaviorProperties
        .getOrCreate('property2')
        .setValue(
          behaviorContent.getBoolAttribute('property2') ? 'true' : 'false'
        )
        .setType('Boolean');

      return behaviorProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.initializeContent = function(behaviorContent) {
      behaviorContent.setStringAttribute('property1', 'Initial value 1');
      behaviorContent.setBoolAttribute('property2', true);
    };

    extension.addBehavior(
      'FakeBehavior',
      'Fake behavior with two properties',
      'FakeBehavior', // Default name is the name
      'A fake behavior with two properties.',
      '',
      'res/function24.png',
      'FakeBehavior', // Class name is the name, actually unused
      fakeBehavior,
      new gd.BehaviorsSharedData()
    );

    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
  {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'FakeTextBehavior',
      'Fake extension with a fake behavior for text objects only',
      'A fake extension with a fake behavior for text objects only.',
      '',
      'MIT'
    );
    const fakeBehavior = new gd.BehaviorJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.updateProperty = function(
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.getProperties = function(behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();
      return behaviorProperties;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    fakeBehavior.initializeContent = function(behaviorContent) {};

    extension
      .addBehavior(
        'FakeTextBehavior',
        'Fake behavior for text objects only',
        'FakeTextBehavior', // Default name is the name
        'A fake behavior for text objects only.',
        '',
        'res/function24.png',
        'FakeTextBehavior', // Class name is the name, actually unused
        fakeBehavior,
        new gd.BehaviorsSharedData()
      )
      .setObjectType('TextObject::Text');

    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
};
