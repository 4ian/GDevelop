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
      "Effects",
      "Effects",
      "Contains various effects to be used in games.",
      "Various contributors from PixiJS, PixiJS filters and GDevelop",
      "MIT"
    );

    // ℹ️ You can declare an effect here. Please order the effects by alphabetical order.
    // This file is for common effects that are well-known/"battle-tested". If you have an
    // experimental effect, create an extension for it (copy this folder, rename "Effects" to something else,
    // and remove all the files and declaration of effects, or take a look at ExampleJsExtension).

    const blackAndWhiteEffect = extension
      .addEffect("BlackAndWhite")
      .setFullName(_("Black and White"))
      .setDescription(_("Alter the colors to make the image black and white"))
      .addIncludeFile("Extensions/Effects/black-and-white-pixi-filter.js");
    const blackAndWhiteProperties = blackAndWhiteEffect.getProperties();
    blackAndWhiteProperties.set(
      "opacity",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(_("Opacity (between 0 and 1)"))
        .setType("number")
    );

    const blurEffect = extension
      .addEffect("Blur")
      .setFullName(_("Blur"))
      .setDescription(_("Blur the rendered image"))
      .addIncludeFile("Extensions/Effects/blur-pixi-filter.js");
    const blurProperties = blurEffect.getProperties();
    blurProperties.set(
      "blur",
      new gd.PropertyDescriptor(/* defaultValue= */ "8")
        .setLabel(_("Blur intensity"))
        .setType("number")
    );
    blurProperties.set(
      "quality",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(
          _(
            "Number of render passes. An high value will cause lags/poor performance."
          )
        )
        .setType("number")
    );
    blurProperties.set(
      "resolution",
      new gd.PropertyDescriptor(/* defaultValue= */ "2")
        .setLabel(_("Resolution"))
        .setType("number")
    );
    blurProperties.set(
      "resolution",
      new gd.PropertyDescriptor(/* defaultValue= */ "2")
        .setLabel(_("Kernel size (one of these values: 5, 7, 9, 11, 13, 15)"))
        .setType("number")
    );

    const brightnessEffect = extension
      .addEffect("Brightness")
      .setFullName(_("Brightness"))
      .setDescription(_("Make the image brighter"))
      .addIncludeFile("Extensions/Effects/brightness-pixi-filter.js");
    const brightnessProperties = brightnessEffect.getProperties();
    brightnessProperties.set(
      "brightness",
      new gd.PropertyDescriptor(/* defaultValue= */ "0.8")
        .setLabel(_("Brightness (between 0 and 1)"))
        .setType("number")
    );

    const lightNightEffect = extension
      .addEffect("LightNight")
      .setFullName(_("Light Night"))
      .setDescription(_("Alter the colors to simulate night"))
      .addIncludeFile("Extensions/Effects/light-night-pixi-filter.js");
    const lightNightProperties = lightNightEffect.getProperties();
    lightNightProperties.set(
      "opacity",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(_("Opacity (between 0 and 1)"))
        .setType("number")
    );

    const nightEffect = extension
      .addEffect("Night")
      .setFullName(_("Dark Night"))
      .setDescription(_("Alter the colors to simulate a dark night"))
      .addIncludeFile("Extensions/Effects/night-pixi-filter.js");
    const nightProperties = nightEffect.getProperties();
    nightProperties.set(
      "intensity",
      new gd.PropertyDescriptor(/* defaultValue= */ "0.5")
        .setLabel(_("Intensity (between 0 and 1)"))
        .setType("number")
    );
    nightProperties.set(
      "opacity",
      new gd.PropertyDescriptor(/* defaultValue= */ "0.5")
        .setLabel(_("Opacity (between 0 and 1)"))
        .setType("number")
    );

    const noiseEffect = extension
      .addEffect("Noise")
      .setFullName(_("Noise"))
      .setDescription(_("Add some noise on the rendered image"))
      .addIncludeFile("Extensions/Effects/noise-pixi-filter.js");
    const noiseProperties = noiseEffect.getProperties();
    noiseProperties.set(
      "noise",
      new gd.PropertyDescriptor(/* defaultValue= */ "0.5")
        .setLabel(_("Noise intensity (between 0 and 1)"))
        .setType("number")
    );

    const sepiaEffect = extension
      .addEffect("Sepia")
      .setFullName(_("Sepia"))
      .setDescription(_("Alter the colors to sepia"))
      .addIncludeFile("Extensions/Effects/sepia-pixi-filter.js");
    const sepiaProperties = sepiaEffect.getProperties();
    sepiaProperties.set(
      "opacity",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(_("Opacity (between 0 and 1)"))
        .setType("number")
    );

    const displacementEffect = extension
      .addEffect("Displacement")
      .setFullName(_("Displacement"))
      .setDescription(_("Add Displacement effect"))
      .addIncludeFile("Extensions/Effects/displacement-pixi-filter.js");
    const displacementProperties = displacementEffect.getProperties();
    displacementProperties.set(
      "displacementMapTexture",
      new gd.PropertyDescriptor("")
        .setType("resource")
        .addExtraInfo("image")
        .setLabel(_("Displacement map texture for the effect"))
    );
    displacementProperties.set(
      "scaleX",
      new gd.PropertyDescriptor(/* defaultValue= */ "20")
        .setLabel(_("Scale X"))
        .setType("number")
    );
    displacementProperties.set(
      "scaleY",
      new gd.PropertyDescriptor(/* defaultValue= */ "20")
        .setLabel(_("Scale Y"))
        .setType("number")
    );

    const colorMapEffect = extension
      .addEffect("ColorMap")
      .setFullName(_("Color Map"))
      .setDescription(_("Add Color Map effect"))
      .addIncludeFile("Extensions/Effects/color-map-pixi-filter.js")
      .addIncludeFile("Extensions/Effects/pixi-filters/filter-color-map.js");
    const colorMapProperties = colorMapEffect.getProperties();
    colorMapProperties.set(
      "colorMapTexture",
      new gd.PropertyDescriptor("")
        .setType("resource")
        .addExtraInfo("image")
        .setLabel(_("Color map texture for the effect"))
        .setDescription(
          _(
            "Color map are like LUT, you can change colors of pixels by modifing a reference color image containing each colours. Orignal map file can be found at [TODO INSERT PATH]"
          )
        )
    );
    colorMapProperties.set(
      "nearest",
      new gd.PropertyDescriptor(/* defaultValue= */ "false")
        .setLabel(_("Nearest"))
        .setType("boolean")
        .setDescription(_("Enable antialiasing on gradients."))
    );
    colorMapProperties.set(
      "mix",
      new gd.PropertyDescriptor(/* defaultValue= */ "100")
        .setLabel(_("Mix"))
        .setType("number")
        .setDescription(
          _("Mix value of the effect on the layer. (in percent)")
        )
    );

    const pixelateEffect = extension
      .addEffect("Pixelate")
      .setFullName(_("Pixelate"))
      .setDescription(_("Pixelize the layer"))
      .addIncludeFile("Extensions/Effects/pixelate-pixi-filter.js")
      .addIncludeFile("Extensions/Effects/pixi-filters/filter-pixelate.js");
    const pixelateProperties = pixelateEffect.getProperties();

    pixelateProperties.set(
      "size",
      new gd.PropertyDescriptor(/* defaultValue= */ "10")
        .setLabel(_("Size"))
        .setType("number")
        .setDescription(_("Size of pixel effect (10 pixels by default)"))
    );

    const reflectionEffect = extension
      .addEffect("Reflection")
      .setFullName(_("Reflection"))
      .setDescription(_("Reflect the layer"))
      .addIncludeFile("Extensions/Effects/reflection-pixi-filter.js")
      .addIncludeFile("Extensions/Effects/pixi-filters/filter-reflection.js");
    const reflectionProperties = reflectionEffect.getProperties();

    reflectionProperties.set(
      "mirror",
      new gd.PropertyDescriptor(/* defaultValue= */ "true")
        .setLabel(_("mirror"))
        .setType("boolean")
        .setDescription(_("True to reflect the image, false for waves-only"))
    );

    reflectionProperties.set(
      "boundary",
      new gd.PropertyDescriptor(/* defaultValue= */ "0.5")
        .setLabel(_("boundary"))
        .setType("number")
        .setDescription(
          _(
            "Vertical position of the reflection point, default is 50% (middle) smaller numbers produce a larger reflection, larger numbers produce a smaller reflection."
          )
        )
    );

    reflectionProperties.set(
      "amplitudeStart",
      new gd.PropertyDescriptor(/* defaultValue= */ "0")
        .setLabel(_("Amplitude start"))
        .setType("number")
        .setDescription(_("Starting amplitude of waves (0 by default)"))
    );

    reflectionProperties.set(
      "amplitudeEnding",
      new gd.PropertyDescriptor(/* defaultValue= */ "20")
        .setLabel(_("Amplitude ending"))
        .setType("number")
        .setDescription(_("Ending amplitude of waves (20 by default)"))
    );

    reflectionProperties.set(
      "waveLengthStart",
      new gd.PropertyDescriptor(/* defaultValue= */ "30")
        .setLabel(_("Wave length start"))
        .setType("number")
        .setDescription(_("Starting wave length (30 by default)"))
    );

    reflectionProperties.set(
      "waveLengthEnding",
      new gd.PropertyDescriptor(/* defaultValue= */ "100")
        .setLabel(_("Wave length ending"))
        .setType("number")
        .setDescription(_("Ending wave length (100 by default)"))
    );

    reflectionProperties.set(
      "alphaStart",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(_("Alpha start"))
        .setType("number")
        .setDescription(_("Starting alpha (1 by default)"))
    );

    reflectionProperties.set(
      "alphaEnding",
      new gd.PropertyDescriptor(/* defaultValue= */ "1")
        .setLabel(_("Alpha ending"))
        .setType("number")
        .setDescription(_("Ending alpha (1 by default)"))
    );

    reflectionProperties.set(
      "animated",
      new gd.PropertyDescriptor(/* defaultValue= */ "false")
        .setLabel(_("animated"))
        .setType("boolean")
        .setDescription(_("Animate position of waves"))
    );

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  }
};
