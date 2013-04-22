/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/KeyboardExtension.h"
#include "GDL/ExtensionBase.h"

KeyboardExtension::KeyboardExtension()
{
    SetExtensionInformation("BuiltinKeyboard",
                          _("Keyboard features"),
                          _("Builtin extensions allowing to use keyboard"),
                          "Compil Games",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddCondition("KeyPressed",
                   _("A key is pressed"),
                   _("Test if a key is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("key", _("Key to test"), "",false)
        .cppCallingInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDL/BuiltinExtensions/KeyboardTools.h");



    AddCondition("KeyFromTextPressed",
                   _("A key is pressed ( text expression )"),
                   _("Test if a key, retrieved from the result of the expression, is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Expression generating the key to test"), "",false)
        .cppCallingInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDL/BuiltinExtensions/KeyboardTools.h");



    AddCondition("AnyKeyPressed",
                   _("Any key is pressed"),
                   _("Test if any key is pressed"),
                   _("Any key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .cppCallingInformation.SetFunctionName("AnyKeyIsPressed").SetIncludeFile("GDL/BuiltinExtensions/KeyboardTools.h");


    #endif
}

