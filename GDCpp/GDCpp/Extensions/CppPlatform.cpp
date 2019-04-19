/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCpp/Extensions/CppPlatform.h"
#include <string>
#include <vector>
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/AbstractFileSystem.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/FontManager.h"
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/SoundManager.h"

// Builtin extensions
#include "GDCpp/Extensions/Builtin/AdvancedExtension.h"
#include "GDCpp/Extensions/Builtin/AudioExtension.h"
#include "GDCpp/Extensions/Builtin/BaseObjectExtension.h"
#include "GDCpp/Extensions/Builtin/CameraExtension.h"
#include "GDCpp/Extensions/Builtin/CommonConversionsExtension.h"
#include "GDCpp/Extensions/Builtin/CommonInstructionsExtension.h"
#include "GDCpp/Extensions/Builtin/ExternalLayoutsExtension.h"
#include "GDCpp/Extensions/Builtin/FileExtension.h"
#include "GDCpp/Extensions/Builtin/JoystickExtension.h"
#include "GDCpp/Extensions/Builtin/KeyboardExtension.h"
#include "GDCpp/Extensions/Builtin/MathematicalToolsExtension.h"
#include "GDCpp/Extensions/Builtin/MouseExtension.h"
#include "GDCpp/Extensions/Builtin/NetworkExtension.h"
#include "GDCpp/Extensions/Builtin/SceneExtension.h"
#include "GDCpp/Extensions/Builtin/SpriteExtension.h"
#include "GDCpp/Extensions/Builtin/StringInstructionsExtension.h"
#include "GDCpp/Extensions/Builtin/TimeExtension.h"
#include "GDCpp/Extensions/Builtin/VariablesExtension.h"
#include "GDCpp/Extensions/Builtin/WindowExtension.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCpp/Runtime/RuntimeObject.h"

CppPlatform *CppPlatform::singleton = NULL;

CppPlatform::CppPlatform() : gd::Platform() {
  ReloadBuiltinExtensions();
}

void CppPlatform::ReloadBuiltinExtensions() {
  std::cout << "* Loading builtin extensions... ";
  std::cout.flush();
  AddExtension(std::make_shared<BaseObjectExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<SpriteExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<CommonInstructionsExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<CommonConversionsExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<VariablesExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<MouseExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<KeyboardExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<JoystickExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<SceneExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<TimeExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<MathematicalToolsExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<CameraExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<AudioExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<FileExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<NetworkExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<WindowExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<StringInstructionsExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<AdvancedExtension>());
  std::cout.flush();
  AddExtension(std::make_shared<ExternalLayoutsExtension>());
  std::cout.flush();
}

bool CppPlatform::AddExtension(
    std::shared_ptr<gd::PlatformExtension> platformExtension) {
  std::shared_ptr<ExtensionBase> extension =
      std::dynamic_pointer_cast<ExtensionBase>(platformExtension);
  if (extension == std::shared_ptr<ExtensionBase>()) {
    std::cout << "ERROR: Tried to add an incompatible extension to C++ Platform"
              << std::endl;
    return false;
  }

  // First add normally the extension
  if (!gd::Platform::AddExtension(extension)) return false;

  // Then Load all runtime objects provided by the extension
  std::vector<gd::String> objectsTypes = extension->GetExtensionObjectsTypes();
  for (std::size_t i = 0; i < objectsTypes.size(); ++i) {
    runtimeObjCreationFunctionTable[objectsTypes[i]] =
        extension->GetRuntimeObjectCreationFunctionPtr(objectsTypes[i]);
  }
  return true;
}

std::unique_ptr<RuntimeObject> CppPlatform::CreateRuntimeObject(
    RuntimeScene &scene, gd::Object &object) {
  const gd::String &type = object.GetType();

  if (runtimeObjCreationFunctionTable.find(type) ==
      runtimeObjCreationFunctionTable.end()) {
    std::cout << "Tried to create an object with an unknown type: " << type
              << std::endl;
    return std::unique_ptr<RuntimeObject>();
  }

  // Create a new object with the type we want.
  return runtimeObjCreationFunctionTable[type](scene, object);
}

#if defined(GD_IDE_ONLY)
gd::String CppPlatform::GetDescription() const {
  return _(
      "Allows you to create 2D games that can be compiled and played on "
      "Windows or Linux.");
}


void CppPlatform::OnIDEClosed() {
  FontManager::Get()->DestroySingleton();
}
#endif

CppPlatform &CppPlatform::Get() {
  if (!singleton) singleton = new CppPlatform;

  return *singleton;
}

void CppPlatform::DestroySingleton() {
  if (singleton) {
    delete singleton;
    singleton = NULL;
  }
}

#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Platform.cpp"
#endif

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the platform class
 */
extern "C" gd::Platform *GD_API CreateGDPlatform() {
  return &CppPlatform::Get();
}

/**
 * Used by GDevelop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform() { CppPlatform::DestroySingleton(); }
#endif
