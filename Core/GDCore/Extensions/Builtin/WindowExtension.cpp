/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsWindowExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinWindow",
          _("Game window and resolution"),
          "Provides actions and conditions to manipulate the game window. "
          "Depending on the platform on which the game is running, not all of "
          "these features can be applied.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("User interface")
      .SetExtensionHelpPath("/all-features/window");
  extension
      .AddInstructionOrExpressionGroupMetadata(
          _("Game window and resolution"))
      .SetIcon("res/actions/window24.png");

  extension
      .AddAction(
          "SetFullScreen",
          _("De/activate fullscreen"),
          _("This action activates or deactivates fullscreen."),
          _("Activate fullscreen: _PARAM1_ (keep aspect ratio: _PARAM2_)"),
          "",
          "res/actions/fullscreen24.png",
          "res/actions/fullscreen.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno", _("Activate fullscreen"))
      .AddParameter("yesorno",
                    _("Keep aspect ratio (HTML5 games only, yes by default)"),
                    "",
                    true)
      .SetDefaultValue("yes");

  extension
      .AddCondition("IsFullScreen",
                    _("Fullscreen activated?"),
                    _("Check if the game is currently in fullscreen."),
                    _("The game is in fullscreen"),
                    "",
                    "res/actions/fullscreen24.png",
                    "res/actions/fullscreen.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddAction("SetWindowMargins",
                 _("Window's margins"),
                 _("This action changes the margins, in pixels, between the "
                   "game frame and the window borders."),
                 _("Set margins of game window to "
                   "_PARAM1_;_PARAM2_;_PARAM3_;_PARAM4_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Top"))
      .AddParameter("expression", _("Right"))
      .AddParameter("expression", _("Bottom"))
      .AddParameter("expression", _("Left"));

  extension
      .AddAction("SetGameResolutionSize",
                 _("Game resolution"),
                 _("Changes the resolution of the game, effectively changing "
                   "the game area size. This won't change the size of the "
                   "window in which the game is running."),
                 _("Set game resolution to _PARAM1_x_PARAM2_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Width"))
      .AddParameter("expression", _("Height"));

  extension
      .AddAction(
          "SetWindowSize",
          _("Game window size"),
          _("Changes the size of the game window. Note that this "
            "will only work on platform supporting this operation: games "
            "running in browsers or on mobile phones can not update their "
            "window size. Game resolution can still be updated."),
          _("Set game window size to _PARAM1_x_PARAM2_ (also update game "
            "resolution: _PARAM3_)"),
          "",
          "res/actions/window24.png",
          "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Width"))
      .AddParameter("expression", _("Height"))
      .AddParameter("yesorno",
                    _("Also update the game resolution? If not, the game will "
                      "be stretched or reduced to fit in the window."));

  extension
      .AddAction("CenterWindow",
                 _("Center the game window on the screen"),
                 _("This action centers the game window on the screen. This "
                   "only works on Windows, macOS and Linux (not when the game "
                   "is executed in a web-browser or on iOS/Android)."),
                 _("Center the game window"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddAction("SetGameResolutionResizeMode",
                 _("Game resolution resize mode"),
                 _("Set if the width or the height of the game resolution "
                   "should be changed to fit the game window - or if the game "
                   "resolution should not be updated automatically."),
                 _("Set game resolution resize mode to _PARAM1_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("stringWithSelector",
                    _("Resize mode"),
                    "[\"adaptWidth\", \"adaptHeight\", \"\"]",
                    false)
      .SetParameterLongDescription(
          _("Empty to disable resizing. \"adaptWidth\" will update the game "
            "width to fit in the window or screen. \"adaptHeight\" will do the "
            "same but with the game height."));

  extension
      .AddAction("SetAdaptGameResolutionAtRuntime",
                 _("Automatically adapt the game resolution"),
                 _("Set if the game resolution should be automatically adapted "
                   "when the game window or screen size change. This will only "
                   "be the case if the game resolution resize mode is "
                   "configured to adapt the width or the height of the game."),
                 _("Automatically adapt the game resolution: _PARAM1_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno",
                    _("Update resolution during the game to fit the screen or "
                      "window size?"));

  extension
      .AddAction("SetWindowIcon",
                 _("Window's icon"),
                 _("This action changes the icon of the game's window."),
                 _("Use _PARAM1_ as the icon for the game's window."),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Name of the image to be used as the icon"));

  extension
      .AddAction("SetWindowTitle",
                 _("Window's title"),
                 _("This action changes the title of the game's window."),
                 _("Change window title to _PARAM1_"),
                 "",
                 "res/actions/window24.png",
                 "res/actions/window.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("New title"));

  extension
      .AddExpression(
          "SceneWindowWidth",
          _("Width of the scene window"),
          _("Width of the scene window (or scene canvas for HTML5 games)"),
          "",
          "res/window.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression(
          "SceneWindowHeight",
          _("Height of the scene window"),
          _("Height of the scene window (or scene canvas for HTML5 games)"),
          "",
          "res/window.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension.AddExpression(
      "ScreenWidth",
      _("Width of the screen/page"),
      _("Width of the screen (or the page for HTML5 games in browser)"),
      "",
      "res/display16.png");

  extension.AddExpression(
      "ScreenHeight",
      _("Height of the screen/page"),
      _("Height of the screen (or the page for HTML5 games in browser)"),
      "",
      "res/display16.png");

  extension.AddExpression("ColorDepth",
                          _("Color depth"),
                          _("Color depth"),
                          "",
                          "res/display16.png");

  extension
      .AddStrExpression("WindowTitle",
                        _("Window's title"),
                        _("Window's title"),
                        "",
                        "res/window.png")
      .AddCodeOnlyParameter("currentScene", "");
}

}  // namespace gd
