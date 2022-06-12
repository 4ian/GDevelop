/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "TimeExtension.h"

#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

TimeExtension::TimeExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsTimeExtension(*this);

  GetAllConditions()["Timer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.timerElapsedTime");  // Deprecated
  GetAllConditions()["CompareTimer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSecondsOrNaN");
  GetAllConditions()["TimerPaused"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.timerPaused");
  GetAllActions()["ResetTimer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.resetTimer");
  GetAllActions()["PauseTimer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.pauseTimer");
  GetAllActions()["UnPauseTimer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.unpauseTimer");
  GetAllActions()["RemoveTimer"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.removeTimer");
  GetAllActions()["Wait"].SetAsyncFunctionName(
      "gdjs.evtTools.runtimeScene.wait");
  GetAllConditions()["TimeScale"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimeScale");
  GetAllActions()["ChangeTimeScale"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.setTimeScale");

  GetAllExpressions()["TimeDelta"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");
  GetAllExpressions()["TempsFrame"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");  // Deprecated
  GetAllExpressions()["ElapsedTime"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds");
  GetAllExpressions()["TimerElapsedTime"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSeconds");
  GetAllExpressions()["TimeFromStart"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimeFromStartInSeconds");
  GetAllExpressions()["TempsDebut"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimeFromStartInSeconds");
  GetAllExpressions()["TimeScale"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTimeScale");
  GetAllExpressions()["Time"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getTime");
}

}  // namespace gdjs
