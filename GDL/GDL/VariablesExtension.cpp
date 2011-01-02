/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/VariablesExtension.h"
#include "GDL/cVariables.h"
#include "GDL/aVariables.h"
#include "GDL/eFreeFunctions.h"

VariablesExtension::VariablesExtension()
{
    DECLARE_THE_EXTENSION("BuiltinVariables",
                          _("Fonctionnalités sur les variables"),
                          _("Extension permettant de manipuler les variables, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("VarScene",
                   _("Variable de la scène"),
                   _("Teste si la variable correspond au test effectué."),
                   _("La variable _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarScene);

        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneTxt",
                   _("Texte d'une variable de la scène"),
                   _("Teste si le texte de la variable correspond au test effectué."),
                   _("Le texte de la variable _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarSceneTxt);

        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _("Texte à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneDef",
                   _("Tester si une variable de la scène est définie"),
                   _("Teste si la variable de la scène existe."),
                   _("La variable _PARAM0_ est définie"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarSceneDef);

        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobal",
                   _("Variable globale"),
                   _("Teste si la variable globale correspond au test effectué."),
                   _("La variable globale _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobal);

        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalTxt",
                   _("Texte d'une variable globale"),
                   _("Teste si le texte de la variable globale correspond au test effectué."),
                   _("Le texte de la variable globale _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobalTxt);

        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _("Texte à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalDef",
                   _("Tester si une variable globale est définie"),
                   _("Teste si la variable globale existe."),
                   _("La variable globale _PARAM0_ est définie"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobalDef);

        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ModVarScene",
                   _("Variable de la scène"),
                   _("Modifie une variable de la scène."),
                   _("Faire _PARAM2__PARAM1_ à la variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarScene);

        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarSceneTxt",
                   _("Texte d'une variable de la scène"),
                   _("Modifie le texte d'une variable de la scène."),
                   _("Faire _PARAM2__PARAM1_ au texte de la variable _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarSceneTxt);

        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _("Texte"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobal",
                   _("Variable globale"),
                   _("Modifie une variable globale"),
                   _("Faire _PARAM2__PARAM1_ à la variable globale _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarGlobal);

        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobalTxt",
                   _("Texte d'une variable globale"),
                   _("Modifie le texte d'une variable globale."),
                   _("Faire _PARAM2__PARAM1_ au texte de la variable globale _PARAM0_"),
                   _("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarGlobalTxt);

        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _("Texte"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("Variable", _("Variable de la scène"), _("Variable de la scène"), _("Variables"), "res/actions/var.png", &ExpGetVariableValue)
        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("VariableString", _("Variable de la scène"), _("Texte d'une variable de la scène"), _("Variables"), "res/actions/var.png", &ExpGetVariableString)
        DECLARE_PARAMETER("scenevar", _("Nom de la variable"), false, "")
    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("GlobalVariable", _("Variable globale"), _("Variable globale"), _("Variables"), "res/actions/var.png", &ExpGetGlobalVariableValue)
        DECLARE_PARAMETER("globalvar", _("Nom de la variable globale"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("GlobalVariableString", _("Variable globale"), _("Texte d'une variable globale"), _("Variables"), "res/actions/var.png", &ExpGetGlobalVariableString)
        DECLARE_PARAMETER("globalvar", _("Nom de la variable"), false, "")
    DECLARE_END_STR_EXPRESSION()
}
