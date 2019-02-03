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
  createExtension: function (t, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        "Tween",
        t("Tween animation"),
        t("Animate object properties via tweening."),
        "Matthias Meike",
        "Open source (MIT License)"
      )
      .setExtensionHelpPath("/all-features/tween");

    var tweenBehavior = new gd.BehaviorJsImplementation();

    tweenBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === "My first property") {
        behaviorContent.property1 = newValue;
        return true;
      }
      if (propertyName === "My other property") {
        behaviorContent.property2 = newValue === "1";
        return true;
      }

      return false;
    };

    tweenBehavior.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties.set(
        "My first property",
        new gd.PropertyDescriptor(behaviorContent.property1)
      );
      behaviorProperties.set(
        "My other property",
        new gd.PropertyDescriptor(
          behaviorContent.property2 ? "true" : "false"
        ).setType("Boolean")
      );

      return behaviorProperties;
    };

    tweenBehavior.setRawJSONContent(
      JSON.stringify({
        property1: "Initial value 1",
        property2: true
      })
    );

    extension
      .addBehavior(
        "TweenBehavior",
        t("Tween animation"),
        "TweenBehavior",
        t("Tween animation"),
        "",
        "CppPlatform/Extensions/topdownmovementicon.png",
        "TweenBehavior",
        tweenBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile("Extensions/TweenBehavior/tweenruntimebehavior.js")
      .addIncludeFile("Extensions/TweenBehavior/shifty.js");
    //.addIncludeFile("Extensions/TweenBehavior/LICENSE-MIT.txt");

    // Behavior related
    extension
      .addAction(
        "AddObjectVariableTween",
        t("Add object variable tween"),
        t("Add a tween animation for an object variable."),
        t(
          "Tween variable _PARAM3_ of _PARAM0_ from _PARAM4_ to _PARAM5_ with easing _PARAM6_ over _PARAM7_ms as _PARAM2_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("objectPtr", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("objectvar", t("Object variable"), "", false)
      .addParameter("expression", t("From value"), "", false)
      .addParameter("expression", t("To value"), "", false)
      .addParameter("string", t("Easing"), "", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter("yesorno", t("Destroy this object when tween finishes"), "", false)
      .setDefaultValue("false")
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.addObjectVariableTween");

    extension
      .addAction(
        "AddObjectPositionTween",
        t("Add object position tween"),
        t("Add a tween animation for an object position."),
        t(
          "Tween position of _PARAM0_ to x: _PARAM3_, y: _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("objectPtr", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To X"), "", false)
      .addParameter("expression", t("To Y"), "", false)
      .addParameter("string", t("Easing"), "", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter("yesorno", t("Destroy this object when tween finishes"), "", false)
      .setDefaultValue("false")
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.addObjectPositionTween");

    extension
      .addCondition(
        "IsPlaying",
        t("Tween is playing"),
        t("Check if the tween animation is currently playing."),
        t(
          "Tween _PARAM2_ on _PARAM0_ is playing"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.isPlaying");

    extension
      .addCondition(
        "HasFinished",
        t("Tween finished playing"),
        t("Check if the tween animation has finished playing."),
        t(
          "Tween _PARAM2_ on _PARAM0_ has finished playing"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("objectPtr", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.hasFinished");

    extension
      .addAction(
        "PauseTween",
        t("Pause a tween"),
        t("Pause the running tween animation."),
        t(
          "Pause the tween _PARAM2_ on _PARAM0_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.pauseTween");

    extension
      .addAction(
        "StopTween",
        t("Stop a tween"),
        t("Stop the running tween animation."),
        t(
          "Stop the tween _PARAM2_ on _PARAM0_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("yesorno", t("Jump to end"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.stopTween");

    extension
      .addAction(
        "ResumeTween",
        t("Resume a tween"),
        t("Resume the tween animation."),
        t(
          "Resume the tween _PARAM2_ on _PARAM0_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.resumeTween");

    extension
      .addAction(
        "RemoveTween",
        t("Remove a tween"),
        t("Remove the tween animation from the object."),
        t(
          "Remove the tween _PARAM2_ from _PARAM0_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.removeTween");

    extension
      .addExpression(
        "GetProgress",
        t("Progress of a tween"),
        t("Progress of a tween (between 0.0 and 1.0)"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior")
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("gdjs.TweenRuntimeBehavior.getProgress");

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  }
};
