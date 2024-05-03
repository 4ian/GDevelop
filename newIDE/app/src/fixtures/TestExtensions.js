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
      .markAsOnlyWorkingFor2D()
      .addIncludeFile('Extensions/Effects/fake-sepia.js');
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel('Opacity (between 0 and 1)')
      .setType('number');

    const layerOnlySepiaEffect = extension
      .addEffect('FakeSepiaThatWouldWorkOnlyForLayers')
      .setFullName('Fake Sepia Effect only for layers')
      .setDescription('A fake sepia effect only for layers')
      .addIncludeFile('Extensions/Effects/fake-sepia-only-for-layers.js')
      .markAsOnlyWorkingFor2D()
      .markAsNotWorkingForObjects();
    const layerOnlySepiaProperties = layerOnlySepiaEffect.getProperties();
    layerOnlySepiaProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel('Opacity (between 0 and 1)')
      .setType('number');

    const nightEffect = extension
      .addEffect('FakeNight')
      .setFullName('Fake Night Effect')
      .setDescription('A fake night effect')
      .markAsOnlyWorkingFor2D()
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
      .markAsOnlyWorkingFor2D()
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
    {
      const effect3D = extension
        .addEffect('FakeDirectionalLight')
        .setFullName('Fake directional light')
        .setDescription('An effect for 3D layers')
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/fake-DirectionalLight.js');
      const properties = effect3D.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel('Light color')
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.5')
        .setLabel('Intensity')
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Y-')
        .setLabel('3D world top')
        .setType('choice')
        .addExtraInfo('Y-')
        .addExtraInfo('Z+')
        .setGroup('Orientation');
      properties
        .getOrCreate('elevation')
        .setValue('45')
        .setLabel('Elevation (in degrees)')
        .setType('number')
        .setGroup('Orientation')
        .setDescription('Maximal elevation is reached at 90°.');
      properties
        .getOrCreate('rotation')
        .setValue('0')
        .setLabel('Rotation (in degrees)')
        .setType('number')
        .setGroup('Orientation');
    }
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

    const behavior = extension.addBehavior(
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
    behavior
      .addExpression(
        'SomethingReturningNumberWith1NumberParam',
        'Some expression returning a number',
        'Some expression returning a number',
        '',
        'fake-icon.png'
      )
      .addParameter('expression', 'First parameter (number)', '', false);
    behavior
      .addStrExpression(
        'SomethingReturningStringWith1NumberParam',
        'Some expression returning a string',
        'Some expression returning a string',
        '',
        'fake-icon.png'
      )
      .addParameter('expression', 'First parameter (number)', '', false);

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

    // $FlowExpectedError
    fakeObject.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      return false;
    };
    // $FlowExpectedError
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

    // $FlowExpectedError
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
    // $FlowExpectedError
    fakeObject.getInitialInstanceProperties = function(
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
  }
  {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Button',
      'Fake event-based object',
      'Fake event-based object',
      '',
      'MIT'
    );
    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
  {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'FakeScene3D',
        'Fake 3D',
        'Fake support for 3D in GDevelop.',
        '',
        'MIT'
      )
      .setCategory('General');
    extension
      .addInstructionOrExpressionGroupMetadata('3D')
      .setIcon('res/conditions/3d_box.svg');
    const Cube3DObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError
    Cube3DObject.getProperties = function(objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();
      return objectProperties;
    };
    // $FlowExpectedError
    Cube3DObject.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    extension
      .addObject(
        'Cube3DObject',
        '3D Box',
        'A box with images for each face',
        'JsPlatform/Extensions/3d_box.svg',
        Cube3DObject
      )
      .setCategoryFullName('General')
      .markAsRenderedIn3D();
    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
  {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'FakeTextInput',
        'Fake Text Input',
        'A fake text field the player can type text into.',
        '',
        'MIT'
      )
      .setCategory('User interface');
    extension
      .addInstructionOrExpressionGroupMetadata('Text Input')
      .setIcon('JsPlatform/Extensions/text_input.svg');

    const textInputObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError
    textInputObject.getProperties = function(objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();
      return objectProperties;
    };

    // $FlowExpectedError
    textInputObject.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties
        .getOrCreate('initialValue')
        .setValue(instance.getRawStringProperty('initialValue'))
        .setType('string')
        .setLabel('Initial value')
        .setDescription('Value that the input will take **initially**');
      instanceProperties
        .getOrCreate('placeholder')
        .setValue(instance.getRawStringProperty('placeholder'))
        .setType('string')
        .setLabel('Placeholder');

      return instanceProperties;
    };

    // $FlowExpectedError
    textInputObject.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === 'initialValue') {
        instance.setRawStringProperty('initialValue', newValue);
        return true;
      } else if (propertyName === 'placeholder') {
        instance.setRawStringProperty('placeholder', newValue);
        return true;
      }

      return false;
    };

    extension
      .addObject(
        'TextInput',
        'Text input',
        'A text field the player can type text into.',
        'JsPlatform/Extensions/text_input.svg',
        textInputObject
      )
      .setCategoryFullName('User interface');

    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
};
