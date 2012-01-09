#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
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
                   &DestroyBaseObject,
                   "");

        #if defined(GD_IDE_ONLY)
        DECLARE_OBJECT_CONDITION("PosX",
                       _("Tester la position X d'un objet"),
                       _("Teste si la position X de l'objet correspond au test effectué."),
                       _("La position X de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position X"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetX").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreX",
                       _("Position X d'un objet"),
                       _("Change la position x d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à la position X de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Valeur"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetX").SetManipulatedType("number").SetAssociatedGetter("GetX");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("PosY",
                       _("Tester la position Y d'un objet"),
                       _("Teste si la position Y de l'objet correspond au test effectué."),
                       _("La position Y de l'objet _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Position"),
                       "res/conditions/position24.png",
                       "res/conditions/position.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position Y"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("GetY").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("MettreY",
                       _("Position Y d'un objet"),
                       _("Change la position Y d'un objet."),
                       _("Faire _PARAM2__PARAM1_ à la position Y de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Valeur"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetY").SetManipulatedType("number").SetAssociatedGetter("GetY");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreXY",
                       _("Position d'un objet"),
                       _("Change la position d'un objet."),
                       _("Faire _PARAM2__PARAM1_;_PARAM4__PARAM3_ à la position de l'objet _PARAM0_"),
                       _("Position"),
                       "res/actions/position24.png",
                       "res/actions/position.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position X"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);
            instrInfo.AddParameter("expression", _("Position Y"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("SetXY");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreAutourPos",
                       _("Mettre un objet autour d'une position"),
                       _("Positionne un objet autour d'une position, avec l'angle et la distance indiquée."),
                       _("Mettre _PARAM0_ autour de _PARAM1_;_PARAM2_ à _PARAM4_° et à _PARAM3_ pixels de distance"),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position X"), "", false);
            instrInfo.AddParameter("expression", _("Position Y"), "", false);
            instrInfo.AddParameter("expression", _("Distance"), "", false);
            instrInfo.AddParameter("expression", _("Angle en degré"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("PutAroundAPosition");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceXY",
                       _("Ajouter une force à un objet"),
                       _("Ajouter une force à un objet. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui. Cette action créé la force en utilisant des coordonnées X et Y."),
                       _("Ajouter à _PARAM0_ une force de _PARAM1_ p/s en X et _PARAM2_ p/s en Y"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Déplacement en X"), "", false);
            instrInfo.AddParameter("expression", _("Déplacement en Y"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("AddForce");

        DECLARE_END_OBJECT_ACTION()
        DECLARE_OBJECT_ACTION("AddForceAL",
                       _("Ajouter une force ( Par angle )"),
                       _("Ajouter une force à un objet. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui. Cette action créé la force en utilisant l'angle et la longueur indiquée."),
                       _("Ajouter à _PARAM0_ une force d'angle _PARAM1_° et de longueur _PARAM2_ pixels"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Angle"), "", false);
            instrInfo.AddParameter("expression", _("Longueur ( en pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("AddForceUsingPolarCoordinates");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceVersPos",
                       _("Ajouter une force dirigée vers une position"),
                       _("Ajouter une force à un objet pour qu'il se dirige vers la position."),
                       _("Diriger _PARAM0_ vers _PARAM1_;_PARAM2_ avec une force de longueur _PARAM3_ pixels"),
                       _("Déplacement"),
                       "res/actions/force24.png",
                       "res/actions/force.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position X"), "", false);
            instrInfo.AddParameter("expression", _("Position Y"), "", false);
            instrInfo.AddParameter("expression", _("Longueur ( en pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AddForceTowardPosition");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceTournePos",
                       _("Ajouter une force pour tourner autour d'une position"),
                       _("Ajouter une force à un objet pour qu'il tourne autour d'une position.\nNotez que le déplacement n'est pas forcément précis, notamment si la vitesse est élevée.\nPour positionner de façon parfaite un objet autour d'une position, utilisez les actions de la catégorie Position."),
                       _("Faire tourner _PARAM0_ autour de _PARAM1_;_PARAM2_ à _PARAM3_°/sec et à _PARAM4_ pixels de distance"),
                       _("Déplacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Position X du point autour duquel tourner"), "", false);
            instrInfo.AddParameter("expression", _("Position Y du point autour duquel tourner"), "", false);
            instrInfo.AddParameter("expression", _("Vitesse ( en Degrés par secondes )"), "", false);
            instrInfo.AddParameter("expression", _("Distance ( en pixels )"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AddForceToMoveAround");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Arreter",
                       _("Arrêter l'objet"),
                       _("Arrête l'objet en supprimant toutes ses forces."),
                       _("Arrêter l'objet _PARAM0_"),
                       _("Déplacement"),
                       "res/actions/arreter24.png",
                       "res/actions/arreter.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("ClearForce");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Delete",
                       _("Supprimer un objet"),
                       _("Supprime l'objet indiqué."),
                       _("Supprimer l'objet _PARAM0_"),
                       _("Objets"),
                       "res/actions/delete24.png",
                       "res/actions/delete.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddCodeOnlyParameter("currentScene","");

            instrInfo.cppCallingInformation.SetFunctionName("DeleteFromScene");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Duplicate",
                       _("Dupliquer un objet"),
                       _("Crée une copie d'un objet ( même position, même animation... )."),
                       _("Dupliquer l'objet _PARAM0_"),
                       _("Objets"),
                       "res/actions/duplicate24.png",
                       "res/actions/duplicate.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddCodeOnlyParameter("currentScene", "");
            instrInfo.AddCodeOnlyParameter("listsOfObjectsOfParameter", "0");

            instrInfo.cppCallingInformation.SetFunctionName("Duplicate");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangePlan",
                       _("Changer le plan d'un objet"),
                       _("Modifier le numéro du plan d'un objet"),
                       _("Faire _PARAM2__PARAM1_ au plan de _PARAM0_"),
                       _("Plan"),
                       "res/actions/planicon24.png",
                       "res/actions/planicon.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Valeur"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("SetZOrder").SetAssociatedGetter("GetZOrder").SetManipulatedType("number");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ChangeLayer",
                       _("Changer le calque sur lequel est un objet"),
                       _("Change le calque sur lequel est actuellement situé l'objet."),
                       _("Mettre _PARAM0_ sur le calque _PARAM1_"),
                       _("Calques et caméras"),
                       "res/actions/layer24.png",
                       "res/actions/layer.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("layer", _("Mettre sur le calque ( calque de base si vide )"), "", false).SetDefaultValue("\"\"");

            instrInfo.cppCallingInformation.SetFunctionName("SetLayer");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjet",
                       _("Modifier une variable d'un objet"),
                       _("Modifie la valeur d'une variable d'un objet."),
                       _("Faire _PARAM3__PARAM2_ à la variable _PARAM1_ de l'objet _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);
            instrInfo.AddParameter("expression", _("Valeur"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.ObtainVariable").SetManipulatedType("number");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("ModVarObjetTxt",
                       _("Modifier le texte d'une variable d'un objet"),
                       _("Modifie le texte d'une variable d'un objet."),
                       _("Faire _PARAM3__PARAM2_ au texte de la variable _PARAM1_ de _PARAM0_"),
                       _("Variables"),
                       "res/actions/var24.png",
                       "res/actions/var.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);
            instrInfo.AddParameter("string", _("Texte"), "", false);
            instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.ObtainVariable").SetManipulatedType("string");

        DECLARE_END_OBJECT_ACTION()


        DECLARE_OBJECT_ACTION("Cache",
                       _("Cacher un objet ( rendre invisible )"),
                       _("Rend invisible l'objet indiqué."),
                       _("Cacher l'objet _PARAM0_"),
                       _("Visibilité"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("SetHidden");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Montre",
                       _("Montrer un objet ( rendre visible )"),
                       _("Rend visible l'objet indiqué ( si il a été précedemment rendu invisible )"),
                       _("Montrer l'objet _PARAM0_"),
                       _("Visibilité"),
                       "res/actions/visibilite24.png",
                       "res/actions/visibilite.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddCodeOnlyParameter("inlineCode", "false");

            instrInfo.cppCallingInformation.SetFunctionName("SetHidden");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_CONDITION("Plan",
                       _("Tester le plan d'un objet"),
                       _("Teste si le plan de l'objet correspond au test effectué."),
                       _("Le plan de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Plan"),
                       "res/conditions/planicon.png",
                       "res/conditions/planicon.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Plan"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Layer",
                       _("Tester le calque d'un objet"),
                       _("Teste si l'objet est sur le calque indiqué."),
                       _("_PARAM0_ est sur le calque _PARAM1_"),
                       _("Calque"),
                       "res/conditions/layer24.png",
                       "res/conditions/layer.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("layer", _("Calque"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetLayer").SetManipulatedType("string");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Visible",
                       _("Visibilité d'un objet"),
                       _("Teste si un objet est visible ( non masqué )."),
                       _("L'objet _PARAM0_ est visible"),
                       _("Visibilité"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsVisible");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Invisible",
                       _("Invisibilité d'un objet"),
                       _("Teste si un objet est invisible ( masqué )."),
                       _("L'objet _PARAM0_ est invisible"),
                       _("Visibilité"),
                       "res/conditions/visibilite24.png",
                       "res/conditions/visibilite.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsHidden");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Arret",
                       _("L'objet est à l'arrêt"),
                       _("Teste si l'objet ne bouge pas."),
                       _("L'objet _PARAM0_ est à l'arrêt"),
                       _("Déplacement"),
                       "res/conditions/arret24.png",
                       "res/conditions/arret.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("IsStopped");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("Vitesse",
                       _("Vitesse de l'objet"),
                       _("Teste si la vitesse globale de l'objet correspond au test effectué."),
                       _("La vitesse de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                       _("Déplacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Vitesse"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AngleOfDisplacement",
                       _("Angle de déplacement"),
                       _("Teste l'angle de déplacement d'un objet"),
                       _("L'angle de déplacement de _PARAM0_ est de _PARAM1_ ( Tolérance : _PARAM2_° )"),
                       _("Déplacement"),
                       "res/conditions/vitesse24.png",
                       "res/conditions/vitesse.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("expression", _("Angle ( en degrés )"), "", false);
            instrInfo.AddParameter("expression", _("Tolérance"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TestAngleOfDisplacement");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjet",
                       _("Variable d'un objet"),
                       _("Teste si la valeur d'une variable d'un objet correspond au test effectué."),
                       _("La variable _PARAM1_ de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);
            instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.ObtainVariable").SetManipulatedType("number");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetTxt",
                       _("Texte d'une variable d'un objet"),
                       _("Teste si le texte de la variable d'un objet correspond au test effectué."),
                       _("Le texte de la variable _PARAM1_ de _PARAM0_ est _PARAM3_ à _PARAM2_"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);
            instrInfo.AddParameter("string", _("Texte à tester"), "", false);
            instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.ObtainVariable").SetManipulatedType("string");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("VarObjetDef",
                       _("Variable définie"),
                       _("Teste si une variable d'un objet existe."),
                       _("La variable _PARAM1_ de _PARAM0_ est définie"),
                       _("Variables"),
                       "res/conditions/var24.png",
                       "res/conditions/var.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);


            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.HasVariable");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_CONDITION("AutomatismActivated",
                       _("Automatisme activé"),
                       _("Renvoi vrai si l'automatisme spécifié est activé pour l'objet."),
                       _("L'automatisme _PARAM1_ de _PARAM0_ est activé"),
                       _("Automatismes"),
                       "res/automatism24.png",
                       "res/automatism16.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("automatism", _("Automatisme"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("AutomatismActivated");

        DECLARE_END_OBJECT_CONDITION()

        DECLARE_OBJECT_ACTION("ActivateAutomatism",
                       _("De/Activer un automatisme"),
                       _("Dés/active l'automatisme spécifié pour l'objet."),
                       _("Activer l'automatisme _PARAM1_ de _PARAM0_ : _PARAM2_"),
                       _("Automatismes"),
                       "res/automatism24.png",
                       "res/automatism16.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("automatism", _("Automatisme"), "", false);
            instrInfo.AddParameter("yesorno", _("Activer ?"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("ActivateAutomatism");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceVers",
                       _("Ajouter une force dirigée vers un objet"),
                       _("Ajoute une force à un objet pour qu'il se dirige vers un autre. L'objet bougera ensuite en fonction de\ntoutes les forces qui s'exercent sur lui."),
                       _("Diriger _PARAM0_ vers _PARAM1_ avec une force de longueur _PARAM2_ pixels"),
                       _("Déplacement"),
                       "res/actions/forceVers24.png",
                       "res/actions/forceVers.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet vers lequel se diriger"), "", false);
            instrInfo.AddParameter("expression", _("Longueur en pixel"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("AddForceTowardObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("AddForceTourne",
                       _("Ajouter une force pour tourner autour d'un objet"),
                       _("Ajoute une force à un objet pour qu'il tourne autour d'un autre.\nNotez que le déplacement n'est pas forcément précis, notamment si la vitesse est élevée.\nPour positionner de façon parfaite un objet autour d'un autre, utilisez les actions de la catégorie Position."),
                       _("Faire tourner _PARAM0_ autour de _PARAM1_ à _PARAM2_°/sec et à _PARAM3_ pixels de distance"),
                       _("Déplacement"),
                       "res/actions/forceTourne24.png",
                       "res/actions/forceTourne.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet autour duquel tourner"), "", false);
            instrInfo.AddParameter("expression", _("Vitesse ( Degrés par secondes )"), "", false);
            instrInfo.AddParameter("expression", _("Distance ( en pixel )"), "", false);
            instrInfo.AddParameter("expression", _("Dissipation ( 0 par défaut )"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("MettreAutour",
                       _("Mettre un objet autour d'un autre"),
                       _("Positionne un objet autour d'un autre, avec l'angle et la distance indiquée."),
                       _("Mettre _PARAM0_ autour de _PARAM1_ à _PARAM3_° et à _PARAM2_ pixels de distance"),
                       _("Position"),
                       "res/actions/positionAutour24.png",
                       "res/actions/positionAutour.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet autour duquel positionner le premier"), "", false);
            instrInfo.AddParameter("expression", _("Distance"), "", false);
            instrInfo.AddParameter("expression", _("Angle en degré"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("PutAroundObject").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Rebondir",
                       _("Ecarter un objet d'un autre"),
                       _("Ecarte un objet d'un autre, en utilisant les forces."),
                       _("Ecarter _PARAM0_ de _PARAM1_ ( seul _PARAM0_ bougera )"),
                       _("Déplacement"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet 2 ( Ne bougera pas )"), "", false);
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_ACTION("Ecarter",
                       _("Ecarter un objet d'un autre"),
                       _("Ecarte un objet d'un autre sans utiliser les forces."),
                       _("Ecarter _PARAM0_ de _PARAM2_ ( seul _PARAM0_ bougera )"),
                       _("Position"),
                       "res/actions/ecarter24.png",
                       "res/actions/ecarter.png");

            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet 2 ( Ne bougera pas )"), "", false);
            instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

        DECLARE_END_OBJECT_ACTION()

        DECLARE_OBJECT_EXPRESSION("X", _("Position X"), _("Position X de l'objet"), _("Position"), "res/actions/position.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetX");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Y", _("Position Y"), _("Position Y de l'objet"), _("Position"), "res/actions/position.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetY");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceX", _("Force moyenne en X"), _("Force moyenne en X"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceX");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceY", _("Force moyenne en Y"), _("Force moyenne en Y"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceY");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceAngle", _("Angle moyen des forces"), _("Angle moyen des forces"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceAngle");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Angle", _("Angle moyen des forces"), _("Angle moyen des forces"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("TotalForceAngle");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ForceLength", _("Longueur moyenne des forces"), _("Longueur moyenne des forces"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Longueur", _("Longueur moyenne des forces"), _("Longueur moyenne des forces"), _("Déplacement"), "res/actions/force.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("TotalForceLength");
        DECLARE_END_OBJECT_EXPRESSION()


        DECLARE_OBJECT_EXPRESSION("Width", _("Largeur d'un objet"), _("Largeur d'un objet"), _("Taille"), "res/actions/scaleWidth.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetWidth");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Largeur", _("Largeur d'un objet"), _("Largeur d'un objet"), _("Taille"), "res/actions/scaleWidth.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetWidth");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Height", _("Hauteur d'un objet"), _("Hauteur d'un objet"), _("Taille"), "res/actions/scaleHeight.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetHeight");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Hauteur", _("Hauteur d'un objet"), _("Hauteur d'un objet"), _("Taille"), "res/actions/scaleHeight.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetHeight");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("ZOrder", _("Plan d'un objet"), _("Plan d'un objet"), _("Visibilité"), "res/actions/planicon.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Plan", _("Plan d'un objet"), _("Plan d'un objet"), _("Visibilité"), "res/actions/planicon.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);

            instrInfo.SetHidden();
            instrInfo.cppCallingInformation.SetFunctionName("GetZOrder");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Distance", _("Distance entre deux objets"), _("Distance entre deux objets"), _("Position"), "res/conditions/distance.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("GetDistanceWithObject");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("SqDistance", _("Distance au carré entre deux objets"), _("Distance au carré entre deux objets"), _("Position"), "res/conditions/distance.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddCodeOnlyParameter("ptrToObjectOfParameter", "1");

            instrInfo.cppCallingInformation.SetFunctionName("GetSqDistanceWithObject");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_EXPRESSION("Variable", _("Variable d'un objet"), _("Variable d'un objet"), _("Variables"), "res/actions/var.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.GetVariableValue");
        DECLARE_END_OBJECT_EXPRESSION()

        DECLARE_OBJECT_STR_EXPRESSION("VariableString", _("Variable d'un objet"), _("Texte d'une variable d'un objet"), _("Variables"), "res/actions/var.png")
            instrInfo.AddParameter("object", _("Objet"), "", false);
            instrInfo.AddParameter("objectvar", _("Nom de la variable"), "", false);

            instrInfo.cppCallingInformation.SetFunctionName("variablesObjet.GetVariableString");
        DECLARE_END_OBJECT_STR_EXPRESSION()
        #endif

    DECLARE_END_OBJECT()
}
