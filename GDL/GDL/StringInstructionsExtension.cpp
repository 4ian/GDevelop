/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

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
                          _T("Manipulation de texte"),
                          _T("Extension apportant des expressions de manipulation de texte, intégrée en standard."),
                          "Compil Games",
                          "Freeware")

    DECLARE_STR_EXPRESSION("SubStr",
                   _T("Obtenir une portion de texte depuis un texte"),
                   _T("Obtenir une portion de texte depuis un texte"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpSubStr)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("expression", _T("Position de départ de la portion ( La première lettre est à la position 0 )"), false, "")
        DECLARE_PARAMETER("expression", _T("Longueur de la portion"), false, "")

    DECLARE_END_STR_EXPRESSION()

    DECLARE_STR_EXPRESSION("StrAt",
                   _T("Obtenir un caractère depuis un texte"),
                   _T("Obtenir un caractère depuis un texte"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrAt)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("expression", _T("Position du caractère à prélever ( Premier caractère : 0 )"), false, "")

    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("StrLength",
                   _T("Longueur d'un texte"),
                   _T("Longueur d'un texte"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrLen)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFind",
                   _T("Chercher dans un texte"),
                   _T("Chercher dans un texte ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrFind)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à chercher"), false, "")

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFind",
                   _T("Chercher dans un texte depuis la fin"),
                   _T("Chercher dans un texte depuis la fin ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrRFind)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à chercher"), false, "")

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFindFrom",
                   _T("Chercher dans un texte à partir d'une position"),
                   _T("Chercher dans un texte à partir d'une position ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrFindFrom)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à chercher"), false, "")
        DECLARE_PARAMETER("expression", _T("Position à partir de laquelle chercher le texte"), false, "")

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFindFrom",
                   _T("Chercher dans un texte depuis la fin à partir d'une position"),
                   _T("Chercher dans un texte depuis la fin à partir d'une position ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _T("Manipulation sur le texte"),
                   "res/conditions/toujours24.png",
                   &ExpStrRFindFrom)

        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à chercher"), false, "")
        DECLARE_PARAMETER("expression", _T("Position à partir de laquelle chercher le texte"), false, "")

    DECLARE_END_EXPRESSION()
}
