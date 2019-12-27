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
      .setDescription(_('Blur the rendered image.'))
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
      .setDescription(_('Make the image brighter.'))
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
      .setDescription(_('Alter the colors to simulate night.'))
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
      .setDescription(_('Alter the colors to simulate a dark night.'))
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
      .setDescription(_('Add some noise on the rendered image.'))
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
      .setDescription(_('Alter the colors to sepia.'))
      .addIncludeFile('Extensions/Effects/sepia-pixi-filter.js');
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties.set(
      'opacity',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Opacity (between 0 and 1)'))
        .setType('number')
    );

    const crtEffect = extension
      .addEffect('CRT')
      .setFullName(_('CRT'))
      .setDescription(_('Apply an effect resembling old CRT monitors.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-crt.js')
      .addIncludeFile('Extensions/Effects/crt-pixi-filter.js');
    const crtProperties = crtEffect.getProperties();
    crtProperties.set(
      'lineWidth',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.2')
        .setLabel(_('Line width (between 0 and 5)'))
        .setType('number')
    );
    crtProperties.set(
      'lineContrast',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Line contrast (between 0 and 1)'))
        .setType('number')
    );
    crtProperties.set(
      'noise',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.1')
        .setLabel(_('Noise (between 0 and 1)'))
        .setType('number')
    );
    crtProperties.set(
      'curvature',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Curvature (between 0 and 10)'))
        .setType('number')
    );
    crtProperties.set(
      'verticalLine',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Vertical line (true or false)'))
        .setType('boolean')
    );
    crtProperties.set(
      'noiseSize',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Noise size (between 0 and 10)'))
        .setType('number')
    );
    crtProperties.set(
      'vignetting',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Vignetting (between 0 and 1)'))
        .setType('number')
    );
    crtProperties.set(
      'vignettingAlpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Vignetting alpha (between 0 and 1)'))
        .setType('number')
    );
    crtProperties.set(
      'vignettingBlur',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Vignetting blur (between 0 and 1)'))
        .setType('number')
    );
    crtProperties.set(
      'animated',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Animated (Enable animations)'))
        .setType('boolean')
    );

    const godrayEffect = extension
      .addEffect('Godray')
      .setFullName(_('Godray'))
      .setDescription(_('Apply and animate atmospheric light rays.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-godray.js')
      .addIncludeFile('Extensions/Effects/godray-pixi-filter.js');
    const godrayProperties = godrayEffect.getProperties();
    godrayProperties.set(
      'parallel',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Parallel (parallel rays)'))
        .setType('boolean')
    );
    godrayProperties.set(
      'animated',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Animated (animate rays)'))
        .setType('boolean')
    );
    godrayProperties.set(
      'lacunarity',
      new gd.PropertyDescriptor(/* defaultValue= */ '2.75')
        .setLabel(_('Lacunarity (between 0 and 5)'))
        .setType('number')
    );
    godrayProperties.set(
      'angle',
      new gd.PropertyDescriptor(/* defaultValue= */ '30')
        .setLabel(_('Angle (between -60 and 60)'))
        .setType('number')
    );
    godrayProperties.set(
      'gain',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.6')
        .setLabel(_('Gain (between 0 and 1)'))
        .setType('number')
    );
    godrayProperties.set(
      'light',
      new gd.PropertyDescriptor(/* defaultValue= */ '30')
        .setLabel(_('Light (between 0 and 60)'))
        .setType('number')
    );
    godrayProperties.set(
      'x',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Center X (between 100 and 1000)'))
        .setType('number')
    );
    godrayProperties.set(
      'y',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Center Y (between -1000 and 100)'))
        .setType('number')
    );

    const tiltShiftEffect = extension
      .addEffect('TiltShift')
      .setFullName(_('Tilt shift'))
      .setDescription(_('Render a tilt-shift-like camera effect.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-tilt-shift.js')
      .addIncludeFile('Extensions/Effects/tilt-shift-pixi-filter.js');
    const tiltShiftProperties = tiltShiftEffect.getProperties();
    tiltShiftProperties.set(
      'blur',
      new gd.PropertyDescriptor(/* defaultValue= */ '30')
        .setLabel(_('Blur (between 0 and 200)'))
        .setType('number')
    );
    tiltShiftProperties.set(
      'gradientBlur',
      new gd.PropertyDescriptor(/* defaultValue= */ '1000')
        .setLabel(_('Gradient blur (between 0 and 2000)'))
        .setType('number')
    );

    const advancedBloomEffect = extension
      .addEffect('AdvancedBloom')
      .setFullName(_('Advanced bloom'))
      .setDescription(_('Applies a Bloom Effect.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile(
        'Extensions/Effects/pixi-filters/filter-advanced-bloom.js'
      )
      .addIncludeFile('Extensions/Effects/advanced-bloom-pixi-filter.js');
    const advancedBloomProperties = advancedBloomEffect.getProperties();
    advancedBloomProperties.set(
      'threshold',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Threshold (between 0 and 1)'))
        .setType('number')
    );
    advancedBloomProperties.set(
      'bloomScale',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.7')
        .setLabel(_('Bloom Scale (between 0 and 2)'))
        .setType('number')
    );
    advancedBloomProperties.set(
      'brightness',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.7')
        .setLabel(_('Brightness (between 0 and 2)'))
        .setType('number')
    );
    advancedBloomProperties.set(
      'blur',
      new gd.PropertyDescriptor(/* defaultValue= */ '4')
        .setLabel(_('Blur (between 0 and 20)'))
        .setType('number')
    );
    advancedBloomProperties.set(
      'quality',
      new gd.PropertyDescriptor(/* defaultValue= */ '7')
        .setLabel(_('Quality (between 0 and 20)'))
        .setType('number')
    );

    const kawaseBlurEffect = extension
      .addEffect('KawaseBlur')
      .setFullName(_('Kawase blur'))
      .setDescription(
        _('A much faster blur than Gaussian blur, but more complicated to use.')
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile('Extensions/Effects/kawase-blur-pixi-filter.js');
    const kawaseBlurProperties = kawaseBlurEffect.getProperties();
    kawaseBlurProperties.set(
      'pixelizeX',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Pixelize X (between 0 and 10)'))
        .setType('number')
    );
    kawaseBlurProperties.set(
      'pixelizeY',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Pixelize Y (between 0 and 10)'))
        .setType('number')
    );
    kawaseBlurProperties.set(
      'blur',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Blur (between 0 and 20)'))
        .setType('number')
    );
    kawaseBlurProperties.set(
      'quality',
      new gd.PropertyDescriptor(/* defaultValue= */ '3')
        .setLabel(_('Quality (between 1 and 20)'))
        .setType('number')
    );

    const zoomBlurEffect = extension
      .addEffect('ZoomBlur')
      .setFullName(_('Zoom blur'))
      .setDescription(_('Applies a Zoom blur.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-zoom-blur.js')
      .addIncludeFile('Extensions/Effects/zoom-blur-pixi-filter.js');
    const zoomBlurProperties = zoomBlurEffect.getProperties();
    zoomBlurProperties.set(
      'centerX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Center X (between 0 and 1, 0.5 is window middle)'))
        .setType('number')
    );
    zoomBlurProperties.set(
      'centerY',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Center Y (between 0 and 1, 0.5 is window middle)'))
        .setType('number')
    );
    zoomBlurProperties.set(
      'innerRadius',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.2')
        .setLabel(_('Inner radius (between 0 and 1, 0.5 is mid-way)'))
        .setType('number')
    );
    zoomBlurProperties.set(
      'strength',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('strength (between 0 and 5)'))
        .setType('number')
    );

    const displacementEffect = extension
      .addEffect('Displacement')
      .setFullName(_('Displacement'))
      .setDescription(
        _(
          'Uses the pixel values from the specified texture (called the displacement map) to perform a displacement of an object.'
        )
      )
      .addIncludeFile('Extensions/Effects/displacement-pixi-filter.js');
    const displacementProperties = displacementEffect.getProperties();
    displacementProperties.set(
      'displacementMapTexture',
      new gd.PropertyDescriptor('')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Displacement map texture'))
        .setDescription(
          _(
            'Displacement map texture for the effect. To get started, **download** [a default displacement map texture here](http://wiki.compilgames.net/doku.php/gdevelop5/interface/scene-editor/layer-effects).'
          )
        )
    );
    displacementProperties.set(
      'scaleX',
      new gd.PropertyDescriptor(/* defaultValue= */ '20')
        .setLabel(_('Scale on X axis'))
        .setType('number')
    );
    displacementProperties.set(
      'scaleY',
      new gd.PropertyDescriptor(/* defaultValue= */ '20')
        .setLabel(_('Scale on Y axis'))
        .setType('number')
    );

    const colorMapEffect = extension
      .addEffect('ColorMap')
      .setFullName(_('Color Map'))
      .setDescription(_('Change the color rendered on screen.'))
      .addIncludeFile('Extensions/Effects/color-map-pixi-filter.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-color-map.js');
    const colorMapProperties = colorMapEffect.getProperties();
    colorMapProperties.set(
      'colorMapTexture',
      new gd.PropertyDescriptor('')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Color map texture for the effect'))
        .setDescription(
          _(
            'You can change colors of pixels by modifing a reference color image, containing each colors, called the *Color Map Texture*. To get started, **download** [a default color map texture here](http://wiki.compilgames.net/doku.php/gdevelop5/interface/scene-editor/layer-effects).'
          )
        )
    );
    colorMapProperties.set(
      'nearest',
      new gd.PropertyDescriptor(/* defaultValue= */ 'false')
        .setLabel(_('Disable anti-aliasing ("nearest" pixel rounding)'))
        .setType('boolean')
    );
    colorMapProperties.set(
      'mix',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Mix'))
        .setType('number')
        .setDescription(_('Mix value of the effect on the layer (in percent)'))
    );

    const pixelateEffect = extension
      .addEffect('Pixelate')
      .setFullName(_('Pixelate'))
      .setDescription(
        _("Applies a pixelate effect, making display objects appear 'blocky'.")
      )
      .addIncludeFile('Extensions/Effects/pixelate-pixi-filter.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-pixelate.js');
    const pixelateProperties = pixelateEffect.getProperties();
    pixelateProperties.set(
      'size',
      new gd.PropertyDescriptor(/* defaultValue= */ '10')
        .setLabel(_('Size'))
        .setType('number')
        .setDescription(_('Size of the pixels (10 pixels by default)'))
    );

    const reflectionEffect = extension
      .addEffect('Reflection')
      .setFullName(_('Reflection'))
      .setDescription(
        _(
          'Applies a reflection effect to simulate the reflection on water with waves.'
        )
      )
      .addIncludeFile('Extensions/Effects/reflection-pixi-filter.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-reflection.js');
    const reflectionProperties = reflectionEffect.getProperties();
    reflectionProperties.set(
      'mirror',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Reflect the image on the waves'))
        .setType('boolean')
    );
    reflectionProperties.set(
      'boundary',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Vertical position of the reflection point'))
        .setType('number')
        .setDescription(
          _(
            'Default is 50% (middle). Smaller numbers produce a larger reflection, larger numbers produce a smaller reflection.'
          )
        )
    );
    reflectionProperties.set(
      'amplitudeStart',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Amplitude start'))
        .setType('number')
        .setDescription(_('Starting amplitude of waves (0 by default)'))
    );
    reflectionProperties.set(
      'amplitudeEnding',
      new gd.PropertyDescriptor(/* defaultValue= */ '20')
        .setLabel(_('Amplitude ending'))
        .setType('number')
        .setDescription(_('Ending amplitude of waves (20 by default)'))
    );
    reflectionProperties.set(
      'waveLengthStart',
      new gd.PropertyDescriptor(/* defaultValue= */ '30')
        .setLabel(_('Wave length start'))
        .setType('number')
        .setDescription(_('Starting wave length (30 by default)'))
    );
    reflectionProperties.set(
      'waveLengthEnding',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Wave length ending'))
        .setType('number')
        .setDescription(_('Ending wave length (100 by default)'))
    );
    reflectionProperties.set(
      'alphaStart',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Alpha start'))
        .setType('number')
        .setDescription(_('Starting alpha (1 by default)'))
    );
    reflectionProperties.set(
      'alphaEnding',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Alpha ending'))
        .setType('number')
        .setDescription(_('Ending alpha (1 by default)'))
    );
    reflectionProperties.set(
      'animated',
      new gd.PropertyDescriptor(/* defaultValue= */ 'false')
        .setLabel(_('Animate waves'))
        .setType('boolean')
    );

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
