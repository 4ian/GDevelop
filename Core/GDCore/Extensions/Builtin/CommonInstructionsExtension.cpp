/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Events/Builtin/AsyncEvent.h"
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
          _("Builtin events"),
          "GDevelop comes with a set of events and conditions that allow to "
          "express the game logic and rules.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/advanced-conditions");

  extension
      .AddCondition("Or",
                    _("Or"),
                    _("Check if one of the sub conditions is true"),
                    _("If one of these conditions is true:"),
                    _("Advanced"),
                    "res/conditions/or24.png",
                    "res/conditions/or.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension
      .AddCondition("And",
                    _("And"),
                    _("Check if all sub conditions are true"),
                    _("If all of these conditions are true:"),
                    _("Advanced"),
                    "res/conditions/and24.png",
                    "res/conditions/and.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "Not",
          _("Not"),
          _("Return the contrary of the result of the sub conditions"),
          _("Invert the logical result of these conditions:"),
          _("Advanced"),
          "res/conditions/not24.png",
          "res/conditions/not.png")
      .SetCanHaveSubInstructions()
      .MarkAsAdvanced();

  extension.AddCondition(
      "Once",
      _("Trigger once while true"),
      _("Run actions only once, for each time the conditions have been met."),
      _("Trigger once"),
      _("Advanced"),
      "res/conditions/once24.png",
      "res/conditions/once.png");

  extension.AddEvent(
      "Standard",
      _("Standard event"),
      _("Standard event: Actions are run if conditions are fulfilled."),
      "",
      "res/eventaddicon.png",
      std::make_shared<gd::StandardEvent>());

  extension.AddEvent("Async",
                     _("Async event"),
                     _("Internal event for asynchronous actions"),
                     "",
                     "res/eventaddicon.png",
                     std::make_shared<gd::AsyncEvent>());

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
