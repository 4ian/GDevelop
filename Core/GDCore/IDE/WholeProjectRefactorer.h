/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_WHOLEPROJECTREFACTORER_H
#define GDCORE_WHOLEPROJECTREFACTORER_H
#include <set>
#include <vector>
namespace gd {
class Project;
class Layout;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class ObjectsContainer;
class EventsBasedBehavior;
class ArbitraryEventsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventsWorkerWithContext;
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
   * \brief Call the specified worker on all ObjectContainers of the project (global,
   * layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  static void ExposeProjectObjects(
      gd::Project& project, gd::ArbitraryObjectsWorker& worker);

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
   * \brief Refactor the project **before** a property of a behavior is
   * renamed.
   *
   * \warning Do the renaming of the specified property after calling this.
   * This is because the property is expected to have its old name for the
   * refactoring.
   */
  static void RenameBehaviorProperty(
      gd::Project& project,
      const gd::EventsFunctionsExtension& eventsFunctionsExtension,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      const gd::String& oldPropertyName,
      const gd::String& newPropertyName);

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

  WholeProjectRefactorer(){};
};

}  // namespace gd

#endif  // GDCORE_WHOLEPROJECTREFACTORER_H
