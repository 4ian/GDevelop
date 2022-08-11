/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_WHOLEPROJECTREFACTORER_H
#define GDCORE_WHOLEPROJECTREFACTORER_H
#include <set>
#include <unordered_set>
#include <vector>
namespace gd {
class Platform;
class Project;
class Layout;
class Object;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class ObjectsContainer;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventsWorkerWithContext;
class Behavior;
class BehaviorContent;
class BehaviorMetadata;
class UnfilledRequiredBehaviorPropertyProblem;
}  // namespace gd

namespace gd {

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
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project& project,
                                  gd::ArbitraryEventsWorker& worker);

  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project& project,
                                  gd::ArbitraryEventsWorkerWithContext& worker);

  /**
   * \brief Call the specified worker on all events of the events based behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project& project,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      gd::ArbitraryEventsWorkerWithContext& worker);

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  static void ExposeProjectObjects(gd::Project& project,
                                   gd::ArbitraryObjectsWorker& worker);

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
   * \brief Refactor the project after an object is renamed in a layout
   *
   * This will update the layout, all external layouts associated with it
   * and all external events used by the layout.
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
   * and all external events used by the layout.
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
      gd::EventsBasedObject& eventsBasedObject,
      gd::ObjectsContainer& globalObjectsContainer,
      gd::ObjectsContainer& objectsContainer,
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
   * behavior have the proper mandatory parameters (the "Object" and
   * "Behavior").
   */
  static void EnsureObjectEventsFunctionsProperParameters(
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedObject& eventsBasedObject);

  virtual ~WholeProjectRefactorer(){};

 private:
  static std::vector<gd::String> GetAssociatedExternalLayouts(
      gd::Project& project, gd::Layout& layout);

  static void DoRenameEventsFunction(gd::Project& project,
                                     const gd::EventsFunction& eventsFunction,
                                     const gd::String& oldFullType,
                                     const gd::String& newFullType);

  static void DoRenameBehavior(gd::Project& project,
                               const gd::String& oldBehaviorType,
                               const gd::String& newBehaviorType);

  static void DoRenameObject(gd::Project& project,
                             const gd::String& oldObjectType,
                             const gd::String& newObjectType);

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

#endif  // GDCORE_WHOLEPROJECTREFACTORER_H
