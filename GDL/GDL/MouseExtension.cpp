#include "GDL/MouseExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cSouris.h"
#include "GDL/aSouris.h"
#include "GDL/eFreeFunctions.h"

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
                   "res/actions/mouse.png",
                   &ActCentreSourisX);

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSourisY",
                   _("Centrer la souris en y"),
                   _("Met le curseur au milieu de l'écran verticalement."),
                   _("Centrer la souris en y"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCentreSourisY);

    DECLARE_END_ACTION()

    DECLARE_ACTION("CacheSouris",
                   _("Cacher le curseur"),
                   _("Cache le curseur de la souris."),
                   _("Cacher le curseur de la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCacheSouris);

    DECLARE_END_ACTION()

    DECLARE_ACTION("MontreSouris",
                   _("Montrer le curseur"),
                   _("Montre le curseur de la souris."),
                   _("Montrer le curseur de la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActMontreSouris);

    DECLARE_END_ACTION()

    DECLARE_ACTION("SetSourisXY",
                   _("Positionner le curseur de la souris"),
                   _("Positionne le curseur de la souris aux coordonnées données."),
                   _("Mettre le curseur en _PARAM0_;_PARAM1_"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActSetSourisXY);

        DECLARE_PARAMETER("expression", _("Position X"), false, "");
        DECLARE_PARAMETER("expression", _("Position Y"), false, "");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreSouris",
                   _("Centrer la souris"),
                   _("Centre la souris."),
                   _("Centrer la souris"),
                   _("Souris"),
                   "res/actions/mouse24.png",
                   "res/actions/mouse.png",
                   &ActCentreSouris);

    DECLARE_END_ACTION()

    DECLARE_CONDITION("SourisX",
                   _("Position X de la souris"),
                   _("Teste si la valeur de la position x de la souris correspond au test effectué."),
                   _("La position X de la souris est _PARAM1_ à _PARAM0_"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisX);

        DECLARE_PARAMETER("expression", _("Position X"), false, "");
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "");
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisY",
                   _("Position Y de la souris"),
                   _("Teste si la valeur de la position y de la souris correspond au test effectué."),
                   _("La position Y de la souris est _PARAM1_ à _PARAM0_"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisY);

        DECLARE_PARAMETER("expression", _("Position Y"), false, "");
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "");
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("SourisBouton",
                   _("Bouton de la souris"),
                   _("Teste si le bouton choisi de la souris est appuyé."),
                   _("Le bouton _PARAM0_ de la souris est appuyé"),
                   _("Souris"),
                   "res/conditions/mouse24.png",
                   "res/conditions/mouse.png",
                   &CondSourisBouton);

        DECLARE_PARAMETER("mouse", _("Bouton à tester"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("mouseX", _("Position X de la souris"), _("Position X de la souris"), _("Souris"), "res/actions/mouse.png", &ExpMouseX)
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("SourisX", _("Position X de la souris"), _("Position X de la souris"), _("Souris"), "res/actions/mouse.png", &ExpMouseX)
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("mouseY", _("Position Y de la souris"), _("Position Y de la souris"), _("Souris"), "res/actions/mouse.png", &ExpMouseY)
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("SourisY", _("Position Y de la souris"), _("Position Y de la souris"), _("Souris"), "res/actions/mouse.png", &ExpMouseY)
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("camera", _("Caméra"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("random", _("Valeur aléatoire"), _("Valeur aléatoire"), _("Aléatoire"), "res/actions/position.png", &ExpRandom)

        DECLARE_PARAMETER("expression", _("Valeur maximale"), false, "")
    DECLARE_END_EXPRESSION()
}
