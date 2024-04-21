/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/JsPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/IDE/ExtensionsLoader.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Log.h"

// Built-in extensions
#include "GDJS/Extensions/Builtin/AdvancedExtension.h"
#include "GDJS/Extensions/Builtin/AsyncExtension.h"
#include "GDJS/Extensions/Builtin/AudioExtension.h"
#include "GDJS/Extensions/Builtin/BaseObjectExtension.h"
#include "GDJS/Extensions/Builtin/CameraExtension.h"
#include "GDJS/Extensions/Builtin/CommonConversionsExtension.h"
#include "GDJS/Extensions/Builtin/CommonInstructionsExtension.h"
#include "GDJS/Extensions/Builtin/ExternalLayoutsExtension.h"
#include "GDJS/Extensions/Builtin/FileExtension.h"
#include "GDJS/Extensions/Builtin/KeyboardExtension.h"
#include "GDJS/Extensions/Builtin/MathematicalToolsExtension.h"
#include "GDJS/Extensions/Builtin/MouseExtension.h"
#include "GDJS/Extensions/Builtin/NetworkExtension.h"
#include "GDJS/Extensions/Builtin/SceneExtension.h"
#include "GDJS/Extensions/Builtin/SpriteExtension.h"
#include "GDJS/Extensions/Builtin/StringInstructionsExtension.h"
#include "GDJS/Extensions/Builtin/TimeExtension.h"
#include "GDJS/Extensions/Builtin/VariablesExtension.h"
#include "GDJS/Extensions/Builtin/WindowExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/AnimatableExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/EffectExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/FlippableExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/ResizableExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/ScalableExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/OpacityExtension.h"
#include "GDJS/Extensions/Builtin/Capacities/TextContainerExtension.h"

namespace gdjs {

JsPlatform *JsPlatform::singleton = NULL;

// When compiling with emscripten, extensions exposes specific functions to
// create them.
#if defined(EMSCRIPTEN)
extern "C" {
gd::PlatformExtension *CreateGDJSPlatformBehaviorExtension();
gd::PlatformExtension *CreateGDJSDestroyOutsideBehaviorExtension();
gd::PlatformExtension *CreateGDJSTiledSpriteObjectExtension();
gd::PlatformExtension *CreateGDJSDraggableBehaviorExtension();
gd::PlatformExtension *CreateGDJSTopDownMovementBehaviorExtension();
gd::PlatformExtension *CreateGDJSTextObjectExtension();
gd::PlatformExtension *CreateGDJSPanelSpriteObjectExtension();
gd::PlatformExtension *CreateGDJSAnchorBehaviorExtension();
gd::PlatformExtension *CreateGDJSPrimitiveDrawingExtension();
gd::PlatformExtension *CreateGDJSTextEntryObjectExtension();
gd::PlatformExtension *CreateGDJSInventoryExtension();
gd::PlatformExtension *CreateGDJSLinkedObjectsExtension();
gd::PlatformExtension *CreateGDJSSystemInfoExtension();
gd::PlatformExtension *CreateGDJSShopifyExtension();
gd::PlatformExtension *CreateGDJSPathfindingBehaviorExtension();
gd::PlatformExtension *CreateGDJSPhysicsBehaviorExtension();
gd::PlatformExtension *CreateGDJSParticleSystemExtension();
}
#endif

void JsPlatform::ReloadBuiltinExtensions() {
  // Adding built-in extensions.
  std::cout << "* Loading builtin extensions... ";
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new BaseObjectExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new SpriteExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new CommonInstructionsExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new AsyncExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new CommonConversionsExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new VariablesExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new MouseExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new KeyboardExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new SceneExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new TimeExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new MathematicalToolsExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new CameraExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new AudioExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new FileExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new NetworkExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new WindowExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new StringInstructionsExtension));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(new AdvancedExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new ExternalLayoutsExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new AnimatableExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new EffectExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new FlippableExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new ResizableExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new ScalableExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new OpacityExtension));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(new TextContainerExtension));
  std::cout.flush();
  std::cout << "done." << std::endl;

#if defined(EMSCRIPTEN) // When compiling with emscripten, hardcode extensions
                        // to load.
  std::cout << "* Loading other extensions... ";
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSPlatformBehaviorExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSDestroyOutsideBehaviorExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSTiledSpriteObjectExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSDraggableBehaviorExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSTopDownMovementBehaviorExtension()));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(CreateGDJSTextObjectExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSParticleSystemExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSPanelSpriteObjectExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSAnchorBehaviorExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSPrimitiveDrawingExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSTextEntryObjectExtension()));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(CreateGDJSInventoryExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSLinkedObjectsExtension()));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(CreateGDJSSystemInfoExtension()));
  std::cout.flush();
  AddExtension(
      std::shared_ptr<gd::PlatformExtension>(CreateGDJSShopifyExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSPathfindingBehaviorExtension()));
  std::cout.flush();
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      CreateGDJSPhysicsBehaviorExtension()));
  std::cout.flush();
#endif
  std::cout << "done." << std::endl;
};

void JsPlatform::AddNewExtension(const gd::PlatformExtension &extension) {
  AddExtension(std::shared_ptr<gd::PlatformExtension>(
      new gd::PlatformExtension(extension)));
}

JsPlatform::JsPlatform() : gd::Platform() { ReloadBuiltinExtensions(); }

JsPlatform &JsPlatform::Get() {
  if (!singleton)
    singleton = new JsPlatform;

  return *singleton;
}

void JsPlatform::DestroySingleton() {
  if (singleton) {
    delete singleton;
    singleton = NULL;
  }
}

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the platform class
 */
extern "C" gd::Platform *GD_API CreateGDPlatform() {
  return &JsPlatform::Get();
}

/**
 * Used by GDevelop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform() { JsPlatform::DestroySingleton(); }
#endif

} // namespace gdjs
