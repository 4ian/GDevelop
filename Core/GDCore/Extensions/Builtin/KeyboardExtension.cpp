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
          _("Keyboard features"),
          _("Built-in extension that enables the use of a keyboard"),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/keyboard");

#if defined(GD_IDE_ONLY)
  extension
      .AddCondition("KeyPressed",
                    _("Key pressed"),
                    _("Test if a key is pressed"),
                    _("_PARAM1_ key is pressed"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("key", _("Key"));

  extension
      .AddCondition("KeyReleased",
                    _("Key released"),
                    _("Test if a key was just released"),
                    _("_PARAM1_ key is released"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("key", _("Key"));

  extension
      .AddCondition("KeyFromTextPressed",
                    _("Key pressed (text expression)"),
                    _("Test if a key, retrieved from the result of the "
                      "expression, is pressed"),
                    _("_PARAM1_ key is pressed"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Expression generating the key to test"))
      .MarkAsAdvanced();

  extension
      .AddCondition("KeyFromTextReleased",
                    _("Key released (text expression)"),
                    _("Test if a key, retrieved from the result of the "
                      "expression, was just released"),
                    _("_PARAM1_ key is released"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Expression generating the key to test"))
      .MarkAsAdvanced();

    extension
      .AddCondition("InputMapped",
                    _("Is Input mapped?"),
                    _("Test if an Input was mapped"),
                    _("Input _PARAM1_ is mapped"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Input Name"));

    extension
      .AddCondition("InputPressed",
                    _("Input pressed"),
                    _("Test if an Input is pressed"),
                    _("Input _PARAM1_ is pressed"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Input Name"));

  extension
      .AddCondition("InputReleased",
                    _("Input released"),
                    _("Test if an Input was just released"),
                    _("Input _PARAM1_ is released"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Input Name"));

  extension
      .AddAction("InputMap",
                    _("Map a key to an Input"),
                    _("Use this to set the key corresponding to an input."),
                    _("Map Input _PARAM1_ to the key _PARAM2_"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Input Name"))
      .AddParameter("key", _("Key"));

  extension
      .AddExpression(
          "GetKeyMap",
          _("Get key mapped to an input"),
          _("Returns the key mapped to an input"),
          _("Keyboard"),
          "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Input Name"));

  extension
      .AddCondition("AnyKeyPressed",
                    _("Any key pressed"),
                    _("Test if any key is pressed"),
                    _("Any key is pressed"),
                    _("Keyboard"),
                    "res/conditions/keyboard24.png",
                    "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddStrExpression(
          "LastPressedKey",
          _("Last pressed key"),
          _("Get the name of the latest key pressed on the keyboard"),
          _("Keyboard"),
          "res/conditions/keyboard.png")
      .AddCodeOnlyParameter("currentScene", "");
#endif
}

}  // namespace gd
