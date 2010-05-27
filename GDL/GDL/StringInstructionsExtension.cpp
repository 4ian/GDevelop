#include "GDL/StringInstructionsExtension.h"
#include "GDL/StringExpressions.h"
#include "GDL/CommentEvent.h"
#include "GDL/StandardEvent.h"
#include "GDL/LinkEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/Event.h"

#include "GDL/ExtensionBase.h"

StringInstructionsExtension::StringInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinStringInstructions",
                          _("Manipulation de texte"),
                          _("Extension apportant des expressions de manipulation de texte, intégrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_STR_EXPRESSION("SubStr",
                   _("Obtenir une portion de texte depuis un texte"),
                   _("Obtenir une portion de texte depuis un texte"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpSubStr)

        DECLARE_PARAMETER("text", _("Texte"), false, "")
        DECLARE_PARAMETER("expression", _("Position de départ de la portion ( La première lettre est à la position 0 )"), false, "")
        DECLARE_PARAMETER("expression", _("Longueur de la portion"), false, "")

    DECLARE_END_STR_EXPRESSION()
}
