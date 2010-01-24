#include "GDL/CameraExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cCamera.h"
#include "GDL/aCamera.h"
#include "GDL/eFreeFunctions.h"

CameraExtension::CameraExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCamera",
                          _("Fonctionnalités sur les caméras"),
                          _("Extension caméra integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("CameraX",
                   _("Position X de la caméra"),
                   _("Teste si la valeur de la position x de la caméra\ncorrespond au test effectué."),
                   _("La position X de la caméra est _PARAM1_ à _PARAM0_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraX);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraY",
                   _("Position Y de la caméra"),
                   _("Teste si la valeur de la position Y de la caméra\ncorrespond au test effectué."),
                   _("La position Y de la caméra est _PARAM1_ à _PARAM0_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraY);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraAngle",
                   _("Angle de la caméra d'un calque"),
                   _("Teste l'angle d'une caméra."),
                   _("L'angle de la caméra est _PARAM1_ à _PARAM0_° ( Calque : _PARAM2_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraAngle);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("RotateCamera",
                   _("Modifier l'angle de la caméra"),
                   _("Cette action modifie l'angle de la caméra du calque indiqué."),
                   _("Faire _PARAM1__PARAM0_ à l'angle de la caméra"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActRotateCamera);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ZoomCamera",
                   _("Changer le niveau de zoom de la caméra"),
                   _("Modifie le niveau de zoom de la caméra."),
                   _("Mettre le niveau de zoom de la caméra à _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActZoomCamera);

        DECLARE_PARAMETER("expression", _("Valeur ( 1: Zoom initial, 2: Zoom avant x2, 0.5:Zoom arrière x2... )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("FixCamera",
                   _("Centrer la caméra sur un objet"),
                   _("Centre la caméra sur l'objet, dans les limites définies.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM0_ ( limites : de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActFixCamera);

        DECLARE_PARAMETER("objet", _("Objet"), true, "")
        DECLARE_PARAMETER("expression", _("Coté haut gauche de la limite : Position X"), false, "")
        DECLARE_PARAMETER("expression", _("Coté haut gauche de la limite : Position Y"), false, "")
        DECLARE_PARAMETER("expression", _("Coté bas droit de la limite : Position X"), false, "")
        DECLARE_PARAMETER("expression", _("Coté bas droit de la limite : Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Anticiper le déplacement de l'objet ( oui par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreCamera",
                   _("Centrer la caméra sur un objet"),
                   _("Centre la caméra sur l'objet indiqué.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCentreCamera);

        DECLARE_PARAMETER("objet", _("Objet"), true, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Anticiper le déplacement de l'objet ( oui par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_EXPRESSION("cameraX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
    DECLARE_END_EXPRESSION()
}
