#include "GDL/CameraExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cCamera.h"
#include "GDL/aCamera.h"
#include "GDL/cLayer.h"
#include "GDL/aLayer.h"
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
                   _("La position X de la caméra _PARAM3_ est _PARAM1_ à _PARAM0_ ( Calque : _PARAM2_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraX);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraY",
                   _("Position Y de la caméra"),
                   _("Teste si la valeur de la position Y de la caméra\ncorrespond au test effectué."),
                   _("La position Y de la caméra _PARAM3_ est _PARAM1_ à _PARAM0_ ( Calque : _PARAM2_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraY);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraWidth",
                   _("Largeur d'une caméra"),
                   _("Teste la largeur d'une caméra d'un calque."),
                   _("La largeur de la caméra _PARAM1_ du calque _PARAM0_ est _PARAM2_ à _PARAM3_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraWidth);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraHeight",
                   _("Hauteur d'une caméra"),
                   _("Teste la hauteur d'une caméra d'un calque."),
                   _("La hauteur de la caméra _PARAM1_ du calque _PARAM0_ est _PARAM2_ à _PARAM3_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraHeight);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraAngle",
                   _("Angle de la caméra d'un calque"),
                   _("Teste l'angle d'une caméra."),
                   _("L'angle de la caméra est _PARAM1_ à _PARAM0_° ( Calque : _PARAM2_, caméra : _PARAM3_  )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraAngle);

        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("RotateCamera",
                   _("Modifier l'angle de la caméra"),
                   _("Cette action modifie l'angle de la caméra du calque indiqué."),
                   _("Faire _PARAM1__PARAM0_ à l'angle de la caméra ( calque : _PARAM2_, caméra : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActRotateCamera);

        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddCamera",
                   _("Ajouter une caméra à un calque"),
                   _("Cette action ajoute une caméra à un calque."),
                   _("Ajouter une caméra au calque _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActAddCamera);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Largeur"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Hauteur"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Position X du point haut gauche de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Position Y du point haut gauche de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Position X du point bas droit de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Position Y du point bas droit de la zone de rendu ( entre 0 et 1 )"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteCamera",
                   _("Supprimer une caméra d'un calque"),
                   _("Supprime la caméra indiquée d'un calque."),
                   _("Supprimer la caméra _PARAM1_ du calque _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActDeleteCamera);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraSize",
                   _("Modifier la taille d'une caméra"),
                   _("Cette action modifie la taille d'une caméra. Remet le zoom à sa valeur initiale."),
                   _("Changer la taille de la caméra _PARAM1_ du calque _PARAM0_ en _PARAM2_*_PARAM3_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCameraSize);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("expression", _("Largeur"), false, "")
        DECLARE_PARAMETER("expression", _("Hauteur"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraViewport",
                   _("Modifier la zone de rendu d'une caméra"),
                   _("Cette action modifie la zone de rendu d'une caméra, exprimée en facteur de la fenêtre."),
                   _("Mettre la zone de rendu de la caméra _PARAM1_ du calque _PARAM0_ à _PARAM2_;_PARAM3_ _PARAM4_;_PARAM5_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCameraViewport);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("expression", _("Position X du point haut gauche de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _("Position Y du point haut gauche de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _("Position X du point bas droit de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _("Position Y du point bas droit de la zone ( entre 0 et 1 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ZoomCamera",
                   _("Changer le niveau de zoom de la caméra"),
                   _("Modifie le niveau de zoom de la caméra."),
                   _("Mettre le niveau de zoom de la caméra à _PARAM0_ ( calque : _PARAM1_, caméra : _PARAM2_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActZoomCamera);

        DECLARE_PARAMETER("expression", _("Valeur ( 1: Zoom initial, 2: Zoom avant x2, 0.5:Zoom arrière x2... )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("FixCamera",
                   _("Centrer la caméra sur un objet ( Limites )"),
                   _("Centre la caméra sur l'objet, dans les limites définies.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM0_ ( limites : de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ ) ( calque : _PARAM6_, caméra : _PARAM7_ )"),
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
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreCamera",
                   _("Centrer la caméra sur un objet"),
                   _("Centre la caméra sur l'objet indiqué.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM0_ ( calque : _PARAM2_, caméra : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCentreCamera);

        DECLARE_PARAMETER("objet", _("Objet"), true, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Anticiper le déplacement de l'objet ( oui par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowLayer",
                   _("Afficher un calque"),
                   _("Rend visible un calque."),
                   _("Afficher le calque _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png",
                   &ActShowLayer);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("HideLayer",
                   _("Cacher un calque"),
                   _("Rend invisible un calque."),
                   _("Cacher le calque _PARAM0_"),
                   _("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png",
                   &ActHideLayer);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_CONDITION("LayerVisible",
                   _("Visibilité d'un calque"),
                   _("Teste si un calque est affiché."),
                   _("Le calque _PARAM0_ est visible"),
                   _("Calques et caméras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png",
                   &CondLayerVisible);

        DECLARE_PARAMETER("layer", _("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("cameraWidth", _("Largeur de la caméra d'un calque"), _("Largeur de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraWidth)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraHeight", _("Hauteur de la caméra d'un calque"), _("Hauteur de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraHeight)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraViewportLeft", _("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png", &ExpCameraViewportLeft)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraViewportTop", _("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png", &ExpCameraViewportTop)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraViewportRight", _("Position X du coté bas-droit de la zone de rendu d'une caméra"), _("Position X du coté bas-droit de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png", &ExpCameraViewportRight)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraViewportBottom", _("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png", &ExpCameraViewportBottom)
        DECLARE_PARAMETER("text", _("Calque"), false, "")
        DECLARE_PARAMETER("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("cameraRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER_OPTIONAL("text", _("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()
}
