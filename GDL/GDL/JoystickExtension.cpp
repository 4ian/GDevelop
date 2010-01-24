#include "GDL/JoystickExtension.h"
#include "GDL/cJoystick.h"
#include "GDL/aJoystick.h"

JoystickExtension::JoystickExtension()
{
    DECLARE_THE_EXTENSION("BuiltinJoystick",
                          _("Fonctionnalités pour les joysticks"),
                          _("Extension permettant d'utiliser des joysticks, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("JoystickButtonDown",
                   _("Un bouton d'un joystick est appuyé"),
                   _("Teste si un bouton d'un joystick est appuyé."),
                   _("Le bouton _PARAM1_ du joystick _PARAM0_ est appuyé"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png",
                   &CondJoystickButtonDown);

        DECLARE_PARAMETER("expression", _("Numéro du joystick"), false, "");
        DECLARE_PARAMETER("expression", _("Numéro du bouton"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("JoystickAxis",
                   _("Valeur d'un axe d'un joystick"),
                   _("Teste si la valeur de l'axe d'un joystick correspond."),
                   _("La valeur de l'axe _PARAM1_ du joystick _PARAM0_ est _PARAM3_ à _PARAM2_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png",
                   &CondJoystickAxis);

        DECLARE_PARAMETER("expression", _("Numéro du joystick"), false, "");
        DECLARE_PARAMETER("joyaxis", _("Axe"), false, "");
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "");
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("GetJoystickAxis",
                   _("Obtenir la valeur de l'axe d'un joystick"),
                   _("Enregistre dans la variable de la scène indiquée la valeur de l'axe du joystick ( de -100 à 100 )."),
                   _("Enregistrer dans _PARAM2_ la valeur de l'axe _PARAM1_ du joystick _PARAM0_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png",
                   &ActGetJoystickAxis);

        DECLARE_PARAMETER("expression", _("Numéro du joystick"), false, "");
        DECLARE_PARAMETER("joyaxis", _("Axe"), false, "");
        DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer la valeur"), false, "");

    DECLARE_END_ACTION()
}
