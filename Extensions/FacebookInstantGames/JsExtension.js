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
 * More information on https://github.com/4ian/GD/blob/master/newIDE/README-extensions.md
 */
module.exports = {
  createExtension: (t, gd) => {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      "FacebookInstantGames",
      t("Facebook Instant Games"),
      t(
        "Allow your game to send scores and interact with Facebook Instant Games"
      ),
      "Florian Rival",
      "Open source (MIT License)"
    );

    extension
      .addStrExpression(
        "PlayerId",
        t("Player identifier"),
        t("Get the player unique identifier"),
        t("Facebook Instant Games"),
        "JsPlatform/Extensions/Facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerId");

    extension
      .addStrExpression(
        "PlayerName",
        t("Player name"),
        t("Get the player name"),
        t("Facebook Instant Games"),
        "JsPlatform/Extensions/Facebookicon16.png"
      )
      .getCodeExtraInformation()
      .setIncludeFile(
        "Extensions/FacebookInstantGames/facebookinstantgamestools.js"
      )
      .setFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerName");

    return extension;
  }
};
