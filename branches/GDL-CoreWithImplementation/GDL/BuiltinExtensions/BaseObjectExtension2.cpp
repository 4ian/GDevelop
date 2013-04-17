#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"

void BaseObjectExtension::DeclareExtensionSecondPart()
{
    #if defined(GD_IDE_ONLY)
    DECLARE_ACTION("Create",
                   _("Create an object"),
                   _("Create an object at specified position"),
                   _("Create object _PARAM3_ at position _PARAM4_;_PARAM5_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameterWithoutPicking", "3");
        instrInfo.AddCodeOnlyParameter("inlineCode", "0"); //Useless parameter
        instrInfo.AddParameter("object", _("Object to create"), "", false);
        instrInfo.AddParameter("expression", _("X position"), "", false);
        instrInfo.AddParameter("expression", _("Y position"), "", false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("CreateObjectOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("CreateByName",
                   _("Create an object from its name"),
                   _("Among the objects of the specified group, the action will create the object with the specified name."),
                   _("Among objects _PARAM2_, create object named _PARAM3_ at position _PARAM4_;_PARAM5_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameterWithoutPicking", "2");
        instrInfo.AddParameter("object", _("Groups containing objects which can be created by the action"), "", false);
        instrInfo.AddParameter("string", _("Text representing the name of the object to create"), "", false);
        instrInfo.AddParameter("expression", _("X position"), "", false);
        instrInfo.AddParameter("expression", _("Y position"), "", false);
        instrInfo.AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"");

        instrInfo.cppCallingInformation.SetFunctionName("CreateObjectFromGroupOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3");
        instrInfo.AddCodeOnlyParameter("inlineCode", "0");
        instrInfo.AddParameter("object", _("Object"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3");
        instrInfo.AddCodeOnlyParameter("inlineCode", "0");
        instrInfo.AddParameter("object", _("Object"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("MoveObjects",
                   _("Make objects moving"),
                   _("Moves the objects according to the forces they have.Game Develop call this action at the end of the events by default."),
                   _("Make objects moving"),
                   _("Displacement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("MoveObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("SeDirige",
                   _("An object is moving to another"),
                   _("Test if an object moves towards another.\nThe first object must move."),
                   _("_PARAM0_ is moving to _PARAM1_"),
                   _("Displacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png");

        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddParameter("object", _("Object 2"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");
        instrInfo.AddParameter("expression", _("Angle of tolerance"), "", false);
        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("MovesToward").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Distance",
                   _("Distance between two objects"),
                   _("Test the distance between two objects."),
                   _("The distance between _PARAM0_ and _PARAM1_ is _PARAM5__PARAM4_"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png");

        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddParameter("object", _("Object 2"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");
        instrInfo.AddParameter("expression", _("Distance"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);
        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("DistanceBetweenObjects").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3");
        instrInfo.AddCodeOnlyParameter("inlineCode", "0");
        instrInfo.AddParameter("object", _("Object"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3");
        instrInfo.AddCodeOnlyParameter("inlineCode", "0");
        instrInfo.AddParameter("object", _("Object"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("NbObjet",
                   _("Number of objects"),
                   _("Test the number of concerned objects."),
                   _("The number of _PARAM0_ is _PARAM3__PARAM2_"),
                   _("Objects"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png");

        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddParameter("expression", _("Value to test"), "", false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("PickedObjectsCount").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _("Collision"),
                   _("Test the collision between two objects using their collision mask.\nNote that some objects may not have a collision mask.\nSome others, like Sprite, provide also more precise collision conditions."),
                   _("_PARAM0_ is in collision with _PARAM1_ ( Collision masks )"),
                   _("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png");

        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1");
        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("HitBoxesCollision").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

    DECLARE_END_CONDITION()

    DECLARE_EXPRESSION("Count", _("Number of objects"), _("Count the number of specified objects currently concerned"), _("Objects"), "res/conditions/nbObjet.png")
        instrInfo.AddParameter("object", _("Object"), "", false);
        instrInfo.AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0");

        instrInfo.cppCallingInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");
    DECLARE_END_EXPRESSION()
    #endif
}

