/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
                          GD_T("Keyboard features"),
                          GD_T("Built-in extensions allowing to use keyboard"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("KeyPressed",
                   _("A key is pressed"),
                   _("Test if a key is pressed"),
                   GD_T("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("key", GD_T("Key to test"), "",false);

    extension.AddCondition("KeyFromTextPressed",
                   _("A key is pressed ( text expression )"),
                   _("Test if a key, retrieved from the result of the expression, is pressed"),
                   GD_T("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Expression generating the key to test"), "",false)
        .MarkAsAdvanced();

    extension.AddCondition("AnyKeyPressed",
                   _("Any key is pressed"),
                   _("Test if any key is pressed"),
                   GD_T("Any key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddStrExpression("LastPressedKey",
                       GD_T("Last pressed key"),
                       GD_T("Get the name of the latest key pressed on the keyboard"),
                       GD_T("Keyboard"),
                       "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}
