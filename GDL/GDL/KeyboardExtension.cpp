#include "GDL/KeyboardExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cClavier.h"

KeyboardExtension::KeyboardExtension()
{
    DECLARE_THE_EXTENSION("BuiltinKeyboard",
                          _T("Fonctionnalités d'utilisation du clavier"),
                          _T("Extension permettant d'utiliser le clavier, integrée en standard"),
                          "Compil Games",
                          "Freeware")


    DECLARE_CONDITION("KeyPressed",
                   _T("Une touche est appuyée"),
                   _T("Teste si une touche du clavier est appuyée."),
                   _T("La touche _PARAM0_ est appuyée"),
                   _T("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondKeyPressed);

        DECLARE_PARAMETER("key", _T("Touche à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("KeyFromTextPressed",
                   _T("Une touche est appuyée (Expression texte)"),
                   _T("Teste si une touche du clavier, retrouvée à partir du résultat de l'expression, est appuyée."),
                   _T("La touche _PARAM0_ est appuyée"),
                   _T("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondKeyFromTextPressed);

        DECLARE_PARAMETER("text", _T("Expression générant la touche à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AnyKeyPressed",
                   _T("N'importe quelle touche est appuyée"),
                   _T("Teste si n'importe quelle touche du clavier est appuyée."),
                   _T("Une touche du clavier est appuyée"),
                   _T("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondAnyKeyPressed);

    DECLARE_END_CONDITION()
}
