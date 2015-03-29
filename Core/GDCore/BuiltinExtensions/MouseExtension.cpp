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
                          GD_T("Mouse features"),
                          GD_T("Built-in extensions allowing to use the mouse"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("SourisSurObjet",
                   GD_T("The cursor/touch is on an object"),
                   GD_T("Test if the cursor is over an object, or if the object is being touched."),
                   GD_T("The cursor/touch is on _PARAM0_"),
                   GD_T("Mouse and touch"),
                   "res/conditions/surObjet24.png",
                   "res/conditions/surObjet.png")

        .AddParameter("objectList", GD_T("Object"))
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", GD_T("Accurate test (yes by default)"), "", true).SetDefaultValue("yes")
        .AddCodeOnlyParameter("conditionInverted", "")
        .MarkAsSimple();

    extension.AddAction("TouchSimulateMouse",
                   GD_T("De/activate moving mouse cursor with touches"),
                   GD_T("When activated, any touch made on a touchscreen will also move the mouse cursor. When deactivated, mouse and touch positions will be completely independant.\nBy default, this is activated so that you can simply use the mouse conditions to also support touchscreens. If you want to have multitouch and differentiate mouse and touches, just deactivate it with this action."),
                   GD_T("Move mouse cursor when touching screen: _PARAM1_"),
                   GD_T("Mouse and touch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", GD_T("Activate (yes by default when game is launched)")).SetDefaultValue("yes")
        .MarkAsAdvanced();

    extension.AddAction("CentreSourisX",
                   GD_T("Center cursor horizontally"),
                   GD_T("Put the cursor in the middle of the screen horizontally."),
                   GD_T("Center cursor horizontally"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CentreSourisY",
                   GD_T("Center cursor vertically"),
                   GD_T("Put the cursor in the middle of the screen vertically."),
                   GD_T("Center cursor vertically"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("CacheSouris",
                   GD_T("Hide the cursor"),
                   GD_T("Hide the cursor."),
                   GD_T("Hide the cursor"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("MontreSouris",
                   GD_T("Show the cursor"),
                   GD_T("Show the cursor."),
                   GD_T("Show the cursor"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddAction("SetSourisXY",
                   GD_T("Position the cursor of the mouse"),
                   GD_T("Position the cursor at the given coordinates."),
                   GD_T("Position cursor at _PARAM1_;_PARAM2_"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("expression", GD_T("Y position"))
        .MarkAsAdvanced();

    extension.AddAction("CentreSouris",
                   GD_T("Center the cursor"),
                   GD_T("Center the cursor on the screen."),
                   GD_T("Center the cursor"),
                   GD_T("Mouse and touch"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        .AddCodeOnlyParameter("currentScene", "")
        .MarkAsAdvanced();

    extension.AddCondition("SourisX",
                   GD_T("Cursor X position"),
                   GD_T("Compare the X position of the cursor or of a touch."),
                   GD_T("Cursor X position is _PARAM1__PARAM2_"),
                   GD_T("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisY",
                   GD_T("Cursor Y position"),
                   GD_T("Compare the Y position of the cursor or of a touch."),
                   GD_T("Cursor Y position is _PARAM1__PARAM2_"),
                   GD_T("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Y position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("SourisBouton",
                   GD_T("Mouse button down or touch held"),
                   GD_T("Return true if the specified button of the mouse is down or if any touch is in contact with the screen."),
                   GD_T("Touch or _PARAM1_ mouse button is down"),
                   GD_T("Mouse and touch"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("mouse", GD_T("Button to test"))
        .MarkAsSimple();

    extension.AddCondition("TouchX",
                   GD_T("Touch X position"),
                   GD_T("Compare the X position of a specific touch."),
                   GD_T("Touch #_PARAM1_ X position is _PARAM2__PARAM3_"),
                   GD_T("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Touch identifier"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("TouchY",
                   GD_T("Touch Y position"),
                   GD_T("Compare the Y position of a specific touch."),
                   GD_T("Touch #_PARAM1_ Y position is _PARAM2__PARAM3_"),
                   GD_T("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Touch identifier"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("X position"))
        .AddParameter("layer", GD_T("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .AddParameter("expression", GD_T("Camera number ( default : 0 )"), "", true).SetDefaultValue("0")
        .SetManipulatedType("number");

    extension.AddCondition("PopStartedTouch",
                   GD_T("A new touch has started"),
                   GD_T("Return true if a touch has started. The touch identifier can be accessed using LastTouchId().\nAs more than one touch can have started, this condition is only true once for each touch: the next time you use it, it will be for a new touch or it will return false if there is no more touch that just started."),
                   GD_T("A new touch has started"),
                   GD_T("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddCondition("PopEndedTouch",
                   GD_T("A touch has ended"),
                   GD_T("Return true if a touch has ended. The touch identifier can be accessed using LastEndedTouchId().\nAs more than one touch can have ended, this condition is only true once for each touch: the next time you use it, it will be for a new touch or it will return false if there is no more touch that just ended."),
                   GD_T("A touch has ended"),
                   GD_T("Mouse and touch/Multitouch"),
                   "res/conditions/touch24.png",
                   "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("MouseX", GD_T("Cursor X position"), GD_T("Cursor X position"), GD_T("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("SourisX", GD_T("Cursor X position"), GD_T("Cursor X position"), GD_T("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0")
        .SetHidden();

    extension.AddExpression("MouseY", GD_T("Cursor Y position"), GD_T("Cursor Y position"), GD_T("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0");


    extension.AddExpression("SourisY", GD_T("Cursor Y position"), GD_T("Cursor Y position"), GD_T("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0")
        .SetHidden();

    extension.AddExpression("MouseWheelDelta", GD_T("Mouse wheel: Displacement"), GD_T("Mouse wheel displacement"), GD_T("Mouse cursor"), "res/actions/mouse.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("TouchX", GD_T("Touch X position"), GD_T("Touch X position"), GD_T("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Touch identifier"), "", false)
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("TouchY", GD_T("Touch Y position"), GD_T("Touch Y position"), GD_T("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("expression", GD_T("Touch identifier"), "", false)
        .AddParameter("layer", GD_T("Layer"), "", true).SetDefaultValue("\"\"")
        .AddParameter("camera", GD_T("Camera"), "", true).SetDefaultValue("0");

    extension.AddExpression("LastTouchId", GD_T("Identifier of the last touch"), GD_T("Identifier of the last touch"), GD_T("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    extension.AddExpression("LastEndedTouchId", GD_T("Identifier of the last ended touch"), GD_T("Identifier of the last ended touch"), GD_T("Multitouch"), "res/conditions/touch.png")
        .AddCodeOnlyParameter("currentScene", "");

    #endif
}

}
