#include "GDCore/Serialization/SerializerElement.h"

#include <cmath>
#include <iostream>

#include "GDCore/Tools/Log.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

SerializerElement SerializerElement::nullElement;

SerializerElement::SerializerElement() : valueUndefined(true), isArray(false) {}

SerializerElement::SerializerElement(const SerializerValue& value)
    : elementValue(value), valueUndefined(false), isArray(false) {}

SerializerElement::~SerializerElement() {}

const SerializerValue& SerializerElement::GetValue() const {
  if (valueUndefined && HasAttribute("value"))
    return attributes->find("value")->second;

  return elementValue;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   bool value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  GetOrCreateAttributes()[name].SetBool(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   const gd::String& value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  GetOrCreateAttributes()[name].SetString(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   int value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).
  GetOrCreateAttributes()[name].SetInt(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   double value) {
  RemoveChild(name);  // Ideally, only children would be used, but we still
                      // support code using attributes. Make sure that any
                      // existing child with this name is removed (otherwise it
                      // would erase the attribute at serialization).

  if (std::isnan(value)) {
    gd::LogError("Attribute \"" + name +
                 "\" was set to NaN - this is not allowed (would not be "
                 "serialized correctly to JSON). Defaulting to 0.");
    GetOrCreateAttributes()[name].SetDouble(0);
  } else {
    GetOrCreateAttributes()[name].SetDouble(value);
  }

  return *this;
}

bool SerializerElement::GetBoolAttribute(const gd::String& name,
                                         bool defaultValue,
                                         gd::String deprecatedName) const {
  if (HasAttribute(name)) {
    return attributes->find(name)->second.GetBool();
  } else if (!deprecatedName.empty() && HasAttribute(deprecatedName)) {
    return attributes->find(deprecatedName)->second.GetBool();
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
  if (HasAttribute(name))
    return attributes->find(name)->second.GetString();
  else if (!deprecatedName.empty() && HasAttribute(deprecatedName))
    return attributes->find(deprecatedName)->second.GetString();
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
  if (HasAttribute(name))
    return attributes->find(name)->second.GetInt();
  else if (!deprecatedName.empty() && HasAttribute(deprecatedName))
    return attributes->find(deprecatedName)->second.GetInt();
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
  if (HasAttribute(name))
    return attributes->find(name)->second.GetDouble();
  else if (!deprecatedName.empty() && HasAttribute(deprecatedName))
    return attributes->find(deprecatedName)->second.GetDouble();
  else {
    if (HasChild(name, deprecatedName)) {
      SerializerElement& child = GetChild(name, 0, deprecatedName);
      if (!child.IsValueUndefined()) return child.GetValue().GetDouble();
    }
  }

  return defaultValue;
}

bool SerializerElement::HasAttribute(const gd::String& name) const {
  return attributes && attributes->find(name) != attributes->end();
}

std::map<gd::String, SerializerValue>&
SerializerElement::GetOrCreateAttributes() const {
  if (!attributes)
    attributes = gd::make_unique<std::map<gd::String, SerializerValue> >();

  return *attributes;
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

  // Remember if all the children have the same name, to access them from
  // their index without iterating on them.
  if (children.empty())
    allChildrenHaveSameName = true;
  else if (name != children.front().first)
    allChildrenHaveSameName = false;
  matchingChildrenIndices.reset();

  // make_shared allocates the element and its reference count together.
  std::shared_ptr<SerializerElement> newElement =
      std::make_shared<SerializerElement>();
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

  SerializerElement* child =
      GetMatchingChild(arrayOf, deprecatedArrayOf, index);
  if (child) return *child;

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

  SerializerElement* child = GetMatchingChild(name, deprecatedName, index);
  if (child) return *child;

  std::cout << "Child " << name << " not found in SerializerElement::GetChild"
            << std::endl;
  return nullElement;
}

SerializerElement &
SerializerElement::GetOrCreateChild(gd::String name,
                                    gd::String deprecatedName) {
  if (!HasChild(name)) {
    AddChild(name);
  }
  return GetChild(name, 0, deprecatedName);
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

  return GetMatchingChildrenCount(name, deprecatedName);
}

SerializerElement* SerializerElement::GetMatchingChild(
    const gd::String& name,
    const gd::String& deprecatedName,
    std::size_t index) const {
  if (allChildrenHaveSameName) {
    // Either all the children match, or none of them (no need to check for null
    // children here: AddChild and Init always create them).
    if (index < children.size() &&
        IsMatchingChildName(children[index].first, name, deprecatedName))
      return children[index].second.get();

    return nullptr;
  }

  if (index == 0) {
    // The first matching child (for example a child of an object, searched by
    // its name) is found without remembering the indices of all the matches.
    for (const auto& child : children) {
      if (child.second &&
          IsMatchingChildName(child.first, name, deprecatedName))
        return child.second.get();
    }

    return nullptr;
  }

  const std::vector<std::size_t>& indices =
      GetMatchingChildrenIndices(name, deprecatedName);
  return index < indices.size() ? children[indices[index]].second.get()
                                : nullptr;
}

std::size_t SerializerElement::GetMatchingChildrenCount(
    const gd::String& name, const gd::String& deprecatedName) const {
  if (allChildrenHaveSameName) {
    // Either all the children match, or none of them.
    if (!children.empty() &&
        IsMatchingChildName(children.front().first, name, deprecatedName))
      return children.size();

    return 0;
  }

  return GetMatchingChildrenIndices(name, deprecatedName).size();
}

const std::vector<std::size_t>& SerializerElement::GetMatchingChildrenIndices(
    const gd::String& name, const gd::String& deprecatedName) const {
  if (matchingChildrenIndices && matchingChildrenIndices->name == name &&
      matchingChildrenIndices->deprecatedName == deprecatedName &&
      matchingChildrenIndices->includeUnnamedChildren == isArray)
    return matchingChildrenIndices->indices;

  // The indices are computed before being kept, so that a failed allocation
  // can't leave the indices of a search incomplete.
  matchingChildrenIndices.reset();
  std::unique_ptr<MatchingChildrenIndices> newMatchingChildrenIndices =
      gd::make_unique<MatchingChildrenIndices>();
  newMatchingChildrenIndices->name = name;
  newMatchingChildrenIndices->deprecatedName = deprecatedName;
  newMatchingChildrenIndices->includeUnnamedChildren = isArray;
  for (size_t i = 0; i < children.size(); ++i) {
    if (children[i].second == std::shared_ptr<SerializerElement>()) continue;

    if (IsMatchingChildName(children[i].first, name, deprecatedName))
      newMatchingChildrenIndices->indices.push_back(i);
  }

  matchingChildrenIndices = std::move(newMatchingChildrenIndices);
  return matchingChildrenIndices->indices;
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
  if (children.empty()) allChildrenHaveSameName = true;
  matchingChildrenIndices.reset();
}

void SerializerElement::Clear() {
  children.clear();
  allChildrenHaveSameName = true;
  matchingChildrenIndices.reset();
  if (attributes) attributes->clear();
}

bool SerializerElement::IsEmpty() {
  return children.empty() && (!attributes || attributes->empty());
}

void SerializerElement::RemoveAttribute(const gd::String& name) {
  if (attributes) attributes->erase(name);
}

void SerializerElement::Init(const gd::SerializerElement& other) {
  valueUndefined = other.valueUndefined;
  elementValue = other.elementValue;
  if (other.attributes && !other.attributes->empty())
    GetOrCreateAttributes() = *other.attributes;
  else if (attributes)
    attributes->clear();

  children.clear();
  children.reserve(other.children.size());
  // Updated before copying the children because, if `other` contains this
  // element, this element is copied too (with the children copied so far).
  allChildrenHaveSameName = other.allChildrenHaveSameName;
  matchingChildrenIndices.reset();
  for (const auto& child : other.children) {
    children.push_back(std::make_pair(
        child.first, std::make_shared<SerializerElement>(*child.second)));
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
  matchingChildrenIndices.reset();
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
