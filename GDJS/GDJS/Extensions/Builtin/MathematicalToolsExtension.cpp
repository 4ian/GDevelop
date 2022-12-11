/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "MathematicalToolsExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

MathematicalToolsExtension::MathematicalToolsExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsMathematicalToolsExtension(*this);

  GetAllExpressions()["Random"].SetFunctionName("gdjs.random");
  GetAllExpressions()["RandomInRange"].SetFunctionName("gdjs.randomInRange");
  GetAllExpressions()["RandomFloat"].SetFunctionName("gdjs.randomFloat");
  GetAllExpressions()["RandomFloatInRange"].SetFunctionName(
      "gdjs.randomFloatInRange");
  GetAllExpressions()["RandomWithStep"].SetFunctionName("gdjs.randomWithStep");
  GetAllExpressions()["normalize"].SetFunctionName("gdjs.evtTools.common.normalize");
  GetAllExpressions()["clamp"].SetFunctionName("gdjs.evtTools.common.clamp");
  GetAllExpressions()["cos"].SetFunctionName("Math.cos");
  GetAllExpressions()["sin"].SetFunctionName("Math.sin");
  GetAllExpressions()["tan"].SetFunctionName("Math.tan");
  GetAllExpressions()["abs"].SetFunctionName("Math.abs");
  GetAllExpressions()["min"].SetFunctionName("Math.min");
  GetAllExpressions()["max"].SetFunctionName("Math.max");
  GetAllExpressions()["sqrt"].SetFunctionName("Math.sqrt");
  GetAllExpressions()["acos"].SetFunctionName("Math.acos");
  GetAllExpressions()["acosh"].SetFunctionName("gdjs.evtTools.common.acosh");
  GetAllExpressions()["asin"].SetFunctionName("Math.asin");
  GetAllExpressions()["asinh"].SetFunctionName("gdjs.evtTools.common.asinh");
  GetAllExpressions()["atan"].SetFunctionName("Math.atan");
  GetAllExpressions()["atan2"].SetFunctionName("Math.atan2");
  GetAllExpressions()["atanh"].SetFunctionName("gdjs.evtTools.common.atanh");
  GetAllExpressions()["cbrt"].SetFunctionName("gdjs.evtTools.common.cbrt");
  GetAllExpressions()["ceil"].SetFunctionName("Math.ceil");
  GetAllExpressions()["ceilTo"].SetFunctionName("gdjs.evtTools.common.ceilTo");
  GetAllExpressions()["floor"].SetFunctionName("Math.floor");
  GetAllExpressions()["floorTo"].SetFunctionName("gdjs.evtTools.common.floorTo");
  GetAllExpressions()["cosh"].SetFunctionName("gdjs.evtTools.common.cosh");
  GetAllExpressions()["sinh"].SetFunctionName("gdjs.evtTools.common.sinh");
  GetAllExpressions()["tanh"].SetFunctionName("gdjs.evtTools.common.tanh");
  GetAllExpressions()["cot"].SetFunctionName("gdjs.evtTools.common.cot");
  GetAllExpressions()["csc"].SetFunctionName("gdjs.evtTools.common.csc");
  GetAllExpressions()["sec"].SetFunctionName("gdjs.evtTools.common.sec");
  GetAllExpressions()["exp"].SetFunctionName("Math.exp");
  GetAllExpressions()["log10"].SetFunctionName("gdjs.evtTools.common.log10");
  GetAllExpressions()["log2"].SetFunctionName("gdjs.evtTools.common.log2");
  GetAllExpressions()["log"].SetFunctionName("Math.log");
  GetAllExpressions()["ln"].SetFunctionName("Math.ln");
  GetAllExpressions()["pow"].SetFunctionName("Math.pow");
  GetAllExpressions()["nthroot"].SetFunctionName(
      "gdjs.evtTools.common.nthroot");
  GetAllExpressions()["sign"].SetFunctionName("gdjs.evtTools.common.sign");
  GetAllExpressions()["mod"].SetFunctionName("gdjs.evtTools.common.mod");
  GetAllExpressions()["AngleDifference"].SetFunctionName(
      "gdjs.evtTools.common.angleDifference");
  GetAllExpressions()["AngleBetweenPositions"].SetFunctionName(
      "gdjs.evtTools.common.angleBetweenPositions");
  GetAllExpressions()["DistanceBetweenPositions"].SetFunctionName(
      "gdjs.evtTools.common.distanceBetweenPositions");
  GetAllExpressions()["int"].SetFunctionName("Math.round");
  GetAllExpressions()["rint"].SetFunctionName("Math.round");
  GetAllExpressions()["round"].SetFunctionName("Math.round");
  GetAllExpressions()["roundTo"].SetFunctionName("gdjs.evtTools.common.roundTo");
  GetAllExpressions()["trunc"].SetFunctionName("gdjs.evtTools.common.trunc");
  GetAllExpressions()["lerp"].SetFunctionName("gdjs.evtTools.common.lerp");
  GetAllExpressions()["XFromAngleAndDistance"].SetFunctionName("gdjs.evtTools.common.getXFromAngleAndDistance");
  GetAllExpressions()["YFromAngleAndDistance"].SetFunctionName("gdjs.evtTools.common.getYFromAngleAndDistance");
  GetAllExpressions()["Pi"].SetFunctionName("gdjs.evtTools.common.pi");
  GetAllExpressions()["lerpAngle"].SetFunctionName("gdjs.evtTools.common.lerpAngle");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
