/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Project/EventsFunction.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class SerializerElement;
}  // namespace gd

namespace gd {

/**
 * \brief The fixed role of an events function owned by a scene or an External
 * Events resource.
 */
enum class SceneLifecycleFunctionRole {
  SceneLoad,
  SceneSignal,
  SceneUpdate,
  SceneUnload,
};

/**
 * \brief Owns the four fixed lifecycle functions of a scene-like event source.
 *
 * Unlike EventsFunctionsContainer, this container deliberately has no insert,
 * remove or reorder API. The function metadata and presentation order are part
 * of the scene lifecycle contract; only the event bodies are author-editable.
 */
class GD_CORE_API SceneLifecycleEventsFunctions {
 public:
  /**
   * \brief JavaScript binding-friendly mirror of SceneLifecycleFunctionRole.
   *
   * Native code should prefer SceneLifecycleFunctionRole. Keeping these values
   * nested makes them available as constants on the fixed container in
   * GDevelop.js, like other bound C++ enums.
   */
  enum Role {
    SceneLoad = 0,
    SceneSignal = 1,
    SceneUpdate = 2,
    SceneUnload = 3,
  };

  SceneLifecycleEventsFunctions();

  gd::EventsFunction& Get(gd::SceneLifecycleFunctionRole role);
  const gd::EventsFunction& Get(
      gd::SceneLifecycleFunctionRole role) const;

  gd::EventsFunction& Get(Role role) {
    return Get(static_cast<gd::SceneLifecycleFunctionRole>(role));
  }
  const gd::EventsFunction& Get(Role role) const {
    return Get(static_cast<gd::SceneLifecycleFunctionRole>(role));
  }

  /**
   * \brief Return the lifecycle function with the canonical role name.
   *
   * \throws std::logic_error when name is not a canonical lifecycle role.
   * Call HasRoleName first when handling untrusted input.
   */
  gd::EventsFunction& GetByName(const gd::String& name);
  const gd::EventsFunction& GetByName(const gd::String& name) const;

  bool HasRoleName(const gd::String& name) const;

  gd::EventsFunction& GetSceneLoadFunction() { return sceneLoad; }
  const gd::EventsFunction& GetSceneLoadFunction() const { return sceneLoad; }

  gd::EventsFunction& GetSceneSignalFunction() { return sceneSignal; }
  const gd::EventsFunction& GetSceneSignalFunction() const {
    return sceneSignal;
  }

  gd::EventsFunction& GetSceneUpdateFunction() { return sceneUpdate; }
  const gd::EventsFunction& GetSceneUpdateFunction() const {
    return sceneUpdate;
  }

  gd::EventsFunction& GetSceneUnloadFunction() { return sceneUnload; }
  const gd::EventsFunction& GetSceneUnloadFunction() const {
    return sceneUnload;
  }

  gd::EventsList& GetEvents(gd::SceneLifecycleFunctionRole role) {
    return Get(role).GetEvents();
  }
  const gd::EventsList& GetEvents(
      gd::SceneLifecycleFunctionRole role) const {
    return Get(role).GetEvents();
  }

  /**
   * \brief Visit the functions in their stable presentation order.
   */
  template <typename Callback>
  void ForEach(Callback callback) {
    callback(gd::SceneLifecycleFunctionRole::SceneLoad, sceneLoad);
    callback(gd::SceneLifecycleFunctionRole::SceneSignal, sceneSignal);
    callback(gd::SceneLifecycleFunctionRole::SceneUpdate, sceneUpdate);
    callback(gd::SceneLifecycleFunctionRole::SceneUnload, sceneUnload);
  }

  /**
   * \brief Visit the functions in their stable presentation order.
   */
  template <typename Callback>
  void ForEach(Callback callback) const {
    callback(gd::SceneLifecycleFunctionRole::SceneLoad, sceneLoad);
    callback(gd::SceneLifecycleFunctionRole::SceneSignal, sceneSignal);
    callback(gd::SceneLifecycleFunctionRole::SceneUpdate, sceneUpdate);
    callback(gd::SceneLifecycleFunctionRole::SceneUnload, sceneUnload);
  }

  /**
   * \brief Return whether all four functions still have their fixed metadata.
   */
  bool HasValidMetadata() const;

  /**
   * \brief Reject lifecycle functions whose fixed metadata was mutated.
   *
   * \throws std::logic_error when the metadata is invalid.
   */
  void ValidateMetadata() const;

  /**
   * \brief Serialize lifecycle event bodies using the legacy single-file
   * project keys.
   *
   * The sceneUpdate body is always stored as `events`. Empty optional bodies
   * are omitted to avoid changing untouched projects.
   */
  void SerializeEventBodiesTo(gd::SerializerElement& element) const;

  /**
   * \brief Load lifecycle event bodies from the legacy single-file project
   * keys and reconstruct all fixed metadata.
   */
  void UnserializeEventBodiesFrom(gd::Project& project,
                                  const gd::SerializerElement& element);

 private:
  void InitializeFunctions();

  gd::EventsFunction sceneLoad;
  gd::EventsFunction sceneSignal;
  gd::EventsFunction sceneUpdate;
  gd::EventsFunction sceneUnload;
};

}  // namespace gd
