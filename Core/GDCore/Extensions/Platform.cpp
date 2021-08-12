/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/String.h"

using namespace std;

#undef CreateEvent

namespace gd {

Platform::Platform(): enableExtensionLoadingLogs(false) {}

Platform::~Platform() {}

bool Platform::AddExtension(std::shared_ptr<gd::PlatformExtension> extension) {
  if (!extension) return false;

  if (enableExtensionLoadingLogs) std::cout << "Loading " << extension->GetName() << "...";
  if (IsExtensionLoaded(extension->GetName())) {
    if (enableExtensionLoadingLogs) std::cout << " (replacing existing extension)";
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

std::unique_ptr<gd::Object> Platform::CreateObject(
    gd::String type, const gd::String& name) const {
  if (creationFunctionTable.find(type) == creationFunctionTable.end()) {
    std::cout << "Tried to create an object with an unknown type: " << type
              << " for platform " << GetName() << "!" << std::endl;
    type = "";
    if (creationFunctionTable.find("") == creationFunctionTable.end()) {
      std::cout << "Unable to create a Base object!" << std::endl;
      return nullptr;
    }
  }

  // Create a new object with the type we want.
  std::unique_ptr<gd::Object> object =
      (creationFunctionTable.find(type)->second)(name);
  object->SetType(type);

  return std::unique_ptr<gd::Object>(std::move(object));
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
