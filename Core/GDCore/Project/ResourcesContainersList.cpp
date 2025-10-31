#include "ResourcesContainersList.h"

#include <vector>

#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ResourcesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

Resource ResourcesContainersList::badResource;
ResourcesContainer ResourcesContainersList::badResourcesContainer(
    gd::ResourcesContainer::SourceType::Unknown);

ResourcesContainersList
ResourcesContainersList::MakeNewResourcesContainersListForProject(
    const gd::Project &project) {
  ResourcesContainersList resourcesContainersList;
  resourcesContainersList.Push(project.GetResourcesManager());
  return resourcesContainersList;
}

ResourcesContainersList
ResourcesContainersList::MakeNewResourcesContainersListForFreeEventsFunction(
    const gd::Project &project, const gd::EventsFunctionsExtension &extension,
    const gd::EventsFunction &eventsFunction,
    gd::ResourcesContainer &parameterResourcesContainer) {
  ResourcesContainersList resourcesContainersList;
  resourcesContainersList.Push(project.GetResourcesManager());

  gd::EventsFunctionTools::ParametersToResourcesContainer(
      eventsFunction.GetParametersForEvents(extension.GetEventsFunctions()),
      parameterResourcesContainer);
  resourcesContainersList.Push(parameterResourcesContainer);

  return resourcesContainersList;
}

ResourcesContainersList ResourcesContainersList::
    MakeNewResourcesContainersListForBehaviorEventsFunction(
        const gd::Project &project,
        const gd::EventsFunctionsExtension &extension,
        const gd::EventsBasedBehavior &eventsBasedBehavior,
        const gd::EventsFunction &eventsFunction,
        gd::ResourcesContainer &parameterResourcesContainer,
        gd::ResourcesContainer &propertyResourcesContainer) {
  ResourcesContainersList resourcesContainersList;
  resourcesContainersList.Push(project.GetResourcesManager());

  gd::EventsFunctionTools::PropertiesToResourcesContainer(
      eventsBasedBehavior.GetSharedPropertyDescriptors(),
      propertyResourcesContainer);
  resourcesContainersList.Push(propertyResourcesContainer);

  gd::EventsFunctionTools::PropertiesToResourcesContainer(
      eventsBasedBehavior.GetPropertyDescriptors(), propertyResourcesContainer);
  resourcesContainersList.Push(propertyResourcesContainer);

  gd::EventsFunctionTools::ParametersToResourcesContainer(
      eventsFunction.GetParametersForEvents(
          eventsBasedBehavior.GetEventsFunctions()),
      parameterResourcesContainer);
  resourcesContainersList.Push(parameterResourcesContainer);

  return resourcesContainersList;
}

ResourcesContainersList
ResourcesContainersList::MakeNewResourcesContainersListForObjectEventsFunction(
    const gd::Project &project, const gd::EventsFunctionsExtension &extension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction,
    gd::ResourcesContainer &parameterResourcesContainer,
    gd::ResourcesContainer &propertyResourcesContainer) {
  ResourcesContainersList resourcesContainersList;
  resourcesContainersList.Push(project.GetResourcesManager());

  gd::EventsFunctionTools::PropertiesToResourcesContainer(
      eventsBasedObject.GetPropertyDescriptors(), propertyResourcesContainer);
  resourcesContainersList.Push(propertyResourcesContainer);

  gd::EventsFunctionTools::ParametersToResourcesContainer(
      eventsFunction.GetParametersForEvents(
          eventsBasedObject.GetEventsFunctions()),
      parameterResourcesContainer);
  resourcesContainersList.Push(parameterResourcesContainer);

  return resourcesContainersList;
}

bool ResourcesContainersList::HasResourceNamed(const gd::String &name) const {
  for (auto it = resourcesContainers.rbegin(); it != resourcesContainers.rend();
       ++it) {
    if ((*it)->HasResource(name))
      return true;
  }

  return false;
}

const gd::Resource &
ResourcesContainersList::GetResource(const gd::String &name) const {
  for (auto it = resourcesContainers.rbegin(); it != resourcesContainers.rend();
       ++it) {
    if ((*it)->HasResource(name))
      return (*it)->GetResource(name);
  }
  return badResource;
}

void ResourcesContainersList::ForEachNameMatchingSearch(
    const gd::String &search,
    std::function<void(const gd::Resource &resource)> fn) const {
  for (auto it = resourcesContainers.rbegin(); it != resourcesContainers.rend();
       ++it) {
    for (const auto &resource : (*it)->GetAllResources()) {
      if (resource->GetName().FindCaseInsensitive(search) != gd::String::npos)
        fn(*resource);
    }
  }
}

void ResourcesContainersList::ForEachResource(
    std::function<void(const gd::Resource &resource)> fn) const {
  for (auto it = resourcesContainers.rbegin(); it != resourcesContainers.rend();
       ++it) {
    const auto &resourcesContainer = **it;
    for (const auto &resource : resourcesContainer.GetAllResources()) {
      fn(*resource);
    }
  }
}

const ResourcesContainer &
ResourcesContainersList::GetResourcesContainerFromResourceName(
    const gd::String &resourceName) const {
  for (auto it = resourcesContainers.rbegin(); it != resourcesContainers.rend();
       ++it) {
    if ((*it)->HasResource(resourceName)) {
      return **it;
    }
  }
  return badResourcesContainer;
}

const gd::ResourcesContainer::SourceType
ResourcesContainersList::GetResourcesContainerSourceType(
    const gd::String &resourceName) const {
  const auto &resourcesContainer =
      GetResourcesContainerFromResourceName(resourceName);
  return resourcesContainer.GetSourceType();
}

} // namespace gd