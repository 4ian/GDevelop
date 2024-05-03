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
  extension.AddInstructionOrExpressionGroupMetadata(_("Multitouch"))
      .SetIcon("res/conditions/touch24.png");

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
          "CursorX",
          _("Cursor X position"),
          _("the X position of the cursor or of a touch"),
          _("the cursor (or touch) X position"),
          "",
          "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  // Support for deprecated names:
  extension.AddDuplicatedCondition("MouseX", "CursorX").SetHidden();
  extension.AddDuplicatedExpression("MouseX", "CursorX").SetHidden();
  extension.AddDuplicatedCondition("SourisX", "CursorX").SetHidden();
  extension.AddDuplicatedExpression("SourisX", "CursorX").SetHidden();

  extension
      .AddExpressionAndCondition(
          "number",
          "CursorY",
          _("Cursor Y position"),
          _("the Y position of the cursor or of a touch"),
          _("the cursor (or touch) Y position"),
          "",
          "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0");

  // Support for deprecated names:
  extension.AddDuplicatedCondition("MouseY", "CursorY").SetHidden();
  extension.AddDuplicatedExpression("MouseY", "CursorY").SetHidden();
  extension.AddDuplicatedCondition("SourisY", "CursorY").SetHidden();
  extension.AddDuplicatedExpression("SourisY", "CursorY").SetHidden();

  extension
      .AddExpressionAndCondition("number",
                                 "MouseOnlyCursorX",
                                 _("Mouse cursor X position"),
                                 _("the X position of the mouse cursor"),
                                 _("the mouse cursor X position"),
                                 "",
                                 "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      // It's only useful for extensions as they can't use TouchSimulateMouse.
      .SetHidden();

  extension
      .AddExpressionAndCondition("number",
                                 "MouseOnlyCursorY",
                                 _("Mouse cursor Y position"),
                                 _("the Y position of the mouse cursor"),
                                 _("the mouse cursor Y position"),
                                 "",
                                 "res/conditions/mouse24.png")
      .AddCodeOnlyParameter("currentScene", "")
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Camera number (default : 0)"), "", true)
      .SetDefaultValue("0")
      // It's only useful for extensions as they can't use TouchSimulateMouse.
      .SetHidden();

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
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
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
      .UseStandardParameters("number", ParameterOptions::MakeNewOptions())
      .AddParameter("layer", _("Layer"), "", true)
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
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();

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
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();

  extension
      .AddCondition(
          "HasAnyTouchStarted",
          _("A new touch has started"),
          _("Check if a touch has just started on this frame. The touch "
            "identifiers can be "
            "accessed using StartedTouchId() and StartedTouchCount()."),
          _("A new touch has started"),
          _("Multitouch"),
          "res/conditions/touch24.png",
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();

  extension
      .AddExpression("StartedTouchCount",
                     _("Started touch count"),
                     _("The number of touches that have just started on this "
                       "frame. The touch identifiers can be "
                       "accessed using StartedTouchId()."),
                     _("Multitouch"),
                     "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();

  extension
      .AddExpression("StartedTouchId",
                     _("Started touch identifier"),
                     _("The identifier of the touch that has just started on "
                       "this frame. The number of touches can be "
                       "accessed using StartedTouchCount()."),
                     _("Multitouch"),
                     "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Touch index"))
      .SetHidden();

  extension
      .AddCondition(
          "HasAnyTouchOrMouseStarted",
          _("A new touch has started"),
          _("Check if a touch has just started or the mouse left button has "
            "been pressed on this frame. The touch identifiers can be "
            "accessed using StartedTouchOrMouseId() and "
            "StartedTouchOrMouseCount()."),
          _("A new touch has started"),
          _("Multitouch"),
          "res/conditions/touch24.png",
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression(
          "StartedTouchOrMouseCount",
          _("Started touch count"),
          _("The number of touches (including the mouse) that have just "
            "started on this frame. The touch identifiers can be "
            "accessed using StartedTouchOrMouseId()."),
          _("Multitouch"),
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "");

  extension
      .AddExpression(
          "StartedTouchOrMouseId",
          _("Started touch identifier"),
          _("The identifier of the touch or mouse that has just started on "
            "this frame. The number of touches can be "
            "accessed using StartedTouchOrMouseCount()."),
          _("Multitouch"),
          "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Touch index"));

  extension
      .AddCondition("HasTouchEnded",
                    _("A touch has ended"),
                    _("Check if a touch has ended or a mouse left button has "
                      "been released."),
                    _("The touch with identifier _PARAM1_ has ended"),
                    _("Multitouch"),
                    "res/conditions/touch24.png",
                    "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("expression", _("Touch identifier"));

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
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();

  extension
      .AddExpression("LastEndedTouchId",
                     _("Identifier of the last ended touch"),
                     _("Identifier of the last ended touch"),
                     _("Multitouch"),
                     "res/conditions/touch.png")
      .AddCodeOnlyParameter("currentScene", "")
      .SetHidden();
}

}  // namespace gd
