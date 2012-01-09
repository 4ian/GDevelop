/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDL/ExtensionBase.h"

StringInstructionsExtension::StringInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinStringInstructions",
                          _("Manipulation de texte"),
                          _("Extension apportant des expressions de manipulation de texte, intégrée en standard."),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)

    DECLARE_STR_EXPRESSION("SubStr",
                   _("Obtenir une portion de texte depuis un texte"),
                   _("Obtenir une portion de texte depuis un texte"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("expression", _("Position de départ de la portion ( La première lettre est à la position 0 )"), "",false);
        instrInfo.AddParameter("expression", _("Longueur de la portion"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_STR_EXPRESSION("StrAt",
                   _("Obtenir un caractère depuis un texte"),
                   _("Obtenir un caractère depuis un texte"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("expression", _("Position du caractère à prélever ( Premier caractère : 0 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("StrLength",
                   _("Longueur d'un texte"),
                   _("Longueur d'un texte"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFind",
                   _("Chercher dans un texte"),
                   _("Chercher dans un texte ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("string", _("Texte à chercher"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFind",
                   _("Chercher dans un texte depuis la fin"),
                   _("Chercher dans un texte depuis la fin ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("string", _("Texte à chercher"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFindFrom",
                   _("Chercher dans un texte à partir d'une position"),
                   _("Chercher dans un texte à partir d'une position ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("string", _("Texte à chercher"), "",false);
        instrInfo.AddParameter("expression", _("Position à partir de laquelle chercher le texte"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFindFrom",
                   _("Chercher dans un texte depuis la fin à partir d'une position"),
                   _("Chercher dans un texte depuis la fin à partir d'une position ( Retourne la position du résultat ou -1 si non trouvé )"),
                   _("Manipulation sur le texte"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Texte"), "",false);
        instrInfo.AddParameter("string", _("Texte à chercher"), "",false);
        instrInfo.AddParameter("expression", _("Position à partir de laquelle chercher le texte"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()
    #endif
}
