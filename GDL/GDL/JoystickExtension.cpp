/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDL/JoystickExtension.h"

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
                   "res/conditions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Numéro du joystick ( Premier joystick : 0 )"), "",false);
        instrInfo.AddParameter("expression", _("Numéro du bouton"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("JoystickButtonDown").SetIncludeFile("GDL/JoystickTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("JoystickAxis",
                   _("Valeur d'un axe d'un joystick"),
                   _("Teste si la valeur de l'axe d'un joystick correspond."),
                   _("La valeur de l'axe _PARAM1_ du joystick _PARAM0_ est _PARAM3_ à _PARAM2_"),
                   _("Joystick"),
                   "res/conditions/joystick24.png",
                   "res/conditions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Numéro du joystick ( Premier joystick : 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axe"), "",false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetJoystickAxisValue").SetManipulatedType("number").SetIncludeFile("GDL/JoystickTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("GetJoystickAxis",
                   _("Obtenir la valeur de l'axe d'un joystick"),
                   _("Enregistre dans la variable de la scène indiquée la valeur de l'axe du joystick ( de -100 à 100 )."),
                   _("Enregistrer dans _PARAM2_ la valeur de l'axe _PARAM1_ du joystick _PARAM0_"),
                   _("Joystick"),
                   "res/actions/joystick24.png",
                   "res/actions/joystick.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Numéro du joystick ( Premier joystick : 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axe"), "",false);
        instrInfo.AddParameter("scenevar", _("Variable de la scène où enregistrer la valeur"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("JoystickAxisValueToVariable").SetManipulatedType("number").SetIncludeFile("GDL/JoystickTools.h");

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("GetJoystickAxis",
                   _("Axe d'un joystick"),
                   _("Valeur de l'axe d'un joystick"),
                   _("Joystick"),
                   "res/conditions/joystick.png")

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Numéro du joystick ( Premier joystick : 0 )"), "",false);
        instrInfo.AddParameter("joyaxis", _("Axe"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetJoystickAxisValue").SetIncludeFile("GDL/JoystickTools.h");

    DECLARE_END_EXPRESSION()
}
