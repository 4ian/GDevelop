/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsMouseExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extensions allowing to use the mouse"),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("CentreSourisX",
                   _("Center mouse horizontaly"),
                   _("Put the cursor in the middle of the screen horizontally."),
                   _("Center mouse horizontaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CentreSourisY",
                   _("Center mouse verticaly"),
                   _("Put the cursor in the middle of the screen vertically."),
                   _("Center mouse verticaly"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CacheSouris",
                   _("Hide the cursor"),
                   _("Hide the cursor."),
                   _("Hide the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("MontreSouris",
                   _("Show the cursor"),
                   _("Show the cursor."),
                   _("Show the cursor"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("SetSourisXY",
                   _("Position the cursor of the mouse"),
                   _("Position the cursor to given coordinates."),
                   _("Position cursor at _PARAM1_;_PARAM2_"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .MarkAsAdvanced();

    extension.AddAction("CentreSouris",
                   _("Center the mouse"),
                   _("Center the mouse."),
                   _("Center the mouse"),
                   _("Mouse"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddCondition("SourisX",
                   _("X position of the mouse"),
                   _("Test the X position of the cursor."),
                   _("The X position of the cursor is _PARAM1__PARAM2_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisY",
                   _("Y position of the mouse"),
                   _("Test the Y position of the cursor."),
                   _("The Y position of the cursor is _PARAM1__PARAM2_"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisBouton",
                   _("Mouse button"),
                   _("Test if the choosen button of the mouse is pressed."),
                   _("The button _PARAM1_ is pressed"),
                   _("Mouse"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", _("Button to test"))
        .MarkAsSimple();

    extension.AddExpression("MouseX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("SourisX", _("X position of the mouse"), _("X position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden();


    extension.AddExpression("MouseY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");


    extension.AddExpression("SourisY", _("Y position of the mouse"), _("Y position of the mouse"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden();


    extension.AddExpression("MouseWheelDelta", _("Mouse wheel : Displacement"), _("Mouse wheel displacement"), _("Mouse"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "");

    #endif
}

}