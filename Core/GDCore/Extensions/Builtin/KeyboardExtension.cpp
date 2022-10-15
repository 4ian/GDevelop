/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsKeyboardExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinKeyboard",
          _("Keyboard"),
          _("Allows your game to respond to keyboard input. Note that this "
            "does not work with on-screen keyboard on touch devices: use "
            "instead conditions related to touch when making a game for "
            "mobile/touchscreen devices."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/keyboard")
      .SetCategory("Input");
  extension.AddInstructionOrExpressionGroupMetadata(_("Keyboard"))
      .SetIcon("res/conditions/keyboard24.png");

  extension
      .AddCondition("KeyPressed",
                    _("Key pressed"),
                    _("Check if a key is pressed"),
                    _("_PARAM1_ key is pressed"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("key", _("Key"));

  extension
      .AddCondition("KeyReleased",
                    _("Key released"),
                    _("Check if a key was just released"),
                    _("_PARAM1_ key is released"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("key", _("Key"));

  extension
      .AddCondition("KeyFromTextPressed",
                    _("Key pressed (text expression)"),
                    _("Check if a key, retrieved from the result of the "
                      "expression, is pressed"),
                    _("_PARAM1_ key is pressed"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Expression generating the key to check"))
      .MarkAsAdvanced();

  extension
      .AddCondition("KeyFromTextReleased",
                    _("Key released (text expression)"),
                    _("Check if a key, retrieved from the result of the "
                      "expression, was just released"),
                    _("_PARAM1_ key is released"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Expression generating the key to check"))
      .MarkAsAdvanced();

  extension
      .AddCondition("AnyKeyPressed",
                    _("Any key pressed"),
                    _("Check if any key is pressed"),
                    _("Any key is pressed"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "");

 extension
      .AddCondition("AnyKeyReleased",
                    _("Any key released"),
                    _("Check if any key is released"),
                    _("Any key is released"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddStrExpression(
          "LastPressedKey",
          _("Last pressed key"),
          _("Get the name of the latest key pressed on the keyboard"),
          "",
          "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "");
}

}  // namespace gd
