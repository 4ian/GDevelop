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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsJoystickExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinJoystick",
                          GD_T("Joysticks features"),
                          GD_T("Built-in extension allowing to use joysticks"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("JoystickButtonDown",
                   _("A button of a joystick is pressed"),
                   _("Test if a button of a joystick is pressed."),
                   GD_T("The button _PARAM2_ of joystick _PARAM1_ is pressed"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("expression", GD_T("Button"), "",false);

    extension.AddCondition("JoystickAxis",
                   _("Value of an axis of a joystick"),
                   _("Test the value of an axis of a joystick."),
                   GD_T("The value of the axis _PARAM2_ of joystick _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .SetManipulatedType("number");

    extension.AddAction("GetJoystickAxis",
                   _("Get the value of the axis of a joystick"),
                   _("Save in the variable the value of the axis of the joystick ( from -100 to 100 )."),
                   GD_T("Save in _PARAM3_ the value of axis _PARAM2_ of joystick _PARAM1_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false)
        .AddParameter("scenevar", GD_T("Save result to scene variable"), "",false)
        .SetManipulatedType("number");

    extension.AddExpression("GetJoystickAxis",
                   GD_T("Joystick axis"),
                   GD_T("Value of an axis of a joystick"),
                   GD_T("Joystick"),
                   "res/conditions/joystick.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false);
    #endif
}

}
