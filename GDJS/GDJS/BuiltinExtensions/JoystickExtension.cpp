/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "JoystickExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

JoystickExtension::JoystickExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsJoystickExtension(*this);

    SetExtensionInformation("BuiltinJoystick",
                          GD_T("Joysticks features"),
                          GD_T("Built-in extension allowing to use joysticks"),
                          "Florian Rival",
                          "Open source (MIT License)");

    //Nothing is available for now.
    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddCondition("JoystickButtonDown",
                   GD_T("A button of a joystick is pressed"),
                   GD_T("Test if a button of a joystick is pressed."),
                   GD_T("The button _PARAM2_ of joystick _PARAM1_ is pressed"),
                   GD_T("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("expression", GD_T("Button"), "",false)
        .SetFunctionName("JoystickButtonDown").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");



    AddCondition("JoystickAxis",
                   GD_T("Value of an axis of a joystick"),
                   GD_T("Test the value of an axis of a joystick."),
                   GD_T("The value of the axis _PARAM2_ of joystick _PARAM1_ is _PARAM3__PARAM4_"),
                   GD_T("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"), "",false)
        .AddParameter("expression", GD_T("Value to test"), "",false)
        .SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");



    AddAction("GetJoystickAxis",
                   GD_T("Get the value of the axis of a joystick"),
                   GD_T("Save in the variable the value of the axis of the joystick ( from -100 to 100 )."),
                   GD_T("Save in _PARAM3_ the value of axis _PARAM2_ of joystick _PARAM1_"),
                   GD_T("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false)
        .AddParameter("scenevar", GD_T("Save result to scene variable"), "",false)
        .SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    AddExpression("GetJoystickAxis",
                   GD_T("Joystick axis"),
                   GD_T("Value of an axis of a joystick"),
                   GD_T("Joystick"),
                   "res/conditions/joystick.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", GD_T("Axis"), "",false)
        .SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    */
}

}
