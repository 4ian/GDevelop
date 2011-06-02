#include "GDL/KeyboardExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cClavier.h"

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
                   _("La touche _PARAM0_ est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondKeyPressed);

        DECLARE_PARAMETER("key", _("Touche à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("KeyFromTextPressed",
                   _("Une touche est appuyée (Expression texte)"),
                   _("Teste si une touche du clavier, retrouvée à partir du résultat de l'expression, est appuyée."),
                   _("La touche _PARAM0_ est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondKeyFromTextPressed);

        DECLARE_PARAMETER("text", _("Expression générant la touche à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AnyKeyPressed",
                   _("N'importe quelle touche est appuyée"),
                   _("Teste si n'importe quelle touche du clavier est appuyée."),
                   _("Une touche du clavier est appuyée"),
                   _("Clavier"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png",
                   &CondAnyKeyPressed);

    DECLARE_END_CONDITION()
}
