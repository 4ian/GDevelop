#include "PropertiesContainersList.h"
#include "PropertiesContainer.h"

#include <vector>

namespace gd {

NamedPropertyDescriptor PropertiesContainersList::badNamedPropertyDescriptor;

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
  for (auto it = propertiesContainers.rbegin(); it != propertiesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return true;
  }

  return false;
}

const NamedPropertyDescriptor& PropertiesContainersList::Get(const gd::String& name) const {
  for (auto it = propertiesContainers.rbegin(); it != propertiesContainers.rend();
       ++it) {
    if ((*it)->Has(name)) return (*it)->Get(name);
  }

  return badNamedPropertyDescriptor;
}

}  // namespace gd