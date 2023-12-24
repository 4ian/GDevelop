/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <set>
#include <unordered_set>
#include <unordered_map>
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Platform;
class Project;
class Layout;
class Layer;
class Object;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class ObjectsContainer;
class VariablesContainer;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventsFunctionsWorker;
class ArbitraryEventsWorkerWithContext;
class ArbitraryEventBasedBehaviorsWorker;
class ArbitraryBehaviorSharedDataWorker;
class Behavior;
class BehaviorMetadata;
class UnfilledRequiredBehaviorPropertyProblem;
class ProjectBrowser;
class SerializerElement;
}  // namespace gd

namespace gd {

struct VariablesChangeset {
  std::unordered_set<gd::String> removedVariableNames;
  std::unordered_map<gd::String, gd::String> oldToNewVariableNames;

  bool HasRemovedVariables() { return !removedVariableNames.empty(); }

  VariablesChangeset& ClearRemovedVariables() { removedVariableNames.clear(); return *this; }
};

/**
 * \brief Tool functions to do refactoring on the whole project after
 * changes like deletion or renaming of an object.
 *
 * \TODO Ideally ObjectOrGroupRenamedInLayout, ObjectOrGroupRemovedInLayout,
 * GlobalObjectOrGroupRenamed, GlobalObjectOrGroupRemoved would be implemented
 * using ExposeProjectEvents.
 */
class GD_CORE_API WholeProjectRefactorer {
 public:

  /**
   * \brief Compute the changes made on the variables of a variable container.
   */
  static VariablesChangeset ComputeChangesetForVariablesContainer(
    gd::Project &project,
    const gd::SerializerElement &oldSerializedVariablesContainer,
    const gd::VariablesContainer &newVariablesContainer);

  /**
   * \brief Refactor the project according to the changes (renaming or deletion)
   * made to variables.
   */
  static void ApplyRefactoringForVariablesContainer(
    gd::Project &project,
    const gd::VariablesContainer &newVariablesContainer,
    const gd::VariablesChangeset& changeset);

  /**
   * \brief Refactor the project **before** an events function extension is
   * renamed.
   *
   * \warning Do the renaming of the specified extension after calling this.
   * This is because the extension is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsFunctionsExtension(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& oldName,
      const gd::String& newName);

  /**
   * \brief Refactor behavior events after the extension was placed in a new
   * extension.
   */
  static void UpdateExtensionNameInEventsBasedBehavior(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& sourceExtensionName);

  /**
   * \brief Refactor the project **before** an events function is renamed.
   *
   * \warning Do the renaming of the specified function after calling this.
   * This is because the function is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsFunction(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& oldFunctionName,
      const gd::String& newFunctionName);

  /**
   * \brief Refactor the project **before** an events function of a behavior is
   * renamed.
   *
   * \warning Do the renaming of the specified function after calling this.
   * This is because the function is expected to have its old name for the
   * refactoring.
   */
  static void RenameBehaviorEventsFunction(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& oldFunctionName,
      const gd::String& newFunctionName);

  /**
   * \brief Refactor the project **before** an events function of an object is
   * renamed.
   *
   * \warning Do the renaming of the specified function after calling this.
   * This is because the function is expected to have its old name for the
   * refactoring.
   */
  static void RenameObjectEventsFunction(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& oldFunctionName,
      const gd::String& newFunctionName);

  /**
   * \brief Refactor the project **before** an events function parameter
   * is moved.
   *
   * \warning Do the move of the specified function parameters after calling
   * this. This is because the function is expected to be in its old state for
   * the refactoring.
   */
  static void MoveEventsFunctionParameter(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& functionName,
      std::size_t oldIndex,
      std::size_t newIndex);

  /**
   * \brief Refactor the project **before** the parameter of an events function
   * of a behavior is moved.
   *
   * \warning Do the move of the specified function parameters after calling
   * this. This is because the function is expected to be in its old state for
   * the refactoring.
   */
  static void MoveBehaviorEventsFunctionParameter(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& functionName,
      std::size_t oldIndex,
      std::size_t newIndex);

  /**
   * \brief Refactor the project **before** the parameter of an events function
   * of an object is moved.
   *
   * \warning Do the move of the specified function parameters after calling
   * this. This is because the function is expected to be in its old state for
   * the refactoring.
   */
  static void MoveObjectEventsFunctionParameter(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& functionName,
      std::size_t oldIndex,
      std::size_t newIndex);

  /**
   * \brief Refactor the project **before** a property of a behavior is
   * renamed.
   *
   * \warning Do the renaming of the specified property after calling this.
   * This is because the property is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsBasedBehaviorProperty(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& oldPropertyName,
      const gd::String& newPropertyName);

  /**
   * \brief Refactor the project **before** a shared property of a behavior is
   * renamed.
   *
   * \warning Do the renaming of the specified shared property after calling
   * this. This is because the shared property is expected to have its old name
   * for the refactoring.
   */
  static void RenameEventsBasedBehaviorSharedProperty(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& oldPropertyName,
      const gd::String& newPropertyName);

  /**
   * \brief Refactor the project **before** a property of an object is
   * renamed.
   *
   * \warning Do the renaming of the specified property after calling this.
   * This is because the property is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsBasedObjectProperty(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedObject& eventsBasedObject,
      const gd::String& oldPropertyName,
      const gd::String& newPropertyName);

  /**
   * \brief Add a behavior to an object and add required behaviors if necessary
   * to fill every behavior properties of the added behaviors.
   */
  static void AddBehaviorAndRequiredBehaviors(gd::Project& project,
                                              gd::Object& object,
                                              const gd::String& behaviorType,
                                              const gd::String& behaviorName);
  /**
   * \brief Add required behaviors if necessary to fill every behavior
   * properties of the given behaviors.
   */
  static void AddRequiredBehaviorsFor(gd::Project& project,
                                      gd::Object& object,
                                      const gd::String& behaviorName);

  /**
   * \brief Find every behavior of the object that needs the given behaviors
   * directly or indirectly (because of "required behavior" properties).
   */
  static std::vector<gd::String> FindDependentBehaviorNames(
      const gd::Project& project,
      const gd::Object& object,
      const gd::String& behaviorName);

  /**
   * \brief Find the names of the behaviors with the specified type on the object.
   */
  static std::vector<gd::String> GetBehaviorsWithType(const gd::Object& object,
                                                      const gd::String& type);

  /**
   * \brief Find in the project objects having behaviors with "behavior" properties that
   * don't have a valid value (i.e: pointing to a non existing behavior, or of a wrong type).
   */
  static std::vector<gd::UnfilledRequiredBehaviorPropertyProblem>
  FindInvalidRequiredBehaviorProperties(const gd::Project& project);

  /**
   * \brief Fix in the project objects having behaviors with "behavior" properties that
   * don't have a valid value (i.e: pointing to a non existing behavior, or of a wrong type),
   * by setting a proper behavior, or adding missing behaviors to these objects.
   */
  static bool
  FixInvalidRequiredBehaviorProperties(gd::Project& project);

  /**
   * \brief Refactor the project **before** a behavior is renamed.
   *
   * \warning Do the renaming of the specified behavior after calling this.
   * This is because the behavior is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsBasedBehavior(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& oldBehaviorName,
      const gd::String& newBehaviorName);

  /**
   * \brief Refactor the project **before** an object is renamed.
   *
   * \warning Do the renaming of the specified object after calling this.
   * This is because the object is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsBasedObject(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& oldObjectName,
      const gd::String& newObjectName);

  /**
   * \brief Refactor the project after a layout is renamed.
   */
  static void RenameLayout(gd::Project &project, const gd::String &oldName,
                           const gd::String &newName);
  /**
   * \brief Refactor the project after an external layout is renamed.
   */
  static void RenameExternalLayout(gd::Project &project,
                                   const gd::String &oldName,
                                   const gd::String &newName);
  /**
   * \brief Refactor the project after external events are renamed.
   */
  static void RenameExternalEvents(gd::Project &project,
                                   const gd::String &oldName,
                                   const gd::String &newName);
  /**
   * \brief Refactor the project after a layer is renamed.
   */
  static void RenameLayer(gd::Project &project, gd::Layout &layout,
                          const gd::String &oldName, const gd::String &newName);

  /**
   * \brief Refactor the project after a layer effect is renamed.
   */
  static void RenameLayerEffect(gd::Project &project, gd::Layout &layout,
                                gd::Layer &layer, const gd::String &oldName,
                                const gd::String &newName);

  /**
   * \brief Refactor the project after an object animation is renamed.
   */
  static void RenameObjectAnimation(gd::Project &project, gd::Layout &layout,
                                    gd::Object &object,
                                    const gd::String &oldName,
                                    const gd::String &newName);

  /**
   * \brief Refactor the project after an object point is renamed.
   */
  static void RenameObjectPoint(gd::Project &project, gd::Layout &layout,
                                gd::Object &object, const gd::String &oldName,
                                const gd::String &newName);

  /**
   * \brief Refactor the project after an object effect is renamed.
   */
  static void RenameObjectEffect(gd::Project &project, gd::Layout &layout,
                                 gd::Object &object, const gd::String &oldName,
                                 const gd::String &newName);

  /**
   * \brief Refactor the project after an object is renamed in a layout
   *
   * This will update the layout, all external layouts associated with it
   * and all external events associated with it.
   */
  static void ObjectOrGroupRenamedInLayout(gd::Project& project,
                                           gd::Layout& layout,
                                           const gd::String& oldName,
                                           const gd::String& newName,
                                           bool isObjectGroup);

  /**
   * \brief Refactor the project after an object is removed in a layout
   *
   * This will update the layout, all external layouts associated with it
   * and all external events associated with it.
   */
  static void ObjectOrGroupRemovedInLayout(gd::Project& project,
                                           gd::Layout& layout,
                                           const gd::String& objectName,
                                           bool isObjectGroup,
                                           bool removeEventsAndGroups = true);

  /**
   * \brief Refactor the project after an object is removed in an events-based
   * object.
   *
   * This will update the events of the function and groups.
   */
  static void ObjectOrGroupRemovedInEventsBasedObject(
      gd::Project& project,
      gd::EventsBasedObject& eventsBasedObject,
      gd::ObjectsContainer& globalObjectsContainer,
      gd::ObjectsContainer& objectsContainer,
      const gd::String& objectName,
      bool isObjectGroup,
      bool removeEventsAndGroups);

  /**
   * \brief Refactor the events function after an object or group is renamed
   *
   * This will update the events of the function and groups.
   */
  static void ObjectOrGroupRenamedInEventsBasedObject(
      gd::Project& project,
      gd::ObjectsContainer& globalObjectsContainer,
      gd::EventsBasedObject& eventsBasedObject,
      const gd::String& oldName,
      const gd::String& newName,
      bool isObjectGroup);

  /**
   * \brief Refactor the events function after an object or group is renamed
   *
   * This will update the events of the function and groups.
   */
  static void ObjectOrGroupRenamedInEventsFunction(
      gd::Project& project,
      gd::EventsFunction& eventsFunction,
      gd::ObjectsContainer& globalObjectsContainer,
      gd::ObjectsContainer& objectsContainer,
      const gd::String& oldName,
      const gd::String& newName,
      bool isObjectGroup);

  /**
   * \brief Refactor the events function after an object or group is removed
   *
   * This will update the events of the function and groups.
   */
  static void ObjectOrGroupRemovedInEventsFunction(
      gd::Project& project,
      gd::EventsFunction& eventsFunction,
      gd::ObjectsContainer& globalObjectsContainer,
      gd::ObjectsContainer& objectsContainer,
      const gd::String& objectName,
      bool isObjectGroup,
      bool removeEventsAndGroups = true);

  /**
   * \brief Refactor the project after a global object is renamed.
   *
   * This will update all the layouts, all external layouts associated with them
   * and all external events used by the layouts.
   */
  static void GlobalObjectOrGroupRenamed(gd::Project& project,
                                         const gd::String& oldName,
                                         const gd::String& newName,
                                         bool isObjectGroup);

  /**
   * \brief Refactor the project after a global object is removed.
   *
   * This will update all the layouts, all external layouts associated with them
   * and all external events used by the layouts.
   */
  static void GlobalObjectOrGroupRemoved(gd::Project& project,
                                         const gd::String& objectName,
                                         bool isObjectGroup,
                                         bool removeEventsAndGroups = true);

  /**
   * \brief Return the set of all the types of the objects that are using the
   * given behavior.
   */
  static std::set<gd::String> GetAllObjectTypesUsingEventsBasedBehavior(
      const gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior);

  /**
   * \brief Ensure (adding if necessary) that the functions of the given
   * behavior have the proper mandatory parameters (the "Object" and
   * "Behavior").
   */
  static void EnsureBehaviorEventsFunctionsProperParameters(
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior);

  /**
   * \brief Ensure (adding if necessary) that the functions of the given
   * object have the proper mandatory parameters (the "Object").
   */
  static void EnsureObjectEventsFunctionsProperParameters(
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedObject& eventsBasedObject);

  /**
   * \brief Remove all the instances from one layer.
   */
  static void RemoveLayer(gd::Project &project, gd::Layout &layout,
                          const gd::String &layerName);

  /**
   * \brief Move all the instances from one layer into another.
   */
  static void MergeLayers(gd::Project &project, gd::Layout &layout,
                          const gd::String &originLayerName,
                          const gd::String &targetLayerName);

  /**
   * \brief Return the number of instances on the layer named \a layerName and
   * all its associated layouts.
   */
  static size_t GetLayoutAndExternalLayoutLayerInstancesCount(
      gd::Project &project, gd::Layout &layout, const gd::String &layerName);

  virtual ~WholeProjectRefactorer(){};

 private:
  static std::vector<gd::String> GetAssociatedExternalLayouts(
      gd::Project& project, gd::Layout& layout);
  static std::vector<gd::String>
  GetAssociatedExternalLayouts(gd::Project &project,
                               const gd::String &layoutName);
  static std::vector<gd::String>
  GetAssociatedExternalEvents(gd::Project &project,
                               const gd::String &layoutName);

  static void DoRenameEventsFunction(gd::Project& project,
                                     const gd::EventsFunction& eventsFunction,
                                     const gd::String& oldFullType,
                                     const gd::String& newFullType,
                                     const gd::ProjectBrowser& projectBrowser);

  static void DoRenameBehavior(gd::Project& project,
                               const gd::String& oldBehaviorType,
                               const gd::String& newBehaviorType,
                               const gd::ProjectBrowser& projectBrowser);

  static void DoRenameObject(gd::Project& project,
                             const gd::String& oldObjectType,
                             const gd::String& newObjectType,
                             const gd::ProjectBrowser& projectBrowser);

  /**
   * \brief Refactor the project **before** an events function extension is
   * renamed.
   *
   * \warning Do the renaming of the specified extension after calling this.
   * This is because the extension is expected to have its old name for the
   * refactoring.
   */
  static void RenameEventsFunctionsExtension(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::String& oldName,
      const gd::String& newName,
      const gd::ProjectBrowser& projectBrowser);

  static void FindDependentBehaviorNames(
      const gd::Project& project,
      const gd::Object& object,
      const gd::String& behaviorName,
      std::unordered_set<gd::String>& dependentBehaviorNames);

  static const gd::String behaviorObjectParameterName;
  static const gd::String parentObjectParameterName;

  WholeProjectRefactorer(){};
};

}  // namespace gd
