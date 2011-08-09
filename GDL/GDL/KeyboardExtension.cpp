/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/KeyboardExtension.h"
#include "GDL/ExtensionBase.h"

KeyboardExtension::KeyboardExtension()
{
    DECLARE_THE_EXTENSION("BuiltinKeyboard",
                          _("Fonctionnalités d'utilisation du clavier"),
                          _("Extension permettant d'utiliser le clavier, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("KeyPressed",
                   _("Une touche est appuyée"),
                   _("Teste si une touche du clavier est appuyée."),
                   _("La touche _PARAM1_ est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("key", _("Touche à tester"), "",false);;

        instrInfo.cppCallingInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDL/KeyboardTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("KeyFromTextPressed",
                   _("Une touche est appuyée (Expression texte)"),
                   _("Teste si une touche du clavier, retrouvée à partir du résultat de l'expression, est appuyée."),
                   _("La touche _PARAM1_ est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Expression générant la touche à tester"), "",false);;

        instrInfo.cppCallingInformation.SetFunctionName("IsKeyPressed").SetIncludeFile("GDL/KeyboardTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AnyKeyPressed",
                   _("N'importe quelle touche est appuyée"),
                   _("Teste si n'importe quelle touche du clavier est appuyée."),
                   _("Une touche du clavier est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("AnyKeyIsPressed").SetIncludeFile("GDL/KeyboardTools.h");

    DECLARE_END_CONDITION()
}
