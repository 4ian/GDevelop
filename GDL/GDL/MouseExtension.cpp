/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/MouseExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cSouris.h"
#include "GDL/aSouris.h"
#include "GDL/eFreeFunctions.h"

MouseExtension::MouseExtension()
{
    DECLARE_THE_EXTENSION("BuiltinMouse",
                          _T("Fonctionnalité d'utilisation de la souris"),
                          _T("Extension permettant d'utiliser la souris, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_ACTION("CentreSourisX",
                   _T("Centrer la souris en x"),
                   _T("Met le curseur au milieu de l'écran horizontalement."),
                   _T("Centrer la souris en x"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCentreSourisX);

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSourisY",
                   _T("Centrer la souris en y"),
                   _T("Met le curseur au milieu de l'écran verticalement."),
                   _T("Centrer la souris en y"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCentreSourisY);

    DECLARE_END_ACTION()

    DECLARE_ACTION("CacheSouris",
                   _T("Cacher le curseur"),
                   _T("Cache le curseur de la souris."),
                   _T("Cacher le curseur de la souris"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCacheSouris);

    DECLARE_END_ACTION()

    DECLARE_ACTION("MontreSouris",
                   _T("Montrer le curseur"),
                   _T("Montre le curseur de la souris."),
                   _T("Montrer le curseur de la souris"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActMontreSouris);

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetSourisXY",
                   _T("Positionner le curseur de la souris"),
                   _T("Positionne le curseur de la souris aux coordonnées données."),
                   _T("Mettre le curseur en _PARAM0_;_PARAM1_"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActSetSourisXY);

        DECLARE_PARAMETER("expression", _T("Position X"), false, "");
        DECLARE_PARAMETER("expression", _T("Position Y"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSouris",
                   _T("Centrer la souris"),
                   _T("Centre la souris."),
                   _T("Centrer la souris"),
                   _T("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCentreSouris);

    DECLARE_END_ACTION()

    DECLARE_CONDITION("SourisX",
                   _T("Position X de la souris"),
                   _T("Teste si la valeur de la position x de la souris correspond au test effectué."),
                   _T("La position X de la souris est _PARAM1_ à _PARAM0_"),
                   _T("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisX);

        DECLARE_PARAMETER("expression", _T("Position X"), false, "");
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "");
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisY",
                   _T("Position Y de la souris"),
                   _T("Teste si la valeur de la position y de la souris correspond au test effectué."),
                   _T("La position Y de la souris est _PARAM1_ à _PARAM0_"),
                   _T("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisY);

        DECLARE_PARAMETER("expression", _T("Position Y"), false, "");
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "");
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisBouton",
                   _T("Bouton de la souris"),
                   _T("Teste si le bouton choisi de la souris est appuyé."),
                   _T("Le bouton _PARAM0_ de la souris est appuyé"),
                   _T("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisBouton);

        DECLARE_PARAMETER("mouse", _T("Bouton à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("MouseX", _T("Position X de la souris"), _T("Position X de la souris"), _T("Souris"), "res/actions/mouse.png", &ExpMouseX)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _T("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("SourisX", _T("Position X de la souris"), _T("Position X de la souris"), _T("Souris"), "res/actions/mouse.png", &ExpMouseX)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _T("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseY", _T("Position Y de la souris"), _T("Position Y de la souris"), _T("Souris"), "res/actions/mouse.png", &ExpMouseY)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _T("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("SourisY", _T("Position Y de la souris"), _T("Position Y de la souris"), _T("Souris"), "res/actions/mouse.png", &ExpMouseY)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _T("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("MouseWheelDelta", _T("Roulette : Déplacement"), _T("Déplacement de la roulette de la souris"), _T("Souris"), "res/actions/mouse.png", &ExpMouseWheelDelta)
    DECLARE_END_EXPRESSION()

    //I myself wonder why I put this here.
    DECLARE_EXPRESSION("Random", _T("Valeur aléatoire"), _T("Valeur aléatoire"), _T("Aléatoire"), "res/actions/position.png", &ExpRandom)
        DECLARE_PARAMETER("expression", _T("Valeur maximale"), false, "")
    DECLARE_END_EXPRESSION()
}
