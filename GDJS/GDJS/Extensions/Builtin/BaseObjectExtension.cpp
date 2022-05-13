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

  objectActions["MettreX"]
      .SetFunctionName("setX")
      .SetGetter("getX")
      .SetIncludeFile("runtimeobject.js");
  objectActions["MettreY"]
      .SetFunctionName("setY")
      .SetGetter("getY")
      .SetIncludeFile("runtimeobject.js");
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
  objectActions["SetAngle"]
      .SetFunctionName("setAngle")
      .SetGetter("getAngle")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Angle"]
      .SetFunctionName("getAngle")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["BoundingBoxLeft"].SetFunctionName("getAABBLeft");
  objectConditions["BoundingBoxTop"].SetFunctionName("getAABBTop");
  objectConditions["BoundingBoxRight"].SetFunctionName("getAABBRight");
  objectConditions["BoundingBoxBottom"].SetFunctionName("getAABBBottom");
  objectConditions["BoundingBoxCenterX"].SetFunctionName("getAABBCenterX");
  objectConditions["BoundingBoxCenterY"].SetFunctionName("getAABBCenterY");
  objectActions["Rotate"].SetFunctionName("rotate").SetIncludeFile(
      "runtimeobject.js");
  objectActions["RotateTowardAngle"]
      .SetFunctionName("rotateTowardAngle")
      .SetIncludeFile("runtimeobject.js");
  objectActions["RotateTowardPosition"]
      .SetFunctionName("rotateTowardPosition")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ChangeLayer"]
      .SetFunctionName("setLayer")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Layer"]
      .SetFunctionName("isOnLayer")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ChangePlan"]
      .SetFunctionName("setZOrder")
      .SetGetter("getZOrder")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Plan"]
      .SetFunctionName("getZOrder")
      .SetIncludeFile("runtimeobject.js");
  objectActions["Cache"].SetFunctionName("hide").SetIncludeFile(
      "runtimeobject.js");
  objectActions["Montre"].SetFunctionName("hide").SetIncludeFile(
      "runtimeobject.js");
  objectConditions["Visible"]
      .SetFunctionName("isVisible")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Invisible"]
      .SetFunctionName("isHidden")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["IsEffectEnabled"]
      .SetFunctionName("isEffectEnabled")
      .SetIncludeFile("runtimeobject.js");
  objectActions["Delete"].SetFunctionName("deleteFromScene");
  objectActions["MettreAutourPos"].SetFunctionName("putAround");
  objectActions["MettreAutour"]
      .SetFunctionName("putAroundObject")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["VarObjet"]
      .SetFunctionName("getVariableNumber")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["VarObjetTxt"]
      .SetFunctionName("getVariableString")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["ObjectVariableAsBoolean"]
      .SetFunctionName("getVariableBoolean")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["VarObjetDef"]
      .SetFunctionName("hasVariable")
      .SetIncludeFile("runtimeobject.js");
  objectActions["AddForceXY"]
      .SetFunctionName("addForce")
      .SetIncludeFile("runtimeobject.js");
  objectActions["AddForceAL"]
      .SetFunctionName("addPolarForce")
      .SetIncludeFile("runtimeobject.js");
  objectActions["AddForceVersPos"]
      .SetFunctionName("addForceTowardPosition")
      .SetIncludeFile("runtimeobject.js");
  objectActions["AddForceVers"]
      .SetFunctionName("addForceTowardObject")
      .SetIncludeFile("runtimeobject.js");
  objectActions["Arreter"]
      .SetFunctionName("clearForces")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Arret"]
      .SetFunctionName("hasNoForces")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["Vitesse"]
      .SetFunctionName("getAverageForce().getLength")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["AngleOfDisplacement"]
      .SetFunctionName("averageForceAngleIs")
      .SetIncludeFile("runtimeobject.js");
  objectActions["SeparateFromObjects"]
      .SetFunctionName("separateFromObjectsList")
      .SetIncludeFile("runtimeobject.js");
  objectActions["Ecarter"]
      .codeExtraInformation  // Deprecated
      .SetFunctionName("separateObjectsWithoutForces")
      .SetIncludeFile("runtimeobject.js");
  objectActions["Rebondir"]
      .codeExtraInformation  // Deprecated
      .SetFunctionName("separateObjectsWithForces")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["BehaviorActivated"]
      .SetFunctionName("behaviorActivated")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ActivateBehavior"]
      .SetFunctionName("activateBehavior")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["ObjectVariableChildExists"]
      .SetFunctionName("variableChildExists")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariableRemoveChild"]
      .SetFunctionName("variableRemoveChild")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariableClearChildren"]
      .SetFunctionName("variableClearChildren")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["CollisionPoint"]
      .SetFunctionName("isCollidingWithPoint")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["ObjectTimer"] // deprecated
      .SetFunctionName("timerElapsedTime")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["CompareObjectTimer"]
      .SetFunctionName("getTimerElapsedTimeInSecondsOrNaN")
      .SetIncludeFile("runtimeobject.js");
  objectConditions["ObjectTimerPaused"]
      .SetFunctionName("timerPaused")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ResetObjectTimer"]
      .SetFunctionName("resetTimer")
      .SetIncludeFile("runtimeobject.js");
  objectActions["PauseObjectTimer"]
      .SetFunctionName("pauseTimer")
      .SetIncludeFile("runtimeobject.js");
  objectActions["UnPauseObjectTimer"]
      .SetFunctionName("unpauseTimer")
      .SetIncludeFile("runtimeobject.js");
  objectActions["RemoveObjectTimer"]
      .SetFunctionName("removeTimer")
      .SetIncludeFile("runtimeobject.js");
  objectActions["EnableEffect"]
      .SetFunctionName("enableEffect")
      .SetIncludeFile("runtimeobject.js");
  objectActions["SetEffectDoubleParameter"]
      .SetFunctionName("setEffectDoubleParameter")
      .SetIncludeFile("runtimeobject.js");
  objectActions["SetEffectStringParameter"]
      .SetFunctionName("setEffectStringParameter")
      .SetIncludeFile("runtimeobject.js");
  objectActions["SetEffectBooleanParameter"]
      .SetFunctionName("setEffectBooleanParameter")
      .SetIncludeFile("runtimeobject.js");

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
  objectExpressions["Plan"].SetFunctionName("getZOrder");  // Deprecated
  objectExpressions["Width"].SetFunctionName("getWidth");
  objectExpressions["Height"].SetFunctionName("getHeight");
  objectExpressions["Largeur"].SetFunctionName("getWidth");   // Deprecated
  objectExpressions["Hauteur"].SetFunctionName("getHeight");  // Deprecated
  objectExpressions["Variable"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableNumber")
      .SetStatic();
  objectStrExpressions["VariableString"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableString")
      .SetStatic();
  objectExpressions["VariableChildCount"]
      .SetFunctionName("gdjs.RuntimeObject.getVariableChildCount")
      .SetStatic();
  objectExpressions["ForceX"].SetFunctionName("getAverageForce().getX");
  objectExpressions["ForceY"].SetFunctionName("getAverageForce().getY");
  objectExpressions["ForceAngle"].SetFunctionName("getAverageForce().getAngle");
  objectExpressions["Angle"].SetFunctionName("getAngle");
  objectExpressions["ForceLength"].SetFunctionName(
      "getAverageForce().getLength");
  objectExpressions["Longueur"].SetFunctionName(
      "getAverageForce().getLength");  // Deprecated
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

  GetAllExpressions()["Count"].SetFunctionName(
      "gdjs.evtTools.object.pickedObjectsCount"); // Deprecated
  GetAllConditions()["NbObjet"].SetFunctionName(
      "gdjs.evtTools.object.pickedObjectsCount"); // Deprecated

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
      })
      .SetIncludeFile("runtimeobject.js");
  objectActions["ModVarObjetTxt"]
      .SetFunctionName("returnVariable")
      .SetManipulatedType("string")
      .SetMutators({
          {"=", "setString"},
          {"+", "concatenate"},
      })
      .SetIncludeFile("runtimeobject.js");

  objectActions["SetObjectVariableAsBoolean"]
      .SetFunctionName("setVariableBoolean")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ToggleObjectVariableAsBoolean"]
      .SetFunctionName("toggleVariableBoolean")
      .SetIncludeFile("runtimeobject.js");

  objectActions["ObjectVariablePush"]
      .SetFunctionName("variablePushCopy")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariablePushString"]
      .SetFunctionName("valuePush")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariablePushNumber"]
      .SetFunctionName("valuePush")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariablePushBool"]
      .SetFunctionName("valuePush")
      .SetIncludeFile("runtimeobject.js");
  objectActions["ObjectVariableRemoveAt"]
      .SetFunctionName("variableRemoveAt")
      .SetIncludeFile("runtimeobject.js");

  GetAllActions()["MoveObjects"].codeExtraInformation.SetCustomCodeGenerator(
      [](gd::Instruction &,
         gd::EventsCodeGenerator &,
         gd::EventsCodeGenerationContext &) {
        return "runtimeScene.updateObjectsForces();";
      });

  auto isNotAssignmentOperator = [](const gd::String &op) {
    return op == "/" || op == "*" || op == "-" || op == "+";
  };

  objectActions["MettreXY"].codeExtraInformation.SetCustomCodeGenerator(
      [&](gd::Instruction &instruction,
          gd::EventsCodeGenerator &codeGenerator,
          gd::EventsCodeGenerationContext &context) -> gd::String {
        gd::String outputCode;

        auto realObjects = codeGenerator.ExpandObjectsName(
            instruction.GetParameter(0).GetPlainString(), context);
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
          gd::String newX =
              isNotAssignmentOperator(op1)
                  ? (objectListName + "[i].getX() " + op1 + expression1Code)
                  : expression1Code;

          gd::String op2 = instruction.GetParameter(3).GetPlainString();
          gd::String newY =
              isNotAssignmentOperator(op2)
                  ? (objectListName + "[i].getY() " + op2 + expression2Code)
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

  objectActions["SetCenter"].codeExtraInformation.SetCustomCodeGenerator(
      [&](gd::Instruction &instruction,
          gd::EventsCodeGenerator &codeGenerator,
          gd::EventsCodeGenerationContext &context) -> gd::String {
        gd::String outputCode;

        auto realObjects = codeGenerator.ExpandObjectsName(
            instruction.GetParameter(0).GetPlainString(), context);
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

}  // namespace gdjs
