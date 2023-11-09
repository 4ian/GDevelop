/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "SceneExtension.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

SceneExtension::SceneExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(*this);

  GetAllStrExpressions()["CurrentSceneName"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getSceneName");

  GetAllConditions()["DepartScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustBegins");
  GetAllConditions()["SceneJustResumed"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustResumed");
  GetAllActions()["SceneBackground"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.setBackgroundColor");
  GetAllActions()["Scene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.replaceScene");
  GetAllActions()["PushScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.pushScene");
  GetAllActions()["PopScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.popScene");
  GetAllActions()["Quit"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.stopGame");
  GetAllConditions()["HasGameJustResumed"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.hasGameJustResumed");
  GetAllConditions()["DoesSceneExist"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.doesSceneExist");

  GetAllActions()["PrioritizeLoadingOfScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.prioritizeLoadingOfScene");
  GetAllConditions()["AreSceneAssetsLoaded"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.areSceneAssetsLoaded");
  GetAllConditions()["SceneLoadingProgress"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getSceneLoadingProgress");
  GetAllExpressions()["SceneLoadingProgress"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getSceneLoadingProgress");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
