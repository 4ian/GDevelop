#include "GDL/CommonInstructionsExtension.h"
#include "GDL/CommonInstructions.h"
#include "GDL/CommentEvent.h"
#include "GDL/StandardEvent.h"
#include "GDL/LinkEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/Event.h"

#include "GDL/ExtensionBase.h"

CommonInstructionsExtension::CommonInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonInstructions",
                          _(""),
                          _(""),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Or",
                   _("Ou"),
                   _("Ou"),
                   _("Ou"),
                   _("Ou"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png",
                   &ConditionOr);

    DECLARE_END_CONDITION()

    DECLARE_EVENT("Standard",
                  "Evenement standard",
                  "Evenement standard",
                  "Evenements standards",
                  "",
                  StandardEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Link",
                  "Evenement lien",
                  "Evenement lien",
                  "Evenements standards",
                  "",
                  LinkEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Comment",
                  "Commentaire",
                  "Evenement commentaire",
                  "Evenements standards",
                  "",
                  CommentEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("While",
                  "Tant que",
                  "Evenement while",
                  "Evenements standards",
                  "",
                  WhileEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Repeat",
                  "Repeat",
                  "Evenement repeat",
                  "Evenements standards",
                  "",
                  RepeatEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("ForEach",
                  "ForEachEvent",
                  "Evenement ForEach",
                  "Evenements standards",
                  "",
                  ForEachEvent)

    DECLARE_END_EVENT()
}
