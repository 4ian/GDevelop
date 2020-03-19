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

    const adjustmentEffect = extension
      .addEffect('Adjustment')
      .setFullName(_('Adjustment'))
      .setDescription(
        _(
          'Adjust gamma, contrast, saturation, brightness, alpha or color-channel shift.'
        )
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-adjustment.js')
      .addIncludeFile('Extensions/Effects/adjustment-pixi-filter.js');
    const adjustmentProperties = adjustmentEffect.getProperties();
    adjustmentProperties.set(
      'gamma',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Gamma (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'saturation',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Saturation (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'contrast',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Contrast (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'brightness',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Brightness (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'red',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Red (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'green',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Green (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'blue',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.6')
        .setLabel(_('Blue (between 0 and 5)'))
        .setType('number')
    );
    adjustmentProperties.set(
      'alpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Alpha (between 0 and 1, 0 is transparent)'))
        .setType('number')
    );

    const advancedBloomEffect = extension
      .addEffect('AdvancedBloom')
      .setFullName(_('Advanced bloom'))
      .setDescription(_('Applies a bloom effect.'))
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

    const asciiEffect = extension
      .addEffect('Ascii')
      .setFullName(_('ASCII'))
      .setDescription(_('Render the image with ASCII characters only.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-ascii.js')
      .addIncludeFile('Extensions/Effects/ascii-pixi-filter.js');
    const asciiProperties = asciiEffect.getProperties();
    asciiProperties.set(
      'size',
      new gd.PropertyDescriptor(/* defaultValue= */ '8')
        .setLabel(_('Size (between 2 and 20)'))
        .setType('number')
    );

    const bevelEffect = extension
      .addEffect('Bevel')
      .setFullName(_('Beveled edges'))
      .setDescription(_('Add beveled edges around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-bevel.js')
      .addIncludeFile('Extensions/Effects/bevel-pixi-filter.js');
    const bevelProperties = bevelEffect.getProperties();
    bevelProperties.set(
      'rotation',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Rotation (between 0 and 360)'))
        .setType('number')
    );
    bevelProperties.set(
      'thickness',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Outer strength (between 0 and 5)'))
        .setType('number')
    );
    bevelProperties.set(
      'distance',
      new gd.PropertyDescriptor(/* defaultValue= */ '15')
        .setLabel(_('Distance (between 10 and 20)'))
        .setType('number')
    );
    bevelProperties.set(
      'lightAlpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Light alpha (between 0 and 1)'))
        .setType('number')
    );
    bevelProperties.set(
      'lightColor',
      new gd.PropertyDescriptor(/* defaultValue= */ '#ffffff')
        .setLabel(_('Light color (color of the outline)'))
        .setType('color')
    );
    bevelProperties.set(
      'shadowColor',
      new gd.PropertyDescriptor(/* defaultValue= */ '#000000')
        .setLabel(_('Shadow color (color of the outline)'))
        .setType('color')
    );
    bevelProperties.set(
      'shadowAlpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Shadow alpha (between 0 and 1)'))
        .setType('number')
    );

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

    const blendingModeEffect = extension
      .addEffect('BlendingMode')
      .setFullName(_('Blending mode'))
      .setDescription(
        _('Alter the rendered image with the specified blend mode.')
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-alpha.js')
      .addIncludeFile('Extensions/Effects/blending-mode-pixi-filter.js');
    const blendingModeProperties = blendingModeEffect.getProperties();
    blendingModeProperties.set(
      'blendmode',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Mode (0: Normal, 1: Add, 2: Multiply, 3: Screen)'))
        .setType('number')
    );
    blendingModeProperties.set(
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
      new gd.PropertyDescriptor(/* defaultValue= */ '5')
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

    const bulgePinchEffect = extension
      .addEffect('BulgePinch')
      .setFullName(_('Bulge Pinch'))
      .setDescription(_('Bulges or pinches the image in a circle.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-bulge-pinch.js')
      .addIncludeFile('Extensions/Effects/bulge-pinch-pixi-filter.js');
    const bulgePinchProperties = bulgePinchEffect.getProperties();
    bulgePinchProperties.set(
      'centerX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center X (between 0 and 1, 0.5 is image middle)'))
        .setType('number')
    );
    bulgePinchProperties.set(
      'centerY',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center Y (between 0 and 1, 0.5 is image middle)'))
        .setType('number')
    );
    bulgePinchProperties.set(
      'radius',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Radius'))
        .setType('number')
    );
    bulgePinchProperties.set(
      'strength',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('strength (between -1 and 1)'))
        .setType('number')
        .setDescription(_('-1 is strong pinch, 0 is no effect, 1 is strong bulge'))
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

    const colorReplaceEffect = extension
      .addEffect('ColorReplace')
      .setFullName(_('Color Replace'))
      .setDescription(_('Effect replacing a color (or similar) by another.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-color-replace.js')
      .addIncludeFile('Extensions/Effects/color-replace-pixi-filter.js');
    const colorReplaceProperties = colorReplaceEffect.getProperties();
    colorReplaceProperties.set(
      'originalColor',
      new gd.PropertyDescriptor(/* defaultValue= */ '#ff0000')
        .setLabel(_('Original Color'))
        .setType('color')
        .setDescription('The color that will be changed')
    );
    colorReplaceProperties.set(
      'newColor',
      new gd.PropertyDescriptor(/* defaultValue= */ '#000000')
        .setLabel(_('New Color'))
        .setType('color')
        .setDescription('The new color')
    );
    colorReplaceProperties.set(
      'epsilon',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.4')
        .setLabel(_('Epsilon (between 0 and 1)'))
        .setType('number')
        .setDescription(
          _(
            'Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)'
          )
        )
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

    const dotEffect = extension
      .addEffect('Dot')
      .setFullName(_('Dot'))
      .setDescription(
        _(
          'Applies a dotscreen effect making objects appear to be made out of black and white halftone dots like an old printer.'
        )
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-dot.js')
      .addIncludeFile('Extensions/Effects/dot-pixi-filter.js');
    const dotProperties = dotEffect.getProperties();
    dotProperties.set(
      'scale',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Scale (between 0.3 and 1)'))
        .setType('number')
        .setDescription('The scale of the effect')
    );
    dotProperties.set(
      'angle',
      new gd.PropertyDescriptor(/* defaultValue= */ '5')
        .setLabel(_('Angle (between 0 and 5)'))
        .setType('number')
        .setDescription('The radius of the effect')
    );

    const dropShadowEffect = extension
      .addEffect('DropShadow')
      .setFullName(_('Drop shadow'))
      .setDescription(_('Add a shadow around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-drop-shadow.js')
      .addIncludeFile('Extensions/Effects/drop-shadow-pixi-filter.js');
    const dropShadowProperties = dropShadowEffect.getProperties();
    dropShadowProperties.set(
      'blur',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Blur (between 0 and 20)'))
        .setType('number')
    );
    dropShadowProperties.set(
      'quality',
      new gd.PropertyDescriptor(/* defaultValue= */ '3')
        .setLabel(_('Quality (between 1 and 20)'))
        .setType('number')
    );
    dropShadowProperties.set(
      'alpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Alpha (between 0 and 1)'))
        .setType('number')
    );
    dropShadowProperties.set(
      'distance',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Distance (between 0 and 50)'))
        .setType('number')
    );
    dropShadowProperties.set(
      'rotation',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Rotation (between 0 and 360)'))
        .setType('number')
    );
    dropShadowProperties.set(
      'color',
      new gd.PropertyDescriptor(/* defaultValue= */ '#000000')
        .setLabel(_('Color of the shadow'))
        .setType('color')
    );
    dropShadowProperties.set(
      'shadowOnly',
      new gd.PropertyDescriptor(/* defaultValue= */ 'false')
        .setLabel(_('Shadow only (shows only the shadow when enabled)'))
        .setType('boolean')
    );

    const glitchEffect = extension
      .addEffect('Glitch')
      .setFullName(_('Glitch'))
      .setDescription(_('Applies a glitch effect to an object.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-glitch.js')
      .addIncludeFile('Extensions/Effects/glitch-pixi-filter.js');
    const glitchProperties = glitchEffect.getProperties();
    glitchProperties.set(
      'slices',
      new gd.PropertyDescriptor(/* defaultValue= */ '5')
        .setLabel(_('Slices (between 2 and infinite)'))
        .setType('number')
        .setDescription('The maximum number of slices')
    );
    glitchProperties.set(
      'offset',
      new gd.PropertyDescriptor(/* defaultValue= */ '100')
        .setLabel(_('Offset (between -400 and 400)'))
        .setType('number')
        .setDescription('The maximum offset amount of slices')
    );
    glitchProperties.set(
      'direction',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Direction (between -180 and 180)'))
        .setType('number')
        .setDescription('The angle in degree of the offset of slices')
    );
    glitchProperties.set(
      'fillMode',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Fill Mode (between 0 and 4)'))
        .setType('number')
        .setDescription(
          _(
            'The fill mode of the space after the offset.(0: TRANSPARENT, 1: ORIGINAL, 2: LOOP, 3: CLAMP, 4: MIRROR)'
          )
        )
    );
    glitchProperties.set(
      'average',
      new gd.PropertyDescriptor(/* defaultValue= */ 'false')
        .setLabel(_('Average'))
        .setType('boolean')
        .setDescription('Divide the bands roughly based on equal amounts')
    );
    glitchProperties.set(
      'minSize',
      new gd.PropertyDescriptor(/* defaultValue= */ '8')
        .setLabel(_('Min Size'))
        .setType('number')
        .setDescription('Minimum size of individual slice')
    );
    glitchProperties.set(
      'sampleSize',
      new gd.PropertyDescriptor(/* defaultValue= */ '512')
        .setLabel(_('Sample Size'))
        .setType('number')
        .setDescription('The resolution of the displacement image')
    );
    glitchProperties.set(
      'animated',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Animated (Enable animations)'))
        .setType('boolean')
    );
    glitchProperties.set(
      'redX',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Red X offset (between -50 and 50)'))
        .setType('number')
    );
    glitchProperties.set(
      'redY',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Red Y offset (between -50 and 50)'))
        .setType('number')
    );
    glitchProperties.set(
      'greenX',
      new gd.PropertyDescriptor(/* defaultValue= */ '10')
        .setLabel(_('Green X offset (between -50 and 50)'))
        .setType('number')
    );
    glitchProperties.set(
      'greenY',
      new gd.PropertyDescriptor(/* defaultValue= */ '-4')
        .setLabel(_('Green Y offset (between -50 and 50)'))
        .setType('number')
    );
    glitchProperties.set(
      'blueX',
      new gd.PropertyDescriptor(/* defaultValue= */ '10')
        .setLabel(_('Blue X offset (between -50 and 50)'))
        .setType('number')
    );
    glitchProperties.set(
      'blueY',
      new gd.PropertyDescriptor(/* defaultValue= */ '-4')
        .setLabel(_('Blue Y offset (between -50 and 50)'))
        .setType('number')
    );

    const glowEffect = extension
      .addEffect('Glow')
      .setFullName(_('Glow'))
      .setDescription(_('Add a glow effect around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-glow.js')
      .addIncludeFile('Extensions/Effects/glow-pixi-filter.js');
    const glowProperties = glowEffect.getProperties();
    glowProperties.set(
      'innerStrength',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Inner strength (between 0 and 20)'))
        .setType('number')
    );
    glowProperties.set(
      'outerStrength',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Outer strength (between 0 and 20)'))
        .setType('number')
    );
    glowProperties.set(
      'distance',
      new gd.PropertyDescriptor(/* defaultValue= */ '15')
        .setLabel(_('Distance (between 10 and 20)'))
        .setType('number')
    );
    glowProperties.set(
      'color',
      new gd.PropertyDescriptor(/* defaultValue= */ '#ffffff')
        .setLabel(_('Color of the outline)'))
        .setType('color')
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

    const oldFilmEffect = extension
      .addEffect('OldFilm')
      .setFullName(_('Old Film'))
      .setDescription(_('Add a Old film effect around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-old-film.js')
      .addIncludeFile('Extensions/Effects/old-film-pixi-filter.js');
    const oldFilmProperties = oldFilmEffect.getProperties();
    oldFilmProperties.set(
      'sepia',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Sepia (between 0 and 1)'))
        .setType('number')
        .setDescription(
          _(
            'The amount of saturation of sepia effect, a value of 1 is more saturation and closer to 0 is less, and a value of 0 produces no sepia effect'
          )
        )
    );
    oldFilmProperties.set(
      'noise',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Noise (between 0 and 1)'))
        .setType('number')
        .setDescription('Opacity/intensity of the noise effect')
    );
    oldFilmProperties.set(
      'noiseSize',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Noise Size (between 0 and 10)'))
        .setType('number')
        .setDescription('The size of the noise particles')
    );
    oldFilmProperties.set(
      'scratch',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.5')
        .setLabel(_('Scratch (between -1 and 1)'))
        .setType('number')
        .setDescription('How often scratches appear')
    );
    oldFilmProperties.set(
      'scratchDensity',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Scratch Density (between 0 and 1)'))
        .setType('number')
        .setDescription('The density of the number of scratches')
    );
    oldFilmProperties.set(
      'scratchWidth',
      new gd.PropertyDescriptor(/* defaultValue= */ '1.0')
        .setLabel(_('Scratch Width (between 1 and 20)'))
        .setType('number')
        .setDescription('The width of the scratches')
    );
    oldFilmProperties.set(
      'vignetting',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Vignetting (between 0 and 1)'))
        .setType('number')
        .setDescription('The radius of the vignette effect')
    );
    oldFilmProperties.set(
      'vignettingAlpha',
      new gd.PropertyDescriptor(/* defaultValue= */ '1.0')
        .setLabel(_('Vignetting Alpha (between 0 and 1)'))
        .setType('number')
        .setDescription('The size of the noise particles')
    );
    oldFilmProperties.set(
      'vignettingBlur',
      new gd.PropertyDescriptor(/* defaultValue= */ '0.3')
        .setLabel(_('Vignetting Blur (between 0 and 1)'))
        .setType('number')
        .setDescription('Blur intensity of the vignette')
    );
    oldFilmProperties.set(
      'animated',
      new gd.PropertyDescriptor(/* defaultValue= */ 'true')
        .setLabel(_('Animated (Enable animations)'))
        .setType('boolean')
    );

    const outlineEffect = extension
      .addEffect('Outline')
      .setFullName(_('Outline'))
      .setDescription(_('Draws an outline around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-outline.js')
      .addIncludeFile('Extensions/Effects/outline-pixi-filter.js');
    const outlineProperties = outlineEffect.getProperties();
    outlineProperties.set(
      'thickness',
      new gd.PropertyDescriptor(/* defaultValue= */ '2')
        .setLabel(_('Thickness (between 0 and 20)'))
        .setType('number')
    );
    outlineProperties.set(
      'color',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Color of the outline'))
        .setType('color')
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

    const radialBlurEffect = extension
      .addEffect('RadialBlur')
      .setFullName(_('Radial Blur'))
      .setDescription(_('Applies a Motion blur to an object.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-radial-blur.js')
      .addIncludeFile('Extensions/Effects/radial-blur-pixi-filter.js');
    const radialBlurProperties = radialBlurEffect.getProperties();
    radialBlurProperties.set(
      'radius',
      new gd.PropertyDescriptor(/* defaultValue= */ '-1')
        .setLabel(_('Radius'))
        .setType('number')
        .setDescription(_('The maximum size of the blur radius, -1 is infinite'))
    );
    radialBlurProperties.set(
      'angle',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Angle (between -180 and 180)'))
        .setType('number')
        .setDescription(_('The angle in degree of the motion for blur effect'))
    );
    radialBlurProperties.set(
      'kernelSize',
      new gd.PropertyDescriptor(/* defaultValue= */ '5')
        .setLabel(_('Kernel Size (between 3 and 25)'))
        .setType('number')
        .setDescription(_('The kernel size of the blur filter (Odd number)'))
    );
    radialBlurProperties.set(
      'centerX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center X'))
        .setType('number')
    );
    radialBlurProperties.set(
      'centerY',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center Y'))
        .setType('number')
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

    const rgbSplitEffect = extension
      .addEffect('RGBSplit')
      .setFullName(_('RGB split (chromatic aberration)'))
      .setDescription(
        _('Applies a RGB split effect also known as chromatic aberration.')
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-rgb-split.js')
      .addIncludeFile('Extensions/Effects/rgb-split-pixi-filter.js');
    const rgbSplitProperties = rgbSplitEffect.getProperties();
    rgbSplitProperties.set(
      'redX',
      new gd.PropertyDescriptor(/* defaultValue= */ '-10')
        .setLabel(_('Red X offset (between -20 and 20)'))
        .setType('number')
    );
    rgbSplitProperties.set(
      'redY',
      new gd.PropertyDescriptor(/* defaultValue= */ '1')
        .setLabel(_('Red Y offset (between -20 and 20)'))
        .setType('number')
    );
    rgbSplitProperties.set(
      'greenX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Green X offset (between -20 and 20)'))
        .setType('number')
    );
    rgbSplitProperties.set(
      'greenY',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Green Y offset (between -20 and 20)'))
        .setType('number')
    );
    rgbSplitProperties.set(
      'blueX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Blue X offset (between -20 and 20)'))
        .setType('number')
    );
    rgbSplitProperties.set(
      'blueY',
      new gd.PropertyDescriptor(/* defaultValue= */ '10')
        .setLabel(_('Blue Y offset (between -20 and 20)'))
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

    const twistEffect = extension
      .addEffect('Twist')
      .setFullName(_('Twist'))
      .setDescription(
        _(
          'Applies a twist effect making objects appear twisted in the given direction.'
        )
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-twist.js')
      .addIncludeFile('Extensions/Effects/twist-pixi-filter.js');
    const twistProperties = twistEffect.getProperties();
    twistProperties.set(
      'radius',
      new gd.PropertyDescriptor(/* defaultValue= */ '200')
        .setLabel(_('Radius'))
        .setType('number')
        .setDescription(_('The radius of the twist'))
    );
    twistProperties.set(
      'angle',
      new gd.PropertyDescriptor(/* defaultValue= */ '4')
        .setLabel(_('Angle (between -10 and 10)'))
        .setType('number')
        .setDescription(_('The angle in degree of the twist'))
    );
    twistProperties.set(
      'padding',
      new gd.PropertyDescriptor(/* defaultValue= */ '20')
        .setLabel(_('Padding'))
        .setType('number')
        .setDescription(_('Padding for filter area'))
    );
    twistProperties.set(
      'offsetX',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center X'))
        .setType('number')
    );
    twistProperties.set(
      'offsetY',
      new gd.PropertyDescriptor(/* defaultValue= */ '0')
        .setLabel(_('Center Y'))
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
    
    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
