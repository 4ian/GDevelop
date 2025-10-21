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
          _("Conditions to check keys pressed on a keyboard. Note that this "
            "does not work with on-screen keyboard on touch devices: use "
            "instead mouse/touch conditions when making a game for "
            "mobile/touchscreen devices or when making a new game from "
            "scratch."),
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
      .AddParameter("key", _("Key to check"))
      .SetHidden();

  extension
      .AddCondition("KeyReleased",
                    _("Key released"),
                    _("Check if a key was just released"),
                    _("_PARAM1_ key is released"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("key", _("Key to check"))
      .SetHidden();

  extension
      .AddCondition(
          "KeyFromTextPressed",
          _("Key pressed"),
          _("Check if a key is pressed. This stays true as long as "
            "the key is held down. To check if a key was pressed during "
            "the frame, use \"Key just pressed\" instead."),
          _("_PARAM1_ key is pressed"),
          "",
          "res/conditions/keyboard24.png",
          "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("keyboardKey", _("Key to check"))
      .MarkAsSimple();

  extension
      .AddCondition("KeyFromTextJustPressed",
                    _("Key just pressed"),
                    _("Check if a key was just pressed."),
                    _("_PARAM1_ key was just pressed"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("keyboardKey", _("Key to check"))
      .MarkAsSimple();

  extension
      .AddCondition("KeyFromTextReleased",
                    _("Key released"),
                    _("Check if a key was just released."),
                    _("_PARAM1_ key is released"),
                    "",
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("keyboardKey", _("Key to check"))
      .MarkAsSimple();

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
