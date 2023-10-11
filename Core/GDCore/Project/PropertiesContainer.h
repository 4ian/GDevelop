#pragma once
#include "EventsFunctionsContainer.h"
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
class PropertiesContainer
    : public SerializableWithNameList<NamedPropertyDescriptor> {
 public:
  PropertiesContainer(EventsFunctionsContainer::FunctionOwner owner)
      : SerializableWithNameList<NamedPropertyDescriptor>(), owner(owner) {}

  PropertiesContainer(const PropertiesContainer& other)
      : SerializableWithNameList<NamedPropertyDescriptor>(other),
        owner(other.owner) {}

  PropertiesContainer& operator=(const PropertiesContainer& other) {
    if (this != &other) {
      SerializableWithNameList<NamedPropertyDescriptor>::operator=(other);
      owner = other.owner;
    }
    return *this;
  }

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

 private:
  EventsFunctionsContainer::FunctionOwner owner;
};

}  // namespace gd