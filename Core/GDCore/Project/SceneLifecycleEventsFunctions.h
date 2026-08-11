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
 * \brief Owns the four reserved lifecycle function slots of a scene-like
 * event source.
 *
 * The slots have stable addresses, but each role has an explicit presence
 * state. This allows functions to be attached or removed without invalidating
 * borrowed wrappers for the other roles. Metadata and presentation order are
 * fixed by the scene lifecycle contract.
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

  bool Has(gd::SceneLifecycleFunctionRole role) const;
  bool Has(Role role) const {
    return Has(static_cast<gd::SceneLifecycleFunctionRole>(role));
  }
  bool HasByName(const gd::String& name) const;

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

  gd::EventsFunction& Insert(gd::SceneLifecycleFunctionRole role);
  gd::EventsFunction& Insert(Role role) {
    return Insert(static_cast<gd::SceneLifecycleFunctionRole>(role));
  }
  gd::EventsFunction& InsertByName(const gd::String& name);

  bool Remove(gd::SceneLifecycleFunctionRole role);
  bool Remove(Role role) {
    return Remove(static_cast<gd::SceneLifecycleFunctionRole>(role));
  }
  bool RemoveByName(const gd::String& name);

  /**
   * \brief Return the stable slot for a role, whether present or not.
   *
   * An absent slot always has canonical metadata and an empty body. This is a
   * read-only semantic fallback for consumers that treat missing functions as
   * empty functions.
   */
  const gd::EventsFunction& GetOrEmpty(
      gd::SceneLifecycleFunctionRole role) const;
  const gd::EventsFunction& GetOrEmptyByName(const gd::String& name) const;

  bool HasRoleName(const gd::String& name) const;

  gd::EventsFunction& GetSceneLoadFunction() {
    return Insert(gd::SceneLifecycleFunctionRole::SceneLoad);
  }
  const gd::EventsFunction& GetSceneLoadFunction() const {
    return GetOrEmpty(gd::SceneLifecycleFunctionRole::SceneLoad);
  }

  gd::EventsFunction& GetSceneSignalFunction() {
    return Insert(gd::SceneLifecycleFunctionRole::SceneSignal);
  }
  const gd::EventsFunction& GetSceneSignalFunction() const {
    return GetOrEmpty(gd::SceneLifecycleFunctionRole::SceneSignal);
  }

  gd::EventsFunction& GetSceneUpdateFunction() {
    return Insert(gd::SceneLifecycleFunctionRole::SceneUpdate);
  }
  const gd::EventsFunction& GetSceneUpdateFunction() const {
    return GetOrEmpty(gd::SceneLifecycleFunctionRole::SceneUpdate);
  }

  gd::EventsFunction& GetSceneUnloadFunction() {
    return Insert(gd::SceneLifecycleFunctionRole::SceneUnload);
  }
  const gd::EventsFunction& GetSceneUnloadFunction() const {
    return GetOrEmpty(gd::SceneLifecycleFunctionRole::SceneUnload);
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
    if (sceneLoadPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneLoad, sceneLoad);
    if (sceneSignalPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneSignal, sceneSignal);
    if (sceneUpdatePresent)
      callback(gd::SceneLifecycleFunctionRole::SceneUpdate, sceneUpdate);
    if (sceneUnloadPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneUnload, sceneUnload);
  }

  /**
   * \brief Visit the functions in their stable presentation order.
   */
  template <typename Callback>
  void ForEach(Callback callback) const {
    if (sceneLoadPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneLoad, sceneLoad);
    if (sceneSignalPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneSignal, sceneSignal);
    if (sceneUpdatePresent)
      callback(gd::SceneLifecycleFunctionRole::SceneUpdate, sceneUpdate);
    if (sceneUnloadPresent)
      callback(gd::SceneLifecycleFunctionRole::SceneUnload, sceneUnload);
  }

  /**
   * \brief Return whether all four stable slots still have fixed metadata.
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
   * Presence is stored independently from body emptiness. `events` remains the
   * compatibility body key for sceneUpdate.
   */
  void SerializeEventBodiesTo(gd::SerializerElement& element) const;

  /**
   * \brief Load lifecycle event bodies from the legacy single-file project
   * keys and reconstruct fixed metadata and presence.
   */
  void UnserializeEventBodiesFrom(gd::Project& project,
                                  const gd::SerializerElement& element);

 private:
  void InitializeSlots();
  gd::EventsFunction& GetSlot(gd::SceneLifecycleFunctionRole role);
  const gd::EventsFunction& GetSlot(
      gd::SceneLifecycleFunctionRole role) const;
  bool& GetPresence(gd::SceneLifecycleFunctionRole role);

  gd::EventsFunction sceneLoad;
  gd::EventsFunction sceneSignal;
  gd::EventsFunction sceneUpdate;
  gd::EventsFunction sceneUnload;
  bool sceneLoadPresent;
  bool sceneSignalPresent;
  bool sceneUpdatePresent;
  bool sceneUnloadPresent;
};

}  // namespace gd
