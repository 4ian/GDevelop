/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/CameraExtension.h"
#include "GDL/ExtensionBase.h"

CameraExtension::CameraExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCamera",
                          _("Fonctionnalités sur les caméras"),
                          _("Extension caméra integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_CONDITION("CameraX",
                   _("Position X de la caméra"),
                   _("Teste si la valeur de la position x de la caméra\ncorrespond au test effectué."),
                   _("La position X de la caméra _PARAM4_ est _PARAM2_ à _PARAM1_ ( Calque : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraY",
                   _("Position Y de la caméra"),
                   _("Teste si la valeur de la position Y de la caméra\ncorrespond au test effectué."),
                   _("La position Y de la caméra _PARAM4_ est _PARAM2_ à _PARAM1_ ( Calque : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("CameraX",
                   _("Position X de la caméra"),
                   _("Modifie la position X de la caméra indiquée."),
                   _("Faire _PARAM2__PARAM1_ à la position X de la caméra _PARAM4_ ( Calque : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraX").SetManipulatedType("number").SetAssociatedGetter("GetCameraX").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraY",
                   _("Position Y de la caméra"),
                   _("Modifie la position Y de la caméra indiquée."),
                   _("Faire _PARAM2__PARAM1_ à la position Y de la caméra _PARAM4_ ( Calque : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraY").SetManipulatedType("number").SetAssociatedGetter("GetCameraY").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("CameraWidth",
                   _("Largeur d'une caméra"),
                   _("Teste la largeur d'une caméra d'un calque."),
                   _("La largeur de la caméra _PARAM2_ du calque _PARAM1_ est _PARAM3_ à _PARAM4_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraWidth").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraHeight",
                   _("Hauteur d'une caméra"),
                   _("Teste la hauteur d'une caméra d'un calque."),
                   _("La hauteur de la caméra _PARAM2_ du calque _PARAM1_ est _PARAM3_ à _PARAM4_"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraHeight").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CameraAngle",
                   _("Angle de la caméra d'un calque"),
                   _("Teste l'angle d'une caméra."),
                   _("L'angle de la caméra est _PARAM2_ à _PARAM1_° ( Calque : _PARAM3_, caméra : _PARAM4_  )"),
                   _("Calques et caméras"),
                   "res/conditions/camera24.png",
                   "res/conditions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur à tester"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("RotateCamera",
                   _("Modifier l'angle de la caméra"),
                   _("Cette action modifie l'angle de la caméra du calque indiqué."),
                   _("Faire _PARAM2__PARAM1_ à l'angle de la caméra ( calque : _PARAM3_, caméra : _PARAM4_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur"), "",false);
        instrInfo.AddParameter("operator", _("Signe de la modification"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraAngle").SetAssociatedGetter("GetCameraAngle").SetManipulatedType("number").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddCamera",
                   _("Ajouter une caméra à un calque"),
                   _("Cette action ajoute une caméra à un calque."),
                   _("Ajouter une caméra au calque _PARAM1_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Largeur"), "",true);
        instrInfo.AddParameter("expression", _("Hauteur"), "",true);
        instrInfo.AddParameter("expression", _("Position X du point haut gauche de la zone de rendu ( entre 0 et 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Position Y du point haut gauche de la zone de rendu ( entre 0 et 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Position X du point bas droit de la zone de rendu ( entre 0 et 1 )"), "",true);
        instrInfo.AddParameter("expression", _("Position Y du point bas droit de la zone de rendu ( entre 0 et 1 )"), "",true);

        instrInfo.cppCallingInformation.SetFunctionName("AddCamera").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("DeleteCamera",
                   _("Supprimer une caméra d'un calque"),
                   _("Supprime la caméra indiquée d'un calque."),
                   _("Supprimer la caméra _PARAM2_ du calque _PARAM1_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("DeleteCamera").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraSize",
                   _("Modifier la taille d'une caméra"),
                   _("Cette action modifie la taille d'une caméra. Remet le zoom à sa valeur initiale."),
                   _("Changer la taille de la caméra _PARAM2_ du calque _PARAM1_ en _PARAM3_*_PARAM4_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra"), "",false);
        instrInfo.AddParameter("expression", _("Largeur"), "",false);
        instrInfo.AddParameter("expression", _("Hauteur"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraSize").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");
    DECLARE_END_ACTION()

    DECLARE_ACTION("CameraViewport",
                   _("Modifier la zone de rendu d'une caméra"),
                   _("Cette action modifie la zone de rendu d'une caméra, exprimée en facteur de la fenêtre."),
                   _("Mettre la zone de rendu de la caméra _PARAM2_ du calque _PARAM1_ à _PARAM3_;_PARAM4_ _PARAM5_;_PARAM6_"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra"), "",false);
        instrInfo.AddParameter("expression", _("Position X du point haut gauche de la zone ( entre 0 et 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Position Y du point haut gauche de la zone ( entre 0 et 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Position X du point bas droit de la zone ( entre 0 et 1 )"), "",false);
        instrInfo.AddParameter("expression", _("Position Y du point bas droit de la zone ( entre 0 et 1 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraViewport").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ZoomCamera",
                   _("Changer le niveau de zoom de la caméra"),
                   _("Modifie le niveau de zoom de la caméra."),
                   _("Mettre le niveau de zoom de la caméra à _PARAM1_ ( calque : _PARAM2_, caméra : _PARAM3_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("expression", _("Valeur ( 1: Zoom initial, 2: Zoom avant x2, 0.5:Zoom arrière x2... )"), "",false);
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("SetCameraZoom").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("FixCamera",
                   _("Centrer la caméra sur un objet ( Limites )"),
                   _("Centre la caméra sur l'objet, dans les limites définies.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM1_ ( limites : de _PARAM3_;_PARAM4_ à _PARAM5_;_PARAM6_ ) ( calque : _PARAM8_, caméra : _PARAM9_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("object", _("Objet"), "", false);
        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");
        instrInfo.AddParameter("expression", _("Coté haut gauche de la limite : Position X"), "",false);
        instrInfo.AddParameter("expression", _("Coté haut gauche de la limite : Position Y"), "",false);
        instrInfo.AddParameter("expression", _("Coté bas droit de la limite : Position X"), "",false);
        instrInfo.AddParameter("expression", _("Coté bas droit de la limite : Position Y"), "",false);
        instrInfo.AddParameter("yesorno", _("Anticiper le déplacement de l'objet ( oui par défaut )"), "",true).SetDefaultValue("true");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("CenterCameraOnObjectWithLimits").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CentreCamera",
                   _("Centrer la caméra sur un objet"),
                   _("Centre la caméra sur l'objet indiqué.\nIl est préférable d'appeler cette action vers la fin des évènements, quand toutes les actions\nde positionnement et de déplacement de l'objet ont été effectuées."),
                   _("Centrer la caméra sur _PARAM1_ ( calque : _PARAM4_, caméra : _PARAM5_ )"),
                   _("Calques et caméras"),
                   "res/actions/camera24.png",
                   "res/actions/camera.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("object", _("Objet"), "", false);
        instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");
        instrInfo.AddParameter("yesorno", _("Anticiper le déplacement de l'objet ( oui par défaut )"), "",true).SetDefaultValue("true");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");


        instrInfo.cppCallingInformation.SetFunctionName("CenterCameraOnObject").SetIncludeFile("GDL/RuntimeSceneCameraTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("ShowLayer",
                   _("Afficher un calque"),
                   _("Rend visible un calque."),
                   _("Afficher le calque _PARAM1_"),
                   _("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("ShowLayer").SetIncludeFile("GDL/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("HideLayer",
                   _("Cacher un calque"),
                   _("Rend invisible un calque."),
                   _("Cacher le calque _PARAM1_"),
                   _("Calques et caméras"),
                   "res/actions/layer24.png",
                   "res/actions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("HideLayer").SetIncludeFile("GDL/RuntimeSceneTools.h");;

    DECLARE_END_ACTION()

    DECLARE_CONDITION("LayerVisible",
                   _("Visibilité d'un calque"),
                   _("Teste si un calque est affiché."),
                   _("Le calque _PARAM1_ est visible"),
                   _("Calques et caméras"),
                   "res/conditions/layer24.png",
                   "res/conditions/layer.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque ( Calque de base si vide )"), "",false).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("LayerVisible").SetIncludeFile("GDL/RuntimeSceneTools.h");;

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("CameraWidth", _("Largeur de la caméra d'un calque"), _("Largeur de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraWidth");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraHeight", _("Hauteur de la caméra d'un calque"), _("Hauteur de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraHeight");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportLeft", _("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _("Position X du coté haut-gauche de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportLeft");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportTop", _("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _("Position Y du coté haut-gauche de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportTop");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportRight", _("Position X du coté bas-droit de la zone de rendu d'une caméra"), _("Position X du coté bas-droit de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportRight");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraViewportBottom", _("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _("Position Y du coté bas-droit de la zone de rendu d'une caméra"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",false);
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",false).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraViewportBottom");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueX", _("Position X de la caméra d'un calque"), _("Position X de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraX");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueY", _("Position Y de la caméra d'un calque"), _("Position Y de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraY");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("CameraRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraRotation");
    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("VueRotation", _("Angle de la caméra d'un calque"), _("Angle de la caméra d'un calque"), _("Caméra"), "res/actions/camera.png")
        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("layer", _("Calque"), "",true).SetDefaultValue("\"\"");
        instrInfo.AddParameter("expression", _("Numéro de la caméra ( 0 par défaut )"), "",true).SetDefaultValue("0");

        instrInfo.cppCallingInformation.SetFunctionName("GetCameraRotation");
        instrInfo.SetHidden();
    DECLARE_END_EXPRESSION()
    #endif
}
