#include "GDL/BaseObjectExtension.h"
#include "GDL/Object.h"
#include "GDL/eFreeFunctions.h"

void BaseObjectExtension::DeclareExtensionSecondPart()
{
    DECLARE_ACTION("Create",
                   _T("Créer un objet"),
                   _T("Créer un objet à la position spécifiée"),
                   _T("Créer l'objet _PARAM0_ à la position _PARAM1_;_PARAM2_"),
                   _T("Objets"),
                   "res/actions/create24.png",
                   "res/actions/create.png",
                   &ActCreate);

        DECLARE_PARAMETER("object", _T("Objet à créer"), true, "")
        DECLARE_PARAMETER("expression", _T("Position X"), false, "")
        DECLARE_PARAMETER("expression", _T("Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("CreateByName",
                   _T("Créer un objet de part son nom"),
                   _T("Créer un objet à la position spécifiée"),
                   _T("Créer l'objet ayant le nom _PARAM0_ à la position _PARAM1_;_PARAM2_"),
                   _T("Objets"),
                   "res/actions/create24.png",
                   "res/actions/create.png",
                   &ActCreateByName);

        DECLARE_PARAMETER("text", _T("Texte représentant le nom de l'objet à créer"), true, "")
        DECLARE_PARAMETER("expression", _T("Position X"), false, "")
        DECLARE_PARAMETER("expression", _T("Position Y"), false, "")
        DECLARE_PARAMETER_OPTIONAL("layer", _T("Calque ( calque de base si vide )"), false, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutObjConcern",
                   _T("Prendre en compte des objets"),
                   _T("Prend en compte tous les objets ainsi nommés de la scène."),
                   _T("Prendre en compte tous les _PARAM0_"),
                   _T("Objets"),
                   "res/actions/add24.png",
                   "res/actions/add.png",
                   &ActAjoutObjConcern);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutHasard",
                   _T("Prendre un objet au hasard"),
                   _T("Prend un seul objet ayant ce nom parmi tous ceux de la scène"),
                   _T("Prendre un _PARAM0_ au hasard"),
                   _T("Objets"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png",
                   &ActAjoutHasard);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Rebondir",
                   _T("Ecarter un objet d'un autre"),
                   _T("Ecarte un objet d'un autre, en utilisant les forces."),
                   _T("Ecarter _PARAM0_ de _PARAM1_ ( seul _PARAM0_ bougera )"),
                   _T("Déplacement"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png",
                   &ActRebondir);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet 2 ( Ne bougera pas )"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("Ecarter",
                   _T("Ecarter un objet d'un autre"),
                   _T("Ecarte un objet d'un autre sans utiliser les forces."),
                   _T("Ecarter _PARAM0_ de _PARAM1_ ( seul _PARAM0_ bougera )"),
                   _T("Position"),
                   "res/actions/ecarter24.png",
                   "res/actions/ecarter.png",
                   &ActEcarter);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet 2 ( Ne bougera pas )"), true, "")

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddForceVers",
                   _T("Ajouter une force dirigée vers un objet"),
                   _T("Ajoute une force à un objet pour qu'il se dirige vers un autre. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui."),
                   _T("Diriger _PARAM0_ vers _PARAM1_ avec une force de longueur _PARAM2_ pixels"),
                   _T("Déplacement"),
                   "res/actions/forceVers24.png",
                   "res/actions/forceVers.png",
                   &ActAddForceVers);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet vers lequel se diriger"), true, "")
        DECLARE_PARAMETER("expression", _T("Longueur en pixel"), false, "")
        DECLARE_PARAMETER("expression", _T("Dissipation ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("AddForceTourne",
                   _T("Ajouter une force pour tourner autour d'un objet"),
                   _T("Ajoute une force à un objet pour qu'il tourne autour d'un autre.\nNotez que le déplacement n'est pas forcément précis, notamment si la vitesse est élevée.\nPour positionner de façon parfaite un objet autour d'un autre, utilisez les actions de la catégorie Position."),
                   _T("Faire tourner _PARAM0_ autour de _PARAM1_ à _PARAM2_°/sec et à _PARAM3_ pixels de distance"),
                   _T("Déplacement"),
                   "res/actions/forceTourne24.png",
                   "res/actions/forceTourne.png",
                   &ActAddForceTourne);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet autour duquel tourner"), true, "")
        DECLARE_PARAMETER("expression", _T("Vitesse ( Degrés par secondes )"), false, "")
        DECLARE_PARAMETER("expression", _T("Distance ( en pixel )"), false, "")
        DECLARE_PARAMETER("expression", _T("Dissipation ( 0 par défaut )"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("MettreAutour",
                   _T("Mettre un objet autour d'un autre"),
                   _T("Positionne un objet autour d'un autre, avec l'angle et la distance indiquée."),
                   _T("Mettre _PARAM0_ autour de _PARAM1_ à _PARAM3_° et à _PARAM2_ pixels de distance"),
                   _T("Position"),
                   "res/actions/positionAutour24.png",
                   "res/actions/positionAutour.png",
                   &ActMettreAutour);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet autour duquel positionner le premier"), true, "")
        DECLARE_PARAMETER("expression", _T("Distance"), false, "")
        DECLARE_PARAMETER("expression", _T("Angle en degré"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_ACTION()

    DECLARE_ACTION("MoveObjects",
                   _T("Effectuer le déplacement des objets"),
                   _T("Fait bouger les objets en fonction des forces qui leurs sont attribués.\nGame Develop appelle par défaut cette action à la fin de la liste des évènements.\nVous pouvez l'appeler et utiliser ensuite les actions de centrage de caméra/positionnement d'objets d'interfaces par exemple."),
                   _T("Effectuer le déplacement des objets"),
                   _T("Déplacement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png",
                   &ActMoveObjects);

    DECLARE_END_ACTION()

    DECLARE_CONDITION("SeDirige",
                   _T("Un objet se dirige vers un autre"),
                   _T("Teste si l'objet se dirige vers un autre.\nL'objet 1 doit être en mouvement."),
                   _T("_PARAM0_ se dirige vers _PARAM1_"),
                   _T("Déplacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png",
                   &CondSeDirige);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet 2"), true, "")
        DECLARE_PARAMETER("expression", _T("Angle de tolérance"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Distance",
                   _T("Distance entre deux objets"),
                   _T("Teste si la distance entre les deux objets correspond au test effectué"),
                   _T("La distance entre les objets _PARAM0_ et _PARAM1_ est _PARAM3_ à _PARAM2_"),
                   _T("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png",
                   &CondDistance);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet 2"), true, "")
        DECLARE_PARAMETER("expression", _T("Distance"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETERS(0,1)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutObjConcern",
                   _T("Prendre en compte des objets"),
                   _T("Prend en compte tous les objets ainsi nommés de la scène."),
                   _T("Prendre en compte tous les _PARAM0_"),
                   _T("Objets"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png",
                   &CondAjoutObjConcern);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutHasard",
                   _T("Prendre un objet au hasard"),
                   _T("Prend un seul objet ayant ce nom parmi tous ceux de la scène"),
                   _T("Prendre un _PARAM0_ au hasard"),
                   _T("Objets"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png",
                   &CondAjoutHasard);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("NbObjet",
                   _T("Nombre d'objets"),
                   _T("Teste le nombre d'objet concernés."),
                   _T("Le nombre de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                   _T("Objets"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png",
                   &CondNbObjet);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("expression", _T("Valeur à tester"), false, "")
        DECLARE_PARAMETER("signe", _T("Signe du test"), false, "")
        MAIN_OBJECTS_IN_PARAMETER(0)

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _T("Collision"),
                   _T("Teste la collision entre deux objets en utilisant leurs masques de collisions.\nNotez que certains objets peuvent ne pas avoir de masque de collisions.\nD'autres, comme les Sprites, proposent des conditions de collisions plus précises."),
                   _T("_PARAM0_ est en collision avec _PARAM1_ ( Masques de collisions )"),
                   _T("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png",
                   &CondHBCollision);

        DECLARE_PARAMETER("object", _T("Objet"), true, "")
        DECLARE_PARAMETER("object", _T("Objet"), true, "")

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("Count", _T("Nombre d'objets"), _T("Compte le nombre d'objets indiqué actuellement concernés"), _T("Objets"), "res/conditions/nbObjet.png", &ExpGetObjectCount)
        DECLARE_PARAMETER("object", _T("Objet"), true, "")
    DECLARE_END_EXPRESSION()
}
