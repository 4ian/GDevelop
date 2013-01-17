/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDL/BuiltinExtensions/JoystickExtension.h"

JoystickExtension::JoystickExtension()
{
    DECLARE_THE_EXTENSION("BuiltinJoystick",
                          _("Joysticks features"),
                          _("Builtin extension allowing to use joysticks"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("JoystickButtonDown",
                   _("A button of a joystick is pressed"),
                   _("Test if a button of a joystick is pressed."),
                   _("The button _PARAM2_ of joystick _PARAM1_ is pressed"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false);
        instrInfo.AddParameter("expression", _("Button"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("JoystickButtonDown").SetIncludeFile("GDL/BuiltinExtensions/JoystickTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("JoystickAxis",
                   _("Value of an axis of a joystick"),
                   _("Test the value of an axis of a joystick."),
                   _("The value of the axis _PARAM2_ of joystick _PARAM1_ is _PARAM4__PARAM3_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axis"), "",false);
        instrInfo.AddParameter("expression", _("Value to test"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/JoystickTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("GetJoystickAxis",
                   _("Get the value of the axis of a joystick"),
                   _("Save in the variable the value of the axis of the joystick ( from -100 to 100 )."),
                   _("Save in _PARAM3_ the value of axis _PARAM2_ of joystick _PARAM1_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axis"), "",false);
        instrInfo.AddParameter("scenevar", _("Save result to scene variable"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/JoystickTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("GetJoystickAxis",
                   _("Joystick axis"),
                   _("Value of an axis of a joystick"),
                   _("Joystick"),
                   "res/conditions/joystick.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axis"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDL/BuiltinExtensions/JoystickTools.h");

    DECLARE_END_EXPRESSION()
    #endif
}

