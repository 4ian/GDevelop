/**

GDevelop - Facebook Instant Games Extension
Copyright (c)2018  Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareFacebookInstantGamesExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation("FacebookInstantGames",
                                    _("Facebook Instant Games"),
                                    _("Allow your game to send scores and "
                                      "interact with Facebook Instant Games"),
                                    "Florian Rival",
                                    "Open source (MIT License)");

#if defined(GD_IDE_ONLY)
  extension.AddStrExpression("PlayerId",
                             _("Player identifier"),
                             _("Get the player unique identifier"),
                             _("Facebook Instant Games"),
                             "JsPlatform/Extensions/Facebookicon16.png");

  extension.AddStrExpression("PlayerName",
                             _("Player name"),
                             _("Get the player name"),
                             _("Facebook Instant Games"),
                             "JsPlatform/Extensions/Facebookicon16.png");
#endif
}

/**
 * \brief This class declares information about the JS extension.
 */
class FacebookInstantGamesJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  FacebookInstantGamesJsExtension() {
    DeclareFacebookInstantGamesExtension(*this);

    GetAllStrExpressions()["FacebookInstantGames::PlayerId"]
        .codeExtraInformation
        .SetIncludeFile(
            "Extensions/FacebookInstantGames/facebookinstantgamestools.js")
        .SetFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerId");

    GetAllStrExpressions()["FacebookInstantGames::PlayerName"]
        .codeExtraInformation
        .SetIncludeFile(
            "Extensions/FacebookInstantGames/facebookinstantgamestools.js")
        .SetFunctionName("gdjs.evtTools.facebookInstantGames.getPlayerName");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSFacebookInstantGamesExtension() {
  return new FacebookInstantGamesJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new FacebookInstantGamesJsExtension;
}
#endif
#endif
