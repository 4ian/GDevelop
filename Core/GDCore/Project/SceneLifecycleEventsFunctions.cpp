/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/SceneLifecycleEventsFunctions.h"

#include <algorithm>
#include <array>
#include <stdexcept>

#include "GDCore/Events/Serialization.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {
namespace {

static_assert(
    static_cast<int>(gd::SceneLifecycleFunctionRole::SceneLoad) ==
            gd::SceneLifecycleEventsFunctions::SceneLoad &&
        static_cast<int>(gd::SceneLifecycleFunctionRole::SceneSignal) ==
            gd::SceneLifecycleEventsFunctions::SceneSignal &&
        static_cast<int>(gd::SceneLifecycleFunctionRole::SceneUpdate) ==
            gd::SceneLifecycleEventsFunctions::SceneUpdate &&
        static_cast<int>(gd::SceneLifecycleFunctionRole::SceneUnload) ==
            gd::SceneLifecycleEventsFunctions::SceneUnload,
    "The native and GDevelop.js scene lifecycle role enums must stay aligned.");

struct LifecycleRegistryEntry {
  gd::SceneLifecycleFunctionRole role;
  const char* name;
  const char* fullName;
  const char* description;
  const char* iconPath;
  const char* legacyEventsKey;
  const char* executionMultiplicity;
  bool hasSignalParameters;
  bool isOptionalInLegacyFormat;
};

/**
 * The canonical lifecycle registry. Its array order is also the presentation,
 * serialization and traversal order.
 *
 * iconPath and executionMultiplicity are kept here even though the core model
 * does not consume them yet. This prevents future adapters from inventing a
 * second role registry when they expose these attributes.
 */
const std::array<LifecycleRegistryEntry, 4>& GetLifecycleRegistry() {
  static const std::array<LifecycleRegistryEntry, 4> registry{{
      {gd::SceneLifecycleFunctionRole::SceneLoad,
       "sceneLoad",
       "On scene load",
       "Events run once after this scene has loaded, before its first update.",
       "res/functions/create_black.svg",
       "sceneLoadEvents",
       "onceOnFirstFrame",
       false,
       true},
      {gd::SceneLifecycleFunctionRole::SceneSignal,
       "sceneSignal",
       "On scene signal",
       "Events run once for each scene signal delivered to this scene.",
       "res/functions/signal_black.svg",
       "sceneSignalEvents",
       "oncePerDeliveredSceneSignal",
       true,
       true},
      {gd::SceneLifecycleFunctionRole::SceneUpdate,
       "sceneUpdate",
       "Scene update",
       "Events run every frame while this scene is active.",
       "res/functions/step_black.svg",
       "events",
       "oncePerFrame",
       false,
       false},
      {gd::SceneLifecycleFunctionRole::SceneUnload,
       "sceneUnload",
       "On scene unload",
       "Events run once before this scene and its objects are unloaded.",
       "res/functions/destroy_black.svg",
       "sceneUnloadEvents",
       "onceBeforeUnload",
       false,
       true},
  }};
  return registry;
}

const LifecycleRegistryEntry* FindRegistryEntry(const gd::String& name) {
  for (const auto& entry : GetLifecycleRegistry()) {
    if (name == entry.name) return &entry;
  }
  return nullptr;
}

void InitializeFunction(gd::EventsFunction& function,
                        const LifecycleRegistryEntry& entry) {
  function = gd::EventsFunction();
  function.SetName(entry.name)
      .SetFullName(entry.fullName)
      .SetDescription(entry.description)
      .SetSentence("")
      .SetGroup("Lifecycle")
      .SetFunctionType(gd::EventsFunction::Action)
      .SetPrivate(true)
      .SetAsync(false);
}

void AddStringParameter(gd::EventsFunction& function,
                        const gd::String& name,
                        const gd::String& description) {
  gd::ParameterMetadata parameter;
  parameter.SetName(name).SetType("string").SetDescription(description);
  function.GetParameters().AddParameter(parameter);
}

bool HasExpectedCommonMetadata(const gd::EventsFunction& function,
                               const LifecycleRegistryEntry& entry) {
  return function.GetName() == entry.name &&
         function.GetFullName() == entry.fullName &&
         function.GetDescription() == entry.description &&
         function.GetSentence().empty() && function.GetGroup() == "Lifecycle" &&
         function.GetFunctionType() == gd::EventsFunction::Action &&
         function.IsPrivate() && !function.IsAsync() &&
         function.GetGetterName().empty() &&
         function.GetObjectGroups().IsEmpty();
}

bool HasNoParameters(const gd::EventsFunction& function) {
  return function.GetParameters().GetParametersCount() == 0;
}

bool HasSceneSignalParameters(const gd::EventsFunction& function) {
  const auto& parameters = function.GetParameters();
  return parameters.GetParametersCount() == 2 &&
         parameters.GetParameter(0).GetName() == "SignalName" &&
         parameters.GetParameter(0).GetType() == "string" &&
         parameters.GetParameter(0).GetDescription() == "Signal name" &&
         !parameters.GetParameter(0).IsOptional() &&
         !parameters.GetParameter(0).IsCodeOnly() &&
         parameters.GetParameter(1).GetName() == "Payload" &&
         parameters.GetParameter(1).GetType() == "string" &&
         parameters.GetParameter(1).GetDescription() == "Payload" &&
         !parameters.GetParameter(1).IsOptional() &&
         !parameters.GetParameter(1).IsCodeOnly();
}

}  // namespace

SceneLifecycleEventsFunctions::SceneLifecycleEventsFunctions() {
  InitializeSlots();
  sceneUpdatePresent = true;
}

void SceneLifecycleEventsFunctions::InitializeSlots() {
  sceneLoadPresent = false;
  sceneSignalPresent = false;
  sceneUpdatePresent = false;
  sceneUnloadPresent = false;
  for (const auto& entry : GetLifecycleRegistry()) {
    auto& function = GetSlot(entry.role);
    InitializeFunction(function, entry);
    if (entry.hasSignalParameters) {
      AddStringParameter(function, "SignalName", "Signal name");
      AddStringParameter(function, "Payload", "Payload");
    }
  }
}

gd::EventsFunction& SceneLifecycleEventsFunctions::GetSlot(
    gd::SceneLifecycleFunctionRole role) {
  switch (role) {
    case gd::SceneLifecycleFunctionRole::SceneLoad:
      return sceneLoad;
    case gd::SceneLifecycleFunctionRole::SceneSignal:
      return sceneSignal;
    case gd::SceneLifecycleFunctionRole::SceneUpdate:
      return sceneUpdate;
    case gd::SceneLifecycleFunctionRole::SceneUnload:
      return sceneUnload;
  }
  throw std::logic_error("Unknown scene lifecycle function role.");
}

const gd::EventsFunction& SceneLifecycleEventsFunctions::GetSlot(
    gd::SceneLifecycleFunctionRole role) const {
  switch (role) {
    case gd::SceneLifecycleFunctionRole::SceneLoad:
      return sceneLoad;
    case gd::SceneLifecycleFunctionRole::SceneSignal:
      return sceneSignal;
    case gd::SceneLifecycleFunctionRole::SceneUpdate:
      return sceneUpdate;
    case gd::SceneLifecycleFunctionRole::SceneUnload:
      return sceneUnload;
  }
  throw std::logic_error("Unknown scene lifecycle function role.");
}

bool& SceneLifecycleEventsFunctions::GetPresence(
    gd::SceneLifecycleFunctionRole role) {
  switch (role) {
    case gd::SceneLifecycleFunctionRole::SceneLoad:
      return sceneLoadPresent;
    case gd::SceneLifecycleFunctionRole::SceneSignal:
      return sceneSignalPresent;
    case gd::SceneLifecycleFunctionRole::SceneUpdate:
      return sceneUpdatePresent;
    case gd::SceneLifecycleFunctionRole::SceneUnload:
      return sceneUnloadPresent;
  }
  throw std::logic_error("Unknown scene lifecycle function role.");
}

bool SceneLifecycleEventsFunctions::Has(
    gd::SceneLifecycleFunctionRole role) const {
  switch (role) {
    case gd::SceneLifecycleFunctionRole::SceneLoad:
      return sceneLoadPresent;
    case gd::SceneLifecycleFunctionRole::SceneSignal:
      return sceneSignalPresent;
    case gd::SceneLifecycleFunctionRole::SceneUpdate:
      return sceneUpdatePresent;
    case gd::SceneLifecycleFunctionRole::SceneUnload:
      return sceneUnloadPresent;
  }
  return false;
}

bool SceneLifecycleEventsFunctions::HasByName(
    const gd::String& name) const {
  const auto* entry = FindRegistryEntry(name);
  return entry && Has(entry->role);
}

gd::EventsFunction& SceneLifecycleEventsFunctions::Get(
    gd::SceneLifecycleFunctionRole role) {
  return GetSlot(role);
}

const gd::EventsFunction& SceneLifecycleEventsFunctions::Get(
    gd::SceneLifecycleFunctionRole role) const {
  return GetSlot(role);
}

const gd::EventsFunction& SceneLifecycleEventsFunctions::GetOrEmpty(
    gd::SceneLifecycleFunctionRole role) const {
  return GetSlot(role);
}

const gd::EventsFunction& SceneLifecycleEventsFunctions::GetOrEmptyByName(
    const gd::String& name) const {
  const auto* entry = FindRegistryEntry(name);
  if (!entry) {
    throw std::logic_error("Unknown scene lifecycle function name.");
  }
  return GetOrEmpty(entry->role);
}

gd::EventsFunction& SceneLifecycleEventsFunctions::Insert(
    gd::SceneLifecycleFunctionRole role) {
  auto& presence = GetPresence(role);
  if (!presence) {
    const auto& entry = *std::find_if(
        GetLifecycleRegistry().begin(), GetLifecycleRegistry().end(),
        [role](const LifecycleRegistryEntry& entry) {
          return entry.role == role;
        });
    auto& function = GetSlot(role);
    InitializeFunction(function, entry);
    if (entry.hasSignalParameters) {
      AddStringParameter(function, "SignalName", "Signal name");
      AddStringParameter(function, "Payload", "Payload");
    }
    presence = true;
  }
  return GetSlot(role);
}

gd::EventsFunction& SceneLifecycleEventsFunctions::InsertByName(
    const gd::String& name) {
  const auto* entry = FindRegistryEntry(name);
  if (!entry) {
    throw std::logic_error("Unknown scene lifecycle function name.");
  }
  return Insert(entry->role);
}

bool SceneLifecycleEventsFunctions::Remove(
    gd::SceneLifecycleFunctionRole role) {
  auto& presence = GetPresence(role);
  if (!presence) return false;

  const auto& entry = *std::find_if(
      GetLifecycleRegistry().begin(), GetLifecycleRegistry().end(),
      [role](const LifecycleRegistryEntry& entry) {
        return entry.role == role;
      });
  auto& function = GetSlot(role);
  InitializeFunction(function, entry);
  if (entry.hasSignalParameters) {
    AddStringParameter(function, "SignalName", "Signal name");
    AddStringParameter(function, "Payload", "Payload");
  }
  presence = false;
  return true;
}

bool SceneLifecycleEventsFunctions::RemoveByName(const gd::String& name) {
  const auto* entry = FindRegistryEntry(name);
  if (!entry) {
    throw std::logic_error("Unknown scene lifecycle function name.");
  }
  return Remove(entry->role);
}

gd::EventsFunction& SceneLifecycleEventsFunctions::GetByName(
    const gd::String& name) {
  const auto* entry = FindRegistryEntry(name);
  if (entry) return Get(entry->role);
  throw std::logic_error("Unknown scene lifecycle function name.");
}

const gd::EventsFunction& SceneLifecycleEventsFunctions::GetByName(
    const gd::String& name) const {
  const auto* entry = FindRegistryEntry(name);
  if (entry) return Get(entry->role);
  throw std::logic_error("Unknown scene lifecycle function name.");
}

bool SceneLifecycleEventsFunctions::HasRoleName(
    const gd::String& name) const {
  return FindRegistryEntry(name) != nullptr;
}

bool SceneLifecycleEventsFunctions::HasValidMetadata() const {
  for (const auto& entry : GetLifecycleRegistry()) {
    const auto& function = GetSlot(entry.role);
    if (!HasExpectedCommonMetadata(function, entry)) return false;
    if (entry.hasSignalParameters ? !HasSceneSignalParameters(function)
                                  : !HasNoParameters(function)) {
      return false;
    }
  }
  return true;
}

void SceneLifecycleEventsFunctions::ValidateMetadata() const {
  if (!HasValidMetadata()) {
    throw std::logic_error(
        "Scene lifecycle function metadata does not match its fixed role.");
  }
}

void SceneLifecycleEventsFunctions::SerializeEventBodiesTo(
    gd::SerializerElement& element) const {
  ValidateMetadata();

  auto& presenceElement = element.AddChild("sceneLifecycleFunctions");
  presenceElement.ConsiderAsArray();
  for (const auto& entry : GetLifecycleRegistry()) {
    if (Has(entry.role)) {
      presenceElement.AddChild("").SetStringValue(entry.name);
    }
  }

  for (const auto& entry : GetLifecycleRegistry()) {
    if (!Has(entry.role)) {
      if (entry.role == gd::SceneLifecycleFunctionRole::SceneUpdate) {
        gd::EventsListSerialization::SerializeEventsTo(
            GetSlot(entry.role).GetEvents(),
            element.AddChild(entry.legacyEventsKey));
      }
      continue;
    }
    gd::EventsListSerialization::SerializeEventsTo(
        Get(entry.role).GetEvents(), element.AddChild(entry.legacyEventsKey));
  }
}

void SceneLifecycleEventsFunctions::UnserializeEventBodiesFrom(
    gd::Project& project,
    const gd::SerializerElement& element) {
  InitializeSlots();

  if (element.HasChild("sceneLifecycleFunctions")) {
    const auto& presenceElement =
        element.GetChild("sceneLifecycleFunctions");
    int previousOrder = -1;
    for (std::size_t i = 0; i < presenceElement.GetChildrenCount(); ++i) {
      const auto name = presenceElement.GetChild(i).GetStringValue();
      const auto* entry = FindRegistryEntry(name);
      if (!entry) {
        throw std::logic_error("Unknown scene lifecycle function name.");
      }
      const int order = static_cast<int>(entry->role);
      if (order <= previousOrder) {
        throw std::logic_error(
            "Scene lifecycle function presence must be unique and ordered.");
      }
      previousOrder = order;
      Insert(entry->role);
    }

    for (const auto& entry : GetLifecycleRegistry()) {
      const bool hasBody = element.HasChild(entry.legacyEventsKey);
      if (Has(entry.role)) {
        if (!hasBody) {
          throw std::logic_error(
              "Attached scene lifecycle function has no event body.");
        }
        gd::EventsListSerialization::UnserializeEventsFrom(
            project, Get(entry.role).GetEvents(),
            element.GetChild(entry.legacyEventsKey));
      } else if (hasBody) {
        auto& emptySlot = GetSlot(entry.role);
        gd::EventsListSerialization::UnserializeEventsFrom(
            project, emptySlot.GetEvents(),
            element.GetChild(entry.legacyEventsKey));
        const bool isAllowedEmptyUpdateShadow =
            entry.role == gd::SceneLifecycleFunctionRole::SceneUpdate &&
            emptySlot.GetEvents().IsEmpty();
        if (!isAllowedEmptyUpdateShadow) {
          InitializeFunction(emptySlot, entry);
          if (entry.hasSignalParameters) {
            AddStringParameter(emptySlot, "SignalName", "Signal name");
            AddStringParameter(emptySlot, "Payload", "Payload");
          }
          throw std::logic_error(
              "Detached scene lifecycle function has an event body.");
        }
      }
    }
    return;
  }

  for (const auto& entry : GetLifecycleRegistry()) {
    const bool hasBody = element.HasChild(entry.legacyEventsKey);
    if (entry.isOptionalInLegacyFormat && !hasBody) {
      continue;
    }
    Insert(entry.role);
    const auto& eventsElement =
        entry.role == gd::SceneLifecycleFunctionRole::SceneUpdate
            ? element.GetChild(entry.legacyEventsKey, 0, "Events")
            : element.GetChild(entry.legacyEventsKey);
    gd::EventsListSerialization::UnserializeEventsFrom(
        project, Get(entry.role).GetEvents(), eventsElement);
  }
}

}  // namespace gd
