#include "GDL/JoystickExtension.h"
#include "GDL/cJoystick.h"
#include "GDL/aJoystick.h"
#include "GDL/eFreeFunctions.h"

JoystickExtension::JoystickExtension()
{
    DECLARE_THE_EXTENSION("BuiltinJoystick",
                          _T("Fonctionnalités pour les joysticks"),
                          _T("Extension permettant d'utiliser des joysticks, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("JoystickButtonDown",
                   _T("Un bouton d'un joystick est appuyé"),
                   _T("Teste si un bouton d'un joystick est appuyé."),
                   _T("Le bouton _PARAM1_ du joystick _PARAM0_ est appuyé"),
                   _T("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png",
                   &CondJoystickButtonDown);

        DECLARE_PARAMETER("expression", _T("Numéro du joystick ( Premier joystick : 0 )"), false, "");
        DECLARE_PARAMETER("expression", _T("Numéro du bouton"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("JoystickAxis",
                   _T("Valeur d'un axe d'un joystick"),
                   _T("Teste si la valeur de l'axe d'un joystick correspond."),
                   _T("La valeur de l'axe _PARAM1_ du joystick _PARAM0_ est _PARAM3_ à _PARAM2_"),
                   _T("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png",
                   &CondJoystickAxis);

        DECLARE_PARAMETER("expression", _T("Numéro du joystick ( Premier joystick : 0 )"), false, "");
        DECLARE_PARAMETER("joyaxis", _T("Axe"), false, "");
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "");
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("GetJoystickAxis",
                   _T("Obtenir la valeur de l'axe d'un joystick"),
                   _T("Enregistre dans la variable de la scène indiquée la valeur de l'axe du joystick ( de -100 à 100 )."),
                   _T("Enregistrer dans _PARAM2_ la valeur de l'axe _PARAM1_ du joystick _PARAM0_"),
                   _T("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png",
                   &ActGetJoystickAxis);

        DECLARE_PARAMETER("expression", _T("Numéro du joystick ( Premier joystick : 0 )"), false, "");
        DECLARE_PARAMETER("joyaxis", _T("Axe"), false, "");
        DECLARE_PARAMETER("scenevar", _T("Variable de la scène où enregistrer la valeur"), false, "");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("GetJoystickAxis",
                   _T("Axe d'un joystick"),
                   _T("Valeur de l'axe d'un joystick"),
                   _T("Joystick"),
                   "res/conditions/joystick.png",
                   &ExpGetJoystickAxis)

        DECLARE_PARAMETER("expression", _T("Numéro du jostick ( Premier joystick : 0 )"), false, "")
        DECLARE_PARAMETER("text", _T("Texte à chercher"), false, "")

    DECLARE_END_EXPRESSION()
}
