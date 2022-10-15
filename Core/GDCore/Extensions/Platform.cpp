/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "Platform.h"

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectConfiguration.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

using namespace std;

#undef CreateEvent

namespace gd {

InstructionOrExpressionGroupMetadata
    Platform::badInstructionOrExpressionGroupMetadata;

Platform::Platform() : enableExtensionLoadingLogs(false) {}

Platform::~Platform() {}

bool Platform::AddExtension(std::shared_ptr<gd::PlatformExtension> extension) {
  if (!extension) return false;

  if (enableExtensionLoadingLogs)
    std::cout << "Loading " << extension->GetName() << "...";
  if (IsExtensionLoaded(extension->GetName())) {
    if (enableExtensionLoadingLogs)
      std::cout << " (replacing existing extension)";
    RemoveExtension(extension->GetName());
  }
  if (enableExtensionLoadingLogs) std::cout << std::endl;

  extensionsLoaded.push_back(extension);

  // Load all creation/destruction functions for objects provided by the
  // extension
  vector<gd::String> objectsTypes = extension->GetExtensionObjectsTypes();
  for (std::size_t i = 0; i < objectsTypes.size(); ++i) {
    creationFunctionTable[objectsTypes[i]] =
        extension->GetObjectCreationFunctionPtr(objectsTypes[i]);
  }

  for (const auto& it :
       extension->GetAllInstructionOrExpressionGroupMetadata()) {
    instructionOrExpressionGroupMetadata[it.first] = it.second;
  }

  return true;
}

void Platform::RemoveExtension(const gd::String& name) {
  // Unload all creation/destruction functions for objects provided by the
  // extension
  for (std::size_t i = 0; i < extensionsLoaded.size(); ++i) {
    auto& extension = extensionsLoaded[i];
    if (extension->GetName() == name) {
      vector<gd::String> objectsTypes = extension->GetExtensionObjectsTypes();
      for (std::size_t i = 0; i < objectsTypes.size(); ++i) {
        creationFunctionTable.erase(objectsTypes[i]);
      }
    }
  }

  extensionsLoaded.erase(
      remove_if(extensionsLoaded.begin(),
                extensionsLoaded.end(),
                [&name](std::shared_ptr<PlatformExtension> extension) {
                  return extension->GetName() == name;
                }),
      extensionsLoaded.end());
}

bool Platform::IsExtensionLoaded(const gd::String& name) const {
  for (std::size_t i = 0; i < extensionsLoaded.size(); ++i) {
    if (extensionsLoaded[i]->GetName() == name) return true;
  }

  return false;
}

std::shared_ptr<gd::PlatformExtension> Platform::GetExtension(
    const gd::String& name) const {
  for (std::size_t i = 0; i < extensionsLoaded.size(); ++i) {
    if (extensionsLoaded[i]->GetName() == name) return extensionsLoaded[i];
  }

  return std::shared_ptr<gd::PlatformExtension>();
}

std::unique_ptr<gd::ObjectConfiguration> Platform::CreateObjectConfiguration(
    gd::String type) const {
  if (creationFunctionTable.find(type) == creationFunctionTable.end()) {
    gd::LogWarning("Tried to create an object with an unknown type: " + type
              + " for platform " + GetName() + "!");
    type = "";
    if (creationFunctionTable.find("") == creationFunctionTable.end()) {
      gd::LogError("Unable to create a Base object!");
      return nullptr;
    }
  }

  // Create a new object with the type we want.
  auto objectConfiguration = (creationFunctionTable.find(type)->second)();
  objectConfiguration->SetType(type);
  return objectConfiguration;
}

#if defined(GD_IDE_ONLY)
std::shared_ptr<gd::BaseEvent> Platform::CreateEvent(
    const gd::String& eventType) const {
  for (std::size_t i = 0; i < extensionsLoaded.size(); ++i) {
    std::shared_ptr<gd::BaseEvent> event =
        extensionsLoaded[i]->CreateEvent(eventType);
    if (event != std::shared_ptr<gd::BaseEvent>()) return event;
  }

  return std::shared_ptr<gd::BaseEvent>();
}
#endif

}  // namespace gd
