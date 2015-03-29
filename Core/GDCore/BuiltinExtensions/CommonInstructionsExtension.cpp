/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#endif

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsCommonInstructionsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinCommonInstructions",
                          GD_T("Standard events"),
                          GD_T("Built-in extension providing standard events."),
                          "Florian Rival",
                          "Open source (MIT License)");

#if defined(GD_IDE_ONLY)
    extension.AddCondition("Or",
               GD_T("Or"),
               GD_T("Return true if one of the sub conditions is true"),
               GD_T("If one of these conditions is true:"),
               GD_T("Advanced"),
               "res/conditions/or24.png",
               "res/conditions/or.png")
        .SetCanHaveSubInstructions()
        .MarkAsAdvanced();

    extension.AddCondition("And",
               GD_T("And"),
               GD_T("Return true if all sub conditions are true"),
               GD_T("If all of these conditions are true:"),
               GD_T("Advanced"),
               "res/conditions/and24.png",
               "res/conditions/and.png")
        .SetCanHaveSubInstructions()
        .MarkAsAdvanced();

    extension.AddCondition("Not",
               GD_T("Not"),
               GD_T("Return the contrary of the result of the sub conditions"),
               GD_T("Invert the logical result of these conditions:"),
               GD_T("Advanced"),
               "res/conditions/not24.png",
               "res/conditions/not.png")
        .SetCanHaveSubInstructions()
        .MarkAsAdvanced();

    extension.AddCondition("Once",
               GD_T("Trigger once while true"),
               GD_T("Run actions only once, for each time the conditions have been met."),
               GD_T("Trigger once"),
               GD_T("Advanced"),
               "res/conditions/once24.png",
               "res/conditions/once.png");

    extension.AddEvent("Standard", GD_T("Standard event"),
              GD_T("Standard event: Actions are run if conditions are fulfilled."),
              "", "res/eventaddicon.png",
              std::shared_ptr<gd::BaseEvent>(new gd::StandardEvent));

    extension.AddEvent("Link", GD_T("Link"),
              GD_T("Link to some external events"),
              "", "res/lienaddicon.png",
              std::shared_ptr<gd::BaseEvent>(new gd::LinkEvent));

    extension.AddEvent("Comment", GD_T("Comment"),
              GD_T("Event displaying a text in the events editor"),
              "", "res/comment.png",
              std::shared_ptr<gd::BaseEvent>(new gd::CommentEvent));

    extension.AddEvent("While", GD_T("While"),
              GD_T("The event is repeated while the conditions are true"),
              "", "res/while.png",
              std::shared_ptr<gd::BaseEvent>(new gd::WhileEvent));

    extension.AddEvent("Repeat", GD_T("Repeat"),
              GD_T("Event repeated a number of times"),
              "", "res/repeat.png",
              std::shared_ptr<gd::BaseEvent>(new gd::RepeatEvent));

    extension.AddEvent("ForEach", GD_T("For each object"),
              GD_T("Repeat the event for each specified object."),
              "", "res/foreach.png",
              std::shared_ptr<gd::BaseEvent>(new gd::ForEachEvent));

    extension.AddEvent("Group", GD_T("Group"),
              GD_T("Group containing events"),
              "", "res/foreach.png",
              std::shared_ptr<gd::BaseEvent>(new gd::GroupEvent));
#endif
}

}
