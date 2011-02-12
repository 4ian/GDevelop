#include "GDL/BaseObjectExtension.h"
#include "GDL/Object.h"
#include "GDL/eFreeFunctions.h"

void BaseObjectExtension::DeclareExtensionSecondPart()
{
    DECLARE_ACTION("Create",
                   _("Créer un objet"),
                   _("Créer un objet à la position spécifiée"),
                   _("Créer l'objet _PARAM0_ à la position _PARAM1_;_PARAM2_"),
                   _("Objets"),
                   "res/actions/create24.png",
                   "res/actions/create.png",
                   &ActCreate);

        DECLARE_PARAMETER("object", _("Objet à créer"), true, "")
        DECLARE_PARAMETER("expression", _("Position X"), false, "")
        DECLARE_PARAMETER("expression", _("Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("CreateByName",
                   _("Créer un objet de part son nom"),
                   _("Créer un objet à la position spécifiée"),
                   _("Créer l'objet ayant le nom _PARAM0_ à la position _PARAM1_;_PARAM2_"),
                   _("Objets"),
                   "res/actions/create24.png",
                   "res/actions/create.png",
                   &ActCreateByName);

        DECLARE_PARAMETER("text", _("Texte représentant le nom de l'objet à créer"), true, "")
        DECLARE_PARAMETER("expression", _("Position X"), false, "")
        DECLARE_PARAMETER("expression", _("Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _("Calque ( calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutObjConcern",
                   _("Prendre en compte des objets"),
                   _("Prend en compte tous les objets ainsi nommés de la scène."),
                   _("Prendre en compte tous les _PARAM0_"),
                   _("Objets"),
                   "res/actions/add24.png",
                   "res/actions/add.png",
                   &ActAjoutObjConcern);

        DECLARE_PARAMETER("object", _("Objet"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutHasard",
                   _("Prendre un objet au hasard"),
                   _("Prend un seul objet ayant ce nom parmi tous ceux de la scène"),
                   _("Prendre un _PARAM0_ au hasard"),
                   _("Objets"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png",
                   &ActAjoutHasard);

        DECLARE_PARAMETER("object", _("Objet"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Rebondir",
                   _("Ecarter un objet d'un autre"),
                   _("Ecarte un objet d'un autre, en utilisant les forces."),
                   _("Ecarter _PARAM0_ de _PARAM1_ ( seul _PARAM0_ bougera )"),
                   _("Déplacement"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png",
                   &ActRebondir);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet 2 ( Ne bougera pas )"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Ecarter",
                   _("Ecarter un objet d'un autre"),
                   _("Ecarte un objet d'un autre sans utiliser les forces."),
                   _("Ecarter _PARAM0_ de _PARAM1_ ( seul _PARAM0_ bougera )"),
                   _("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png",
                   &ActEcarter);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet 2 ( Ne bougera pas )"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddForceVers",
                   _("Ajouter une force dirigée vers un objet"),
                   _("Ajoute une force à un objet pour qu'il se dirige vers un autre. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui."),
                   _("Diriger _PARAM0_ vers _PARAM1_ avec une force de longueur _PARAM2_ pixels"),
                   _("Déplacement"),
                   "res/actions/forceVers24.png",
                   "res/actions/forceVers.png",
                   &ActAddForceVers);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet vers lequel se diriger"), true, "")
        DECLARE_PARAMETER("expression", _("Longueur en pixel"), false, "")
        DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddForceTourne",
                   _("Ajouter une force pour tourner autour d'un objet"),
                   _("Ajoute une force à un objet pour qu'il tourne autour d'un autre.\nNotez que le déplacement n'est pas forcément précis, notamment si la vitesse est élevée.\nPour positionner de façon parfaite un objet autour d'un autre, utilisez les actions de la catégorie Position."),
                   _("Faire tourner _PARAM0_ autour de _PARAM1_ à _PARAM2_°/sec et à _PARAM3_ pixels de distance"),
                   _("Déplacement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png",
                   &ActAddForceTourne);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet autour duquel tourner"), true, "")
        DECLARE_PARAMETER("expression", _("Vitesse ( Degrés par secondes )"), false, "")
        DECLARE_PARAMETER("expression", _("Distance ( en pixel )"), false, "")
        DECLARE_PARAMETER("expression", _("Dissipation ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("MettreAutour",
                   _("Mettre un objet autour d'un autre"),
                   _("Positionne un objet autour d'un autre, avec l'angle et la distance indiquée."),
                   _("Mettre _PARAM0_ autour de _PARAM1_ à _PARAM3_° et à _PARAM2_ pixels de distance"),
                   _("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png",
                   &ActMettreAutour);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet autour duquel positionner le premier"), true, "")
        DECLARE_PARAMETER("expression", _("Distance"), false, "")
        DECLARE_PARAMETER("expression", _("Angle en degré"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("MoveObjects",
                   _("Effectuer le déplacement des objets"),
                   _("Fait bouger les objets en fonction des forces qui leurs sont attribués.\nGame Develop appelle par défaut cette action à la fin de la liste des évènements.\nVous pouvez l'appeler et utiliser ensuite les actions de centrage de caméra/positionnement d'objets d'interfaces par exemple."),
                   _("Effectuer le déplacement des objets"),
                   _("Déplacement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png",
                   &ActMoveObjects);

    DECLARE_END_ACTION()

    DECLARE_CONDITION("SeDirige",
                   _("Un objet se dirige vers un autre"),
                   _("Teste si l'objet se dirige vers un autre.\nL'objet 1 doit être en mouvement."),
                   _("_PARAM0_ se dirige vers _PARAM1_"),
                   _("Déplacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png",
                   &CondSeDirige);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet 2"), true, "")
        DECLARE_PARAMETER("expression", _("Angle de tolérance"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Distance",
                   _("Distance entre deux objets"),
                   _("Teste si la distance entre les deux objets correspond au test effectué"),
                   _("La distance entre les objets _PARAM0_ et _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png",
                   &CondDistance);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet 2"), true, "")
        DECLARE_PARAMETER("expression", _("Distance"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutObjConcern",
                   _("Prendre en compte des objets"),
                   _("Prend en compte tous les objets ainsi nommés de la scène."),
                   _("Prendre en compte tous les _PARAM0_"),
                   _("Objets"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png",
                   &CondAjoutObjConcern);

        DECLARE_PARAMETER("object", _("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutHasard",
                   _("Prendre un objet au hasard"),
                   _("Prend un seul objet ayant ce nom parmi tous ceux de la scène"),
                   _("Prendre un _PARAM0_ au hasard"),
                   _("Objets"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png",
                   &CondAjoutHasard);

        DECLARE_PARAMETER("object", _("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("NbObjet",
                   _("Nombre d'objets"),
                   _("Teste le nombre d'objet concernés."),
                   _("Le nombre de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _("Objets"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png",
                   &CondNbObjet);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _("Collision"),
                   _("Teste la collision entre deux objets en utilisant leurs masques de collisions.\nNotez que certains objets peuvent ne pas avoir de masque de collisions.\nD'autres, comme les Sprites, proposent des conditions de collisions plus précises."),
                   _("_PARAM0_ est en collision avec _PARAM1_ ( Masques de collisions )"),
                   _("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png",
                   &CondHBCollision);

        DECLARE_PARAMETER("object", _("Objet"), true, "")
        DECLARE_PARAMETER("object", _("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("Count", _("Nombre d'objets"), _("Compte le nombre d'objets indiqué actuellement concernés"), _("Objets"), "res/conditions/nbObjet.png", &ExpGetObjectCount)
        DECLARE_PARAMETER("object", _("Objet"), true, "")
    DECLARE_END_EXPRESSION()
}
