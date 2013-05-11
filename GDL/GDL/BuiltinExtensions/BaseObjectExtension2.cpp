#include "GDL/BuiltinExtensions/BaseObjectExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"

void BaseObjectExtension::DeclareExtensionSecondPart()
{
    #if defined(GD_IDE_ONLY)
    AddAction("Create",
                   _("Create an object"),
                   _("Create an object at specified position"),
                   _("Create object _PARAM3_ at position _PARAM4_;_PARAM5_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameterWithoutPicking", "3")
        .AddCodeOnlyParameter("inlineCode", "0") //Useless parameter
        .AddParameter("object", _("Object to create"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("CreateObjectOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("CreateByName",
                   _("Create an object from its name"),
                   _("Among the objects of the specified group, the action will create the object with the specified name."),
                   _("Among objects _PARAM2_, create object named _PARAM3_ at position _PARAM4_;_PARAM5_"),
                   _("Objects"),
                   "res/actions/create24.png",
                   "res/actions/create.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameterWithoutPicking", "2")
        .AddParameter("object", _("Groups containing objects which can be created by the action"))
        .AddParameter("string", _("Text representing the name of the object to create"))
        .AddParameter("expression", _("X position"))
        .AddParameter("expression", _("Y position"))
        .AddParameter("layer", _("Layer ( Base layer if empty )"), "", true).SetDefaultValue("\"\"")
        .codeExtraInformation.SetFunctionName("CreateObjectFromGroupOnScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/actions/add24.png",
                   "res/actions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3")
        .AddCodeOnlyParameter("inlineCode", "0")
        .AddParameter("object", _("Object"))
        .codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/actions/ajouthasard24.png",
                   "res/actions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3")
        .AddCodeOnlyParameter("inlineCode", "0")
        .AddParameter("object", _("Object"))
        .codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("MoveObjects",
                   _("Make objects moving"),
                   _("Moves the objects according to the forces they have.Game Develop call this action at the end of the events by default."),
                   _("Make objects moving"),
                   _("Displacement"),
                   "res/actions/doMove24.png",
                   "res/actions/doMove.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("MoveObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("SeDirige",
                   _("An object is moving to another"),
                   _("Test if an object moves towards another.\nThe first object must move."),
                   _("_PARAM0_ is moving to _PARAM1_"),
                   _("Displacement"),
                   "res/conditions/sedirige24.png",
                   "res/conditions/sedirige.png")
        .AddParameter("object", _("Object"))
        .AddParameter("object", _("Object 2"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1")
        .AddParameter("expression", _("Angle of tolerance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("MovesToward").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddCondition("Distance",
                   _("Distance between two objects"),
                   _("Test the distance between two objects."),
                   _("The distance between _PARAM0_ and _PARAM1_ is _PARAM4__PARAM5_"),
                   _("Position"),
                   "res/conditions/distance24.png",
                   "res/conditions/distance.png")
        .AddParameter("object", _("Object"))
        .AddParameter("object", _("Object 2"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Distance"))
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("DistanceBetweenObjects").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddCondition("AjoutObjConcern",
                   _("Consider objects"),
                   _("Pick all objects with this name."),
                   _("Consider all _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/add24.png",
                   "res/conditions/add.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3")
        .AddCodeOnlyParameter("inlineCode", "0")
        .AddParameter("object", _("Object"))
        .codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");



    AddCondition("AjoutHasard",
                   _("Take a random object"),
                   _("Take only one object with this name among all"),
                   _("Take a random _PARAM3_ "),
                   _("Objects"),
                   "res/conditions/ajouthasard24.png",
                   "res/conditions/ajouthasard.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "3")
        .AddCodeOnlyParameter("inlineCode", "0")
        .AddParameter("object", _("Object"))
        .codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");



    AddCondition("NbObjet",
                   _("Number of objects"),
                   _("Test the number of concerned objects."),
                   _("The number of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Objects"),
                   "res/conditions/nbObjet24.png",
                   "res/conditions/nbObjet.png")
        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value to test"))
        .codeExtraInformation.SetFunctionName("PickedObjectsCount").SetManipulatedType("number").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddCondition("CollisionNP", //"CollisionNP" cames from an old condition to test collision between two sprites non precisely.
                   _("Collision"),
                   _("Test the collision between two objects using their collision mask.\nNote that some objects may not have a collision mask.\nSome others, like Sprite, provide also more precise collision conditions."),
                   _("_PARAM0_ is in collision with _PARAM1_ ( Collision masks )"),
                   _("Collision"),
                   "res/conditions/collision24.png",
                   "res/conditions/collision.png")
        .AddParameter("object", _("Object"))
        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "1")
        .AddCodeOnlyParameter("conditionInverted", "")
        .codeExtraInformation.SetFunctionName("HitBoxesCollision").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");



    AddExpression("Count", _("Number of objects"), _("Count the number of specified objects currently concerned"), _("Objects"), "res/conditions/nbObjet.png")
        .AddParameter("object", _("Object"))
        .AddCodeOnlyParameter("mapOfObjectListsOfParameter", "0")
        .codeExtraInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDL/BuiltinExtensions/ObjectTools.h");

    #endif
}

