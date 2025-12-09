/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>

#include "GDCore/Project/ResourcesContainer.h"
#include "Variable.h"

namespace gd {
class String;
class Project;
class Layout;
class EventsFunctionsExtension;
class EventsBasedObject;
class EventsBasedBehavior;
class EventsFunction;
} // namespace gd

namespace gd {

/**
 * \brief A list of resources containers, useful for accessing resources in a
 * scoped way, along with methods to access them.
 *
 * \see gd::Resource
 * \see gd::ResourcesContainer
 * \see gd::Project
 * \see gd::Layout
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API ResourcesContainersList {
public:
  virtual ~ResourcesContainersList(){};

  static ResourcesContainersList
  MakeNewResourcesContainersListForProject(const gd::Project &project);

  static ResourcesContainersList
  MakeNewResourcesContainersListForFreeEventsFunction(
      const gd::Project &project, const gd::EventsFunctionsExtension &extension,
      const gd::EventsFunction &eventsFunction,
      gd::ResourcesContainer &parameterResourcesContainer);

  static ResourcesContainersList
  MakeNewResourcesContainersListForBehaviorEventsFunction(
      const gd::Project &project, const gd::EventsFunctionsExtension &extension,
      const gd::EventsBasedBehavior &eventsBasedBehavior,
      const gd::EventsFunction &eventsFunction,
      gd::ResourcesContainer &parameterResourcesContainer,
      gd::ResourcesContainer &propertyResourcesContainer);

  static ResourcesContainersList
  MakeNewResourcesContainersListForObjectEventsFunction(
      const gd::Project &project, const gd::EventsFunctionsExtension &extension,
      const gd::EventsBasedObject &eventsBasedObject,
      const gd::EventsFunction &eventsFunction,
      gd::ResourcesContainer &parameterResourcesContainer,
      gd::ResourcesContainer &propertyResourcesContainer);

  /**
   * \brief Check if the specified object exists ignoring groups.
   */
  bool HasResourceNamed(const gd::String &name) const;

  const gd::Resource &GetResource(const gd::String &name) const;

  void
  ForEachResource(std::function<void(const gd::Resource &resource)> fn) const;

  /**
   * \brief Call the callback for each object or group name matching the
   * search passed in parameter.
   */
  void ForEachNameMatchingSearch(
      const gd::String &search,
      std::function<void(const gd::Resource &resource)> fn) const;

  /**
   * \brief Return the source type of the container for the specified object or
   * group of objects.
   */
  const gd::ResourcesContainer::SourceType
  GetResourcesContainerSourceType(const gd::String &resourceName) const;

  /**
   * Get the objects container for for the specified object or group of objects.
   */
  const gd::ResourcesContainer &GetResourcesContainerFromResourceName(
      const gd::String &resourceName) const;

  /**
   * \brief Return a the objects container at position \a index.
   *
   * \warning The returned `ResourcesContainer` may contain cloned objects (in
   * the case of
   * `ProjectScopedContainers::MakeNewProjectScopedContainersForEventsBasedObject`)
   * or "fake" objects used by events like parameters. They must not be used to
   * edit the objects.
   * Search for "ProjectScopedContainers wrongly containing temporary objects
   * containers or objects" in the codebase.
   */
  const gd::ResourcesContainer &GetResourcesContainer(std::size_t index) const {
    return *resourcesContainers.at(index);
  }

  /**
   * \brief Return the number of objects containers.
   */
  std::size_t GetResourcesContainersCount() const{
    return resourcesContainers.size();
  }

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  ResourcesContainersList(){};

private:
  /**
   * \brief Push a new resources container to the context.
   */
  void Push(const gd::ResourcesContainer &resourcesContainer) {
    resourcesContainers.push_back(&resourcesContainer);
  };

  std::vector<const gd::ResourcesContainer *> resourcesContainers;
  static Resource badResource;
  static ResourcesContainer badResourcesContainer;
};

} // namespace gd