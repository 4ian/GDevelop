
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Chercher.h"
#include "GDL/Object.h"
#include <iostream>
#include <string>
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include <iostream>

#if defined(GD_IDE_ONLY)
#include <wx/textdlg.h>
#include <wx/bitmap.h>
#include <wx/wx.h>
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#endif

ExtensionSprite::ExtensionSprite()
{
    DECLARE_THE_EXTENSION("Sprite",
                          _T("Sprite ( image animée )"),
                          _T("Extension permettant d'ajouter des objets animées à la scène, qui peuvent contenir des animations avec des directions à l'intérieur de chacune."),
                          "Compil Games",
                          "Freeware")

    //Declaration of all objects available
    DECLARE_OBJECT("Sprite",
                   _T("Sprite ( image animée )"),
                   _T("Objet animé, composé d'animations et directions contenant des images."),
                   "Extensions/spriteicon.png",
                   &CreateSpriteObject,
                   &DestroySpriteObject);

        DECLARE_OBJECT_ACTION("Opacity",
                       _T("Régler l'opacité d'un objet"),
                       _T("Modifie la transparence d'un objet."),
                       _T("Faire _PARAM2__PARAM1_ à l'opacité de _PARAM0_"),
                       _T("Visibilité"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png",
                       &SpriteObject::ActOpacity);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeAnimation",
                       _T("Changer le numéro de l'animation d'un objet"),
                       _T("Modifie le numéro de l'animation de l'objet."),
                       _T("Faire _PARAM2__PARAM1_ au numéro de l'animation de _PARAM0_"),
                       _T("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActChangeAnimation);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeDirection",
                       _T("Changer le numéro de la direction d'un objet"),
                       _T("Modifie la direction de l'objet"),
                       _T("Faire _PARAM2__PARAM1_ à la direction de _PARAM0_"),
                       _T("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png",
                       &SpriteObject::ActChangeDirection);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeSprite",
                       _T("Changer le numéro de l'image d'un objet"),
                       _T("Modifie le numéro de l'image actuelle de l'objet"),
                       _T("Faire _PARAM2__PARAM1_ au numéro de l'image de _PARAM0_"),
                       _T("Animations et images"),
                       "res/actions/sprite24.png",
                       "res/actions/sprite.png",
                       &SpriteObject::ActChangeSprite);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PauseAnimation",
                       _T("Mettre en pause l'animation de l'objet"),
                       _T("Met en pause l'animation actuelle de l'objet"),
                       _T("Mettre en pause l'animation actuelle de _PARAM0_"),
                       _T("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActPauseAnimation);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PlayAnimation",
                       _T("Jouer l'animation de l'objet"),
                       _T("Joue l'animation actuelle de l'objet"),
                       _T("Jouer l'animation actuelle de _PARAM0_"),
                       _T("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActPlayAnimation);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("TourneVersPos",
                       _T("Tourner un objet vers une position"),
                       _T("Tourne un objet vers une position.\n( Si la direction est normale, l'objet prendra la direction la plus appropriée.\nSi c'est une rotation automatique, il sera tourné vers l'objet. )"),
                       _T("Tourner _PARAM0_ vers _PARAM1_;_PARAM2_"),
                       _T("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png",
                       &SpriteObject::ActTourneVersPos);

            DECLARE_PARAMETER("object", _T("Objet à tourner"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Position X"), false, "")
            DECLARE_PARAMETER("expression", _T("Position Y"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScale",
                       _T("Modifier l'échelle d'un objet"),
                       _T("Modifie l'échelle de la taille de l'objet indiqué."),
                       _T("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_"),
                       _T("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScale);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleWidth",
                       _T("Modifier l'échelle en largeur d'un objet"),
                       _T("Modifie l'échelle de la taille de l'objet indiqué en largeur."),
                       _T("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_ en largeur"),
                       _T("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScaleWidth);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleHeight",
                       _T("Modifier l'échelle en hauteur d'un objet"),
                       _T("Modifie l'échelle de la taille de l'objet indiqué en hauteur."),
                       _T("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_ en hauteur"),
                       _T("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScaleHeight);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Animation",
                       _T("Numéro de l'animation d'un objet"),
                       _T("Teste si le numéro de l'animation de l'objet correspond."),
                       _T("Le numéro de l'animation de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Animations et images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png",
                       &SpriteObject::CondAnim);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Numéro de l'animation à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Direction",
                       _T("Numéro de la direction de l'objet"),
                       _T("Teste si le numéro de la direction de l'objet correspond au test effectué."),
                       _T("La direction de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Direction"),
                       "res/conditions/direction24.png",
                       "res/conditions/direction.png",
                       &SpriteObject::CondDirection);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Numéro de la direction à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Sprite",
                       _T("Numéro de l'image de l'objet"),
                       _T("Teste si le numéro de l'image de l'objet correspond."),
                       _T("L'image de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Animations et images"),
                       "res/conditions/sprite24.png",
                       "res/conditions/sprite.png",
                       &SpriteObject::CondSprite);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Numéro de l'image à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AnimStopped",
                       _T("L'animation est en pause"),
                       _T("Teste si l'animation de l'objet est en pause."),
                       _T("L'animation de _PARAM0_ est en pause"),
                       _T("Animations et images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png",
                       &SpriteObject::CondAnimStopped);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleWidth",
                       _T("Echelle de la taille d'un objet en largeur"),
                       _T("Teste l'échelle de la taille de l'objet en largeur."),
                       _T("L'échelle de la taille de l'objet _PARAM0_ en largeur est _PARAM2_ à _PARAM1_"),
                       _T("Taille"),
                       "res/conditions/scaleWidth24.png",
                       "res/conditions/scaleWidth.png",
                       &SpriteObject::CondScaleWidth);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleHeight",
                       _T("Echelle de la taille d'un objet en hauteur"),
                       _T("Teste l'échelle de la taille de l'objet en hauteur."),
                       _T("L'échelle de la taille de l'objet _PARAM0_ en hauteur est _PARAM2_ à _PARAM1_"),
                       _T("Taille"),
                       "res/conditions/scaleHeight24.png",
                       "res/conditions/scaleHeight.png",
                       &SpriteObject::CondScaleHeight);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Opacity",
                       _T("Opacité d'un objet"),
                       _T("Teste la valeur de l'opacité ( transparence ) d'un objet."),
                       _T("L'opacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Visibilité"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png",
                       &SpriteObject::CondOpacityObjet);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("BlendMode",
                       _T("Mode d'affichage"),
                       _T("Teste le numéro du mode d'affichage actuellement employé par un objet"),
                       _T("Le numéro du mode d'affichage de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _T("Effets"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png",
                       &SpriteObject::CondBlendMode);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Valeur à tester ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), false, "")
            DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("CopyImageOnImageOfSprite",
                       _T("Copier une image sur celle d'un objet"),
                       _T("Copie une image sur celle d'un objet.\nNotez qu'il est préférable que l'image source reste chargée en mémoire."),
                       _T("Copier l'image _PARAM1_ sur celle de _PARAM0_ à l'emplacement _PARAM2_;_PARAM3_"),
                       _T("Effets"),
                       "res/actions/copy24.png",
                       "res/actions/copy.png",
                       &SpriteObject::ActCopyImageOnImageOfSprite);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("text", _T("Nom de l'image source"), false, "")
            DECLARE_PARAMETER("expression", _T("Position X"), false, "")
            DECLARE_PARAMETER("expression", _T("Position Y"), false, "")
            DECLARE_PARAMETER("yesorno", _T("Utiliser la transparence de la source ( non si vide )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("CreateMaskFromColorOnActualImage",
                       _T("Rendre une couleur de l'image d'un objet transparente"),
                       _T("Rend une couleur de l'image d'un objet transparente."),
                       _T("Rendre la couleur _PARAM1_ de l'image actuelle de _PARAM0_ transparente"),
                       _T("Effets"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png",
                       &SpriteObject::ActCreateMaskFromColorOnActualImage);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("color", _T("Couleur à rendre transparente"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeColor",
                       _T("Changer la couleur globale d'un objet"),
                       _T("Change la couleur globale de l'objet. Par défaut, la couleur est le blanc."),
                       _T("Changer la couleur de _PARAM0_ en _PARAM1_"),
                       _T("Effets"),
                       "res/actions/color24.png",
                       "res/actions/color.png",
                       &SpriteObject::ActChangeColor);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("color", _T("Couleur"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeBlendMode",
                       _T("Changer le mode d'affichage"),
                       _T("Change le numéro de mode d'affichage d'un objet.\nLe mode d'affichage par défaut est 0 ( Alpha )."),
                       _T("Changer le numéro de mode d'affichage de _PARAM0_ en _PARAM1_"),
                       _T("Effets"),
                       "res/actions/color24.png",
                       "res/actions/color.png",
                       &SpriteObject::ActBlendMode);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _T("Mode ( 0 : Alpha, 1 : Add, 2 : Multiply, 3 : None )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("FlipX",
                       _T("Inverser l'affichage horizontalement"),
                       _T("Inverse l'affichage de l'objet horizontalement"),
                       _T("Inverser l'affichage de _PARAM0_ horizontalement : _PARAM1_"),
                       _T("Effets"),
                       "res/actions/flipX24.png",
                       "res/actions/flipX.png",
                       &SpriteObject::ActFlipX);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("yesorno", _T("Activer l'inversion"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("FlipY",
                       _T("Inverser l'affichage verticalement"),
                       _T("Inverse l'affichage de l'objet verticalement"),
                       _T("Inverser l'affichage de _PARAM0_ verticalement : _PARAM1_"),
                       _T("Effets"),
                       "res/actions/flipY24.png",
                       "res/actions/flipY.png",
                       &SpriteObject::ActFlipY);

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("yesorno", _T("Activer l'inversion"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("X", _T("Position X d'un point"), _T("Position X d'un point"), _T("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectX)

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER_OPTIONAL("", _T("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("Y", _T("Position Y d'un point"), _T("Position Y d'un point"), _T("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectY)

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER_OPTIONAL("", _T("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("PointX", _T("Position X d'un point"), _T("Position X d'un point"), _T("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectX)

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("", _T("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("PointY", _T("Position Y d'un point"), _T("Position Y d'un point"), _T("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectY)

            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
            DECLARE_PARAMETER("", _T("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("Direc", _T("Direction"), _T("Direction de l'objet"), _T("Direction"), "res/actions/direction.png", &SpriteObject::ExpGetObjectDirection)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Direction", _T("Direction"), _T("Direction de l'objet"), _T("Direction"), "res/actions/direction.png", &SpriteObject::ExpGetObjectDirection)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("Anim", _T("Animation"), _T("Animation de l'objet"), _T("Animations et images"), "res/actions/animation.png", &SpriteObject::ExpGetObjectAnimationNb)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Animation", _T("Animation"), _T("Animation de l'objet"), _T("Animations et images"), "res/actions/animation.png", &SpriteObject::ExpGetObjectAnimationNb)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Sprite", _T("Image"), _T("Numéro de l'image de l'objet"), _T("Animations et images"), "res/actions/sprite.png", &SpriteObject::ExpGetObjectSpriteNb)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ScaleX", _T("Echelle de la taille en largeur"), _T("Echelle de la taille en largeur"), _T("Taille"), "res/actions/scaleWidth.png", &SpriteObject::ExpGetObjectScaleX)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ScaleY", _T("Echelle de la taille en hauteur"), _T("Echelle de la taille en hauteur"), _T("Taille"), "res/actions/scaleHeight.png", &SpriteObject::ExpGetObjectScaleY)
            DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_END_OBJECT()

    //Declaration of all conditions available
    DECLARE_CONDITION("SourisSurObjet",
                   _T("Le curseur est sur un objet"),
                   _T("Teste si le curseur survole un objet. Le test est précis par défaut ( vérifie que le curseur n'est pas sur une zone transparente )."),
                   _T("Le curseur est sur _PARAM0_"),
                   _T("Souris"),
                   "res/conditions/surObjet24.png",
                   "res/conditions/surObjet.png",
                   &CondSourisSurObjet);

        DECLARE_PARAMETER("object", _T("Objet"), true, "Sprite")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _T("Test précis ? ( oui par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("EstTourne",
                      _T("Un objet est tourné vers un autre"),
                      _T("Teste si un objet est tourné vers un autre"),
                      _T("L'objet _PARAM0_ est tourné vers _PARAM1_"),
                      _T("Direction"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png",
                      &CondEstTourne);

        DECLARE_PARAMETER("object", _T("Nom de l'objet"), true, "Sprite")
        DECLARE_PARAMETER("object", _T("Nom du second objet"), true, "")
        DECLARE_PARAMETER("expression", _T("Angle de tolérance ( 0 : tolérance minimale )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()
    DECLARE_CONDITION("Collision",
                      _T("Collision"),
                      _T("La condition est vraie si il y a collision entre les deux objets donnés.\nLa collision est faite au pixel près.\nAttention ! Cette condition est couteuse pour l'ordinateur en terme de perfomance."),
                      _T("_PARAM0_ est en collision avec _PARAM1_"),
                      _T("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png",
                      &CondCollision);

        DECLARE_PARAMETER("object", _T("Objet 1"), true, "Sprite")
        DECLARE_PARAMETER("object", _T("Objet 2"), true, "Sprite")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("TourneVers",
                   _T("Tourner un objet vers un autre"),
                   _T("Tourne un objet vers un autre.\n( Si la direction est normale, l'objet prendra la direction la plus appropriée.\nSi c'est une rotation automatique, il sera tourné vers l'objet. )"),
                   _T("Tourner _PARAM0_ vers _PARAM1_"),
                   _T("Direction"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png",
                   &ActTourneVers);

        DECLARE_PARAMETER("object", _T("Objet à tourner"), true, "Sprite")
        DECLARE_PARAMETER("object", _T("Objet vers lequel se tourner"), true, "")

    DECLARE_END_ACTION()
}
