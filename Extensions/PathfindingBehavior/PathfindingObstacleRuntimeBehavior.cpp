/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "PathfindingObstacleRuntimeBehavior.h"
#include <memory>
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ScenePathfindingObstaclesManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Localization.h"
#endif

PathfindingObstacleRuntimeBehavior::PathfindingObstacleRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      parentScene(NULL),
      sceneManager(NULL),
      registeredInManager(false),
      impassable(true),
      cost(2) {
  impassable = behaviorContent.GetBoolAttribute("impassable");
  cost = behaviorContent.GetDoubleAttribute("cost");
}

PathfindingObstacleRuntimeBehavior::~PathfindingObstacleRuntimeBehavior() {
  if (sceneManager && registeredInManager) sceneManager->RemoveObstacle(this);
}

void PathfindingObstacleRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    if (sceneManager)  // Remove the object from any old scene manager.
      sceneManager->RemoveObstacle(this);

    parentScene = &scene;
    sceneManager = parentScene
                       ? &ScenePathfindingObstaclesManager::managers[&scene]
                       : NULL;
    registeredInManager = false;
  }

  if (!activated && registeredInManager) {
    if (sceneManager) sceneManager->RemoveObstacle(this);
    registeredInManager = false;
  } else if (activated && !registeredInManager) {
    if (sceneManager) {
      sceneManager->AddObstacle(this);
      registeredInManager = true;
    }
  }
}

void PathfindingObstacleRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {
}

void PathfindingObstacleRuntimeBehavior::OnActivate() {
  if (sceneManager) {
    sceneManager->AddObstacle(this);
    registeredInManager = true;
  }
}

void PathfindingObstacleRuntimeBehavior::OnDeActivate() {
  if (sceneManager) sceneManager->RemoveObstacle(this);

  registeredInManager = false;
}
