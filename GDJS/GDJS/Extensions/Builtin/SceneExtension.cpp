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

  GetAllConditions()["SceneJustBegins"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustBegins");
  // Compatibility with GD <= 5.6.251
  GetAllConditions()["DepartScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustBegins");
  // End of compatibility code
  GetAllConditions()["SceneJustResumed"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustResumed");
  GetAllConditions()["SignalReceived"].SetFunctionName(
      "gdjs.evtTools.signal.isSignalReceived");
  GetAllActions()["EmitSceneSignal"].SetFunctionName(
      "gdjs.evtTools.signal.emitSceneSignalFromEvents");
  GetAllActions()["EmitSignalToObjectInstance"].SetFunctionName(
      "gdjs.evtTools.signal.emitSignalToInstanceFromEvents");
  GetAllActions()["SubscribeSceneSignal"].SetFunctionName(
      "gdjs.evtTools.signal.subscribeSceneSignal");
  GetAllStrExpressions()["SignalName"].SetFunctionName(
      "gdjs.evtTools.signal.getSignalName");
  GetAllStrExpressions()["SignalName"].SetCustomCodeGenerator(
      [](const std::vector<gd::Expression>& parameters,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        if (context.IsInsideAsync()) {
          return gd::String("asyncObjectsList.getSceneSignalName()");
        }
        if (codeGenerator.GetSceneLifecycleFunctionRole() == "sceneSignal") {
          return codeGenerator.GetCodeNamespaceAccessor() +
                 "sceneSignalName";
        }
        return gd::String("gdjs.evtTools.signal.getSignalName(runtimeScene)");
      });
  GetAllStrExpressions()["SignalPayload"].SetFunctionName(
      "gdjs.evtTools.signal.getSignalPayload");
  GetAllStrExpressions()["SignalPayload"].SetCustomCodeGenerator(
      [](const std::vector<gd::Expression>& parameters,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        if (context.IsInsideAsync()) {
          return gd::String("asyncObjectsList.getSceneSignalPayload()");
        }
        if (codeGenerator.GetSceneLifecycleFunctionRole() == "sceneSignal") {
          return codeGenerator.GetCodeNamespaceAccessor() +
                 "sceneSignalPayload";
        }
        return gd::String(
            "gdjs.evtTools.signal.getSignalPayload(runtimeScene)");
      });
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
  GetAllActions()["LoadObjectAssets"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.loadObjectOrGroupAssets");
  GetAllActions()["UnloadObjectAssets"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.unloadObjectOrGroupAssets");
  GetAllConditions()["AreObjectAssetsLoaded"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.areObjectOrGroupAssetsLoaded");

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
