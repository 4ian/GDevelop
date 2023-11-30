/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BaseObjectExtension.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

BaseObjectExtension::BaseObjectExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(*this);

  std::map<gd::String, gd::InstructionMetadata> &objectActions =
      GetAllActionsForObject("");
  std::map<gd::String, gd::InstructionMetadata> &objectConditions =
      GetAllConditionsForObject("");
  std::map<gd::String, gd::ExpressionMetadata> &objectExpressions =
      GetAllExpressionsForObject("");
  std::map<gd::String, gd::ExpressionMetadata> &objectStrExpressions =
      GetAllStrExpressionsForObject("");

  objectActions["MettreX"].SetFunctionName("setX").SetGetter("getX");
  objectActions["MettreY"].SetFunctionName("setY").SetGetter("getY");
  objectConditions["PosX"].SetFunctionName("getX").SetIncludeFile(
      "runtimeobject.js");
  objectConditions["PosY"].SetFunctionName("getY").SetIncludeFile(
      "runtimeobject.js");
  objectConditions["CenterX"].SetFunctionName("getCenterXInScene");
  objectConditions["CenterY"].SetFunctionName("getCenterYInScene");
  objectActions["SetCenterX"]
      .SetFunctionName("setCenterXInScene")
      .SetGetter("getCenterXInScene");
  objectActions["SetCenterY"]
      .SetFunctionName("setCenterYInScene")
      .SetGetter("getCenterYInScene");
  objectActions["SetAngle"].SetFunctionName("setAngle").SetGetter("getAngle");
  objectConditions["Angle"].SetFunctionName("getAngle");
  objectConditions["BoundingBoxLeft"].SetFunctionName("getAABBLeft");
  objectConditions["BoundingBoxTop"].SetFunctionName("getAABBTop");
  objectConditions["BoundingBoxRight"].SetFunctionName("getAABBRight");
  objectConditions["BoundingBoxBottom"].SetFunctionName("getAABBBottom");
  objectConditions["BoundingBoxCenterX"].SetFunctionName("getAABBCenterX");
  objectConditions["BoundingBoxCenterY"].SetFunctionName("getAABBCenterY");
  objectActions["Rotate"].SetFunctionName("rotate").SetIncludeFile(
      "runtimeobject.js");
  objectActions["RotateTowardAngle"].SetFunctionName("rotateTowardAngle");
  objectActions["RotateTowardPosition"].SetFunctionName("rotateTowardPosition");
  objectActions["ChangeLayer"].SetFunctionName("setLayer");
  objectConditions["Layer"].SetFunctionName("isOnLayer");
  objectActions["ChangePlan"]
      .SetFunctionName("setZOrder")
      .SetGetter("getZOrder");
  objectConditions["Plan"].SetFunctionName("getZOrder");
  objectActions["Cache"].SetFunctionName("hide").SetIncludeFile(
      "runtimeobject.js");
  objectActions["Montre"].SetFunctionName("hide").SetIncludeFile(
      "runtimeobject.js");
  objectConditions["Visible"].SetFunctionName("isVisible");
  objectConditions["Invisible"].SetFunctionName("isHidden");
  objectConditions["IsEffectEnabled"].SetFunctionName("isEffectEnabled");
  objectActions["Delete"].SetFunctionName("deleteFromScene");
  objectActions["MettreAutourPos"].SetFunctionName("putAround");
  objectActions["MettreAutour"].SetFunctionName("putAroundObject");
  objectConditions["VarObjet"].SetFunctionName("getVariableNumber");
  objectConditions["VarObjetTxt"].SetFunctionName("getVariableString");
  objectConditions["ObjectVariableAsBoolean"].SetFunctionName(
      "getVariableBoolean");
  objectConditions["VarObjetDef"].SetFunctionName("hasVariable");
  objectActions["AddForceXY"].SetFunctionName("addForce");
  objectActions["AddForceAL"].SetFunctionName("addPolarForce");
  objectActions["AddForceVersPos"].SetFunctionName("addForceTowardPosition");
  objectActions["AddForceVers"].SetFunctionName("addForceTowardObject");
  objectActions["Arreter"].SetFunctionName("clearForces");
  objectConditions["Arret"].SetFunctionName("hasNoForces");
  objectConditions["Vitesse"].SetFunctionName("getAverageForce().getLength");
  objectConditions["AngleOfDisplacement"].SetFunctionName(
      "averageForceAngleIs");
  objectConditions["IsTotalForceAngleAround"].SetFunctionName(
      "isTotalForceAngleAround");
  objectActions["SeparateFromObjects"].SetFunctionName(
      "separateFromObjectsList");
  // Deprecated
  objectActions["Ecarter"].SetFunctionName("separateObjectsWithoutForces");
  // Deprecated
  objectActions["Rebondir"].SetFunctionName("separateObjectsWithForces");
  objectConditions["BehaviorActivated"].SetFunctionName("behaviorActivated");
  objectActions["ActivateBehavior"].SetFunctionName("activateBehavior");
  objectConditions["ObjectVariableChildExists"].SetFunctionName(
      "variableChildExists");
  objectActions["ObjectVariableRemoveChild"].SetFunctionName(
      "variableRemoveChild");
  objectActions["ObjectVariableClearChildren"].SetFunctionName(
      "variableClearChildren");
  objectConditions["CollisionPoint"].SetFunctionName("isCollidingWithPoint");
  // deprecated
  objectConditions["ObjectTimer"].SetFunctionName("timerElapsedTime");
  objectConditions["CompareObjectTimer"].SetFunctionName(
      "getTimerElapsedTimeInSecondsOrNaN");
  objectConditions["ObjectTimerPaused"].SetFunctionName("timerPaused");
  objectActions["ResetObjectTimer"].SetFunctionName("resetTimer");
  objectActions["PauseObjectTimer"].SetFunctionName("pauseTimer");
  objectActions["UnPauseObjectTimer"].SetFunctionName("unpauseTimer");
  objectActions["RemoveObjectTimer"].SetFunctionName("removeTimer");
  objectActions["EnableEffect"].SetFunctionName("enableEffect");
  objectActions["SetEffectDoubleParameter"].SetFunctionName(
      "setEffectDoubleParameter");
  objectActions["SetEffectStringParameter"].SetFunctionName(
      "setEffectStringParameter");
  objectActions["SetEffectBooleanParameter"].SetFunctionName(
      "setEffectBooleanParameter");
  objectActions["SetIncludedInParentCollisionMask"].SetFunctionName(
      "setIncludedInParentCollisionMask");

  objectExpressions["X"].SetFunctionName("getX");
  objectExpressions["Y"].SetFunctionName("getY");
  objectExpressions["CenterX"].SetFunctionName("getCenterXInScene");
  objectExpressions["CenterY"].SetFunctionName("getCenterYInScene");
  objectExpressions["BoundingBoxLeft"].SetFunctionName("getAABBLeft");
  objectExpressions["BoundingBoxTop"].SetFunctionName("getAABBTop");
  objectExpressions["BoundingBoxRight"].SetFunctionName("getAABBRight");
  objectExpressions["BoundingBoxBottom"].SetFunctionName("getAABBBottom");
  objectExpressions["BoundingBoxCenterX"].SetFunctionName("getAABBCenterX");
  objectExpressions["BoundingBoxCenterY"].SetFunctionName("getAABBCenterY");
  objectExpressions["ZOrder"].SetFunctionName("getZOrder");
  // Deprecated
  objectExpressions["Plan"].SetFunctionName("getZOrder");
  objectExpressions["Width"].SetFunctionName("getWidth");
  objectExpressions["Height"].SetFunctionName("getHeight");
  // Deprecated
  objectExpressions["Largeur"].SetFunctionName("getWidth");
  // Deprecated
  objectExpressions["Hauteur"].SetFunctionName("getHeight");
  objectExpressions["Variable"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableNumber")
      .SetStatic();
  objectStrExpressions["VariableString"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableString")
      .SetStatic();
  objectExpressions["VariableChildCount"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableChildCount")
      .SetStatic();
  objectExpressions["ArrayVariableFirstNumber"]
      .SetFunctionName("gdjs.RuntimeObject.getFirstVariableNumber")
      .SetStatic();
  objectStrExpressions["ArrayVariableFirstString"]
      .SetFunctionName("gdjs.RuntimeObject.getFirstVariableString")
      .SetStatic();
  objectExpressions["ArrayVariableLastNumber"]
      .SetFunctionName("gdjs.RuntimeObject.getLastVariableNumber")
      .SetStatic();
  objectStrExpressions["ArrayVariableLastString"]
      .SetFunctionName("gdjs.RuntimeObject.getLastVariableString")
      .SetStatic();
  objectExpressions["ForceX"].SetFunctionName("getAverageForce().getX");
  objectExpressions["ForceY"].SetFunctionName("getAverageForce().getY");
  objectExpressions["ForceAngle"].SetFunctionName("getAverageForce().getAngle");
  objectExpressions["Angle"].SetFunctionName("getAngle");
  objectExpressions["ForceLength"].SetFunctionName(
      "getAverageForce().getLength");
  // Deprecated
  objectExpressions["Longueur"].SetFunctionName("getAverageForce().getLength");
  objectExpressions["Distance"].SetFunctionName("getDistanceToObject");
  objectExpressions["SqDistance"].SetFunctionName("getSqDistanceToObject");
  objectExpressions["DistanceToPosition"].SetFunctionName(
      "getDistanceToPosition");
  objectExpressions["SqDistanceToPosition"].SetFunctionName(
      "getSqDistanceToPosition");
  objectExpressions["AngleToObject"].SetFunctionName("getAngleToObject");
  objectExpressions["AngleToPosition"].SetFunctionName("getAngleToPosition");
  objectExpressions["ObjectTimerElapsedTime"].SetFunctionName(
      "getTimerElapsedTimeInSeconds");
  objectStrExpressions["ObjectName"].SetFunctionName("getName");
  objectStrExpressions["Layer"].SetFunctionName("getLayer");
  objectExpressions["XFromAngleAndDistance"].SetFunctionName(
      "getXFromAngleAndDistance");
  objectExpressions["YFromAngleAndDistance"].SetFunctionName(
      "getYFromAngleAndDistance");

  GetAllActions()["Create"].SetFunctionName(
      "gdjs.evtTools.object.createObjectOnScene");
  GetAllActions()["CreateByName"].SetFunctionName(
      "gdjs.evtTools.object.createObjectFromGroupOnScene");
  // Deprecated
  GetAllExpressions()["Count"].SetFunctionName(
      "gdjs.evtTools.object.pickedObjectsCount");
  // Deprecated
  GetAllConditions()["NbObjet"].SetFunctionName(
      "gdjs.evtTools.object.pickedObjectsCount");

  GetAllExpressions()["SceneInstancesCount"].SetFunctionName(
      "gdjs.evtTools.object.getSceneInstancesCount");
  GetAllConditions()["SceneInstancesCount"].SetFunctionName(
      "gdjs.evtTools.object.getSceneInstancesCount");
  GetAllExpressions()["PickedInstancesCount"].SetFunctionName(
      "gdjs.evtTools.object.getPickedInstancesCount");
  GetAllConditions()["PickedInstancesCount"].SetFunctionName(
      "gdjs.evtTools.object.getPickedInstancesCount");

  GetAllConditions()["CollisionNP"].SetFunctionName(
      "gdjs.evtTools.object.hitBoxesCollisionTest");
  GetAllConditions()["Raycast"].SetFunctionName(
      "gdjs.evtTools.object.raycastObject");
  GetAllConditions()["RaycastToPosition"].SetFunctionName(
      "gdjs.evtTools.object.raycastObjectToPosition");
  GetAllConditions()["Distance"].SetFunctionName(
      "gdjs.evtTools.object.distanceTest");
  GetAllConditions()["SeDirige"].SetFunctionName(
      "gdjs.evtTools.object.movesTowardTest");
  GetAllConditions()["EstTourne"].SetFunctionName(
      "gdjs.evtTools.object.turnedTowardTest");
  GetAllConditions()["SourisSurObjet"].SetFunctionName(
      "gdjs.evtTools.input.cursorOnObject");

  GetAllActions()["AjoutObjConcern"].SetFunctionName(
      "gdjs.evtTools.object.pickAllObjects");
  GetAllConditions()["AjoutObjConcern"].SetFunctionName(
      "gdjs.evtTools.object.pickAllObjects");
  GetAllActions()["AjoutHasard"].SetFunctionName(
      "gdjs.evtTools.object.pickRandomObject");
  GetAllConditions()["AjoutHasard"].SetFunctionName(
      "gdjs.evtTools.object.pickRandomObject");
  GetAllConditions()["PickNearest"].SetFunctionName(
      "gdjs.evtTools.object.pickNearestObject");

  objectActions["ModVarObjet"]
      .SetFunctionName("returnVariable")
      .SetManipulatedType("number")
      .SetMutators({
          {"=", "setNumber"},
          {"+", "add"},
          {"-", "sub"},
          {"*", "mul"},
          {"/", "div"},
      });
  objectActions["ModVarObjetTxt"]
      .SetFunctionName("returnVariable")
      .SetManipulatedType("string")
      .SetMutators({
          {"=", "setString"},
          {"+", "concatenate"},
      });

  objectActions["SetObjectVariableAsBoolean"].SetFunctionName(
      "setVariableBoolean");
  objectActions["ToggleObjectVariableAsBoolean"].SetFunctionName(
      "toggleVariableBoolean");

  objectActions["ObjectVariablePush"].SetFunctionName("variablePushCopy");
  objectActions["ObjectVariablePushString"].SetFunctionName("valuePush");
  objectActions["ObjectVariablePushNumber"].SetFunctionName("valuePush");
  objectActions["ObjectVariablePushBool"].SetFunctionName("valuePush");
  objectActions["ObjectVariableRemoveAt"].SetFunctionName("variableRemoveAt");
  objectConditions["ObjectVariableChildCount"].SetFunctionName(
      "getVariableChildCount");

  GetAllActions()["MoveObjects"].SetCustomCodeGenerator(
      [](gd::Instruction &,
         gd::EventsCodeGenerator &,
         gd::EventsCodeGenerationContext &) {
        return "runtimeScene.updateObjectsForces();";
      });

  auto isNotAssignmentOperator = [](const gd::String &op) {
    return op == "/" || op == "*" || op == "-" || op == "+";
  };

  objectActions["MettreXY"].SetCustomCodeGenerator(
      [&](gd::Instruction &instruction,
          gd::EventsCodeGenerator &codeGenerator,
          gd::EventsCodeGenerationContext &context) -> gd::String {
        gd::String outputCode;

        auto realObjects = codeGenerator.GetObjectsContainersList().ExpandObjectName(
            instruction.GetParameter(0).GetPlainString(), context.GetCurrentObject());
        for (auto &realObjectName : realObjects) {
          context.SetCurrentObject(realObjectName);
          context.ObjectsListNeeded(realObjectName);

          gd::String objectListName =
              codeGenerator.GetObjectListName(realObjectName, context);

          gd::String expression1Code =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(2).GetPlainString(),
                  instruction.GetParameter(0).GetPlainString());

          gd::String expression2Code =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(4).GetPlainString(),
                  instruction.GetParameter(0).GetPlainString());

          gd::String op1 = instruction.GetParameter(1).GetPlainString();
          gd::String newX = isNotAssignmentOperator(op1)
                                ? (objectListName + "[i].getX() " + op1 + "(" +
                                   expression1Code + ")")
                                : expression1Code;

          gd::String op2 = instruction.GetParameter(3).GetPlainString();
          gd::String newY = isNotAssignmentOperator(op2)
                                ? (objectListName + "[i].getY() " + op2 + "(" +
                                   expression2Code + ")")
                                : expression2Code;

          gd::String call =
              objectListName + "[i].setPosition(" + newX + "," + newY + ")";

          outputCode += "for(var i = 0, len = " + objectListName +
                        ".length ;i < len;++i) {\n";
          outputCode += "    " + call + ";\n";
          outputCode += "}\n";

          context.SetNoCurrentObject();
        }

        return outputCode;
      });

  objectActions["SetCenter"].SetCustomCodeGenerator(
      [&](gd::Instruction &instruction,
          gd::EventsCodeGenerator &codeGenerator,
          gd::EventsCodeGenerationContext &context) -> gd::String {
        gd::String outputCode;

        auto realObjects = codeGenerator.GetObjectsContainersList().ExpandObjectName(
            instruction.GetParameter(0).GetPlainString(), context.GetCurrentObject());
        for (auto &realObjectName : realObjects) {
          context.SetCurrentObject(realObjectName);
          context.ObjectsListNeeded(realObjectName);

          gd::String objectListName =
              codeGenerator.GetObjectListName(realObjectName, context);

          gd::String expression1Code =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(2).GetPlainString(),
                  instruction.GetParameter(0).GetPlainString());

          gd::String expression2Code =
              gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator,
                  context,
                  "number",
                  instruction.GetParameter(4).GetPlainString(),
                  instruction.GetParameter(0).GetPlainString());

          gd::String op1 = instruction.GetParameter(1).GetPlainString();
          gd::String newX = isNotAssignmentOperator(op1)
                                ? (objectListName + "[i].getCenterXInScene() " +
                                   op1 + expression1Code)
                                : expression1Code;

          gd::String op2 = instruction.GetParameter(3).GetPlainString();
          gd::String newY = isNotAssignmentOperator(op2)
                                ? (objectListName + "[i].getCenterYInScene() " +
                                   op2 + expression2Code)
                                : expression2Code;

          gd::String call = objectListName + "[i].setCenterPositionInScene(" +
                            newX + "," + newY + ")";

          outputCode += "for(var i = 0, len = " + objectListName +
                        ".length ;i < len;++i) {\n";
          outputCode += "    " + call + ";\n";
          outputCode += "}\n";

          context.SetNoCurrentObject();
        }

        return outputCode;
      });

  // "AddForceTournePos" and "AddForceTourne" are deprecated and not implemented
  StripUnimplementedInstructionsAndExpressions();
}

} // namespace gdjs
