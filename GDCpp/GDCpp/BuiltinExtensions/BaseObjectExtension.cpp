#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCpp/BuiltinExtensions/BaseObjectExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCpp/Object.h"
#include "GDCpp/RuntimeObject.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/BaseObjectExtension.cpp"
#endif

BaseObjectExtension::BaseObjectExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(*this);

    gd::ObjectMetadata & obj = GetObjectMetadata("");
    AddRuntimeObject(obj, "", &CreateBaseRuntimeObject, &DestroyBaseRuntimeObject);

    #if defined(GD_IDE_ONLY)
    std::map<std::string, gd::InstructionMetadata > & objectActions = GetAllActionsForObject("");
    std::map<std::string, gd::InstructionMetadata > & objectConditions = GetAllConditionsForObject("");
    std::map<std::string, gd::ExpressionMetadata > & objectExpressions = GetAllExpressionsForObject("");
    std::map<std::string, gd::ExpressionMetadata > & objectStrExpressions = GetAllStrExpressionsForObject("");

    objectConditions["PosX"].codeExtraInformation.SetFunctionName("GetX").SetManipulatedType("number");
    objectActions["MettreX"].codeExtraInformation.SetFunctionName("SetX").SetManipulatedType("number").SetAssociatedGetter("GetX");
    objectConditions["PosY"].codeExtraInformation.SetFunctionName("GetY").SetManipulatedType("number");
    objectActions["MettreY"].codeExtraInformation.SetFunctionName("SetY").SetManipulatedType("number").SetAssociatedGetter("GetY");
    objectActions["MettreXY"].codeExtraInformation.SetFunctionName("SetXY");
    objectConditions["Angle"].codeExtraInformation.SetFunctionName("GetAngle");

    objectActions["SetAngle"].codeExtraInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle");
    objectActions["Rotate"].codeExtraInformation.SetFunctionName("Rotate");
    objectActions["RotateTowardAngle"].codeExtraInformation.SetFunctionName("RotateTowardAngle");
    objectActions["RotateTowardPosition"].codeExtraInformation.SetFunctionName("RotateTowardPosition");

    objectActions["MettreAutourPos"].codeExtraInformation.SetFunctionName("PutAroundAPosition");
    objectActions["AddForceXY"].codeExtraInformation.SetFunctionName("AddForce");
    objectActions["AddForceAL"].codeExtraInformation.SetFunctionName("AddForceUsingPolarCoordinates");
    objectActions["AddForceVersPos"].codeExtraInformation.SetFunctionName("AddForceTowardPosition");
    objectActions["AddForceTournePos"].codeExtraInformation.SetFunctionName("AddForceToMoveAround");
    objectActions["Arreter"].codeExtraInformation.SetFunctionName("ClearForce");
    objectActions["Delete"].codeExtraInformation.SetFunctionName("DeleteFromScene");
    objectActions["ChangePlan"].codeExtraInformation.SetFunctionName("SetZOrder").SetAssociatedGetter("GetZOrder").SetManipulatedType("number");
    objectActions["ChangeLayer"].codeExtraInformation.SetFunctionName("SetLayer");

    objectActions["ModVarObjet"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");
    objectActions["ModVarObjetTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");
    objectConditions["ObjectVariableChildExists"].codeExtraInformation.SetFunctionName("VariableChildExists");
    objectActions["ObjectVariableRemoveChild"].codeExtraInformation.SetFunctionName("VariableRemoveChild");

    objectActions["Cache"].codeExtraInformation.SetFunctionName("SetHidden");
    objectActions["Montre"].codeExtraInformation.SetFunctionName("SetHidden");

    objectConditions["Plan"].codeExtraInformation.SetFunctionName("GetZOrder").SetManipulatedType("number");
    objectConditions["Layer"].codeExtraInformation.SetFunctionName("IsOnLayer");
    objectConditions["Visible"].codeExtraInformation.SetFunctionName("IsVisible");
    objectConditions["Invisible"].codeExtraInformation.SetFunctionName("IsHidden");
    objectConditions["Arret"].codeExtraInformation.SetFunctionName("IsStopped");
    objectConditions["Vitesse"].codeExtraInformation.SetFunctionName("TotalForceLength").SetManipulatedType("number");
    objectConditions["AngleOfDisplacement"].codeExtraInformation.SetFunctionName("TestAngleOfDisplacement");
    objectConditions["VarObjet"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number");
    objectConditions["VarObjetTxt"].codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string");
    objectConditions["VarObjetDef"].codeExtraInformation.SetFunctionName("VariableExists");
    objectConditions["AutomatismActivated"].codeExtraInformation.SetFunctionName("AutomatismActivated");
    objectActions["ActivateAutomatism"].codeExtraInformation.SetFunctionName("ActivateAutomatism");
    objectActions["AddForceVers"].codeExtraInformation.SetFunctionName("AddForceTowardObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    objectActions["AddForceTourne"].codeExtraInformation.SetFunctionName("AddForceToMoveAroundObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    objectActions["MettreAutour"].codeExtraInformation.SetFunctionName("PutAroundObject").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    objectActions["Rebondir"].codeExtraInformation.SetFunctionName("SeparateObjectsWithForces").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    objectActions["Ecarter"].codeExtraInformation.SetFunctionName("SeparateObjectsWithoutForces").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    objectActions["SeparateFromObjects"].codeExtraInformation.SetFunctionName("SeparateFromObjects").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");


    objectExpressions["X"].codeExtraInformation.SetFunctionName("GetX");
    objectExpressions["Y"].codeExtraInformation.SetFunctionName("GetY");
    objectExpressions["ForceX"].codeExtraInformation.SetFunctionName("TotalForceX");
    objectExpressions["ForceY"].codeExtraInformation.SetFunctionName("TotalForceY");
    objectExpressions["ForceAngle"].codeExtraInformation.SetFunctionName("TotalForceAngle");
    objectExpressions["Angle"].codeExtraInformation.SetFunctionName("GetAngle");
    objectExpressions["ForceLength"].codeExtraInformation.SetFunctionName("TotalForceLength");
    objectExpressions["Longueur"].codeExtraInformation.SetFunctionName("TotalForceLength");
    objectExpressions["Width"].codeExtraInformation.SetFunctionName("GetWidth");
    objectExpressions["Largeur"].codeExtraInformation.SetFunctionName("GetWidth");
    objectExpressions["Height"].codeExtraInformation.SetFunctionName("GetHeight");
    objectExpressions["Hauteur"].codeExtraInformation.SetFunctionName("GetHeight");
    objectExpressions["ZOrder"].codeExtraInformation.SetFunctionName("GetZOrder");
    objectExpressions["Plan"].codeExtraInformation.SetFunctionName("GetZOrder");
    objectExpressions["Distance"].codeExtraInformation.SetFunctionName("GetDistanceWithObject");
    objectExpressions["SqDistance"].codeExtraInformation.SetFunctionName("GetSqDistanceWithObject");
    objectExpressions["Variable"].codeExtraInformation.SetFunctionName("GetVariableValue").SetStatic();
    objectStrExpressions["VariableString"].codeExtraInformation.SetFunctionName("GetVariableString").SetStatic();

    GetAllActions()["Create"].codeExtraInformation.SetFunctionName("CreateObjectOnScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["CreateByName"].codeExtraInformation.SetFunctionName("CreateObjectFromGroupOnScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["AjoutObjConcern"].codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["AjoutHasard"].codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["MoveObjects"].codeExtraInformation.SetFunctionName("MoveObjects").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["SeDirige"].codeExtraInformation.SetFunctionName("MovesToward").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    GetAllConditions()["Distance"].codeExtraInformation.SetFunctionName("DistanceBetweenObjects").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    GetAllConditions()["AjoutObjConcern"].codeExtraInformation.SetFunctionName("PickAllObjects").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["AjoutHasard"].codeExtraInformation.SetFunctionName("PickRandomObject").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["NbObjet"].codeExtraInformation.SetFunctionName("PickedObjectsCount").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    GetAllConditions()["CollisionNP"].codeExtraInformation.SetFunctionName("HitBoxesCollision").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    GetAllConditions()["EstTourne"].codeExtraInformation.SetFunctionName("ObjectsTurnedToward").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");

    GetAllExpressions()["Count"].codeExtraInformation.SetFunctionName("PickedObjectsCount").SetIncludeFile("GDCpp/BuiltinExtensions/ObjectTools.h");
    #endif
}

