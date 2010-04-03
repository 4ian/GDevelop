#include "GDL/CommonInstructionsExtension.h"
#include "GDL/CommonInstructions.h"

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
}
