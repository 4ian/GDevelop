/** \file
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
                          _T("Fonctionnalités sur les variables"),
                          _T("Extension permettant de manipuler les variables, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("VarScene",
                   _T("Variable de la scène"),
                   _T("Teste si la variable correspond au test effectué."),
                   _T("La variable _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarScene);

        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneTxt",
                   _T("Texte d'une variable de la scène"),
                   _T("Teste si le texte de la variable correspond au test effectué."),
                   _T("Le texte de la variable _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarSceneTxt);

        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarSceneDef",
                   _T("Tester si une variable de la scène est définie"),
                   _T("Teste si la variable de la scène existe."),
                   _T("La variable _PARAM0_ est définie"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarSceneDef);

        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobal",
                   _T("Variable globale"),
                   _T("Teste si la variable globale correspond au test effectué."),
                   _T("La variable globale _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobal);

        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalTxt",
                   _T("Texte d'une variable globale"),
                   _T("Teste si le texte de la variable globale correspond au test effectué."),
                   _T("Le texte de la variable globale _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobalTxt);

        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("VarGlobalDef",
                   _T("Tester si une variable globale est définie"),
                   _T("Teste si la variable globale existe."),
                   _T("La variable globale _PARAM0_ est définie"),
                   _T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png",
                   &CondVarGlobalDef);

        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("ModVarScene",
                   _T("Variable de la scène"),
                   _T("Modifie une variable de la scène."),
                   _T("Faire _PARAM2__PARAM1_ à la variable _PARAM0_"),
                   _T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarScene);

        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarSceneTxt",
                   _T("Texte d'une variable de la scène"),
                   _T("Modifie le texte d'une variable de la scène."),
                   _T("Faire _PARAM2__PARAM1_ au texte de la variable _PARAM0_"),
                   _T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarSceneTxt);

        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobal",
                   _T("Variable globale"),
                   _T("Modifie une variable globale"),
                   _T("Faire _PARAM2__PARAM1_ à la variable globale _PARAM0_"),
                   _T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarGlobal);

        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ModVarGlobalTxt",
                   _T("Texte d'une variable globale"),
                   _T("Modifie le texte d'une variable globale."),
                   _T("Faire _PARAM2__PARAM1_ au texte de la variable globale _PARAM0_"),
                   _T("Variables"),
                   "res/actions/var24.png",
                   "res/actions/var.png",
                   &ActModVarGlobalTxt);

        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")
        DECLARE_PARAMETER("text", _T("Texte"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("Variable", _T("Variable de la scène"), _T("Variable de la scène"), _T("Variables"), "res/actions/var.png", &ExpGetVariableValue)
        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("VariableString", _T("Variable de la scène"), _T("Texte d'une variable de la scène"), _T("Variables"), "res/actions/var.png", &ExpGetVariableString)
        DECLARE_PARAMETER("scenevar", _T("Nom de la variable"), false, "")
    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("GlobalVariable", _T("Variable globale"), _T("Variable globale"), _T("Variables"), "res/actions/var.png", &ExpGetGlobalVariableValue)
        DECLARE_PARAMETER("globalvar", _T("Nom de la variable globale"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("GlobalVariableString", _T("Variable globale"), _T("Texte d'une variable globale"), _T("Variables"), "res/actions/var.png", &ExpGetGlobalVariableString)
        DECLARE_PARAMETER("globalvar", _T("Nom de la variable"), false, "")
    DECLARE_END_STR_EXPRESSION()
}
