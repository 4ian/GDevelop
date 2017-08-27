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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsJoystickExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinJoystick",
                          _("Joysticks features"),
                          _("Built-in extension that enables the use of joysticks"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("JoystickButtonDown",
                   _("A button on a joystick is pressed"),
                   _("Test if a button on a joystick is pressed."),
                   _("The button _PARAM2_ of joystick _PARAM1_ is pressed"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number (first joystick: 0)"))
        .AddParameter("expression", _("Button"));

    extension.AddCondition("JoystickAxis",
                   _("Value of an axis of a joystick"),
                   _("Test the value of an axis of a joystick."),
                   _("The value of the axis _PARAM2_ of joystick _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number (first joystick: 0)"))
        .AddParameter("joyaxis", _("Axis"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .SetManipulatedType("number");

    extension.AddAction("GetJoystickAxis",
                   _("Get the value of the axis of a joystick"),
                   _("Save the value of the axis of the joystick (from -100 to 100)."),
                   _("Save in _PARAM3_ the value of axis _PARAM2_ of joystick _PARAM1_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number (first joystick: 0)"))
        .AddParameter("joyaxis", _("Axis"))
        .AddParameter("scenevar", _("Save the result to the scene variable"))
        .SetManipulatedType("number");

    extension.AddExpression("GetJoystickAxis",
                   _("Joystick axis"),
                   _("Value of an axis of a joystick"),
                   _("Joystick"),
                   "res/conditions/joystick.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number (first joystick: 0)"))
        .AddParameter("joyaxis", _("Axis"));
    #endif
}

}
