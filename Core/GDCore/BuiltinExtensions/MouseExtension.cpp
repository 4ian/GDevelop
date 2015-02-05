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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsMouseExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extensions allowing to use the mouse"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddAction("CentreSourisX",
                   _("Center cursor horizontally"),
                   _("Put the cursor in the middle of the screen horizontally."),
                   _("Center cursor horizontally"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CentreSourisY",
                   _("Center cursor vertically"),
                   _("Put the cursor in the middle of the screen vertically."),
                   _("Center cursor vertically"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CacheSouris",
                   _("Hide the cursor"),
                   _("Hide the cursor."),
                   _("Hide the cursor"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("MontreSouris",
                   _("Show the cursor"),
                   _("Show the cursor."),
                   _("Show the cursor"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("SetSourisXY",
                   _("Position the cursor of the mouse"),
                   _("Position the cursor at the given coordinates."),
                   _("Position cursor at _PARAM1_;_PARAM2_"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .MarkAsAdvanced();

    extension.AddAction("CentreSouris",
                   _("Center the cursor"),
                   _("Center the cursor on the screen."),
                   _("Center the cursor"),
                   _("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddCondition("SourisX",
                   _("Cursor/touch X position"),
                   _("Compare the X position of the cursor or of a touch."),
                   _("Cursor/touch X position is _PARAM1__PARAM2_"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisY",
                   _("Cursor/touch Y position"),
                   _("Compare the Y position of the cursor or of a touch."),
                   _("Cursor/touch Y position is _PARAM1__PARAM2_"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisBouton",
                   _("Mouse button down or touch held"),
                   _("Return true if the specified button of the mouse is down or if any touch is in contact with the screen."),
                   _("Touch or _PARAM1_ mouse button is down"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", _("Button to test"))
        .MarkAsSimple();

    extension.AddExpression("MouseX", _("Cursor/touch X position"), _("Cursor/touch X position"), _("Mouse and touch"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("SourisX", _("Cursor/touch X position"), _("Cursor/touch X position"), _("Mouse and touch"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden();


    extension.AddExpression("MouseY", _("Cursor/touch Y position"), _("Cursor/touch Y position"), _("Mouse and touch"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");


    extension.AddExpression("SourisY", _("Cursor/touch Y position"), _("Cursor/touch Y position"), _("Mouse and touch"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")

        .SetHidden();


    extension.AddExpression("MouseWheelDelta", _("Mouse wheel: Displacement"), _("Mouse wheel displacement"), _("Mouse and touch"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "");

    #endif
}

}
