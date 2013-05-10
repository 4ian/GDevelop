#include "MouseExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

MouseExtension::MouseExtension()
{
    SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Builtin extensions allowing to use the mouse"),
                          "Compil Games",
                          "Freeware");
    CloneExtension("Game Develop C++ platform", "BuiltinMouse");

    GetAllConditions()["SourisX"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseX").SetIncludeFile("inputtools.h");
    GetAllConditions()["SourisY"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseY").SetIncludeFile("inputtools.h");

    //TODO: Support for layers
    GetAllExpressions()["MouseX"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseX").SetIncludeFile("inputtools.h");
    GetAllExpressions()["SourisX"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseX").SetIncludeFile("inputtools.h"); //Deprecated
    GetAllExpressions()["MouseY"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseY").SetIncludeFile("inputtools.h"); //Deprecated
    GetAllExpressions()["SourisY"].codeExtraInformation
        .SetFunctionName("runtimeScene.getGame().getMouseY").SetIncludeFile("inputtools.h"); //Deprecated

    /*
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



    AddExpression("MouseWheelDelta", _("Mouse wheel : Displacement"), _("Mouse wheel displacement"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDL/BuiltinExtensions/MouseTools.h");
*/
}
