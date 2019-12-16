/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'Effects',
      'Effects',
      'Contains various effects to be used in games.',
      'Various contributors from PixiJS, PixiJS filters and GDevelop',
      'MIT'
    );

    // ℹ️ You can declare an effect here. Please order the effects by alphabetical order.
    // This file is for common effects that are well-known/"battle-tested". If you have an
    // experimental effect, create an extension for it (copy this folder, rename "Effects" to something else,
    // and remove all the files and declaration of effects, or take a look at ExampleJsExtension).

    const blackAndWhiteEffect = extension
      .addEffect('BlackAndWhite')
      .setFullName(_('Black and White'))
      .setDescription(_('Alter the colors to make the image black and white'))
      .addIncludeFile('Extensions/Effects/black-and-white-pixi-filter.js');
    const blackAndWhiteProperties = blackAndWhiteEffect.getProperties();
    blackAndWhiteProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Opacity (between 0 and 1)'))
        .setType('number')
    );

    const blurEffect = extension
      .addEffect('Blur')
      .setFullName(_('Blur'))
      .setDescription(_('Blur the rendered image'))
      .addIncludeFile('Extensions/Effects/blur-pixi-filter.js');
    const blurProperties = blurEffect.getProperties();
    blurProperties.set(
      'blur',
      new gd.PropertyDescriptor(/* defaultValue= */ '8')
        .setLabel(_('Blur intensity'))
        .setType('number')
    );
    blurProperties.set(
      'quality',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(
          _(
            'Number of render passes. An high value will cause lags/poor performance.'
          )
        )
        .setType('number')
    );
    blurProperties.set(
      'resolution',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Resolution'))
        .setType('number')
    );
    blurProperties.set(
      'resolution',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Kernel size (one of these values: 5, 7, 9, 11, 13, 15)'))
        .setType('number')
    );

    const brightnessEffect = extension
      .addEffect('Brightness')
      .setFullName(_('Brightness'))
      .setDescription(_('Make the image brighter'))
      .addIncludeFile('Extensions/Effects/brightness-pixi-filter.js');
    const brightnessProperties = brightnessEffect.getProperties();
    brightnessProperties.set(
      'brightness',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.8')
        .setLabel(_('Brightness (between 0 and 1)'))
        .setType('number')
    );

    const lightNightEffect = extension
      .addEffect('LightNight')
      .setFullName(_('Light Night'))
      .setDescription(_('Alter the colors to simulate night'))
      .addIncludeFile('Extensions/Effects/light-night-pixi-filter.js');
    const lightNightProperties = lightNightEffect.getProperties();
    lightNightProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Opacity (between 0 and 1)'))
        .setType('number')
    );

    const nightEffect = extension
      .addEffect('Night')
      .setFullName(_('Dark Night'))
      .setDescription(_('Alter the colors to simulate a dark night'))
      .addIncludeFile('Extensions/Effects/night-pixi-filter.js');
    const nightProperties = nightEffect.getProperties();
    nightProperties.set(
      'intensity',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Intensity (between 0 and 1)'))
        .setType('number')
    );
    nightProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Opacity (between 0 and 1)'))
        .setType('number')
    );

    const noiseEffect = extension
      .addEffect('Noise')
      .setFullName(_('Noise'))
      .setDescription(_('Add some noise on the rendered image'))
      .addIncludeFile('Extensions/Effects/noise-pixi-filter.js');
    const noiseProperties = noiseEffect.getProperties();
    noiseProperties.set(
      'noise',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Noise intensity (between 0 and 1)'))
        .setType('number')
    );

    const sepiaEffect = extension
      .addEffect('Sepia')
      .setFullName(_('Sepia'))
      .setDescription(_('Alter the colors to sepia'))
      .addIncludeFile('Extensions/Effects/sepia-pixi-filter.js');
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Opacity (between 0 and 1)'))
        .setType('number')
    );

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
