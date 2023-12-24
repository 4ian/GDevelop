#pragma once
#include <functional>
#include <vector>

#include "PropertiesContainer.h"

namespace gd {
class String;
class Project;
class Layout;
class NamedPropertyDescriptor;
}  // namespace gd

namespace gd {

/**
 * \brief A list of property containers, useful for accessing properties in a
 * scoped way.
 *
 * \see gd::NamedPropertyDescriptor
 * \see gd::Project
 * \see gd::Layout
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API PropertiesContainersList {
 public:
  virtual ~PropertiesContainersList(){};

  static PropertiesContainersList MakeNewPropertiesContainersListFor(
      const gd::PropertiesContainer& propertiesContainer);
  static PropertiesContainersList MakeNewEmptyPropertiesContainersList();

  /**
   * \brief Add a new container of properties in the list.
   * Add containers in order from the most global one to the most local one.
   */
  void Add(const gd::PropertiesContainer& propertiesContainer) {
    propertiesContainers.push_back(&propertiesContainer);
  };

  /**
   * \brief Return true if the specified property is in one of the containers.
   */
  bool Has(const gd::String& name) const;

  /**
   * \brief Return a reference to the property called \a name, and the
   * properties container holding it.
   */
  std::pair<std::reference_wrapper<const gd::PropertiesContainer>,
            std::reference_wrapper<const NamedPropertyDescriptor>>
  Get(const gd::String& name) const;

  /**
   * \brief Return true if the specified properties container is present.
   */
  bool HasPropertiesContainer(const gd::PropertiesContainer& propertiesContainer) const;

  /**
   * Get the properties container at the bottom of the scope (so the most
   * "local" one).
   */
  const PropertiesContainer* GetBottomMostPropertiesContainer() const {
    if (propertiesContainers.empty()) return nullptr;
    return propertiesContainers.back();
  }

  /**
   * \brief Call the callback for each property having a name matching the specified search.
   */
  void ForEachPropertyMatchingSearch(const gd::String& search, std::function<void(const gd::NamedPropertyDescriptor& property)> fn) const;

  /** Do not use - should be private but accessible to let Emscripten create a
   * temporary. */
  PropertiesContainersList(){};

 private:
  std::vector<const gd::PropertiesContainer*> propertiesContainers;
  static NamedPropertyDescriptor badNamedPropertyDescriptor;
  static PropertiesContainer badPropertiesContainer;
};

}  // namespace gd