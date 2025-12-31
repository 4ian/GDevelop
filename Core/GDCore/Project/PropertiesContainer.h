#pragma once
#include "EventsFunctionsContainer.h"
#include "GDCore/Tools/SerializableWithNameList.h"
#include "NamedPropertyDescriptor.h"
#include "GDCore/Project/PropertyFolderOrProperty.h"

namespace gd {

/**
 * \brief A container of properties, used for custom behaviors, custom objects,
 * extensions...
 *
 * \see gd::NamedPropertyDescriptor
 *
 * \ingroup PlatformDefinition
 */
class PropertiesContainer
    : public SerializableWithNameList<NamedPropertyDescriptor> {
 public:
  PropertiesContainer(EventsFunctionsContainer::FunctionOwner owner);

  PropertiesContainer(const PropertiesContainer& other);

  PropertiesContainer& operator=(const PropertiesContainer& other);

  void ForEachPropertyMatchingSearch(
      const gd::String& search,
      std::function<void(const gd::NamedPropertyDescriptor& property)> fn)
      const {
    for (const auto& property : elements) {
      if (property->GetName().FindCaseInsensitive(search) != gd::String::npos)
        fn(*property);
    }
  }

  EventsFunctionsContainer::FunctionOwner GetOwner() const { return owner; }

  /**
   * \brief Add a new empty property called \a name in the
   * given folder at the specified position.<br>
   *
   * \return A reference to the property in the list.
   */
  gd::NamedPropertyDescriptor& InsertNewPropertyInFolder(
      const gd::String& name,
      gd::PropertyFolderOrProperty& propertyFolderOrProperty,
      std::size_t position);

  /**
   * Returns a vector containing all object and folders in this container.
   * Only use this for checking if you hold a valid `PropertyFolderOrProperty` -
   * don't use this for rendering or anything else.
   */
  std::vector<const PropertyFolderOrProperty*> GetAllPropertyFolderOrProperty() const;

  gd::PropertyFolderOrProperty& GetRootFolder() {
      return *rootFolder;
  }

  void AddMissingPropertiesInRootFolder();

  /**
   * \brief Serialize folder structure.
   */
  void SerializeFoldersTo(SerializerElement& element) const;

  /**
   * \brief Unserialize folder structure.
   */
  void UnserializeFoldersFrom(gd::Project& project,
                              const SerializerElement& element);

 private:
  EventsFunctionsContainer::FunctionOwner owner;
  std::unique_ptr<gd::PropertyFolderOrProperty> rootFolder;
};

}  // namespace gd