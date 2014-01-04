/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/BuiltinExtensions/KeyboardExtension.h"
#include "GDCpp/ExtensionBase.h"

KeyboardExtension::KeyboardExtension()
{
    SetExtensionInformation("BuiltinKeyboard",
                          _("Keyboard features"),
                          _("Built-in extensions allowing to use keyboard"),
                          "Florian Rival",
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
        .codeExtraInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");



    AddCondition("KeyFromTextPressed",
                   _("A key is pressed ( text expression )"),
                   _("Test if a key, retrieved from the result of the expression, is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Expression generating the key to test"), "",false)
        .codeExtraInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");



    AddCondition("AnyKeyPressed",
                   _("Any key is pressed"),
                   _("Test if any key is pressed"),
                   _("Any key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("AnyKeyIsPressed").SetIncludeFile("GDCpp/BuiltinExtensions/KeyboardTools.h");


    #endif
}

