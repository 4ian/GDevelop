/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
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
                          _("Joysticks features"),
                          _("Built-in extension allowing to use joysticks"),
                          "Florian Rival",
                          "Open source (LGPL)");

    //Nothing is available for now.
    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
    /*
    AddCondition("JoystickButtonDown",
                   _("A button of a joystick is pressed"),
                   _("Test if a button of a joystick is pressed."),
                   _("The button _PARAM2_ of joystick _PARAM1_ is pressed"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("expression", _("Button"), "",false)
        .codeExtraInformation.SetFunctionName("JoystickButtonDown").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");



    AddCondition("JoystickAxis",
                   _("Value of an axis of a joystick"),
                   _("Test the value of an axis of a joystick."),
                   _("The value of the axis _PARAM2_ of joystick _PARAM1_ is _PARAM3__PARAM4_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", _("Axis"), "",false)
        .AddParameter("relationalOperator", _("Sign of the test"), "",false)
        .AddParameter("expression", _("Value to test"), "",false)
        .codeExtraInformation.SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");



    AddAction("GetJoystickAxis",
                   _("Get the value of the axis of a joystick"),
                   _("Save in the variable the value of the axis of the joystick ( from -100 to 100 )."),
                   _("Save in _PARAM3_ the value of axis _PARAM2_ of joystick _PARAM1_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", _("Axis"), "",false)
        .AddParameter("scenevar", _("Save result to scene variable"), "",false)
        .codeExtraInformation.SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    AddExpression("GetJoystickAxis",
                   _("Joystick axis"),
                   _("Value of an axis of a joystick"),
                   _("Joystick"),
                   "res/conditions/joystick.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Joystick number ( First joystick: 0 )"), "",false)
        .AddParameter("joyaxis", _("Axis"), "",false)
        .codeExtraInformation.SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDCpp/BuiltinExtensions/JoystickTools.h");

    */
}

}
