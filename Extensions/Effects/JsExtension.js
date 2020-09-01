// @flow
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
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
    adjustmentProperties
      .getOrCreate('gamma')
      .setValue('1')
      .setLabel(_('Gamma (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('saturation')
      .setValue('2')
      .setLabel(_('Saturation (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('contrast')
      .setValue('1')
      .setLabel(_('Contrast (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('brightness')
      .setValue('1')
      .setLabel(_('Brightness (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('red')
      .setValue('1')
      .setLabel(_('Red (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('green')
      .setValue('1')
      .setLabel(_('Green (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('blue')
      .setValue('0.6')
      .setLabel(_('Blue (between 0 and 5)'))
      .setType('number');
    adjustmentProperties
      .getOrCreate('alpha')
      .setValue('1')
      .setLabel(_('Alpha (between 0 and 1, 0 is transparent)'))
      .setType('number');

    const advancedBloomEffect = extension
      .addEffect('AdvancedBloom')
      .setFullName(_('Advanced bloom'))
      .setDescription(_('Applies a bloom effect.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile(
        'Extensions/Effects/pixi-filters/filter-advanced-bloom.js'
      )
      .addIncludeFile('Extensions/Effects/advanced-bloom-pixi-filter.js');
    const advancedBloomProperties = advancedBloomEffect.getProperties();
    advancedBloomProperties
      .getOrCreate('threshold')
      .setValue('0.5')
      .setLabel(_('Threshold (between 0 and 1)'))
      .setType('number');
    advancedBloomProperties
      .getOrCreate('bloomScale')
      .setValue('0.7')
      .setLabel(_('Bloom Scale (between 0 and 2)'))
      .setType('number');
    advancedBloomProperties
      .getOrCreate('brightness')
      .setValue('0.7')
      .setLabel(_('Brightness (between 0 and 2)'))
      .setType('number');
    advancedBloomProperties
      .getOrCreate('blur')
      .setValue('4')
      .setLabel(_('Blur (between 0 and 20)'))
      .setType('number');
    advancedBloomProperties
      .getOrCreate('quality')
      .setValue('7')
      .setLabel(_('Quality (between 0 and 20)'))
      .setType('number');

    const asciiEffect = extension
      .addEffect('Ascii')
      .setFullName(_('ASCII'))
      .setDescription(_('Render the image with ASCII characters only.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-ascii.js')
      .addIncludeFile('Extensions/Effects/ascii-pixi-filter.js');
    const asciiProperties = asciiEffect.getProperties();
    asciiProperties
      .getOrCreate('size')
      .setValue('8')
      .setLabel(_('Size (between 2 and 20)'))
      .setType('number');

    const bevelEffect = extension
      .addEffect('Bevel')
      .setFullName(_('Beveled edges'))
      .setDescription(_('Add beveled edges around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-bevel.js')
      .addIncludeFile('Extensions/Effects/bevel-pixi-filter.js');
    const bevelProperties = bevelEffect.getProperties();
    bevelProperties
      .getOrCreate('rotation')
      .setValue('1')
      .setLabel(_('Rotation (between 0 and 360)'))
      .setType('number');
    bevelProperties
      .getOrCreate('thickness')
      .setValue('2')
      .setLabel(_('Outer strength (between 0 and 5)'))
      .setType('number');
    bevelProperties
      .getOrCreate('distance')
      .setValue('15')
      .setLabel(_('Distance (between 10 and 20)'))
      .setType('number');
    bevelProperties
      .getOrCreate('lightAlpha')
      .setValue('1')
      .setLabel(_('Light alpha (between 0 and 1)'))
      .setType('number');
    bevelProperties
      .getOrCreate('lightColor')
      .setValue('#ffffff')
      .setLabel(_('Light color (color of the outline)'))
      .setType('color');
    bevelProperties
      .getOrCreate('shadowColor')
      .setValue('#000000')
      .setLabel(_('Shadow color (color of the outline)'))
      .setType('color');
    bevelProperties
      .getOrCreate('shadowAlpha')
      .setValue('1')
      .setLabel(_('Shadow alpha (between 0 and 1)'))
      .setType('number');

    const blackAndWhiteEffect = extension
      .addEffect('BlackAndWhite')
      .setFullName(_('Black and White'))
      .setDescription(_('Alter the colors to make the image black and white'))
      .addIncludeFile('Extensions/Effects/black-and-white-pixi-filter.js');
    const blackAndWhiteProperties = blackAndWhiteEffect.getProperties();
    blackAndWhiteProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel(_('Opacity (between 0 and 1)'))
      .setType('number');

    const blendingModeEffect = extension
      .addEffect('BlendingMode')
      .setFullName(_('Blending mode'))
      .setDescription(
        _('Alter the rendered image with the specified blend mode.')
      )
      .addIncludeFile('Extensions/Effects/blending-mode-pixi-filter.js');
    const blendingModeProperties = blendingModeEffect.getProperties();
    blendingModeProperties
      .getOrCreate('blendmode')
      .setValue('0')
      .setLabel(_('Mode (0: Normal, 1: Add, 2: Multiply, 3: Screen)'))
      .setType('number');
    blendingModeProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel(_('Opacity (between 0 and 1)'))
      .setType('number');

    const blurEffect = extension
      .addEffect('Blur')
      .setFullName(_('Blur'))
      .setDescription(_('Blur the rendered image.'))
      .addIncludeFile('Extensions/Effects/blur-pixi-filter.js');
    const blurProperties = blurEffect.getProperties();
    blurProperties
      .getOrCreate('blur')
      .setValue('8')
      .setLabel(_('Blur intensity'))
      .setType('number');
    blurProperties
      .getOrCreate('quality')
      .setValue('1')
      .setLabel(
        _(
          'Number of render passes. An high value will cause lags/poor performance.'
        )
      )
      .setType('number');
    blurProperties
      .getOrCreate('resolution')
      .setValue('2')
      .setLabel(_('Resolution'))
      .setType('number');
    blurProperties
      .getOrCreate('kernelSize')
      .setValue('5')
      .setLabel(_('Kernel size (one of these values: 5, 7, 9, 11, 13, 15)'))
      .setType('number');

    const brightnessEffect = extension
      .addEffect('Brightness')
      .setFullName(_('Brightness'))
      .setDescription(_('Make the image brighter.'))
      .addIncludeFile('Extensions/Effects/brightness-pixi-filter.js');
    const brightnessProperties = brightnessEffect.getProperties();
    brightnessProperties
      .getOrCreate('brightness')
      .setValue('0.8')
      .setLabel(_('Brightness (between 0 and 1)'))
      .setType('number');

    const bulgePinchEffect = extension
      .addEffect('BulgePinch')
      .setFullName(_('Bulge Pinch'))
      .setDescription(_('Bulges or pinches the image in a circle.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-bulge-pinch.js')
      .addIncludeFile('Extensions/Effects/bulge-pinch-pixi-filter.js');
    const bulgePinchProperties = bulgePinchEffect.getProperties();
    bulgePinchProperties
      .getOrCreate('centerX')
      .setValue('0')
      .setLabel(_('Center X (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    bulgePinchProperties
      .getOrCreate('centerY')
      .setValue('0')
      .setLabel(_('Center Y (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    bulgePinchProperties
      .getOrCreate('radius')
      .setValue('100')
      .setLabel(_('Radius'))
      .setType('number');
    bulgePinchProperties
      .getOrCreate('strength')
      .setValue('1')
      .setLabel(_('strength (between -1 and 1)'))
      .setType('number')
      .setDescription(
        _('-1 is strong pinch, 0 is no effect, 1 is strong bulge')
      );

    const colorMapEffect = extension
      .addEffect('ColorMap')
      .setFullName(_('Color Map'))
      .setDescription(_('Change the color rendered on screen.'))
      .addIncludeFile('Extensions/Effects/color-map-pixi-filter.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-color-map.js');
    const colorMapProperties = colorMapEffect.getProperties();
    colorMapProperties
      .getOrCreate('colorMapTexture')
      .setType('resource')
      .addExtraInfo('image')
      .setLabel(_('Color map texture for the effect'))
      .setDescription(
        _(
          'You can change colors of pixels by modifing a reference color image, containing each colors, called the *Color Map Texture*. To get started, **download** [a default color map texture here](http://wiki.compilgames.net/doku.php/gdevelop5/interface/scene-editor/layer-effects).'
        )
      );
    colorMapProperties
      .getOrCreate('nearest')
      .setValue('false')
      .setLabel(_('Disable anti-aliasing ("nearest" pixel rounding)'))
      .setType('boolean');
    colorMapProperties
      .getOrCreate('mix')
      .setValue('100')
      .setLabel(_('Mix'))
      .setType('number')
      .setDescription(_('Mix value of the effect on the layer (in percent)'));

    const colorReplaceEffect = extension
      .addEffect('ColorReplace')
      .setFullName(_('Color Replace'))
      .setDescription(_('Effect replacing a color (or similar) by another.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-color-replace.js')
      .addIncludeFile('Extensions/Effects/color-replace-pixi-filter.js');
    const colorReplaceProperties = colorReplaceEffect.getProperties();
    colorReplaceProperties
      .getOrCreate('originalColor')
      .setValue('#ff0000')
      .setLabel(_('Original Color'))
      .setType('color')
      .setDescription('The color that will be changed');
    colorReplaceProperties
      .getOrCreate('newColor')
      .setValue('#000000')
      .setLabel(_('New Color'))
      .setType('color')
      .setDescription('The new color');
    colorReplaceProperties
      .getOrCreate('epsilon')
      .setValue('0.4')
      .setLabel(_('Epsilon (between 0 and 1)'))
      .setType('number')
      .setDescription(
        _(
          'Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)'
        )
      );

    const crtEffect = extension
      .addEffect('CRT')
      .setFullName(_('CRT'))
      .setDescription(_('Apply an effect resembling old CRT monitors.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-crt.js')
      .addIncludeFile('Extensions/Effects/crt-pixi-filter.js');
    const crtProperties = crtEffect.getProperties();
    crtProperties
      .getOrCreate('lineWidth')
      .setValue('1')
      .setLabel(_('Line width (between 0 and 5)'))
      .setType('number');
    crtProperties
      .getOrCreate('lineContrast')
      .setValue('0.25')
      .setLabel(_('Line contrast (between 0 and 1)'))
      .setType('number');
    crtProperties
      .getOrCreate('noise')
      .setValue('0.3')
      .setLabel(_('Noise (between 0 and 1)'))
      .setType('number');
    crtProperties
      .getOrCreate('curvature')
      .setValue('1')
      .setLabel(_('Curvature (between 0 and 10)'))
      .setType('number');
    crtProperties
      .getOrCreate('verticalLine')
      .setValue('false')
      .setLabel(_('Show vertical lines'))
      .setType('boolean');
    crtProperties
      .getOrCreate('noiseSize')
      .setValue('1')
      .setLabel(_('Noise size (between 0 and 10)'))
      .setType('number');
    crtProperties
      .getOrCreate('vignetting')
      .setValue('0.3')
      .setLabel(_('Vignetting (between 0 and 1)'))
      .setType('number');
    crtProperties
      .getOrCreate('vignettingAlpha')
      .setValue('1')
      .setLabel(_('Vignetting alpha (between 0 and 1)'))
      .setType('number');
    crtProperties
      .getOrCreate('vignettingBlur')
      .setValue('0.3')
      .setLabel(_('Vignetting blur (between 0 and 1)'))
      .setType('number');
    crtProperties
      .getOrCreate('animationSpeed')
      .setValue('1')
      .setLabel(_('Interlaced Lines Speed'))
      .setType('number')
      .setDescription(
        _('0: Pause, 0.5: Half speed, 1: Normal speed, 2: Double speed, etc...')
      );
    crtProperties
      .getOrCreate('animationFrequency')
      .setValue('60')
      .setLabel(_('Noise Frequency'))
      .setType('number')
      .setDescription('Number of updates per second (0: no updates)');

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
    displacementProperties
      .getOrCreate('displacementMapTexture')
      .setType('resource')
      .addExtraInfo('image')
      .setLabel(_('Displacement map texture'))
      .setDescription(
        _(
          'Displacement map texture for the effect. To get started, **download** [a default displacement map texture here](http://wiki.compilgames.net/doku.php/gdevelop5/interface/scene-editor/layer-effects).'
        )
      );
    displacementProperties
      .getOrCreate('scaleX')
      .setValue('20')
      .setLabel(_('Scale on X axis'))
      .setType('number');
    displacementProperties
      .getOrCreate('scaleY')
      .setValue('20')
      .setLabel(_('Scale on Y axis'))
      .setType('number');

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
    dotProperties
      .getOrCreate('scale')
      .setValue('1')
      .setLabel(_('Scale (between 0.3 and 1)'))
      .setType('number')
      .setDescription('The scale of the effect');
    dotProperties
      .getOrCreate('angle')
      .setValue('5')
      .setLabel(_('Angle (between 0 and 5)'))
      .setType('number')
      .setDescription('The radius of the effect');

    const dropShadowEffect = extension
      .addEffect('DropShadow')
      .setFullName(_('Drop shadow'))
      .setDescription(_('Add a shadow around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-drop-shadow.js')
      .addIncludeFile('Extensions/Effects/drop-shadow-pixi-filter.js');
    const dropShadowProperties = dropShadowEffect.getProperties();
    dropShadowProperties
      .getOrCreate('blur')
      .setValue('2')
      .setLabel(_('Blur (between 0 and 20)'))
      .setType('number');
    dropShadowProperties
      .getOrCreate('quality')
      .setValue('3')
      .setLabel(_('Quality (between 1 and 20)'))
      .setType('number');
    dropShadowProperties
      .getOrCreate('alpha')
      .setValue('1')
      .setLabel(_('Alpha (between 0 and 1)'))
      .setType('number');
    dropShadowProperties
      .getOrCreate('distance')
      .setValue('1')
      .setLabel(_('Distance (between 0 and 50)'))
      .setType('number');
    dropShadowProperties
      .getOrCreate('rotation')
      .setValue('0')
      .setLabel(_('Rotation (between 0 and 360)'))
      .setType('number');
    dropShadowProperties
      .getOrCreate('color')
      .setValue('#000000')
      .setLabel(_('Color of the shadow'))
      .setType('color');
    dropShadowProperties
      .getOrCreate('shadowOnly')
      .setValue('false')
      .setLabel(_('Shadow only (shows only the shadow when enabled)'))
      .setType('boolean');

    const glitchEffect = extension
      .addEffect('Glitch')
      .setFullName(_('Glitch'))
      .setDescription(_('Applies a glitch effect to an object.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-glitch.js')
      .addIncludeFile('Extensions/Effects/glitch-pixi-filter.js');
    const glitchProperties = glitchEffect.getProperties();
    glitchProperties
      .getOrCreate('slices')
      .setValue('5')
      .setLabel(_('Slices (between 2 and infinite)'))
      .setType('number')
      .setDescription('The maximum number of slices');
    glitchProperties
      .getOrCreate('offset')
      .setValue('100')
      .setLabel(_('Offset (between -400 and 400)'))
      .setType('number')
      .setDescription('The maximum offset amount of slices');
    glitchProperties
      .getOrCreate('direction')
      .setValue('0')
      .setLabel(_('Direction (between -180 and 180)'))
      .setType('number')
      .setDescription('The angle in degree of the offset of slices');
    glitchProperties
      .getOrCreate('fillMode')
      .setValue('0')
      .setLabel(_('Fill Mode (between 0 and 4)'))
      .setType('number')
      .setDescription(
        _(
          'The fill mode of the space after the offset.(0: TRANSPARENT, 1: ORIGINAL, 2: LOOP, 3: CLAMP, 4: MIRROR)'
        )
      );
    glitchProperties
      .getOrCreate('average')
      .setValue('false')
      .setLabel(_('Average'))
      .setType('boolean')
      .setDescription('Divide the bands roughly based on equal amounts');
    glitchProperties
      .getOrCreate('minSize')
      .setValue('8')
      .setLabel(_('Min Size'))
      .setType('number')
      .setDescription('Minimum size of individual slice');
    glitchProperties
      .getOrCreate('sampleSize')
      .setValue('512')
      .setLabel(_('Sample Size'))
      .setType('number')
      .setDescription('The resolution of the displacement image');
    glitchProperties
      .getOrCreate('animationFrequency')
      .setValue('60')
      .setLabel(_('Animation Frequency'))
      .setType('number')
      .setDescription('Number of updates per second (0: no updates)');
    glitchProperties
      .getOrCreate('redX')
      .setValue('2')
      .setLabel(_('Red X offset (between -50 and 50)'))
      .setType('number');
    glitchProperties
      .getOrCreate('redY')
      .setValue('2')
      .setLabel(_('Red Y offset (between -50 and 50)'))
      .setType('number');
    glitchProperties
      .getOrCreate('greenX')
      .setValue('10')
      .setLabel(_('Green X offset (between -50 and 50)'))
      .setType('number');
    glitchProperties
      .getOrCreate('greenY')
      .setValue('-4')
      .setLabel(_('Green Y offset (between -50 and 50)'))
      .setType('number');
    glitchProperties
      .getOrCreate('blueX')
      .setValue('10')
      .setLabel(_('Blue X offset (between -50 and 50)'))
      .setType('number');
    glitchProperties
      .getOrCreate('blueY')
      .setValue('-4')
      .setLabel(_('Blue Y offset (between -50 and 50)'))
      .setType('number');

    const glowEffect = extension
      .addEffect('Glow')
      .setFullName(_('Glow'))
      .setDescription(_('Add a glow effect around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-glow.js')
      .addIncludeFile('Extensions/Effects/glow-pixi-filter.js');
    const glowProperties = glowEffect.getProperties();
    glowProperties
      .getOrCreate('innerStrength')
      .setValue('1')
      .setLabel(_('Inner strength (between 0 and 20)'))
      .setType('number');
    glowProperties
      .getOrCreate('outerStrength')
      .setValue('2')
      .setLabel(_('Outer strength (between 0 and 20)'))
      .setType('number');
    glowProperties
      .getOrCreate('distance')
      .setValue('15')
      .setLabel(_('Distance (between 10 and 20)'))
      .setType('number');
    glowProperties
      .getOrCreate('color')
      .setValue('#ffffff')
      .setLabel(_('Color (color of the outline)'))
      .setType('color');

    const godrayEffect = extension
      .addEffect('Godray')
      .setFullName(_('Godray'))
      .setDescription(_('Apply and animate atmospheric light rays.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-godray.js')
      .addIncludeFile('Extensions/Effects/godray-pixi-filter.js');
    const godrayProperties = godrayEffect.getProperties();
    godrayProperties
      .getOrCreate('parallel')
      .setValue('true')
      .setLabel(_('Parallel (parallel rays)'))
      .setType('boolean');
    godrayProperties
      .getOrCreate('animationSpeed')
      .setValue('1')
      .setLabel(_('Animation Speed'))
      .setType('number')
      .setDescription(
        _('0: Pause, 0.5: Half speed, 1: Normal speed, 2: Double speed, etc...')
      );
    godrayProperties
      .getOrCreate('lacunarity')
      .setValue('2.75')
      .setLabel(_('Lacunarity (between 0 and 5)'))
      .setType('number');
    godrayProperties
      .getOrCreate('angle')
      .setValue('30')
      .setLabel(_('Angle (between -60 and 60)'))
      .setType('number');
    godrayProperties
      .getOrCreate('gain')
      .setValue('0.6')
      .setLabel(_('Gain (between 0 and 1)'))
      .setType('number');
    godrayProperties
      .getOrCreate('light')
      .setValue('30')
      .setLabel(_('Light (between 0 and 60)'))
      .setType('number');
    godrayProperties
      .getOrCreate('x')
      .setValue('100')
      .setLabel(_('Center X (between 100 and 1000)'))
      .setType('number');
    godrayProperties
      .getOrCreate('y')
      .setValue('100')
      .setLabel(_('Center Y (between -1000 and 100)'))
      .setType('number');

    const kawaseBlurEffect = extension
      .addEffect('KawaseBlur')
      .setFullName(_('Kawase blur'))
      .setDescription(
        _('A much faster blur than Gaussian blur, but more complicated to use.')
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-kawase-blur.js')
      .addIncludeFile('Extensions/Effects/kawase-blur-pixi-filter.js');
    const kawaseBlurProperties = kawaseBlurEffect.getProperties();
    kawaseBlurProperties
      .getOrCreate('pixelizeX')
      .setValue('1')
      .setLabel(_('Pixelize X (between 0 and 10)'))
      .setType('number');
    kawaseBlurProperties
      .getOrCreate('pixelizeY')
      .setValue('1')
      .setLabel(_('Pixelize Y (between 0 and 10)'))
      .setType('number');
    kawaseBlurProperties
      .getOrCreate('blur')
      .setValue('0.5')
      .setLabel(_('Blur (between 0 and 20)'))
      .setType('number');
    kawaseBlurProperties
      .getOrCreate('quality')
      .setValue('3')
      .setLabel(_('Quality (between 1 and 20)'))
      .setType('number');

    const lightNightEffect = extension
      .addEffect('LightNight')
      .setFullName(_('Light Night'))
      .setDescription(_('Alter the colors to simulate night.'))
      .addIncludeFile('Extensions/Effects/light-night-pixi-filter.js');
    const lightNightProperties = lightNightEffect.getProperties();
    lightNightProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel(_('Opacity (between 0 and 1)'))
      .setType('number');

    const nightEffect = extension
      .addEffect('Night')
      .setFullName(_('Dark Night'))
      .setDescription(_('Alter the colors to simulate a dark night.'))
      .addIncludeFile('Extensions/Effects/night-pixi-filter.js');
    const nightProperties = nightEffect.getProperties();
    nightProperties
      .getOrCreate('intensity')
      .setValue('0.5')
      .setLabel(_('Intensity (between 0 and 1)'))
      .setType('number');
    nightProperties
      .getOrCreate('opacity')
      .setValue('0.5')
      .setLabel(_('Opacity (between 0 and 1)'))
      .setType('number');

    const noiseEffect = extension
      .addEffect('Noise')
      .setFullName(_('Noise'))
      .setDescription(_('Add some noise on the rendered image.'))
      .addIncludeFile('Extensions/Effects/noise-pixi-filter.js');
    const noiseProperties = noiseEffect.getProperties();
    noiseProperties
      .getOrCreate('noise')
      .setValue('0.5')
      .setLabel(_('Noise intensity (between 0 and 1)'))
      .setType('number');

    const oldFilmEffect = extension
      .addEffect('OldFilm')
      .setFullName(_('Old Film'))
      .setDescription(_('Add a Old film effect around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-old-film.js')
      .addIncludeFile('Extensions/Effects/old-film-pixi-filter.js');
    const oldFilmProperties = oldFilmEffect.getProperties();
    oldFilmProperties
      .getOrCreate('sepia')
      .setValue('0.3')
      .setLabel(_('Sepia (between 0 and 1)'))
      .setType('number')
      .setDescription(
        _(
          'The amount of saturation of sepia effect, a value of 1 is more saturation and closer to 0 is less, and a value of 0 produces no sepia effect'
        )
      );
    oldFilmProperties
      .getOrCreate('noise')
      .setValue('0.3')
      .setLabel(_('Noise (between 0 and 1)'))
      .setType('number')
      .setDescription('Opacity/intensity of the noise effect');
    oldFilmProperties
      .getOrCreate('noiseSize')
      .setValue('1')
      .setLabel(_('Noise Size (between 0 and 10)'))
      .setType('number')
      .setDescription('The size of the noise particles');
    oldFilmProperties
      .getOrCreate('scratch')
      .setValue('0.5')
      .setLabel(_('Scratch (between -1 and 1)'))
      .setType('number')
      .setDescription('How often scratches appear');
    oldFilmProperties
      .getOrCreate('scratchDensity')
      .setValue('0.3')
      .setLabel(_('Scratch Density (between 0 and 1)'))
      .setType('number')
      .setDescription('The density of the number of scratches');
    oldFilmProperties
      .getOrCreate('scratchWidth')
      .setValue('1.0')
      .setLabel(_('Scratch Width (between 1 and 20)'))
      .setType('number')
      .setDescription('The width of the scratches');
    oldFilmProperties
      .getOrCreate('vignetting')
      .setValue('0.3')
      .setLabel(_('Vignetting (between 0 and 1)'))
      .setType('number')
      .setDescription('The radius of the vignette effect');
    oldFilmProperties
      .getOrCreate('vignettingAlpha')
      .setValue('1.0')
      .setLabel(_('Vignetting Alpha (between 0 and 1)'))
      .setType('number');
    oldFilmProperties
      .getOrCreate('vignettingBlur')
      .setValue('0.3')
      .setLabel(_('Vignetting Blur (between 0 and 1)'))
      .setType('number');
    oldFilmProperties
      .getOrCreate('animationFrequency')
      .setValue('60')
      .setLabel(_('Animation Frequency'))
      .setType('number')
      .setDescription('Number of updates per second (0: no updates)');

    const outlineEffect = extension
      .addEffect('Outline')
      .setFullName(_('Outline'))
      .setDescription(_('Draws an outline around the rendered image.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-outline.js')
      .addIncludeFile('Extensions/Effects/outline-pixi-filter.js');
    const outlineProperties = outlineEffect.getProperties();
    outlineProperties
      .getOrCreate('thickness')
      .setValue('2')
      .setLabel(_('Thickness (between 0 and 20)'))
      .setType('number');
    outlineProperties
      .getOrCreate('color')
      .setValue('1')
      .setLabel(_('Color of the outline'))
      .setType('color');

    const pixelateEffect = extension
      .addEffect('Pixelate')
      .setFullName(_('Pixelate'))
      .setDescription(
        _("Applies a pixelate effect, making display objects appear 'blocky'.")
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-pixelate.js')
      .addIncludeFile('Extensions/Effects/pixelate-pixi-filter.js');
    const pixelateProperties = pixelateEffect.getProperties();
    pixelateProperties
      .getOrCreate('size')
      .setValue('10')
      .setLabel(_('Size'))
      .setType('number')
      .setDescription(_('Size of the pixels (10 pixels by default)'));

    const radialBlurEffect = extension
      .addEffect('RadialBlur')
      .setFullName(_('Radial Blur'))
      .setDescription(_('Applies a Motion blur to an object.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-radial-blur.js')
      .addIncludeFile('Extensions/Effects/radial-blur-pixi-filter.js');
    const radialBlurProperties = radialBlurEffect.getProperties();
    radialBlurProperties
      .getOrCreate('radius')
      .setValue('-1')
      .setLabel(_('Radius'))
      .setType('number')
      .setDescription(_('The maximum size of the blur radius, -1 is infinite'));
    radialBlurProperties
      .getOrCreate('angle')
      .setValue('0')
      .setLabel(_('Angle (between -180 and 180)'))
      .setType('number')
      .setDescription(_('The angle in degree of the motion for blur effect'));
    radialBlurProperties
      .getOrCreate('kernelSize')
      .setValue('5')
      .setLabel(_('Kernel Size (between 3 and 25)'))
      .setType('number')
      .setDescription(_('The kernel size of the blur filter (Odd number)'));
    radialBlurProperties
      .getOrCreate('centerX')
      .setValue('0.5')
      .setLabel(_('Center X (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    radialBlurProperties
      .getOrCreate('centerY')
      .setValue('0.5')
      .setLabel(_('Center Y (between 0 and 1, 0.5 is image middle)'))
      .setType('number');

    const reflectionEffect = extension
      .addEffect('Reflection')
      .setFullName(_('Reflection'))
      .setDescription(
        _(
          'Applies a reflection effect to simulate the reflection on water with waves.'
        )
      )
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-reflection.js')
      .addIncludeFile('Extensions/Effects/reflection-pixi-filter.js');
    const reflectionProperties = reflectionEffect.getProperties();
    reflectionProperties
      .getOrCreate('mirror')
      .setValue('true')
      .setLabel(_('Reflect the image on the waves'))
      .setType('boolean');
    reflectionProperties
      .getOrCreate('boundary')
      .setValue('0.5')
      .setLabel(_('Vertical position of the reflection point'))
      .setType('number')
      .setDescription(
        _(
          'Default is 50% (middle). Smaller numbers produce a larger reflection, larger numbers produce a smaller reflection.'
        )
      );
    reflectionProperties
      .getOrCreate('amplitudeStart')
      .setValue('0')
      .setLabel(_('Amplitude start'))
      .setType('number')
      .setDescription(_('Starting amplitude of waves (0 by default)'));
    reflectionProperties
      .getOrCreate('amplitudeEnding')
      .setValue('20')
      .setLabel(_('Amplitude ending'))
      .setType('number')
      .setDescription(_('Ending amplitude of waves (20 by default)'));
    reflectionProperties
      .getOrCreate('waveLengthStart')
      .setValue('30')
      .setLabel(_('Wave length start'))
      .setType('number')
      .setDescription(_('Starting wave length (30 by default)'));
    reflectionProperties
      .getOrCreate('waveLengthEnding')
      .setValue('100')
      .setLabel(_('Wave length ending'))
      .setType('number')
      .setDescription(_('Ending wave length (100 by default)'));
    reflectionProperties
      .getOrCreate('alphaStart')
      .setValue('1')
      .setLabel(_('Alpha start'))
      .setType('number')
      .setDescription(_('Starting alpha (1 by default)'));
    reflectionProperties
      .getOrCreate('alphaEnding')
      .setValue('1')
      .setLabel(_('Alpha ending'))
      .setType('number')
      .setDescription(_('Ending alpha (1 by default)'));
    reflectionProperties
      .getOrCreate('animationSpeed')
      .setValue('1')
      .setLabel(_('Animation Speed'))
      .setType('number')
      .setDescription(
        _('0: Pause, 0.5: Half speed, 1: Normal speed, 2: Double speed, etc...')
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
    rgbSplitProperties
      .getOrCreate('redX')
      .setValue('-10')
      .setLabel(_('Red X offset (between -20 and 20)'))
      .setType('number');
    rgbSplitProperties
      .getOrCreate('redY')
      .setValue('1')
      .setLabel(_('Red Y offset (between -20 and 20)'))
      .setType('number');
    rgbSplitProperties
      .getOrCreate('greenX')
      .setValue('0')
      .setLabel(_('Green X offset (between -20 and 20)'))
      .setType('number');
    rgbSplitProperties
      .getOrCreate('greenY')
      .setValue('0')
      .setLabel(_('Green Y offset (between -20 and 20)'))
      .setType('number');
    rgbSplitProperties
      .getOrCreate('blueX')
      .setValue('0')
      .setLabel(_('Blue X offset (between -20 and 20)'))
      .setType('number');
    rgbSplitProperties
      .getOrCreate('blueY')
      .setValue('10')
      .setLabel(_('Blue Y offset (between -20 and 20)'))
      .setType('number');

    const sepiaEffect = extension
      .addEffect('Sepia')
      .setFullName(_('Sepia'))
      .setDescription(_('Alter the colors to sepia.'))
      .addIncludeFile('Extensions/Effects/sepia-pixi-filter.js');
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties
      .getOrCreate('opacity')
      .setValue('1')
      .setLabel(_('Opacity (between 0 and 1)'))
      .setType('number');

    const tiltShiftEffect = extension
      .addEffect('TiltShift')
      .setFullName(_('Tilt shift'))
      .setDescription(_('Render a tilt-shift-like camera effect.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-tilt-shift.js')
      .addIncludeFile('Extensions/Effects/tilt-shift-pixi-filter.js');
    const tiltShiftProperties = tiltShiftEffect.getProperties();
    tiltShiftProperties
      .getOrCreate('blur')
      .setValue('30')
      .setLabel(_('Blur (between 0 and 200)'))
      .setType('number');
    tiltShiftProperties
      .getOrCreate('gradientBlur')
      .setValue('1000')
      .setLabel(_('Gradient blur (between 0 and 2000)'))
      .setType('number');

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
    twistProperties
      .getOrCreate('radius')
      .setValue('200')
      .setLabel(_('Radius'))
      .setType('number')
      .setDescription(_('The radius of the twist'));
    twistProperties
      .getOrCreate('angle')
      .setValue('4')
      .setLabel(_('Angle (between -10 and 10)'))
      .setType('number')
      .setDescription(_('The angle in degree of the twist'));
    twistProperties
      .getOrCreate('padding')
      .setValue('20')
      .setLabel(_('Padding'))
      .setType('number')
      .setDescription(_('Padding for filter area'));
    twistProperties
      .getOrCreate('offsetX')
      .setValue('0.5')
      .setLabel(_('Offset X (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    twistProperties
      .getOrCreate('offsetY')
      .setValue('0.5')
      .setLabel(_('Offset Y (between 0 and 1, 0.5 is image middle)'))
      .setType('number');

    const zoomBlurEffect = extension
      .addEffect('ZoomBlur')
      .setFullName(_('Zoom blur'))
      .setDescription(_('Applies a Zoom blur.'))
      .addIncludeFile('Extensions/Effects/pixi-filters/filter-zoom-blur.js')
      .addIncludeFile('Extensions/Effects/zoom-blur-pixi-filter.js');
    const zoomBlurProperties = zoomBlurEffect.getProperties();
    zoomBlurProperties
      .getOrCreate('centerX')
      .setValue('0.5')
      .setLabel(_('Center X (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    zoomBlurProperties
      .getOrCreate('centerY')
      .setValue('0.5')
      .setLabel(_('Center Y (between 0 and 1, 0.5 is image middle)'))
      .setType('number');
    zoomBlurProperties
      .getOrCreate('innerRadius')
      .setValue('200')
      .setLabel(_('Inner radius'))
      .setType('number');
    zoomBlurProperties
      .getOrCreate('strength')
      .setValue('0.3')
      .setLabel(_('strength (between 0 and 5)'))
      .setType('number');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
