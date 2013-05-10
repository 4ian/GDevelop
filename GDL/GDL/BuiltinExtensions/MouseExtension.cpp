/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/MouseExtension.h"
#include "GDL/ExtensionBase.h"

MouseExtension::MouseExtension()
{
    SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Builtin extensions allowing to use the mouse"),
                          "Compil Games",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddAction("CentreSourisX",
                   _("Center mouse horizontaly"),
                   _("Put the cursor in the middle of the screen horizontally."),
                   _("Center mouse horizontaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    AddAction("CentreSourisY",
                   _("Center mouse verticaly"),
                   _("Put the cursor in the middle of the screen vertically."),
                   _("Center mouse verticaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursorVertically").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    AddAction("CacheSouris",
                   _("Hide the cursor"),
                   _("Hide the cursor."),
                   _("Hide the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("HideCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    AddAction("MontreSouris",
                   _("Show the cursor"),
                   _("Show the cursor."),
                   _("Show the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("ShowCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    AddAction("SetSourisXY",
                   _("Position the cursor of the mouse"),
                   _("Position the cursor to given coordinates."),
                   _("Position cursor at _PARAM1_;_PARAM2_"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .codeExtraInformation.SetFunctionName("SetCursorPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    AddAction("CentreSouris",
                   _("Center the mouse"),
                   _("Center the mouse."),
                   _("Center the mouse"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("CenterCursor").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    AddCondition("SourisX",
                   _("X position of the mouse"),
                   _("Test the X position of the cursor."),
                   _("The X position of the cursor is _PARAM2__PARAM1_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("X position"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCursorXPosition").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");



    AddCondition("SourisY",
                   _("Y position of the mouse"),
                   _("Test the Y position of the cursor."),
                   _("The Y position of the cursor is _PARAM2__PARAM1_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Y position"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCursorYPosition").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");



    AddCondition("SourisBouton",
                   _("Mouse button"),
                   _("Test if the choosen button of the mouse is pressed."),
                   _("The button _PARAM1_ is pressed"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", _("Button to test"))
        .codeExtraInformation.SetFunctionName("MouseButtonPressed").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");



    AddExpression("MouseX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    AddExpression("SourisX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden()
        .codeExtraInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    AddExpression("MouseY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")
        .codeExtraInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    AddExpression("SourisY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden()
        .codeExtraInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");


    AddExpression("MouseWheelDelta", _("Mouse wheel : Displacement"), _("Mouse wheel displacement"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");

    #endif
}

