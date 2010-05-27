#include "GDL/BaseObjectExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Object.h"

BaseObjectExtension::BaseObjectExtension()
{
    DECLARE_THE_EXTENSION("BuiltinObject",
                          _("Objet de base"),
                          _("Objet de base integré en standard"),
                          "Compil Games",
                          "Freeware")

    DeclareExtensionFirstPart();
    DeclareExtensionSecondPart();
}

void BaseObjectExtension::DeclareExtensionFirstPart()
{
    //Declaration of all objects available
    DECLARE_OBJECT("",
                   _("Objet de base"),
                   _("Objet de base"),
                   "res/objeticon24.png",
                   &CreateBaseObject,
                   &DestroyBaseObject);

        DECLARE_OBJECT_CONDITION("PosX",
                       _("Tester la position X d'un objet"),
                       _("Teste si la position X de l'objet correspond au test effectué."),
                       _("La position X de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png",
                       &Object::CondPosX);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("PosY",
                       _("Tester la position Y d'un objet"),
                       _("Teste si la position Y de l'objet correspond au test effectué."),
                       _("La position Y de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png",
                       &Object::CondPosY);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreX",
                       _("Position X d'un objet"),
                       _("Change la position x d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à la position X de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png",
                       &Object::ActMettreX);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreY",
                       _("Position Y d'un objet"),
                       _("Change la position y d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à la position Y de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png",
                       &Object::ActMettreY);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreXY",
                       _("Position d'un objet"),
                       _("Change la position d'un objet."),
                       _("Faire _PARAM2__PARAM1_;_PARAM4__PARAM3_ à la position de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png",
                       &Object::ActMettreXY);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreAutourPos",
                       _("Mettre un objet autour d'une position"),
                       _("Positionne un objet autour d'une position, avec l'angle et la distance indiquée."),
                       _("Mettre _PARAM0_ autour de _PARAM1_;_PARAM2_ à _PARAM3_° et à _PARAM4_ pixels de distance"),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png",
                       &Object::ActMettreAutourPos);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            DECLARE_PARAMETER("expression", _("Distance"), false, "")
            DECLARE_PARAMETER("expression", _("Angle en degré"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceXY",
                       _("Ajouter une force à un objet"),
                       _("Ajouter une force à un objet. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui. Cette action créé la force en utilisant des coordonnées X et Y."),
                       _("Ajouter à _PARAM0_ une force de _PARAM1_ p/s en X et _PARAM2_ p/s en Y"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png",
                       &Object::ActAddForceXY);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Déplacement en X"), false, "")
            DECLARE_PARAMETER("expression", _("Déplacement en Y"), false, "")
            DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceAL",
                       _("Ajouter une force ( Par angle )"),
                       _("Ajouter une force à un objet. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui. Cette action créé la force en utilisant l'angle et la longueur indiquée."),
                       _("Ajouter à _PARAM0_ une force d'angle _PARAM1_° et de longeur _PARAM2_ pixels"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png",
                       &Object::ActAddForceAL);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Angle"), false, "")
            DECLARE_PARAMETER("expression", _("Longueur ( en pixels )"), false, "")
            DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceVersPos",
                       _("Ajouter une force dirigée vers une position"),
                       _("Ajouter une force à un objet pour qu'il se dirige vers la position."),
                       _("Diriger _PARAM0_ vers _PARAM1_;_PARAM2_ avec une force de longueur _PARAM3_ pixels"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png",
                       &Object::ActAddForceVersPos);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y"), false, "")
            DECLARE_PARAMETER("expression", _("Longueur ( en pixels )"), false, "")
            DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceTournePos",
                       _("Ajouter une force pour tourner autour d'une position"),
                       _("Ajouter une force à un objet pour qu'il tourne autour d'une position.\nNotez que le déplacement n'est pas forcément précis, notamment si la vitesse est élevée.\nPour positionner de façon parfaite un objet autour d'une position, utilisez les actions de la catégorie Position."),
                       _("Faire tourner _PARAM0_ autour de _PARAM1_;_PARAM2_ à _PARAM3_°/sec et à _PARAM4_ pixels de distance"),
                       _("Déplacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png",
                       &Object::ActAddForceTournePos);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Position X du point autour duquel tourner"), false, "")
            DECLARE_PARAMETER("expression", _("Position Y du point autour duquel tourner"), false, "")
            DECLARE_PARAMETER("expression", _("Vitesse ( en Degrés par secondes )"), false, "")
            DECLARE_PARAMETER("expression", _("Distance ( en pixels )"), false, "")
            DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Arreter",
                       _("Arrêter l'objet"),
                       _("Arrête l'objet en supprimant toutes ses forces."),
                       _("Arrêter l'objet _PARAM0_"),
                       _("Déplacement"),
                       "res/actions/arreter24.png",
                       "res/actions/arreter.png",
                       &Object::ActArreter);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Delete",
                       _("Supprimer un objet"),
                       _("Supprime l'objet indiqué."),
                       _("Supprimer l'objet _PARAM0_"),
                       _("Objets"),
                       "res/actions/delete24.png",
                       "res/actions/delete.png",
                       &Object::ActDelete);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Duplicate",
                       _("Dupliquer un objet"),
                       _("Crée une copie d'un objet ( même position, même animation... )."),
                       _("Dupliquer l'objet _PARAM0_"),
                       _("Objets"),
                       "res/actions/duplicate24.png",
                       "res/actions/duplicate.png",
                       &Object::ActDuplicate);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangePlan",
                       _("Changer le plan d'un objet"),
                       _("Modifier le numéro du plan d'un objet"),
                       _("Faire _PARAM2__PARAM1_ au plan de _PARAM0_"),
                       _("Plan"),
                       "res/actions/planicon24.png",
                       "res/actions/planicon.png",
                       &Object::ActChangeZOrder);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeLayer",
                       _("Changer le calque sur lequel est un objet"),
                       _("Change le calque sur lequel est actuellement situé l'objet."),
                       _("Mettre _PARAM0_ sur le calque _PARAM1_"),
                       _("Calques et caméras"),
                       "res/actions/layer24.png",
                       "res/actions/layer.png",
                       &Object::ActChangeLayer);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("layer", _("Mettre sur le calque ( calque de base si vide )"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjet",
                       _("Modifier une variable d'un objet"),
                       _("Modifie la valeur d'une variable d'un objet."),
                       _("Faire _PARAM3__PARAM2_ à la variable _PARAM1_ de l'objet _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png",
                       &Object::ActModVarObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
            DECLARE_PARAMETER("expression", _("Valeur"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjetTxt",
                       _("Modifier le texte d'une variable d'un objet"),
                       _("Modifie le texte d'une variable d'un objet."),
                       _("Faire _PARAM3__PARAM2_ au texte de la variable _PARAM1_ de _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png",
                       &Object::ActModVarObjetTxt);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
            DECLARE_PARAMETER("text", _("Texte"), false, "")
            DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Cache",
                       _("Cacher un objet ( rendre invisible )"),
                       _("Rend invisible l'objet indiqué."),
                       _("Cacher l'objet _PARAM0_"),
                       _("Visibilité"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png",
                       &Object::ActCacheObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Montre",
                       _("Montrer un objet ( rendre visible )"),
                       _("Rend visible l'objet indiqué ( si il a été précedemment rendu invisible )"),
                       _("Montrer l'objet _PARAM0_"),
                       _("Visibilité"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png",
                       &Object::ActMontreObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Plan",
                       _("Tester le plan d'un objet"),
                       _("Teste si le plan de l'objet correspond au test effectué."),
                       _("Le plan de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Plan"),
                       "res/conditions/planicon.png",
                       "res/conditions/planicon.png",
                       &Object::CondZOrder);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Plan"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Layer",
                       _("Tester le calque d'un objet"),
                       _("Teste si l'objet est sur le calque indiqué."),
                       _("_PARAM0_ est sur le calque _PARAM1_"),
                       _("Calque"),
                       "res/conditions/layer24.png",
                       "res/conditions/layer.png",
                       &Object::CondLayer);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("layer", _("Calque"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Visible",
                       _("Visibilité d'un objet"),
                       _("Teste si un objet est visible ( non masqué )."),
                       _("L'objet _PARAM0_ est visible"),
                       _("Visibilité"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png",
                       &Object::CondVisibleObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Invisible",
                       _("Invisibilité d'un objet"),
                       _("Teste si un objet est invisible ( masqué )."),
                       _("L'objet _PARAM0_ est invisible"),
                       _("Visibilité"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png",
                       &Object::CondInvisibleObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Arret",
                       _("L'objet est à l'arrêt"),
                       _("Teste si l'objet ne bouge pas."),
                       _("L'objet _PARAM0_ est à l'arrêt"),
                       _("Déplacement"),
                       "res/conditions/arret24.png",
                       "res/conditions/arret.png",
                       &Object::CondArret);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Vitesse",
                       _("Vitesse de l'objet"),
                       _("Teste si la vitesse globale de l'objet correspond au test effectué."),
                       _("La vitesse de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Déplacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png",
                       &Object::CondVitesse);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Vitesse"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AngleOfDisplacement",
                       _("Angle de déplacement"),
                       _("Teste l'angle de déplacement d'un objet"),
                       _("L'angle de déplacement de _PARAM0_ est de _PARAM1_ ( Tolérance : _PARAM2_° )"),
                       _("Déplacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png",
                       &Object::CondAngleOfDisplacement);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("expression", _("Angle ( en degrés )"), false, "")
            DECLARE_PARAMETER("expression", _("Tolérance"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjet",
                       _("Variable d'un objet"),
                       _("Teste si la valeur d'une variable d'un objet correspond au test effectué."),
                       _("La variable \"_PARAM1_\" de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png",
                       &Object::CondVarObjet);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
            DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetTxt",
                       _("Texte d'une variable d'un objet"),
                       _("Teste si le texte de la variable d'un objet correspond au test effectué."),
                       _("Le texte de la variable _PARAM1_ de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png",
                       &Object::CondVarObjetTxt);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
            DECLARE_PARAMETER("text", _("Texte à tester"), false, "")
            DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetDef",
                       _("Une variable d'un objet est elle définie ?"),
                       _("Teste si une variable d'un objet existe."),
                       _("La variable _PARAM1_ de _PARAM0_ est définie"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png",
                       &Object::CondVarObjetDef);

            DECLARE_PARAMETER("objet", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
            MAIN_OBJECTS_IN_PARAMETER(0)

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_EXPRESSION("x", _("Position X"), _("Position X de l'objet"), _("Position"), "res/actions/position.png", &Object::ExpGetObjectX)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("y", _("Position Y"), _("Position Y de l'objet"), _("Position"), "res/actions/position.png", &Object::ExpGetObjectY)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("forceX", _("Force moyenne en X"), _("Force moyenne en X"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceX)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("forceY", _("Force moyenne en Y"), _("Force moyenne en Y"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceY)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("forceAngle", _("Angle moyen des forces"), _("Angle moyen des forces"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceAngle)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("angle", _("Angle moyen des forces"), _("Angle moyen des forces"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceAngle)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("forceLength", _("Longueur moyenne des forces"), _("Longueur moyenne des forces"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceLength)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("longueur", _("Longueur moyenne des forces"), _("Longueur moyenne des forces"), _("Déplacement"), "res/actions/force.png", &Object::ExpGetObjectTotalForceLength)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("width", _("Largeur d'un objet"), _("Largeur d'un objet"), _("Taille"), "res/actions/scaleWidth.png", &Object::ExpGetObjectWidth)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("largeur", _("Largeur d'un objet"), _("Largeur d'un objet"), _("Taille"), "res/actions/scaleWidth.png", &Object::ExpGetObjectWidth)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("height", _("Hauteur d'un objet"), _("Hauteur d'un objet"), _("Taille"), "res/actions/scaleHeight.png", &Object::ExpGetObjectHeight)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("hauteur", _("Hauteur d'un objet"), _("Hauteur d'un objet"), _("Taille"), "res/actions/scaleHeight.png", &Object::ExpGetObjectHeight)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("zOrder", _("Plan d'un objet"), _("Plan d'un objet"), _("Visibilité"), "res/actions/planicon.png", &Object::ExpGetObjectZOrder)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_HIDDEN_EXPRESSION("plan", _("Plan d'un objet"), _("Plan d'un objet"), _("Visibilité"), "res/actions/planicon.png", &Object::ExpGetObjectZOrder)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("distance", _("Distance entre deux objets"), _("Distance entre deux objets"), _("Position"), "res/conditions/distance.png", &Object::ExpGetDistanceBetweenObjects)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("sqDistance", _("Distance au carré entre deux objets"), _("Distance au carré entre deux objets"), _("Position"), "res/conditions/distance.png", &Object::ExpGetSqDistanceBetweenObjects)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("variable", _("Variable d'un objet"), _("Variable d'un objet"), _("Variables"), "res/actions/var.png", &Object::ExpGetObjectVariableValue)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_STR_EXPRESSION("variable", _("Variable d'un objet"), _("Texte d'une variable d'un objet"), _("Variables"), "res/actions/var.png", &Object::ExpGetObjectVariableString)
            DECLARE_PARAMETER("object", _("Objet"), true, "")
            DECLARE_PARAMETER("objectvar", _("Nom de la variable"), false, "")
        DECLARE_END_OBJECT_STR_EXPRESSION()

    DECLARE_END_OBJECT()
}
