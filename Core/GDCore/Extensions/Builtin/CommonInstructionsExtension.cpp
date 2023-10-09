/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachChildVariableEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API
BuiltinExtensionsImplementer::ImplementsCommonInstructionsExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinCommonInstructions",
          _("Events and control flow"),
          "GDevelop comes with a set of events and conditions that allow to "
          "express the game logic and rules.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Advanced")
      .SetExtensionHelpPath("/all-features/advanced-conditions");
  extension
      .AddInstructionOrExpressionGroupMetadata(_("Events and control flow"))
      .SetIcon("res/conditions/toujours24_black.png");

  // This condition is deprecated as this does not bring anything new
  // and can be confusing or misleading for beginners.
  extension
      .AddCondition("Always",
                    _("Always"),
                    _("This condition always returns true (or always false, if "
                      "the condition is inverted)."),
                    _("Always"),
                    "",
                    "res/conditions/toujours24_black.png",
                    "res/conditions/toujours_black.png")
      .SetHelpPath("/all-features/advanced-conditions")
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced()
      .SetHidden();

  // Compatibility with GD <= 5.0.127
  extension
      .AddDuplicatedCondition(
          "Toujours", "BuiltinCommonInstructions::Always", {.unscoped = true})
      .SetHidden();
  // end of compatibility code

  extension
      .AddCondition("Or",
                    _("Or"),
                    _("Check if one of the sub conditions is true"),
                    _("If one of these conditions is true:"),
                    "",
                    "res/conditions/or24_black.png",
                    "res/conditions/or_black.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension
      .AddCondition("And",
                    _("And"),
                    _("Check if all sub conditions are true"),
                    _("If all of these conditions are true:"),
                    "",
                    "res/conditions/and24_black.png",
                    "res/conditions/and_black.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "Not",
          _("Not"),
          _("Return the contrary of the result of the sub conditions"),
          _("Invert the logical result of these conditions:"),
          "",
          "res/conditions/not24_black.png",
          "res/conditions/not_black.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension.AddCondition(
      "Once",
      _("Trigger once while true"),
      _("Run actions only once, for each time the conditions have been met."),
      _("Trigger once"),
      "",
      "res/conditions/once24.png",
      "res/conditions/once.png");

  extension
      .AddCondition("CompareNumbers",
                    _("Compare two numbers"),
                    _("Compare the two numbers."),
                    _("_PARAM0_ _PARAM1_ _PARAM2_"),
                    "",
                    "res/conditions/egal24_black.png",
                    "res/conditions/egal_black.png")
      .SetHelpPath("/all-features/advanced-conditions")
      .AddParameter("expression", _("First expression"))
      .AddParameter("relationalOperator", _("Sign of the test"), "number")
      .AddParameter("expression", _("Second expression"))
      .MarkAsAdvanced();

  // Compatibility with GD <= 5.0.127
  extension
      .AddDuplicatedCondition("Egal",
                              "BuiltinCommonInstructions::CompareNumbers",
                              {.unscoped = true})
      .SetHidden();
  // end of compatibility code

  extension
      .AddCondition("CompareStrings",
                    _("Compare two strings"),
                    _("Compare the two strings."),
                    _("_PARAM0_ _PARAM1_ _PARAM2_"),
                    "",
                    "res/conditions/egal24_black.png",
                    "res/conditions/egal_black.png")
      .SetHelpPath("/all-features/advanced-conditions")
      .AddParameter("string", _("First string expression"))
      .AddParameter("relationalOperator", _("Sign of the test"), "string")
      .AddParameter("string", _("Second string expression"))
      .MarkAsAdvanced();

  // Compatibility with GD <= 5.0.127
  extension
      .AddDuplicatedCondition("StrEqual",
                              "BuiltinCommonInstructions::CompareStrings",
                              {.unscoped = true})
      .SetHidden();
  // end of compatibility code

  extension.AddEvent(
      "Standard",
      _("Standard event"),
      _("Standard event: Actions are run if conditions are fulfilled."),
      "",
      "res/eventaddicon.png",
      std::make_shared<gd::StandardEvent>());

  extension.AddEvent("Link",
                     _("Link external events"),
                     _("Link to external events."),
                     "",
                     "res/lienaddicon.png",
                     std::make_shared<gd::LinkEvent>());

  extension.AddEvent("Comment",
                     _("Comment"),
                     _("Event displaying a text in the events editor."),
                     "",
                     "res/comment.png",
                     std::make_shared<gd::CommentEvent>());

  extension.AddEvent("While",
                     _("While"),
                     _("Repeat the event while the conditions are true."),
                     "",
                     "res/while.png",
                     std::make_shared<gd::WhileEvent>());

  extension.AddEvent("Repeat",
                     _("Repeat"),
                     _("Repeat the event for a specified number of times."),
                     "",
                     "res/repeat.png",
                     std::make_shared<gd::RepeatEvent>());

  extension.AddEvent("ForEach",
                     _("For each object"),
                     _("Repeat the event for each specified object."),
                     "",
                     "res/foreach.png",
                     std::make_shared<gd::ForEachEvent>());

  extension.AddEvent(
      "ForEachChildVariable",
      _("For each child variable (of a structure or array)"),
      _("Repeat the event for each child variable of a structure or array."),
      "",
      "res/foreach.png",
      std::make_shared<gd::ForEachChildVariableEvent>());

  extension.AddEvent("Group",
                     _("Event group"),
                     _("Group containing events."),
                     "",
                     "res/foreach.png",
                     std::make_shared<gd::GroupEvent>());
}

}  // namespace gd
