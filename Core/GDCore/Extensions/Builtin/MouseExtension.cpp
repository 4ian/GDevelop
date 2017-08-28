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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsMouseExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinMouse",
                          _("Mouse features"),
                          _("Built-in extension that enables the use of a mouse"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("SourisSurObjet",
                   _("The cursor/touch is on an object"),
                   _("Test if the cursor is over an object, or if the object is being touched."),
                   _("The cursor/touch is on _PARAM0_"),
                   _("Mouse and touch"),
                   "res/conditions/surObjet24.png",
                   "res/conditions/surObjet.png")

        .AddParameter("objectList", _("Object"))
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Accurate test (yes by default)"), "", true).SetDefaultValue("yes")
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddAction("TouchSimulateMouse",
                   _("De/activate moving the mouse cursor with touches"),
                   _("When activated, any touch made on a touchscreen will also move the mouse cursor. When deactivated, mouse and touch positions will be completely independent.\nBy default, this is activated so that you can simply use the mouse conditions to also support touchscreens. If you want to have multitouch and differentiate mouse movement and touches, just deactivate it with this action."),
                   _("Move mouse cursor when touching screen: _PARAM1_"),
                   _("Mouse and touch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Activate (yes by default when game is launched)")).SetDefaultValue("yes")
        .MarkAsAdvanced();

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
                   _("Cursor X position"),
                   _("Compare the X position of the cursor or of a touch."),
                   _("Cursor X position is _PARAM1__PARAM2_"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisY",
                   _("Cursor Y position"),
                   _("Compare the Y position of the cursor or of a touch."),
                   _("Cursor Y position is _PARAM1__PARAM2_"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisBouton",
                   _("Mouse button pressed or touch held"),
                   _("Return true if the specified mouse button is pressed or if a touch is in contact with the screen."),
                   _("Touch or _PARAM1_ mouse button is down"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", _("Button to test"))
        .MarkAsSimple();

    extension.AddCondition("MouseButtonReleased",
                   _("Mouse button released"),
                   _("Return true if the specified mouse button was released."),
                   _("_PARAM1_ mouse button was released"),
                   _("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", _("Button to test"))
        .MarkAsSimple();

    extension.AddCondition("TouchX",
                   _("Touch X position"),
                   _("Compare the X position of a specific touch."),
                   _("Touch #_PARAM1_ X position is _PARAM2__PARAM3_"),
                   _("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Touch identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("TouchY",
                   _("Touch Y position"),
                   _("Compare the Y position of a specific touch."),
                   _("Touch #_PARAM1_ Y position is _PARAM2__PARAM3_"),
                   _("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Touch identifier"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("X position"))
        .AddParameter("layer", _("Layer (base layer if empty)"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", _("Camera number (default : 0)"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("PopStartedTouch",
                   _("A new touch has started"),
                   _("Return true if a touch has started. The touch identifier can be accessed using LastTouchId().\nAs more than one touch can be started, this condition is only true once for each touch: the next time you use it, it will be for a new touch, or it will return false if no more touches have just started."),
                   _("A new touch has started"),
                   _("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddCondition("PopEndedTouch",
                   _("A touch has ended"),
                   _("Return true if a touch has ended. The touch identifier can be accessed using LastEndedTouchId().\nAs more than one touch can be ended, this condition is only true once for each touch: the next time you use it, it will be for a new touch, or it will return false if no more touches have just ended."),
                   _("A touch has ended"),
                   _("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("MouseX", _("Cursor X position"), _("Cursor X position"), _("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("SourisX", _("Cursor X position"), _("Cursor X position"), _("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")
        .SetHidden();

    extension.AddExpression("MouseY", _("Cursor Y position"), _("Cursor Y position"), _("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");


    extension.AddExpression("SourisY", _("Cursor Y position"), _("Cursor Y position"), _("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0")
        .SetHidden();

    extension.AddExpression("MouseWheelDelta", _("Mouse wheel: Displacement"), _("Mouse wheel displacement"), _("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("TouchX", _("Touch X position"), _("Touch X position"), _("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Touch identifier"))
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("TouchY", _("Touch Y position"), _("Touch Y position"), _("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", _("Touch identifier"))
        .AddParameter("layer", _("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", _("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("LastTouchId", _("Identifier of the last touch"), _("Identifier of the last touch"), _("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("LastEndedTouchId", _("Identifier of the last ended touch"), _("Identifier of the last ended touch"), _("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    #endif
}

}
