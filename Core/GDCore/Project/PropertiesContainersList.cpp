#include "PropertiesContainersList.h"

#include <functional>
#include <vector>

#include "PropertiesContainer.h"

namespace gd {

NamedPropertyDescriptor PropertiesContainersList::badNamedPropertyDescriptor;
PropertiesContainer PropertiesContainersList::badPropertiesContainer(gd::EventsFunctionsContainer::FunctionOwner::Extension);

PropertiesContainersList
PropertiesContainersList::MakeNewPropertiesContainersListFor(
    const gd::PropertiesContainer& propertiesContainer) {
  PropertiesContainersList propertiesContainersList;
  propertiesContainersList.Add(propertiesContainer);
  return propertiesContainersList;
}

PropertiesContainersList
PropertiesContainersList::MakeNewEmptyPropertiesContainersList() {
  PropertiesContainersList propertiesContainersList;
  return propertiesContainersList;
}

bool PropertiesContainersList::Has(const gd::String& name) const {
  for (auto it = propertiesContainers.rbegin();
       it != propertiesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return true;
  }

  return false;
}

std::pair<std::reference_wrapper<const gd::PropertiesContainer>,
          std::reference_wrapper<const NamedPropertyDescriptor>>
PropertiesContainersList::Get(const gd::String& name) const {
  for (auto it = propertiesContainers.rbegin();
       it != propertiesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return {**it, (*it)->Get(name)};
  }

  return {badPropertiesContainer, badNamedPropertyDescriptor};
}

bool PropertiesContainersList::HasPropertiesContainer(const gd::PropertiesContainer& propertiesContainer) const {
  for (auto it = propertiesContainers.rbegin(); it != propertiesContainers.rend();
       ++it) {
    if (*it == &propertiesContainer) return true;
  }

  return false;
}

void PropertiesContainersList::ForEachPropertyMatchingSearch(
    const gd::String& search,
    std::function<void(const gd::NamedPropertyDescriptor& property)> fn) const {
  for (auto it = propertiesContainers.rbegin(); it != propertiesContainers.rend();
       ++it) {
    (*it)->ForEachPropertyMatchingSearch(search, fn);
  }
}

}  // namespace gd