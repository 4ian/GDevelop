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

    const behavior = extension
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
    behavior
      .addAction(
        "AddObjectVariableTween",
        t("Add object variable tween"),
        t("Add a tween animation for an object variable."),
        t(
          "Tween the variable _PARAM3_ of _PARAM0_ from _PARAM4_ to _PARAM5_ with easing _PARAM6_ over _PARAM7_ms as _PARAM2_"
        ),
        t("Tween animation/Object variables"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("objectvar", t("Object variable"), "", false)
      .addParameter("expression", t("From value"), "", false)
      .addParameter("expression", t("To value"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addVariableTween");

    behavior
      .addAction(
        "AddObjectPositionTween",
        t("Add object position tween"),
        t("Add a tween animation for the object position."),
        t(
          "Tween the position of _PARAM0_ to x: _PARAM3_, y: _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_"
        ),
        t("Tween animation/Position"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To X"), "", false)
      .addParameter("expression", t("To Y"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectPositionTween");

    behavior
      .addAction(
        "AddObjectPositionXTween",
        t("Add object position X tween"),
        t("Add a tween animation for the object X position."),
        t(
          "Tween the X position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation/Position"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To X"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectPositionXTween");

    behavior
      .addAction(
        "AddObjectPositionYTween",
        t("Add object position Y tween"),
        t("Add a tween animation for the object Y position."),
        t(
          "Tween the Y position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation/Position"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To Y"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectPositionYTween");

    behavior
      .addAction(
        "AddObjectAngleTween",
        t("Add object angle tween"),
        t("Add a tween animation for the object angle."),
        t(
          "Tween the angle of _PARAM0_ to _PARAM3_° with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To angle (in degrees)"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectAngleTween");

    behavior
      .addAction(
        "AddObjectScaleTween",
        t("Add object scale tween"),
        t(
          "Add a tween animation for the object scale. (Note: the scale can never be less than 0)"
        ),
        t(
          "Tween the scale of _PARAM0_ to X-scale: _PARAM3_, Y-scale: _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_"
        ),
        t("Tween animation/Scale"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To scale X"), "", false)
      .addParameter("expression", t("To scale Y"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectScaleTween");

    behavior
      .addAction(
        "AddObjectScaleXTween",
        t("Add object X-scale tween"),
        t(
          "Add a tween animation for the object X-scale. (Note: the scale can never be less than 0)"
        ),
        t(
          "Tween the X-scale of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation/Scale"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To scale X"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectScaleXTween");

    behavior
      .addAction(
        "AddObjectScaleYTween",
        t("Add object Y-scale tween"),
        t(
          "Add a tween animation for the object Y-scale. (Note: the scale can never be less than 0)"
        ),
        t(
          "Tween the Y-scale of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation/Scale"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To scale Y"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectScaleYTween");

    behavior
      .addAction(
        "AddObjectOpacityTween",
        t("Add object opacity tween"),
        t(
          "Add a tween animation for the object opacity. (Value between 0 and 255)"
        ),
        t(
          "Tween the opacity of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_"
        ),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("expression", t("To opacity"), "", false)
      .addParameter("stringWithSelector", t("Easing"), "[\"linear\", \"easeInQuad\", \"easeOutQuad\", \"easeInOutQuad\", \"easeInCubic\", \"easeOutCubic\", \"easeInOutCubic\", \"easeInQuart\", \"easeOutQuart\", \"easeInOutQuart\", \"easeInQuint\", \"easeOutQuint\", \"easeInOutQuint\", \"easeInSine\", \"easeOutSine\", \"easeInOutSine\", \"easeInExpo\", \"easeOutExpo\", \"easeInOutExpo\", \"easeInCirc\", \"easeOutCirc\", \"easeInOutCirc\", \"easeOutBounce\", \"easeInBack\", \"easeOutBack\", \"easeInOutBack\", \"elastic\", \"swingFromTo\", \"swingFrom\", \"swingTo\", \"bounce\", \"bouncePast\", \"easeFromTo\", \"easeFrom\", \"easeTo\"]", false)
      .setDefaultValue("linear")
      .addParameter("expression", t("Duration"), "", false)
      .addParameter(
        "yesorno",
        t("Destroy this object when tween finishes"),
        "",
        false
      )
      .setDefaultValue("no")
      .getCodeExtraInformation()
      .setFunctionName("addObjectOpacityTween");

    behavior
      .addCondition(
        "IsPlaying",
        t("Tween is playing"),
        t("Check if the tween animation is currently playing."),
        t("Tween _PARAM2_ on _PARAM0_ is playing"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("isPlaying");

    behavior
      .addCondition(
        "HasFinished",
        t("Tween finished playing"),
        t("Check if the tween animation has finished playing."),
        t("Tween _PARAM2_ on _PARAM0_ has finished playing"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("hasFinished");

    behavior
      .addAction(
        "PauseTween",
        t("Pause a tween"),
        t("Pause the running tween animation."),
        t("Pause the tween _PARAM2_ on _PARAM0_"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("pauseTween");

    behavior
      .addAction(
        "StopTween",
        t("Stop a tween"),
        t("Stop the running tween animation."),
        t("Stop the tween _PARAM2_ on _PARAM0_"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .addParameter("yesorno", t("Jump to end"), "", false)
      .getCodeExtraInformation()
      .setFunctionName("stopTween");

    behavior
      .addAction(
        "ResumeTween",
        t("Resume a tween"),
        t("Resume the tween animation."),
        t("Resume the tween _PARAM2_ on _PARAM0_"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("resumeTween");

    behavior
      .addAction(
        "RemoveTween",
        t("Remove a tween"),
        t("Remove the tween animation from the object."),
        t("Remove the tween _PARAM2_ from _PARAM0_"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("removeTween");

    behavior
      .addExpression(
        "GetProgress",
        t("Progress of a tween"),
        t("Progress of a tween (between 0.0 and 1.0)"),
        t("Tween animation"),
        "JsPlatform/Extensions/take_screenshot24.png",
        "JsPlatform/Extensions/take_screenshot32.png"
      )
      .addParameter("object", t("Object"), "", false)
      .addParameter("behavior", t("Behavior"), "TweenBehavior", false)
      .addParameter("string", t("Tween Identifier"), "", false) // TODO: Change into stringlist
      .getCodeExtraInformation()
      .setFunctionName("getProgress");

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  }
};
