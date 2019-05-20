/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PlatformRuntimeBehavior.h"
#include <memory>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ScenePlatformObjectsManager.h"

PlatformRuntimeBehavior::PlatformRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      parentScene(NULL),
      sceneManager(NULL),
      registeredInManager(false),
      platformType(NormalPlatform),
      canBeGrabbed(true),
      yGrabOffset(0) {
  gd::String platformTypeStr =
      behaviorContent.GetStringAttribute("platformType");
  platformType =
      platformTypeStr == "Ladder"
          ? Ladder
          : (platformTypeStr == "Jumpthru" ? Jumpthru : NormalPlatform);
  canBeGrabbed = behaviorContent.GetBoolAttribute("canBeGrabbed", true);
  yGrabOffset = behaviorContent.GetDoubleAttribute("yGrabOffset");
}

PlatformRuntimeBehavior::~PlatformRuntimeBehavior() {
  if (sceneManager && registeredInManager) sceneManager->RemovePlatform(this);
}

void PlatformRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    if (sceneManager)  // Remove the object from any old scene manager.
      sceneManager->RemovePlatform(this);

    parentScene = &scene;
    sceneManager =
        parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
    registeredInManager = false;
  }

  if (!activated && registeredInManager) {
    if (sceneManager) sceneManager->RemovePlatform(this);
    registeredInManager = false;
  } else if (activated && !registeredInManager) {
    if (sceneManager) {
      sceneManager->AddPlatform(this);
      registeredInManager = true;
    }
  }
}

void PlatformRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {}

void PlatformRuntimeBehavior::ChangePlatformType(
    const gd::String& platformType_) {
  if (platformType_ == "Ladder")
    platformType = Ladder;
  else if (platformType_ == "Jumpthru")
    platformType = Jumpthru;
  else
    platformType = NormalPlatform;
}

void PlatformRuntimeBehavior::OnActivate() {
  if (sceneManager) {
    sceneManager->AddPlatform(this);
    registeredInManager = true;
  }
}

void PlatformRuntimeBehavior::OnDeActivate() {
  if (sceneManager) sceneManager->RemovePlatform(this);

  registeredInManager = false;
}
