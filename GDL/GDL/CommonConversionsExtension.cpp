#include "GDL/CommonConversionsExtension.h"
#include "GDL/CommonConversions.h"

CommonConversionsExtension::CommonConversionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonConversions",
                          _T("Conversions standards"),
                          _T("Extension apportant des expressions de conversion, intégrée en standard."),
                          "Compil Games",
                          "Freeware")


    DECLARE_EXPRESSION("ToNumber",
                       _T("Convertir en un nombre"),
                       _T("Converti le texte en un nombre"),
                       _T("Conversion"),
                       "res/conditions/toujours24.png",
                       &ExpToNumber)

        DECLARE_PARAMETER("text", _T("Texte à convertir en nombre"), false, "")

    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("ToString",
                       _T("Convertir en un texte"),
                       _T("Converti le résultat de l'expression en un texte"),
                       _T("Conversion"),
                       "res/conditions/toujours24.png",
                       &ExpToStr)

        DECLARE_PARAMETER("expression", _T("Expression à convertir en texte"), false, "")

    DECLARE_END_STR_EXPRESSION()
}
