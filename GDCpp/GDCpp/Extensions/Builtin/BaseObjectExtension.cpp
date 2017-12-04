#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/Builtin/BaseObjectExtension.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/BaseObjectExtension.cpp"
#endif

BaseObjectExtension::BaseObjectExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(*this);

    gd::ObjectMetadata & obj = GetObjectMetadata("");
    AddRuntimeObject<gd::Object, RuntimeObject>(obj, "");

    #if defined(GD_IDE_ONLY)
    std::map<gd::String, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("");
    std::map<gd::String, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("");
    std::map<gd::String, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("");
    std::map<gd::String, gd::ExpressionMetadata > & objectStrExpressions = GetAllStrExpressionsForObject("");

    objectConditions["PosX"].SetFunctionName("GetX").SetManipulatedType("number");
    objectActions["MettreX"].SetFunctionName("SetX").SetManipulatedType("number").SetGetter("GetX");
    objectConditions["PosY"].SetFunctionName("GetY").SetManipulatedType("number");
    objectActions["MettreY"].SetFunctionName("SetY").SetManipulatedType("number").SetGetter("GetY");
    objectActions["MettreXY"].SetFunctionName("SetXY");
    objectConditions["Angle"].SetFunctionName("GetAngle");

    objectActions["SetAngle"].SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle");
    objectActions["Rotate"].SetFunctionName("Rotate");
    objectActions["RotateTowardAngle"].SetFunctionName("RotateTowardAngle");
    objectActions["RotateTowardPosition"].SetFunctionName("RotateTowardPosition");

    objectActions["MettreAutourPos"].SetFunctionName("PutAroundAPosition");
    objectActions["AddForceXY"].SetFunctionName("AddForce");
    objectActions["AddForceAL"].SetFunctionName("AddForceUsingPolarCoordinates");
    objectActions["AddForceVersPos"].SetFunctionName("AddForceTowardPosition");
    objectActions["AddForceTournePos"].SetFunctionName("AddForceToMoveAround");
    objectActions["Arreter"].SetFunctionName("ClearForce");
    objectActions["Delete"].SetFunctionName("DeleteFromScene");
    objectActions["ChangePlan"].SetFunctionName("SetZOrder").SetGetter("GetZOrder").SetManipulatedType("number");
    objectActions["ChangeLayer"].SetFunctionName("SetLayer");

    objectActions["ModVarObjet"].SetFunctionName("ReturnVariable").SetManipulatedType("number");
    objectActions["ModVarObjetTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string");
    objectConditions["ObjectVariableChildExists"].SetFunctionName("VariableChildExists");
    objectActions["ObjectVariableRemoveChild"].SetFunctionName("VariableRemoveChild");
    objectActions["ObjectVariableClearChildren"].SetFunctionName("VariableClearChildren");

    objectActions["Cache"].SetFunctionName("SetHidden");
    objectActions["Montre"].SetFunctionName("SetHidden");

    objectConditions["Plan"].SetFunctionName("GetZOrder").SetManipulatedType("number");
    objectConditions["Layer"].SetFunctionName("IsOnLayer");
    objectConditions["Visible"].SetFunctionName("IsVisible");
    objectConditions["Invisible"].SetFunctionName("IsHidden");
    objectConditions["Arret"].SetFunctionName("IsStopped");
    objectConditions["Vitesse"].SetFunctionName("TotalForceLength").SetManipulatedType("number");
    objectConditions["AngleOfDisplacement"].SetFunctionName("TestAngleOfDisplacement");
    objectConditions["VarObjet"].SetFunctionName("ReturnVariable").SetManipulatedType("number");
    objectConditions["VarObjetTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string");
    objectConditions["VarObjetDef"].SetFunctionName("VariableExists");
    objectConditions["BehaviorActivated"].SetFunctionName("BehaviorActivated");
    objectActions["ActivateBehavior"].SetFunctionName("ActivateBehavior");
    objectActions["AddForceVers"].SetFunctionName("AddForceTowardObject").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectActions["AddForceTourne"].SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectActions["MettreAutour"].SetFunctionName("PutAroundObject").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectActions["Rebondir"].SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectActions["Ecarter"].SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectActions["SeparateFromObjects"].SetFunctionName("SeparateFromObjects").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    objectConditions["CollisionPoint"].SetFunctionName("IsCollidingWithPoint");


    objectExpressions["X"].SetFunctionName("GetX");
    objectExpressions["Y"].SetFunctionName("GetY");
    objectExpressions["ForceX"].SetFunctionName("TotalForceX");
    objectExpressions["ForceY"].SetFunctionName("TotalForceY");
    objectExpressions["ForceAngle"].SetFunctionName("TotalForceAngle");
    objectExpressions["Angle"].SetFunctionName("GetAngle");
    objectExpressions["ForceLength"].SetFunctionName("TotalForceLength");
    objectExpressions["Longueur"].SetFunctionName("TotalForceLength");
    objectExpressions["Width"].SetFunctionName("GetWidth");
    objectExpressions["Largeur"].SetFunctionName("GetWidth");
    objectExpressions["Height"].SetFunctionName("GetHeight");
    objectExpressions["Hauteur"].SetFunctionName("GetHeight");
    objectExpressions["ZOrder"].SetFunctionName("GetZOrder");
    objectExpressions["Plan"].SetFunctionName("GetZOrder");
    objectExpressions["Distance"].SetFunctionName("GetDistanceWithObject");
    objectExpressions["SqDistance"].SetFunctionName("GetSqDistanceWithObject");
    objectExpressions["Variable"].SetFunctionName("GetVariableValue").SetStatic();
    objectStrExpressions["VariableString"].SetFunctionName("GetVariableString").SetStatic();
    objectExpressions["VariableChildCount"].SetFunctionName("GetVariableChildCount");

    GetAllActions()["Create"].SetFunctionName("CreateObjectOnScene").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["CreateByName"].SetFunctionName("CreateObjectFromGroupOnScene").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["AjoutObjConcern"].SetFunctionName("PickAllObjects").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["AjoutHasard"].SetFunctionName("PickRandomObject").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["MoveObjects"].SetFunctionName("MoveObjects").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllConditions()["SeDirige"].SetFunctionName("MovesToward").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    GetAllConditions()["Distance"].SetFunctionName("DistanceBetweenObjects").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    GetAllConditions()["AjoutObjConcern"].SetFunctionName("PickAllObjects").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["AjoutHasard"].SetFunctionName("PickRandomObject").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["PickNearest"].SetFunctionName("PickNearestObject").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["NbObjet"].SetFunctionName("PickedObjectsCount").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    GetAllConditions()["CollisionNP"].SetFunctionName("HitBoxesCollision").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    GetAllConditions()["EstTourne"].SetFunctionName("ObjectsTurnedToward").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");

    GetAllExpressions()["Count"].SetFunctionName("PickedObjectsCount").SetIncludeFile("GDCpp/Extensions/Builtin/ObjectTools.h");
    #endif
}
