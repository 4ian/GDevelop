#pragma once
#include "EventsFunctionsContainer.h"
#include "GDCore/Project/PropertyFolderOrProperty.h"
#include "GDCore/Tools/SerializableWithNameList.h"
#include "NamedPropertyDescriptor.h"

namespace gd {

/**
 * \brief A container of properties, used for custom behaviors, custom objects,
 * extensions...
 *
 * \see gd::NamedPropertyDescriptor
 *
 * \ingroup PlatformDefinition
 */
class PropertiesContainer {
public:
  PropertiesContainer(EventsFunctionsContainer::FunctionOwner owner);

  PropertiesContainer(const PropertiesContainer &other);

  PropertiesContainer &operator=(const PropertiesContainer &other);

  NamedPropertyDescriptor &Insert(const NamedPropertyDescriptor &element,
                                  size_t position = (size_t)-1);
  NamedPropertyDescriptor &InsertNew(const gd::String &name,
                                     size_t position = (size_t)-1);
  bool Has(const gd::String &name) const;
  NamedPropertyDescriptor &Get(const gd::String &name);
  const NamedPropertyDescriptor &Get(const gd::String &name) const;
  NamedPropertyDescriptor &Get(size_t index);
  const NamedPropertyDescriptor &Get(size_t index) const;
  void Remove(const gd::String &name);
  void Move(std::size_t oldIndex, std::size_t newIndex);
  size_t GetCount() const;
  std::size_t GetPosition(const NamedPropertyDescriptor &element) const;
  bool IsEmpty() const;
  size_t size() const { return GetCount(); }
  NamedPropertyDescriptor &at(size_t index) { return Get(index); };
  bool empty() const { return IsEmpty(); }
  const std::vector<std::unique_ptr<NamedPropertyDescriptor>>& GetInternalVector() const;
  std::vector<std::unique_ptr<NamedPropertyDescriptor>>& GetInternalVector();
  void SerializeElementsTo(const gd::String& elementName,
                           SerializerElement& element) const;
  void UnserializeElementsFrom(const gd::String& elementName,
                               const SerializerElement& element);

  void ForEachPropertyMatchingSearch(
      const gd::String &search,
      std::function<void(const gd::NamedPropertyDescriptor &property)> fn)
      const {
    for (const auto &property : properties.GetInternalVector()) {
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
  gd::NamedPropertyDescriptor &InsertNewPropertyInFolder(
      const gd::String &name,
      gd::PropertyFolderOrProperty &propertyFolderOrProperty,
      std::size_t position);

  /**
   * Returns a vector containing all object and folders in this container.
   * Only use this for checking if you hold a valid `PropertyFolderOrProperty` -
   * don't use this for rendering or anything else.
   */
  std::vector<const PropertyFolderOrProperty *>
  GetAllPropertyFolderOrProperty() const;

  gd::PropertyFolderOrProperty &GetRootFolder() { return *rootFolder; }

  void AddMissingPropertiesInRootFolder();

  /**
   * \brief Serialize folder structure.
   */
  void SerializeFoldersTo(SerializerElement &element) const;

  /**
   * \brief Unserialize folder structure.
   */
  void UnserializeFoldersFrom(gd::Project &project,
                              const SerializerElement &element);

private:
  EventsFunctionsContainer::FunctionOwner owner;
  SerializableWithNameList<NamedPropertyDescriptor> properties;
  std::unique_ptr<gd::PropertyFolderOrProperty> rootFolder;
};

} // namespace gd