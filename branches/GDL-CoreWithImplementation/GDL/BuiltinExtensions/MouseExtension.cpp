/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/MouseExtension.h"
#include "GDL/ExtensionBase.h"

MouseExtension::MouseExtension()
{
    DECLARE_THE_EXTENSION("BuiltinMouse",
                          _("Mouse features"),
                          _("Builtin extensions allowing to use mouse"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_ACTION("CentreSourisX",
                   _("Center mouse horizontaly"),
                   _("Put the cursor in the middle of the screen horizontally."),
                   _("Center mouse horizontaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSourisY",
                   _("Center mouse verticaly"),
                   _("Put the cursor in the middle of the screen vertically."),
                   _("Center mouse verticaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursorVertically").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CacheSouris",
                   _("Hide the cursor"),
                   _("Hide the cursor."),
                   _("Hide the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("HideCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("MontreSouris",
                   _("Show the cursor"),
                   _("Show the cursor."),
                   _("Show the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("ShowCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetSourisXY",
                   _("Position the cursor of the mouse"),
                   _("Position the cursor to given coordinates."),
                   _("Position cursor at _PARAM1_;_PARAM2_"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("X position"), "", false);
        instrInfo.AddParameter("expression", _("Y position"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SetCursorPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSouris",
                   _("Center the mouse"),
                   _("Center the mouse."),
                   _("Center the mouse"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    DECLARE_END_ACTION()

    DECLARE_CONDITION("SourisX",
                   _("X position of the mouse"),
                   _("Test the X position of the cursor."),
                   _("The X position of the cursor is _PARAM2__PARAM1_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("X position"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisY",
                   _("Y position of the mouse"),
                   _("Test the Y position of the cursor."),
                   _("The Y position of the cursor is _PARAM2__PARAM1_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Y position"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisBouton",
                   _("Mouse button"),
                   _("Test if the choosen button of the mouse is pressed."),
                   _("The button _PARAM1_ is pressed"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("mouse", _("Button to test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("MouseButtonPressed").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("MouseX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("SourisX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

        instrInfo.SetHidden();
        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("SourisY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

        instrInfo.SetHidden();
        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseWheelDelta", _("Mouse wheel : Displacement"), _("Mouse wheel displacement"), _("Mouse"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
    DECLARE_END_EXPRESSION()
    #endif
}

