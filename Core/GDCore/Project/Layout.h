/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/EventsList.h"
#include "GDCore/IDE/Dialogs/LayoutEditorCanvas/EditorSettings.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Layer.h"
#include "GDCore/Project/LayersContainer.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class Object;
class Project;
class InitialInstancesContainer;
}  // namespace gd
class BaseProfiler;
#undef GetObject  // Disable an annoying macro

namespace gd {

/**
 * \brief Represent a layout ( also called a scene ) of a project.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Layout {
 public:
  Layout();
  Layout(const Layout&);
  virtual ~Layout();
  Layout& operator=(const Layout& rhs);

  /**
   * \brief Return a pointer to a copy of the layout.
   */
  Layout* Clone() const { return new Layout(*this); };

  /** \name Common properties
   * Members functions related to common properties of layouts
   */
  ///@{

  /**
   * Change the name of the layout with the name passed as parameter.
   */
  void SetName(const gd::String& name_);

  /**
   * Return the name of the layout.
   */
  const gd::String& GetName() const { return name; };

  /**
   * Return the name of the layout mangled by SceneNameMangler.
   */
  const gd::String& GetMangledName() const { return mangledName; };

  /**
   * Set the background color
   */
  void SetBackgroundColor(unsigned int r, unsigned int g, unsigned int b) {
    backgroundColorR = r;
    backgroundColorG = g;
    backgroundColorB = b;
  }

  /**
   * Get the background color red component
   */
  unsigned int GetBackgroundColorRed() const { return backgroundColorR; }

  /**
   * Get the background color green component
   */
  unsigned int GetBackgroundColorGreen() const { return backgroundColorG; }

  /**
   * Get the background color blue component
   */
  unsigned int GetBackgroundColorBlue() const { return backgroundColorB; }

  /**
   * Get scene window default title
   */
  const gd::String& GetWindowDefaultTitle() const { return title; };

  /**
   * Set scene window default title
   */
  void SetWindowDefaultTitle(const gd::String& title_) { title = title_; };

  ///@}

  /** \name Layout's objects
   */
  ///@{
  /**
   * \brief return the objects of the scene.
   */
  gd::ObjectsContainer& GetObjects() {
    return objectsContainer;
  }

  /**
   * \brief Return the objects of the scene.
   */
  const gd::ObjectsContainer& GetObjects() const {
    return objectsContainer;
  }
  ///@}

  /** \name Layout's initial instances
   * Members functions related to initial instances of objects created at the
   * layout start up
   */
  ///@{
  /**
   * Return the container storing initial instances.
   */
  const gd::InitialInstancesContainer& GetInitialInstances() const {
    return initialInstances;
  }

  /**
   * Return the container storing initial instances.
   */
  gd::InitialInstancesContainer& GetInitialInstances() {
    return initialInstances;
  }
  ///@}

  /** \name Layout's events
   * Members functions related to events management.
   */
  ///@{

  /**
   * Get the events of the layout
   */
  const gd::EventsList& GetEvents() const { return events; }

  /**
   * Get the events of the layout
   */
  gd::EventsList& GetEvents() { return events; }

  ///@}

  /** \name Variable management
   * Members functions related to layout variables management.
   */
  ///@{

  /**
   * \brief Get the variables of the scene.
   *
   * \see gd::VariablesContainer
   */
  inline const gd::VariablesContainer& GetVariables() const {
    return variables;
  }

  /**
   * \brief Get the variables of the scene.
   *
   * \see gd::VariablesContainer
   */
  inline gd::VariablesContainer& GetVariables() { return variables; }

  ///@}

  /** \name Layers
   */
  ///@{

  /**
   * \brief Get the layers of the scene.
   */
  const gd::LayersContainer& GetLayers() const { return layers; }

  /**
   * \brief Get the layers of the scene.
   */
  gd::LayersContainer& GetLayers() { return layers; }

  /**
   * @deprecated
   */
  bool HasLayerNamed(const gd::String& name) const;

  /**
   * @deprecated
   */
  Layer& GetLayer(const gd::String& name);

  /**
   * @deprecated
   */
  const Layer& GetLayer(const gd::String& name) const;

  /**
   * @deprecated
   */
  Layer& GetLayer(std::size_t index);

  /**
   * @deprecated
   */
  const Layer& GetLayer(std::size_t index) const;

  /**
   * @deprecated
   */
  std::size_t GetLayerPosition(const gd::String& name) const;

  /**
   * @deprecated
   */
  std::size_t GetLayersCount() const;

  /**
   * @deprecated
   */
  void InsertNewLayer(const gd::String& name, std::size_t position);

  /**
   * @deprecated
   */
  void InsertLayer(const Layer& theLayer, std::size_t position);

  /**
   * @deprecated
   */
  void RemoveLayer(const gd::String& name);

  /**
   * @deprecated
   */
  void SwapLayers(std::size_t firstLayerIndex, std::size_t secondLayerIndex);

  /**
   * @deprecated
   */
  void MoveLayer(std::size_t oldIndex, std::size_t newIndex);
  ///@}

  /**
   * This ensures that the scene had an instance of shared data for
   * every behavior of every object that can be used on the scene
   * (i.e. the objects of the scene and the global objects)
   *
   * Must be called when a behavior have been added/deleted
   * or when a scene have been added to a project.
   */
  void UpdateBehaviorsSharedData(gd::Project& project);

  /**
   * \brief Get the names of all shared data stored for behaviors
   */
  std::vector<gd::String> GetAllBehaviorSharedDataNames() const;

  /**
   * \brief Check if shared data are stored for a behavior
   */
  bool HasBehaviorSharedData(const gd::String& behaviorName);

  /**
   * \brief Get the shared data stored for a behavior
   */
  const gd::BehaviorsSharedData& GetBehaviorSharedData(
      const gd::String& behaviorName) const;

  /**
   * \brief Get the shared data stored for a behavior
   */
  gd::BehaviorsSharedData& GetBehaviorSharedData(
      const gd::String& behaviorName);

  /**
   * \brief Get a map of all shared data stored for behaviors
   */
  const std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>&
  GetAllBehaviorSharedData() const;

  /**
   * Return the settings associated to the layout.
   * \see gd::EditorSettings
   */
  const gd::EditorSettings& GetAssociatedEditorSettings() const {
    return editorSettings;
  }

  /**
   * Return the settings associated to the layout.
   * \see gd::EditorSettings
   */
  gd::EditorSettings& GetAssociatedEditorSettings() { return editorSettings; }

  /** \name Other properties
   */
  ///@{
  /**
   * Set if the input must be disabled when window lose focus.
   */
  void DisableInputWhenFocusIsLost(bool disable = true) {
    disableInputWhenNotFocused = disable;
  }

  /**
   * Return true if the input must be disabled when window lost focus.
   */
  bool IsInputDisabledWhenFocusIsLost() { return disableInputWhenNotFocused; }

  /**
   * Set if the objects z-order are sorted using the standard method
   */
  void SetStandardSortMethod(bool enable = true) {
    standardSortMethod = enable;
  }

  /**
   * Return true if the objects z-order are sorted using the standard method
   */
  bool StandardSortMethod() const { return standardSortMethod; }

  /**
   * Set if the scene must stop all the sounds being played when it is launched.
   */
  void SetStopSoundsOnStartup(bool enable = true) {
    stopSoundsOnStartup = enable;
  }

  /**
   * Return true if the scene must stop all the sounds being played when it is
   * launched
   */
  bool StopSoundsOnStartup() const { return stopSoundsOnStartup; }
  ///@}

  /** \name Saving and loading
   * Members functions related to saving and loading the object.
   */
  ///@{
  /**
   * \brief Serialize the layout.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the layout.
   */
  void UnserializeFrom(gd::Project& project, const SerializerElement& element);
  ///@}

 private:
  gd::String name;         ///< Scene name
  gd::String mangledName;  ///< The scene name mangled by SceneNameMangler
  unsigned int backgroundColorR = 0;     ///< Background color Red component
  unsigned int backgroundColorG = 0;     ///< Background color Green component
  unsigned int backgroundColorB = 0;     ///< Background color Blue component
  gd::String title;                  ///< Title displayed in the window
  gd::VariablesContainer variables;  ///< Variables list
  gd::ObjectsContainer objectsContainer;
  gd::InitialInstancesContainer initialInstances;  ///< Initial instances
  gd::LayersContainer layers;
  std::map<gd::String, std::unique_ptr<gd::BehaviorsSharedData>>
      behaviorsSharedData;   ///< Initial shared datas of behaviors
  bool stopSoundsOnStartup = true;  ///< True to make the scene stop all sounds at
                                    ///< startup.
  bool standardSortMethod = true;   ///< True to sort objects using standard sort.
  bool disableInputWhenNotFocused = true;  /// If set to true, the input must be
                                           /// disabled when the window do not have the
                                           /// focus.
  static gd::BehaviorsSharedData
      badBehaviorSharedData;  ///< Null object, returned when
                              ///< GetBehaviorSharedData can not find the
                              ///< specified behavior shared data.

  EventsList events;  ///< Scene events
  gd::EditorSettings editorSettings;

  /**
   * Initialize from another layout. Used by copy-ctor and assign-op.
   * Don't forget to update me if members were changed!
   */
  void Init(const gd::Layout& other);

  std::unique_ptr<gd::BehaviorsSharedData> CreateBehaviorsSharedData(
      gd::Project& project,
      const gd::String& name,
      const gd::String& behaviorsType);
};

/**
 * \brief Get the names of all layers from the given layout
 * that are invisible.
 * \see gd::Layout
 */
std::vector<gd::String> GetHiddenLayers(const Layout& layout);

/**
 * \brief Get a type from an object/group name.
 * \note If a group contains only objects of a same type, then the group has
 * this type. Otherwise, it is considered as an object without any specific
 * type.
 * \deprecated Use gd::ObjectsContainersList::GetTypeOfObject instead.
 *
 * @return Type of the object/group.
 */
gd::String GD_CORE_API GetTypeOfObject(const ObjectsContainer& game,
                                       const ObjectsContainer& layout,
                                       gd::String objectName,
                                       bool searchInGroups = true);
/**
 * \brief Check if an object or all objects of a group has a behavior.
 * \deprecated Use gd::ObjectsContainersList::HasBehaviorInObjectOrGroup
 * instead.
 */
bool GD_CORE_API HasBehaviorInObjectOrGroup(const gd::ObjectsContainer& project,
                                            const gd::ObjectsContainer& layout,
                                            const gd::String& objectOrGroupName,
                                            const gd::String& behaviorName,
                                            bool searchInGroups = true);
/**
 * \brief Get the names of behavior of a given type if an object or all objects
 * of a group has it.
 */
std::vector<gd::String> GD_CORE_API
GetBehaviorNamesInObjectOrGroup(const gd::ObjectsContainer& project,
                                const gd::ObjectsContainer& layout,
                                const gd::String& objectOrGroupName,
                                const gd::String& behaviorType,
                                bool searchInGroups);

/**
 * \brief Check if a behavior is a default one or doesn't exist in an object or
 * all objects of a group.
 */
bool GD_CORE_API IsDefaultBehavior(const gd::ObjectsContainer& project,
                                   const gd::ObjectsContainer& layout,
                                   gd::String objectOrGroupName,
                                   gd::String behaviorName,
                                   bool searchInGroups = true);

/**
 * \brief Get the type of a behavior if an object or all objects of a group has
 * it.
 */
gd::String GD_CORE_API
GetTypeOfBehaviorInObjectOrGroup(const gd::ObjectsContainer& project,
                                 const gd::ObjectsContainer& layout,
                                 const gd::String& objectOrGroupName,
                                 const gd::String& behaviorName,
                                 bool searchInGroups = true);
/**
 * \brief Get a type from a behavior name
 * @return Type of the behavior.
 * @deprecated - Use GetTypeOfBehaviorInObjectOrGroup instead.
 */
gd::String GD_CORE_API GetTypeOfBehavior(const ObjectsContainer& game,
                                         const ObjectsContainer& layout,
                                         gd::String behaviorName,
                                         bool searchInGroups = true);

/**
 * \brief Get behaviors of an object/group
 * \note The behaviors of a group are the behaviors which are found in common
 * when looking all the objects of the group.
 *
 * @return Vector containing names of behaviors
 */
std::vector<gd::String> GD_CORE_API
GetBehaviorsOfObject(const ObjectsContainer& game,
                     const ObjectsContainer& layout,
                     const gd::String& objectName,
                     bool searchInGroups = true);

}  // namespace gd

typedef gd::Layout Scene;
