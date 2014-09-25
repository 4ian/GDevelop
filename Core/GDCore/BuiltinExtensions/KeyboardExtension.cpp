/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Built-in extensions allowing to use keyboard"),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("KeyPressed",
                   _("A key is pressed"),
                   _("Test if a key is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("key", _("Key to test"), "",false);

    extension.AddCondition("KeyFromTextPressed",
                   _("A key is pressed ( text expression )"),
                   _("Test if a key, retrieved from the result of the expression, is pressed"),
                   _("_PARAM1_ key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Expression generating the key to test"), "",false)
        .MarkAsAdvanced();

    extension.AddCondition("AnyKeyPressed",
                   _("Any key is pressed"),
                   _("Test if any key is pressed"),
                   _("Any key is pressed"),
                   _("Keyboard"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddCodeOnlyParameter("currentScene", "");
    #endif
}

}
