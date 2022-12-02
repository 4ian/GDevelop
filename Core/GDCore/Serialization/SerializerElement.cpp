#include "GDCore/Serialization/SerializerElement.h"

#include <iostream>

namespace gd {

SerializerElement SerializerElement::nullElement;

SerializerElement::SerializerElement() : valueUndefined(true), isArray(false) {}

SerializerElement::SerializerElement(const SerializerValue& value)
    : valueUndefined(false), elementValue(value), isArray(false) {}

SerializerElement::~SerializerElement() {}

const SerializerValue& SerializerElement::GetValue() const {
  if (valueUndefined && attributes.find("value") != attributes.end())
    return attributes.find("value")->second;

  return elementValue;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   bool value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  attributes[name].SetBool(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   const gd::String& value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  attributes[name].SetString(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   int value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  attributes[name].SetInt(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   double value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  attributes[name].SetDouble(value);
  return *this;
}

bool SerializerElement::GetBoolAttribute(const gd::String& name,
                                         bool defaultValue,
                                         gd::String deprecatedName) const {
  if (attributes.find(name) != attributes.end()) {
    return attributes.find(name)->second.GetBool();
  } else if (!deprecatedName.empty() &&
             attributes.find(deprecatedName) != attributes.end()) {
    return attributes.find(deprecatedName)->second.GetBool();
  } else {
    if (HasChild(name, deprecatedName)) {
      SerializerElement& child = GetChild(name, 0, deprecatedName);
      if (!child.IsValueUndefined()) {
        return child.GetValue().GetBool();
      }
    }
  }

  return defaultValue;
}

gd::String SerializerElement::GetStringAttribute(  // TODO: Use const ref?
    const gd::String& name,
    gd::String defaultValue,
    gd::String deprecatedName) const {
  if (attributes.find(name) != attributes.end())
    return attributes.find(name)->second.GetString();
  else if (!deprecatedName.empty() &&
           attributes.find(deprecatedName) != attributes.end())
    return attributes.find(deprecatedName)->second.GetString();
  else {
    if (HasChild(name, deprecatedName)) {
      SerializerElement& child = GetChild(name, 0, deprecatedName);
      if (!child.IsValueUndefined()) return child.GetValue().GetString();
    }
  }

  return defaultValue;
}

int SerializerElement::GetIntAttribute(const gd::String& name,
                                       int defaultValue,
                                       gd::String deprecatedName) const {
  if (attributes.find(name) != attributes.end())
    return attributes.find(name)->second.GetInt();
  else if (!deprecatedName.empty() &&
           attributes.find(deprecatedName) != attributes.end())
    return attributes.find(deprecatedName)->second.GetInt();
  else {
    if (HasChild(name, deprecatedName)) {
      SerializerElement& child = GetChild(name, 0, deprecatedName);
      if (!child.IsValueUndefined()) return child.GetValue().GetInt();
    }
  }

  return defaultValue;
}

double SerializerElement::GetDoubleAttribute(const gd::String& name,
                                             double defaultValue,
                                             gd::String deprecatedName) const {
  if (attributes.find(name) != attributes.end())
    return attributes.find(name)->second.GetDouble();
  else if (!deprecatedName.empty() &&
           attributes.find(deprecatedName) != attributes.end())
    return attributes.find(deprecatedName)->second.GetDouble();
  else {
    if (HasChild(name, deprecatedName)) {
      SerializerElement& child = GetChild(name, 0, deprecatedName);
      if (!child.IsValueUndefined()) return child.GetValue().GetDouble();
    }
  }

  return defaultValue;
}

bool SerializerElement::HasAttribute(const gd::String& name) const {
  return attributes.find(name) != attributes.end();
}

SerializerElement& SerializerElement::AddChild(gd::String name) {
  if (isArray) {
    if (name != arrayOf) {
      std::cout << "WARNING: Adding a child, to a SerializerElement which is "
                   "considered as an array, with a name ("
                << name << ") which is not the same as the array elements ("
                << arrayOf << "). Child was renamed." << std::endl;
      name = arrayOf;
    }
  }

  // In case of children of objects, there can be only one child with
  // a given name.
  // Note: searching for the existing children is O(number of children). This
  // could be improved, but in practice has no visible impact on saving
  // large projects.
  if (!isArray && HasChild(name)) {
    return GetChild(name);
  }

  std::shared_ptr<SerializerElement> newElement(new SerializerElement);
  children.push_back(std::make_pair(name, newElement));

  return *newElement;
}

SerializerElement& SerializerElement::GetChild(std::size_t index) const {
  if (!isArray) {
    std::cout << "ERROR: Getting a child from its index whereas the parent is "
                 "not considered as an array."
              << std::endl;
    return nullElement;
  }

  std::size_t currentIndex = 0;
  for (size_t i = 0; i < children.size(); ++i) {
    if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

    if (children[i].first == arrayOf || children[i].first.empty() ||
        (!deprecatedArrayOf.empty() &&
         children[i].first == deprecatedArrayOf)) {
      if (index == currentIndex)
        return *children[i].second;
      else
        currentIndex++;
    }
  }

  std::cout << "ERROR: Requested out of bound child at index " << index
            << std::endl;
  return nullElement;
}

SerializerElement& SerializerElement::GetChild(
    gd::String name, std::size_t index, gd::String deprecatedName) const {
  if (isArray) {
    if (name != arrayOf) {
      std::cout << "WARNING: Getting a child, from a SerializerElement which "
                   "is considered as an array, with a name ("
                << name << ") which is not the same as the array elements ("
                << arrayOf << ")." << std::endl;
      name = arrayOf;
    }
  }

  std::size_t currentIndex = 0;
  for (size_t i = 0; i < children.size(); ++i) {
    if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

    if (children[i].first == name || (isArray && children[i].first.empty()) ||
        (!deprecatedName.empty() && children[i].first == deprecatedName)) {
      if (index == currentIndex)
        return *children[i].second;
      else
        currentIndex++;
    }
  }

  std::cout << "Child " << name << " not found in SerializerElement::GetChild"
            << std::endl;
  return nullElement;
}

std::size_t SerializerElement::GetChildrenCount(
    gd::String name, gd::String deprecatedName) const {
  if (name.empty()) {
    if (!isArray) {
      std::cout
          << "ERROR: Getting children count without specifying name, from a "
             "SerializerElement which is NOT considered as an array."
          << std::endl;
      return 0;
    }

    name = arrayOf;
    deprecatedName = deprecatedArrayOf;
  }

  std::size_t currentIndex = 0;
  for (size_t i = 0; i < children.size(); ++i) {
    if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

    if (children[i].first == name || (isArray && children[i].first.empty()) ||
        (!deprecatedName.empty() && children[i].first == deprecatedName))
      currentIndex++;
  }

  return currentIndex;
}

bool SerializerElement::HasChild(const gd::String& name,
                                 gd::String deprecatedName) const {
  for (size_t i = 0; i < children.size(); ++i) {
    if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

    if (children[i].first == name ||
        (!deprecatedName.empty() && children[i].first == deprecatedName))
      return true;
  }

  return false;
}

void SerializerElement::RemoveChild(const gd::String& name) {
  for (size_t i = 0; i < children.size();) {
    if (children[i].first == name)
      children.erase(children.begin() + i);
    else
      ++i;
  }
}

void SerializerElement::Init(const gd::SerializerElement& other) {
  valueUndefined = other.valueUndefined;
  elementValue = other.elementValue;
  attributes = other.attributes;

  children.clear();
  for (const auto& child : other.children) {
    children.push_back(
        std::make_pair(child.first,
                       std::shared_ptr<SerializerElement>(
                           new SerializerElement(*child.second))));
  }

  isArray = other.isArray;
  arrayOf = other.arrayOf;
  deprecatedArrayOf = other.deprecatedArrayOf;
}

void SerializerElement::SetMultilineStringValue(const gd::String& value) {
  if (value.find('\n') == gd::String::npos) {
    SetStringValue(value);
    return;
  }

  std::vector<gd::String> lines = value.Split('\n');
  children.clear();
  ConsiderAsArrayOf("");
  for (const auto& line : lines) {
    AddChild("").SetStringValue(line);
  }
}

gd::String SerializerElement::GetMultilineStringValue() {
  if (!ConsideredAsArray()) {
    return GetValue().GetString();
  }

  gd::String value;
  for (const auto& child : children) {
    if (!value.empty()) value += "\n";
    value += child.second->GetStringValue();
  }
  return value;
}

}  // namespace gd
