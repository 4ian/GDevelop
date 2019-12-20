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
    sepiaProperties.set('opacity', new gd.PropertyDescriptor(/* defaultValue= */ '1').setLabel(_('Opacity (between 0 and 1)')).setType('number'));

    const setFilterProperties = (propertiesSchema, filterProperties) => {
      Object.keys(propertiesSchema).forEach(property => {
        const value = propertiesSchema[property];
        filterProperties.set(property, new gd.PropertyDescriptor(/* defaultValue= */ value.default).setLabel(value.name + ' (' + value.description + ')').setType('number'));
      });
    };

    const crtPropertiesSchema = {
      lineWidth: { name: _('Line width'), default: '0.2', description: _('between 0 and 5') },
      lineContrast: { name: _('Line contrast'), default: '0', description: _('between 0 and 1') },
      noise: { name: _('Noise'), default: '0.1', description: _('between 0 and 1') },
      curvature: { name: _('Curvature'), default: '0', description: _('between 0 and 10') },
      verticalLine: { name: _('Vertical line'), default: '0', description: _('0 = false, 1 = true') },
      noiseSize: { name: _('Noise size'), default: '1', description: _('between 0 and 10') },
      vignetting: { name: _('Vignetting'), default: '0.3', description: _('between 0 and 1') },
      vignettingAlpha: { name: _('Vignetting alpha'), default: '1', description: _('between 0 and 1') },
      vignettingBlur: { name: _('Vignetting blur'), default: '0.3', description: _('between 0 and 1') },
      time: { name: _('Time'), default: '0.5', description: _('between 0 and 20') },
      seed: { name: _('Seed'), default: '0', description: _('between 0 and 1') },
    };
    const crtEffect = extension
      .addEffect('Crt')
      .setFullName(_('Crt'))
      .setDescription(_('Add Crt effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-crt.js')
      .addIncludeFile('Extensions/Effects/crt-pixi-filter.js');
    const crtProperties = crtEffect.getProperties();
    setFilterProperties(crtPropertiesSchema, crtProperties);

    const godrayPropertiesSchema = {
      parallel: { name: _('Parallel'), default: '1', description: _('0 = false, 1 = true') },
      lacunarity: { name: _('Lacunarity'), default: '2.75', description: _('between 0 and 5') },
      angle: { name: _('Angle'), default: '30', description: _('between -60 and 60') },
      gain: { name: _('Gain'), default: '0.6', description: _('between 0 and 1') },
      time: { name: _('Time'), default: '0.5', description: _('between 0 and 20') },
      light: { name: _('Light'), default: '30', description: _('between 0 and 60') },
      x: { name: _('Center X'), default: '100', description: _('between 100 and 1000') },
      y: { name: _('Center Y'), default: '100', description: _('between -1000 and 100') },
    };
    const godrayEffect = extension
      .addEffect('Godray')
      .setFullName(_('Godray'))
      .setDescription(_('Add Godray effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-godray.js')
      .addIncludeFile('Extensions/Effects/god-ray-pixi-filter.js');
    const godrayProperties = godrayEffect.getProperties();
    setFilterProperties(godrayPropertiesSchema, godrayProperties);

    const tiltShiftPropertiesSchema = {
      blur: { name: _('Blur'), default: '30', description: _('between 0 and 200') },
      gradientBlur: { name: _('Gradient blur'), default: '1000', description: _('between 0 and 2000') },
    };
    const tiltShiftEffect = extension
      .addEffect('TiltShift')
      .setFullName(_('Tilt Shift'))
      .setDescription(_('Add Tilt shift effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-tilt-shift.js')
      .addIncludeFile('Extensions/Effects/tilt-shift-pixi-filter.js');
    const tiltShiftProperties = tiltShiftEffect.getProperties();
    setFilterProperties(tiltShiftPropertiesSchema, tiltShiftProperties);

    const advancedBloomPropertiesSchema = {
      threshold: { name: _('Threshold'), default: '0.5', description: _('between 0 and 1') },
      bloomScale: { name: _('Bloom Scale'), default: '0.7', description: _('between 0 and 2') },
      brightness: { name: _('Brightness'), default: '0.7', description: _('between 0 and 2') },
      blur: { name: _('Blur'), default: '4', description: _('between 0 and 20') },
      quality: { name: _('Quality'), default: '7', description: _('between 0 and 20') },
    };
    const advancedBloomEffect = extension
      .addEffect('AdvancedBloom')
      .setFullName(_('Advanced Bloom'))
      .setDescription(_('Add Tilt shift effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js') //filter dependency
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-advanced-bloom.js')
      .addIncludeFile('Extensions/Effects/advanced-bloom-pixi-filter.js');
    const advancedBloomProperties = advancedBloomEffect.getProperties();
    setFilterProperties(advancedBloomPropertiesSchema, advancedBloomProperties);

    const kawaseBlurPropertiesSchema = {
      pixelizeX: { name: _('Pixelize X'), default: '1', description: _('between 0 and 10') },
      pixelizeY: { name: _('Pixelize Y'), default: '1', description: _('between 0 and 10') },
      blur: { name: _('Blur'), default: '0.5', description: _('between 0 and 20') },
      quality: { name: _('Quality'), default: '3', description: _('between 1 and 20') },
    };
    const kawaseBlurEffect = extension
      .addEffect('KawaseBlur')
      .setFullName(_('Kawase Blur'))
      .setDescription(_('Add Kawase blur effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile('Extensions/Effects/kawase-blur-pixi-filter.js');
    const kawaseBlurProperties = kawaseBlurEffect.getProperties();
    setFilterProperties(kawaseBlurPropertiesSchema, kawaseBlurProperties);

    const zoomBlurPropertiesSchema = {
      centerX: { name: _('Center X'), default: '0.5', description: _('between 0 and 1, 0.5 = window middle') },
      centerY: { name: _('Center Y'), default: '0.5', description: _('between 0 and 1, 0.5 = window middle') },
      innerRadius: { name: _('Inner radius'), default: '0.2', description: _('between 0 and 1, 0.5 = mid-way') },
      strength: { name: _('strength'), default: '0.3', description: _('between 0. and 5') },
    };
    const zoomBlurEffect = extension
      .addEffect('ZoomBlur')
      .setFullName(_('Zoom Blur'))
      .setDescription(_('Add Zoom blur effect'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-zoom-blur.js')
      .addIncludeFile('Extensions/Effects/zoom-blur-pixi-filter.js');
    const zoomBlurProperties = zoomBlurEffect.getProperties();
    setFilterProperties(zoomBlurPropertiesSchema, zoomBlurProperties);

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
