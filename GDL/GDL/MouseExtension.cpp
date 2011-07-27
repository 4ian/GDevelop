/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/MouseExtension.h"
#include "GDL/ExtensionBase.h"

MouseExtension::MouseExtension()
{
    DECLARE_THE_EXTENSION("BuiltinMouse",
                          _("Fonctionnalité d'utilisation de la souris"),
                          _("Extension permettant d'utiliser la souris, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("CentreSourisX",
                   _("Centrer la souris en x"),
                   _("Met le curseur au milieu de l'écran horizontalement."),
                   _("Centrer la souris en x"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursorHorizontally").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSourisY",
                   _("Centrer la souris en y"),
                   _("Met le curseur au milieu de l'écran verticalement."),
                   _("Centrer la souris en y"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursorVertically").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CacheSouris",
                   _("Cacher le curseur"),
                   _("Cache le curseur de la souris."),
                   _("Cacher le curseur de la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("HideCursor").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("MontreSouris",
                   _("Montrer le curseur"),
                   _("Montre le curseur de la souris."),
                   _("Montrer le curseur de la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("ShowCursor").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetSourisXY",
                   _("Positionner le curseur de la souris"),
                   _("Positionne le curseur de la souris aux coordonnées données."),
                   _("Mettre le curseur en _PARAM0_;_PARAM1_"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Position X"), "", false);
        instrInfo.AddParameter("expression", _("Position Y"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("SetMousePosition").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSouris",
                   _("Centrer la souris"),
                   _("Centre la souris."),
                   _("Centrer la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCursor").SetIncludeFile("GDL/MouseTools.h");


    DECLARE_END_ACTION()

    DECLARE_CONDITION("SourisX",
                   _("Position X de la souris"),
                   _("Teste si la valeur de la position x de la souris correspond au test effectué."),
                   _("La position X de la souris est _PARAM1_ à _PARAM0_"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Position X"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Numéro de la caméra ( Caméra 0 si vide )"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetManipulatedType("number").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisY",
                   _("Position Y de la souris"),
                   _("Teste si la valeur de la position y de la souris correspond au test effectué."),
                   _("La position Y de la souris est _PARAM1_ à _PARAM0_"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Position Y"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Numéro de la caméra ( Caméra 0 si vide )"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetManipulatedType("number").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisBouton",
                   _("Bouton de la souris"),
                   _("Teste si le bouton choisi de la souris est appuyé."),
                   _("Le bouton _PARAM0_ de la souris est appuyé"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("mouse", _("Bouton à tester"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("MouseButtonPressed").SetIncludeFile("GDL/MouseTools.h");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("MouseX", _("Position X de la souris"), _("Position X de la souris"), _("Souris"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Caméra"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("SourisX", _("Position X de la souris"), _("Position X de la souris"), _("Souris"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Caméra"), "", true).SetDefaultValue("0");

        instrInfo.SetHidden();
        instrInfo.cppCallingInformation.SetFunctionName("GetCursorXPosition").SetIncludeFile("GDL/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseY", _("Position Y de la souris"), _("Position Y de la souris"), _("Souris"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Caméra"), "", true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("SourisY", _("Position Y de la souris"), _("Position Y de la souris"), _("Souris"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "", true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("camera", _("Caméra"), "", true).SetDefaultValue("0");

        instrInfo.SetHidden();
        instrInfo.cppCallingInformation.SetFunctionName("GetCursorYPosition").SetIncludeFile("GDL/MouseTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseWheelDelta", _("Roulette : Déplacement"), _("Déplacement de la roulette de la souris"), _("Souris"), "res/actions/mouse.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("GetMouseWheelDelta").SetIncludeFile("GDL/MouseTools.h");
    DECLARE_END_EXPRESSION()

}
