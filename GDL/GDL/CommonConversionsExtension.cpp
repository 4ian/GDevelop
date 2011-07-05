#include "GDL/CommonConversionsExtension.h"

CommonConversionsExtension::CommonConversionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonConversions",
                          _("Conversions standards"),
                          _("Extension apportant des expressions de conversion, intégrée en standard."),
                          "Compil Games",
                          "Freeware")


    DECLARE_EXPRESSION("ToNumber",
                       _("Convertir en un nombre"),
                       _("Converti le texte en un nombre"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        DECLARE_PARAMETER("string", _("Texte à convertir en nombre"), "",false)

        instrInfo.cppCallingInformation.SetFunctionName("ToDouble").SetIncludeFile("GDL/CommonTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("ToString",
                       _("Convertir en un texte"),
                       _("Converti le résultat de l'expression en un texte"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        DECLARE_PARAMETER("expression", _("Expression à convertir en texte"), "",false)

        instrInfo.cppCallingInformation.SetFunctionName("ToString").SetIncludeFile("GDL/CommonTools.h");

    DECLARE_END_STR_EXPRESSION()
}
