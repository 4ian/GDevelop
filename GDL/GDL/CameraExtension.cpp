/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

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
                          _T("Fonctionnalités sur les caméras"),
                          _T("Extension caméra integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("CameraX",
                   _T("Position X de la caméra"),
                   _T("Teste si la valeur de la position x de la caméra\ncorrespond au test effectué."),
                   _T("La position X de la caméra _PARAM3_ est _PARAM1_ à _PARAM0_ ( Calque : _PARAM2_ )"),
                   _T("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraX);

        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraY",
                   _T("Position Y de la caméra"),
                   _T("Teste si la valeur de la position Y de la caméra\ncorrespond au test effectué."),
                   _T("La position Y de la caméra _PARAM3_ est _PARAM1_ à _PARAM0_ ( Calque : _PARAM2_ )"),
                   _T("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraY);

        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraWidth",
                   _T("Largeur d'une caméra"),
                   _T("Teste la largeur d'une caméra d'un calque."),
                   _T("La largeur de la caméra _PARAM1_ du calque _PARAM0_ est _PARAM2_ à _PARAM3_"),
                   _T("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraWidth);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraHeight",
                   _T("Hauteur d'une caméra"),
                   _T("Teste la hauteur d'une caméra d'un calque."),
                   _T("La hauteur de la caméra _PARAM1_ du calque _PARAM0_ est _PARAM2_ à _PARAM3_"),
                   _T("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraHeight);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraAngle",
                   _T("Angle de la caméra d'un calque"),
                   _T("Teste l'angle d'une caméra."),
                   _T("L'angle de la caméra est _PARAM1_ à _PARAM0_° ( Calque : _PARAM2_, caméra : _PARAM3_  )"),
                   _T("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png",
                   &CondCameraAngle);

        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("RotateCamera",
                   _T("Modifier l'angle de la caméra"),
                   _T("Cette action modifie l'angle de la caméra du calque indiqué."),
                   _T("Faire _PARAM1__PARAM0_ à l'angle de la caméra ( calque : _PARAM2_, caméra : _PARAM3_ )"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActRotateCamera);

        DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddCamera",
                   _T("Ajouter une caméra à un calque"),
                   _T("Cette action ajoute une caméra à un calque."),
                   _T("Ajouter une caméra au calque _PARAM0_"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActAddCamera);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Largeur"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Hauteur"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Position X du point haut gauche de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Position Y du point haut gauche de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Position X du point bas droit de la zone de rendu ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Position Y du point bas droit de la zone de rendu ( entre 0 et 1 )"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteCamera",
                   _T("Supprimer une caméra d'un calque"),
                   _T("Supprime la caméra indiquée d'un calque."),
                   _T("Supprimer la caméra _PARAM1_ du calque _PARAM0_"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActDeleteCamera);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraSize",
                   _T("Modifier la taille d'une caméra"),
                   _T("Cette action modifie la taille d'une caméra. Remet le zoom à sa valeur initiale."),
                   _T("Changer la taille de la caméra _PARAM1_ du calque _PARAM0_ en _PARAM2_*_PARAM3_"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCameraSize);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("expression", _T("Largeur"), false, "")
        DECLARE_PARAMETER("expression", _T("Hauteur"), false, "")
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraViewport",
                   _T("Modifier la zone de rendu d'une caméra"),
                   _T("Cette action modifie la zone de rendu d'une caméra, exprimée en facteur de la fenêtre."),
                   _T("Mettre la zone de rendu de la caméra _PARAM1_ du calque _PARAM0_ à _PARAM2_;_PARAM3_ _PARAM4_;_PARAM5_"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCameraViewport);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra"), false, "")
        DECLARE_PARAMETER("expression", _T("Position X du point haut gauche de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _T("Position Y du point haut gauche de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _T("Position X du point bas droit de la zone ( entre 0 et 1 )"), false, "")
        DECLARE_PARAMETER("expression", _T("Position Y du point bas droit de la zone ( entre 0 et 1 )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("ZoomCamera",
                   _T("Changer le niveau de zoom de la caméra"),
                   _T("Modifie le niveau de zoom de la caméra."),
                   _T("Mettre le niveau de zoom de la caméra à _PARAM0_ ( calque : _PARAM1_, caméra : _PARAM2_ )"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActZoomCamera);

        DECLARE_PARAMETER("expression", _T("Valeur ( 1: Zoom initial, 2: Zoom avant x2, 0.5:Zoom arrière x2... )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("FixCamera",
                   _T("Centrer la caméra sur un objet ( Limites )"),
                   _T("Centre la caméra sur l'objet, dans les limites définies.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _T("Centrer la caméra sur _PARAM0_ ( limites : de _PARAM1_;_PARAM2_ à _PARAM3_;_PARAM4_ ) ( calque : _PARAM6_, caméra : _PARAM7_ )"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActFixCamera);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("expression", _T("Coté haut gauche de la limite : Position X"), false, "")
        DECLARE_PARAMETER("expression", _T("Coté haut gauche de la limite : Position Y"), false, "")
        DECLARE_PARAMETER("expression", _T("Coté bas droit de la limite : Position X"), false, "")
        DECLARE_PARAMETER("expression", _T("Coté bas droit de la limite : Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _T("Anticiper le déplacement de l'objet ( oui par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreCamera",
                   _T("Centrer la caméra sur un objet"),
                   _T("Centre la caméra sur l'objet indiqué.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _T("Centrer la caméra sur _PARAM0_ ( calque : _PARAM2_, caméra : _PARAM3_ )"),
                   _T("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png",
                   &ActCentreCamera);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _T("Anticiper le déplacement de l'objet ( oui par défaut )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( Calque de base si vide )"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowLayer",
                   _T("Afficher un calque"),
                   _T("Rend visible un calque."),
                   _T("Afficher le calque _PARAM0_"),
                   _T("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png",
                   &ActShowLayer);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_ACTION("HideLayer",
                   _T("Cacher un calque"),
                   _T("Rend invisible un calque."),
                   _T("Cacher le calque _PARAM0_"),
                   _T("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png",
                   &ActHideLayer);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_ACTION()

    DECLARE_CONDITION("LayerVisible",
                   _T("Visibilité d'un calque"),
                   _T("Teste si un calque est affiché."),
                   _T("Le calque _PARAM0_ est visible"),
                   _T("Calques et caméras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png",
                   &CondLayerVisible);

        DECLARE_PARAMETER("layer", _T("Calque ( Calque de base si vide )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("CameraWidth", _T("Largeur de la caméra d'un calque"), _T("Largeur de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraWidth)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraHeight", _T("Hauteur de la caméra d'un calque"), _T("Hauteur de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraHeight)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportLeft", _T("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _T("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _T("Caméra"), "res/actions/camera.png", &ExpCameraViewportLeft)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportTop", _T("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _T("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _T("Caméra"), "res/actions/camera.png", &ExpCameraViewportTop)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportRight", _T("Position X du coté bas-droit de la zone de rendu d'une caméra"), _T("Position X du coté bas-droit de la zone de rendu d'une caméra"), _T("Caméra"), "res/actions/camera.png", &ExpCameraViewportRight)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportBottom", _T("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _T("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _T("Caméra"), "res/actions/camera.png", &ExpCameraViewportBottom)
        DECLARE_PARAMETER("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraX", _T("Position X de la caméra d'un calque"), _T("Position X de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueX", _T("Position X de la caméra d'un calque"), _T("Position X de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraX)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraY", _T("Position Y de la caméra d'un calque"), _T("Position Y de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueY", _T("Position Y de la caméra d'un calque"), _T("Position Y de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraY)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraRotation", _T("Angle de la caméra d'un calque"), _T("Angle de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()

    DECLARE_HIDDEN_EXPRESSION("VueRotation", _T("Angle de la caméra d'un calque"), _T("Angle de la caméra d'un calque"), _T("Caméra"), "res/actions/camera.png", &ExpCameraRotation)
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque"), false, "")
        DECLARE_PARAMETER_OPTIONAL("expression", _T("Numéro de la caméra ( 0 par défaut )"), false, "")
    DECLARE_END_EXPRESSION()
}
