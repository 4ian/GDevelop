/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsMouseExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinMouse",
          _("Mouse and touch"),
          "Conditions and actions to handle either the mouse or touches on "
          "touchscreen. By default, conditions related to the mouse will also "
          "handle the touches - so that it's easier to handle both in your "
          "game. You can disable this behavior if you want to handle them "
          "separately in different events.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/mouse-touch")
      .SetCategory("Input");
  extension.AddInstructionOrExpressionGroupMetadata(_("Mouse and touch"))
      .SetIcon("res/actions/mouse24.png");

  extension
      .AddCondition(
          "IsMouseWheelScrollingUp",
          _("The mouse wheel is scrolling up"),
          _("Check if the mouse wheel is scrolling up. Use MouseWheelDelta "
            "expression if you want to know the amount that was scrolled."),
          _("The mouse wheel is scrolling up"),
          "",
          "res/actions/mouse24.png",
          "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  extension
      .AddCondition(
          "IsMouseWheelScrollingDown",
          _("The mouse wheel is scrolling down"),
          _("Check if the mouse wheel is scrolling down. Use MouseWheelDelta "
            "expression if you want to know the amount that was scrolled."),
          _("The mouse wheel is scrolling down"),
          "",
          "res/actions/mouse24.png",
          "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsSimple();

  extension
      .AddAction(
          "TouchSimulateMouse",
          _("De/activate moving the mouse cursor with touches"),
          _("When activated, any touch made on a touchscreen will also move "
            "the mouse cursor. When deactivated, mouse and touch positions "
            "will be completely independent.\nBy default, this is activated so "
            "that you can simply use the mouse conditions to also support "
            "touchscreens. If you want to have multitouch and differentiate "
            "mouse movement and touches, just deactivate it with this action."),
          _("Move mouse cursor when touching screen: _PARAM1_"),
          "",
          "res/conditions/touch24.png",
          "res/conditions/touch.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("yesorno",
                    _("Activate (yes by default when game is launched)"))
      .SetDefaultValue("yes")
      .MarkAsAdvanced();

  extension
      .AddAction("CentreSourisX",
                 _("Center cursor horizontally"),
                 _("Put the cursor in the middle of the screen horizontally."),
                 _("Center cursor horizontally"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("CentreSourisY",
                 _("Center cursor vertically"),
                 _("Put the cursor in the middle of the screen vertically."),
                 _("Center cursor vertically"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("CacheSouris",
                 _("Hide the cursor"),
                 _("Hide the cursor."),
                 _("Hide the cursor"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("MontreSouris",
                 _("Show the cursor"),
                 _("Show the cursor."),
                 _("Show the cursor"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddAction("SetSourisXY",
                 _("Position the cursor of the mouse"),
                 _("Position the cursor at the given coordinates."),
                 _("Position cursor at _PARAM1_;_PARAM2_"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .MarkAsAdvanced();

  extension
      .AddAction("CentreSouris",
                 _("Center the cursor"),
                 _("Center the cursor on the screen."),
                 _("Center the cursor"),
                 "",
                 "res/actions/mouse24.png",
                 "res/actions/mouse.png")

      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition(
          "number",
          "MouseX",
          _("Cursor X position"),
          _("the X position of the cursor or of a touch"),
          _("the cursor (or touch) X position"),
          "",
          "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number")
      .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  // Support for deprecated names:
  extension.AddDuplicatedCondition("SourisX", "MouseX").SetHidden();
  extension.AddDuplicatedExpression("SourisX", "MouseX").SetHidden();

  extension
      .AddExpressionAndCondition(
          "number",
          "MouseY",
          _("Cursor Y position"),
          _("the Y position of the cursor or of a touch"),
          _("the cursor (or touch) Y position"),
          "",
          "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number")
      .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  // Support for deprecated names:
  extension.AddDuplicatedCondition("SourisY", "MouseY").SetHidden();
  extension.AddDuplicatedExpression("SourisY", "MouseY").SetHidden();

  extension
      .AddCondition("IsMouseInsideCanvas",
                    _("Mouse cursor is inside the window"),
                    _("Check if the mouse cursor is inside the window."),
                    _("The mouse cursor is inside the window"),
                    "",
                    "res/conditions/mouse24.png",
                    "res/conditions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .MarkAsAdvanced();

  extension
      .AddCondition("MouseButtonPressed",
                    _("Mouse button pressed or touch held"),
                    _("Check if the specified mouse button is pressed or "
                      "if a touch is in contact with the screen."),
                    _("Touch or _PARAM1_ mouse button is down"),
                    "",
                    "res/conditions/mouse24.png",
                    "res/conditions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("mouse", _("Button to check"))
      .MarkAsSimple();

  // Support for deprecated names:
  extension.AddDuplicatedCondition("SourisBouton", "MouseButtonPressed")
      .SetHidden();

  extension
      .AddCondition("MouseButtonReleased",
                    _("Mouse button released"),
                    _("Check if the specified mouse button was released."),
                    _("_PARAM1_ mouse button was released"),
                    "",
                    "res/conditions/mouse24.png",
                    "res/conditions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("mouse", _("Button to check"))
      .MarkAsSimple();

  extension
      .AddCondition(
          "MouseButtonFromTextPressed",
          _("Mouse button pressed or touch held (text expression)"),
          _("Check if a mouse button, retrieved from the result of the "
            "expression, is pressed."),
          _("_PARAM1_ mouse button is pressed"),
          "",
          "res/conditions/mouse24.png",
          "res/conditions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("stringWithSelector",
                    _("Expression generating the mouse button to check"),
                    "[\"Left\", \"Right\", \"Middle\"]")
      .SetParameterLongDescription(
          _("Possible values are Left, Right and Middle."))
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "MouseButtonFromTextReleased",
          _("Mouse button released (text expression)"),
          _("Check if a mouse button, retrieved from the result of the "
            "expression, was just released."),
          _("_PARAM1_ mouse button is released"),
          "",
          "res/conditions/mouse24.png",
          "res/conditions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("stringWithSelector",
                    _("Expression generating the mouse button to check"),
                    "[\"Left\", \"Right\", \"Middle\"]")
      .SetParameterLongDescription(
          _("Possible values are Left, Right and Middle."))
      .MarkAsAdvanced();

  extension
      .AddExpressionAndCondition("number",
                                 "TouchX",
                                 _("Touch X position"),
                                 _("the X position of a specific touch"),
                                 _("the touch #_PARAM1_ X position"),
                                 _("Multitouch"),
                                 "res/conditions/touch24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Touch identifier"))
      .UseStandardParameters("number")
      .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  extension
      .AddExpressionAndCondition("number",
                                 "TouchY",
                                 _("Touch Y position"),
                                 _("the Y position of a specific touch"),
                                 _("the touch #_PARAM1_ Y position"),
                                 _("Multitouch"),
                                 "res/conditions/touch24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Touch identifier"))
      .UseStandardParameters("number")
      .AddParameter("layer", _("Layer (base layer if empty)"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  extension
      .AddCondition(
          "PopStartedTouch",
          _("A new touch has started"),
          _("Check if a touch has started. The touch identifier can be "
            "accessed using LastTouchId().\nAs more than one touch can be "
            "started, this condition is only true once for each touch: the "
            "next time you use it, it will be for a new touch, or it will "
            "return false if no more touches have just started."),
          _("A new touch has started"),
          _("Multitouch"),
          "res/conditions/touch24.png",
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddCondition(
          "PopEndedTouch",
          _("A touch has ended"),
          _("Check if a touch has ended. The touch identifier can be "
            "accessed using LastEndedTouchId().\nAs more than one touch can be "
            "ended, this condition is only true once for each touch: the next "
            "time you use it, it will be for a new touch, or it will return "
            "false if no more touches have just ended."),
          _("A touch has ended"),
          _("Multitouch"),
          "res/conditions/touch24.png",
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("MouseWheelDelta",
                     _("Mouse wheel: Displacement"),
                     _("Mouse wheel displacement"),
                     _("Mouse and touch"),
                     "res/actions/mouse.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("LastTouchId",
                     _("Identifier of the last touch"),
                     _("Identifier of the last touch"),
                     _("Multitouch"),
                     "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression("LastEndedTouchId",
                     _("Identifier of the last ended touch"),
                     _("Identifier of the last ended touch"),
                     _("Multitouch"),
                     "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");
}

}  // namespace gd
