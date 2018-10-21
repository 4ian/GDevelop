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
  createExtension: function(t, gd) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "AdMob",
      t("AdMob"),
      t(
        "Allow the game to display AdMob banner, intersticial and reward video ads"
      ),
      "Franco Maciel",
      "MIT"
    );

    extension
      .addCondition(
        "VideoLoading",
        t("Video loading"),
        t("Check if a reward video is currently loading."),
        t("Reward video is loading"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.isVideoLoading");

    extension
      .addCondition(
        "VideoReady",
        t("Video ready"),
        t("Check if a reward video is ready to be displayed."),
        t("Reward video is ready"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.isVideoReady");

    extension
      .addCondition(
        "VideoShowing",
        t("Video showing"),
        t("Check if there is a video being displayed."),
        t("Reward video is showing"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.isVideoShowing");

    extension
      .addCondition(
        "VideoReward",
        t("Video reward"),
        t(
          "Check if there is a video reward.\nYou can mark it as non-claimed yet, so you can check this reward in other events."
        ),
        t("Video reward given"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .addParameter("yesorno", t("Mark as claimed"), "", false)
      .setDefaultValue("true")
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.existVideoReward");

    extension
      .addAction(
        "LoadVideo",
        t("Load video"),
        t(
          "Start loading a reward video, you can display it automatically when finish loading.\nIf test mode is set to true a test video will be displayed."
        ),
        t("Load reward video (show on load: _PARAM2_, test mode: _PARAM3_)"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .addParameter("string", t("Android reward video ID"), "", false)
      .addParameter("string", t("iOS reward video ID"), "", false)
      .addParameter("yesorno", t("Display on load complete?"), "", false)
      .setDefaultValue("true")
      .addParameter("yesorno", t("Test mode?"), "", false)
      .setDefaultValue("true")
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.loadVideo");

    extension
      .addAction(
        "ShowVideo",
        t("Show video"),
        t(
          "Show the reward video, will work only when the video is fully loaded."
        ),
        t("Show reward video"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.showVideo");

    extension
      .addAction(
        "ClaimReward",
        t("Claim reward"),
        t("Mark the video reward as claimed."),
        t("Claim video reward"),
        t("AdMob"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile("Extensions/AdMob/admobtools.js")
      .setFunctionName("gdjs.adMob.claimVideoReward");

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  }
};
