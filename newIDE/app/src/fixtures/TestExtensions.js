let testExtensionsAdded = false;

/**
 * Create dummy extensions into gd.JsPlatform
 * @param gd The GD instance to use to create the extensions and find the platform.
 */
export const makeTestExtensions = gd => {
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
    sepiaProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel('Opacity (between 0 and 1)')
        .setType('number')
    );

    const nightEffect = extension
      .addEffect('FakeNight')
      .setFullName('Fake Night Effect')
      .setDescription('A fake night effect')
      .addIncludeFile('Extensions/Effects/fake-night.js');
    const nightProperties = nightEffect.getProperties();
    nightProperties.set(
      'intensity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel('Intensity (between 0 and 1)')
        .setType('number')
    );
    nightProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel('Opacity (between 0 and 1)')
        .setType('number')
    );

    const variousParametersEffect = extension
      .addEffect('FakeEffectWithVariousParameters')
      .setFullName('Fake Effect With Various Parameters')
      .setDescription('A fake effect using different parameters')
      .addIncludeFile(
        'Extensions/Effects/fake-effect-with-various-parameters.js'
      );
    const variousParametersEffectProperties = variousParametersEffect.getProperties();
    variousParametersEffectProperties.set(
      'intensity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel('Intensity (between 0 and 1)')
        .setType('number')
        .setDescription(
          'Some interesting description about this intensity parameter that can be used by the effect.'
        )
    );
    variousParametersEffectProperties.set(
      'someColor',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel('Some color')
        .setType('color')
        .setDescription(
          'Some interesting description about this color parameter that can be used by the effect.'
        )
    );
    variousParametersEffectProperties.set(
      'image',
      new gd.PropertyDescriptor(/* defaultValue= */ '')
        .setLabel('An image resource')
        .setType('resource')
        .addExtraInfo('image')
        .setDescription(
          'Some interesting description about this image resource that can be used by the effect.'
        )
    );
    variousParametersEffectProperties.set(
      'someBoolean',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel('Some setting to enable or not for the effect')
        .setType('boolean')
        .setDescription('And some *optional* description.')
    );

    platform.addNewExtension(extension);
    extension.delete(); // Release the extension as it was copied inside gd.JsPlatform
  }
};
