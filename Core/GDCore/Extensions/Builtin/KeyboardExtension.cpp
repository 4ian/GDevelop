/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsKeyboardExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinKeyboard",
                          _("Keyboard features"),
                          _("Built-in extension that enables the use of a keyboard"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("KeyPressed",
                   _("Key pressed"),
                   _("Test if a key is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("key", _("Key"));

    extension.AddCondition("KeyReleased",
                   _("Key released"),
                   _("Test if a key was just released"),
                   _("_PARAM1_ key is released"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("key", _("Key"));

    extension.AddCondition("KeyFromTextPressed",
                   _("Key pressed (text expression)"),
                   _("Test if a key, retrieved from the result of the expression, is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Expression generating the key to test"))
        .MarkAsAdvanced();

    extension.AddCondition("KeyFromTextReleased",
                   _("Key released (text expression)"),
                   _("Test if a key, retrieved from the result of the expression, was just released"),
                   _("_PARAM1_ key is released"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Expression generating the key to test"))
        .MarkAsAdvanced();

    extension.AddCondition("AnyKeyPressed",
                   _("Any key pressed"),
                   _("Test if any key is pressed"),
                   _("Any key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddStrExpression("LastPressedKey",
                       _("Last pressed key"),
                       _("Get the name of the latest key pressed on the keyboard"),
                       _("Keyboard"),
                       "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}
