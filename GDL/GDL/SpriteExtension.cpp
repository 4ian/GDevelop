
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "GDL/SpriteExtension.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Access.h"
#include "GDL/Chercher.h"
#include "GDL/Object.h"
#include <iostream>
#include <string>
#include "GDL/ExtensionBase.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "GDL/Access.h"
#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include <iostream>

#ifdef GDE
#include <wx/textdlg.h>
#include <wx/bitmap.h>
#include <wx/wx.h>
#include "GDL/Game.h"
#include "GDL/MainEditorCommand.h"
#endif

ExtensionSprite::ExtensionSprite()
{
    DECLARE_THE_EXTENSION("Sprite",
                          _("Sprite ( image animée )"),
                          _("Extension permettant d'ajouter des objets animées à la scène, qui peuvent contenir des animations avec des directions à l'intérieur de chacune."),
                          "Compil Games",
                          "Freeware")

    //Declaration of all objects available
    DECLARE_OBJECT("Sprite",
                   _("Sprite ( image animée )"),
                   _("Objet animé, composé d'animations et directions contenant des images."),
                   "Extensions/spriteicon.png",
                   &CreateSpriteObject,
                   &CreateSpriteObjectByCopy,
                   &DestroySpriteObject);

        DECLARE_OBJECT_ACTION("Opacity",
                       _("Régler l'opacité d'un objet"),
                       _("Modifie la transparence d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à l'opacité de _PARAM0_"),
                       _("Visibilité"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png",
                       &SpriteObject::ActOpacity);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeAnimation",
                       _("Changer le numéro de l'animation d'un objet"),
                       _("Modifie le numéro de l'animation de l'objet."),
                       _("Faire _PARAM2__PARAM1_ au numéro de l'animation de _PARAM0_"),
                       _("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActChangeAnimation);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeDirection",
                       _("Changer le numéro de la direction d'un objet"),
                       _("Modifie la direction de l'objet"),
                       _("Faire _PARAM2__PARAM1_ à la direction de _PARAM0_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png",
                       &SpriteObject::ActChangeDirection);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeSprite",
                       _("Changer le numéro de l'image d'un objet"),
                       _("Modifie le numéro de l'image actuelle de l'objet"),
                       _("Faire _PARAM2__PARAM1_ au numéro de l'image de _PARAM0_"),
                       _("Animations et images"),
                       "res/actions/sprite24.png",
                       "res/actions/sprite.png",
                       &SpriteObject::ActChangeSprite);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PauseAnimation",
                       _("Mettre en pause l'animation de l'objet"),
                       _("Met en pause l'animation actuelle de l'objet"),
                       _("Mettre en pause l'animation actuelle de _PARAM0_"),
                       _("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActPauseAnimation);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("PlayAnimation",
                       _("Jouer l'animation de l'objet"),
                       _("Joue l'animation actuelle de l'objet"),
                       _("Jouer l'animation actuelle de _PARAM0_"),
                       _("Animations et images"),
                       "res/actions/animation24.png",
                       "res/actions/animation.png",
                       &SpriteObject::ActPlayAnimation);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("TourneVersPos",
                       _("Tourner un objet vers une position"),
                       _("Tourne un objet vers une position.\n( Si la direction est normale, l'objet prendra la direction la plus appropriée.\nSi c'est une rotation automatique, il sera tourné vers l'objet. )"),
                       _("Tourner _PARAM0_ vers _PARAM1_;_PARAM2_"),
                       _("Direction"),
                       "res/actions/direction24.png",
                       "res/actions/direction.png",
                       &SpriteObject::ActTourneVersPos);

            DECLARE_PARAMETER("objet", _("Objet à tourner"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScale",
                       _("Modifier l'échelle d'un objet"),
                       _("Modifie l'échelle de la taille de l'objet indiqué."),
                       _("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_"),
                       _("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScale);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleWidth",
                       _("Modifier l'échelle en largeur d'un objet"),
                       _("Modifie l'échelle de la taille de l'objet indiqué en largeur."),
                       _("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_ en largeur"),
                       _("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScaleWidth);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeScaleHeight",
                       _("Modifier l'échelle en hauteur d'un objet"),
                       _("Modifie l'échelle de la taille de l'objet indiqué en hauteur."),
                       _("Faire _PARAM2__PARAM1_ à l'échelle de la taille de _PARAM0_ en hauteur"),
                       _("Taille"),
                       "res/actions/scale24.png",
                       "res/actions/scale.png",
                       &SpriteObject::ActChangeScaleHeight);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Animation",
                       _("Numéro de l'animation d'un objet"),
                       _("Teste si le numéro de l'animation de l'objet correspond."),
                       _("Le numéro de l'animation de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Animations et images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png",
                       &SpriteObject::CondAnim);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Numéro de l'animation à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Direction",
                       _("Numéro de la direction de l'objet"),
                       _("Teste si le numéro de la direction de l'objet correspond au test effectué."),
                       _("La direction de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Direction"),
                       "res/conditions/direction24.png",
                       "res/conditions/direction.png",
                       &SpriteObject::CondDirection);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Numéro de la direction à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Sprite",
                       _("Numéro de l'image de l'objet"),
                       _("Teste si le numéro de l'image de l'objet correspond."),
                       _("L'image de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Animations et images"),
                       "res/conditions/sprite24.png",
                       "res/conditions/sprite.png",
                       &SpriteObject::CondSprite);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Numéro de l'image à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AnimStopped",
                       _("L'animation est en pause"),
                       _("Teste si l'animation de l'objet est en pause."),
                       _("L'animation de _PARAM0_ est en pause"),
                       _("Animations et images"),
                       "res/conditions/animation24.png",
                       "res/conditions/animation.png",
                       &SpriteObject::CondAnimStopped);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleWidth",
                       _("Echelle de la taille d'un objet en largeur"),
                       _("Teste l'échelle de la taille de l'objet en largeur."),
                       _("L'échelle de la taille de l'objet _PARAM0_ en largeur est _PARAM2_ à _PARAM1_"),
                       _("Taille"),
                       "res/conditions/scaleWidth24.png",
                       "res/conditions/scaleWidth.png",
                       &SpriteObject::CondScaleWidth);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("ScaleHeight",
                       _("Echelle de la taille d'un objet en hauteur"),
                       _("Teste l'échelle de la taille de l'objet en hauteur."),
                       _("L'échelle de la taille de l'objet _PARAM0_ en hauteur est _PARAM2_ à _PARAM1_"),
                       _("Taille"),
                       "res/conditions/scaleHeight24.png",
                       "res/conditions/scaleHeight.png",
                       &SpriteObject::CondScaleHeight);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Opacity",
                       _("Opacité d'un objet"),
                       _("Teste la valeur de l'opacité ( transparence ) d'un objet."),
                       _("L'opacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Visibilité"),
                       "res/conditions/opacity24.png",
                       "res/conditions/opacity.png",
                       &SpriteObject::CondOpacityObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("CopyImageOnImageOfSprite",
                       _("Copier une image sur celle d'un objet"),
                       _("Copie une image sur celle d'un objet."),
                       _("Copier l'image _PARAM1_ sur celle de _PARAM0_ à l'emplacement _PARAM2_;_PARAM3_"),
                       _("Effets"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png",
                       &SpriteObject::ActCopyImageOnImageOfSprite);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("texte", _("Nom de l'image source"), false, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            DECLARE_PARAMETER("yesorno", _("Utiliser la transparence de la source ( non si vide )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("CreateMaskFromColorOnActualImage",
                       _("Rendre une couleur de l'image d'un objet transparente"),
                       _("Rend une couleur de l'image d'un objet transparente."),
                       _("Rendre la couleur _PARAM1_ de l'image actuelle de _PARAM0_ transparente"),
                       _("Effets"),
                       "res/actions/opacity24.png",
                       "res/actions/opacity.png",
                       &SpriteObject::ActCreateMaskFromColorOnActualImage);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("color", _("Couleur à rendre transparente"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeColor",
                       _("Changer la couleur globale d'un objet"),
                       _("Change la couleur globale de l'objet. Par défaut, la couleur est le blanc."),
                       _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                       _("Effets"),
                       "res/actions/color24.png",
                       "res/actions/color.png",
                       &SpriteObject::ActChangeColor);

            DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("color", _("Couleur"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("x", _("Position X d'un point"), _("Position X d'un point"), _("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectX)

            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("texte", _("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("y", _("Position Y d'un point"), _("Position Y d'un point"), _("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectY)

            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("texte", _("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("pointX", _("Position X d'un point"), _("Position X d'un point"), _("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectX)

            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("text", _("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("pointY", _("Position Y d'un point"), _("Position Y d'un point"), _("Position"), "res/actions/position.png", &SpriteObject::ExpGetObjectY)

            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
            DECLARE_PARAMETER("text", _("Nom du point"), false, "")

        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("direc", _("Direction"), _("Direction de l'objet"), _("Direction"), "res/actions/direction.png", &SpriteObject::ExpGetObjectDirection)
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("direction", _("Direction"), _("Direction de l'objet"), _("Direction"), "res/actions/direction.png", &SpriteObject::ExpGetObjectDirection)
            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("anim", _("Animation"), _("Animation de l'objet"), _("Animation et images"), "res/actions/animation.png", &SpriteObject::ExpGetObjectAnimationNb)
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("animation", _("Animation"), _("Animation de l'objet"), _("Animation et images"), "res/actions/animation.png", &SpriteObject::ExpGetObjectAnimationNb)
            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("sprite", _("Image"), _("Numéro de l'image de l'objet"), _("Animations et images"), "res/actions/sprite.png", &SpriteObject::ExpGetObjectSpriteNb)
            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("scaleX", _("Echelle de la taille en largeur"), _("Echelle de la taille en largeur"), _("Taille"), "res/actions/scaleWidth.png", &SpriteObject::ExpGetObjectScaleX)
            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("scaleY", _("Echelle de la taille en hauteur"), _("Echelle de la taille en hauteur"), _("Taille"), "res/actions/scaleHeight.png", &SpriteObject::ExpGetObjectScaleY)
            DECLARE_PARAMETER("object", _("Objet"), true, "Sprite")
        DECLARE_END_OBJECT_EXPRESSION()

    DECLARE_END_OBJECT()

    //Declaration of all conditions available
    DECLARE_CONDITION("SourisSurObjet",
                   _("Le curseur est sur un objet"),
                   _("Teste si le curseur survole un objet. Le test est précis par défaut ( vérifie que le curseur n'est pas sur une zone transparente )."),
                   _("Le curseur est sur _PARAM0_"),
                   _("Souris"),
                   "res/conditions/surObjet24.png",
                   "res/conditions/surObjet.png",
                   &CondSourisSurObjet);

        DECLARE_PARAMETER("objet", _("Objet"), true, "Sprite")
        DECLARE_PARAMETER_OPTIONAL("yesorno", _("Test précis ? ( oui par défaut )"), false, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("EstTourne",
                      _("Un objet est tourné vers un autre"),
                      _("Description de EstTourne"),
                      _("L'objet _PARAM0_ est tourné vers _PARAM1_"),
                      _("Direction"),
                      "res/conditions/estTourne24.png",
                      "res/conditions/estTourne.png",
                      &CondEstTourne);

        DECLARE_PARAMETER("objet", _("Nom de l'objet"), true, "Sprite")
        DECLARE_PARAMETER("objet", _("Nom du second objet"), true, "")
        DECLARE_PARAMETER("expression", _("Angle de tolérance ( 0 : tolérance minimale )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()
    DECLARE_CONDITION("Collision",
                      _("Collision"),
                      _("La condition est vraie si il y a collision entre les deux objets donnés.\nLa collision est faite au pixel près.\nAttention ! Cette condition est couteuse pour l'ordinateur en terme de perfomance."),
                      _("L'objet _PARAM0_ est en collision avec _PARAM1_"),
                      _("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png",
                      &CondCollision);

        DECLARE_PARAMETER("objet", _("Objet 1"), true, "Sprite")
        DECLARE_PARAMETER("objet", _("Objet 2"), true, "Sprite")

    DECLARE_END_CONDITION()
    DECLARE_CONDITION("CollisionNP",
                      _("Collision ( non précise )"),
                      _("Teste rapidement si il y a collision entre deux objets.\nLe test n'est pas précis ( rectangle englobant ) mais beaucoup plus rapide que le test précis."),
                      _("L'objet _PARAM0_ est en collision avec _PARAM1_ ( non précis )"),
                      _("Collision"),
                      "res/conditions/collision24.png",
                      "res/conditions/collision.png",
                      &CondCollisionNP);

        DECLARE_PARAMETER("objet", _("Objet 1"), true, "Sprite")
        DECLARE_PARAMETER("objet", _("Objet 2"), true, "Sprite")

    DECLARE_END_CONDITION()

    DECLARE_ACTION("TourneVers",
                   _("Tourner un objet vers un autre"),
                   _("Tourne un objet vers un autre.\n( Si la direction est normale, l'objet prendra la direction la plus appropriée.\nSi c'est une rotation automatique, il sera tourné vers l'objet. )"),
                   _("Tourner _PARAM0_ vers _PARAM1_"),
                   _("Direction"),
                   "res/actions/direction24.png",
                   "res/actions/direction.png",
                   &ActTourneVers);

        DECLARE_PARAMETER("objet", _("Objet à tourner"), true, "Sprite")
        DECLARE_PARAMETER("objet", _("Objet vers lequel se tourner"), true, "")

    DECLARE_END_ACTION()
}
