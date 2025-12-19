#include "GDCore/Serialization/SerializerElement.h"

#include <cmath>
#include <iostream>
#include <utility>

#include "GDCore/Tools/Log.h"

namespace gd {

SerializerElement SerializerElement::nullElement;

SerializerElement::SerializerElement() : valueUndefined(true), isArray(false) {}

SerializerElement::SerializerElement(const SerializerValue& value)
    : valueUndefined(false), elementValue(value), isArray(false) {}

// ============================================================================
// MOVE SEMANTICS
// ============================================================================
// Optimization: Move constructor and move assignment operator allow efficient
// transfer of ownership without deep copying. This is particularly useful
// during serialization when SerializerElement objects are frequently created
// and stored in containers.

SerializerElement::SerializerElement(gd::SerializerElement&& other) noexcept
    : valueUndefined(other.valueUndefined),
      elementValue(std::move(other.elementValue)),
      attributes(std::move(other.attributes)),
      children(std::move(other.children)),
      isArray(other.isArray),
      arrayOf(std::move(other.arrayOf)),
      deprecatedArrayOf(std::move(other.deprecatedArrayOf)) {
  // Reset the moved-from object to a valid empty state
  other.valueUndefined = true;
  other.isArray = false;
}

SerializerElement& SerializerElement::operator=(gd::SerializerElement&& other) noexcept {
  if (this != &other) {
    valueUndefined = other.valueUndefined;
    elementValue = std::move(other.elementValue);
    attributes = std::move(other.attributes);
    children = std::move(other.children);
    isArray = other.isArray;
    arrayOf = std::move(other.arrayOf);
    deprecatedArrayOf = std::move(other.deprecatedArrayOf);
    // Reset the moved-from object to a valid empty state
    other.valueUndefined = true;
    other.isArray = false;
  }
  return *this;
}

SerializerElement::~SerializerElement() {}

const SerializerValue& SerializerElement::GetValue() const {
  if (valueUndefined && attributes.find("value") != attributes.end())
    return attributes.find("value")->second;

  return elementValue;
}

// ============================================================================
// SET ATTRIBUTE METHODS
// ============================================================================
// Optimization: The RemoveChild call is only performed when the children vector
// is non-empty. During serialization (the primary use case we're optimizing for),
// elements typically don't have both children and attributes with the same name,
// so this check avoids the O(n) scan through children in the common case.
//
// Safety: This optimization is 100% safe because:
// 1. If children is empty, there's nothing to remove
// 2. If children is non-empty, we still call RemoveChild to maintain the original
//    behavior and ensure correctness

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   bool value) {
  // Optimization: Only scan children if there are any.
  // During serialization, this vector is typically empty or doesn't contain
  // conflicting names, so this check avoids unnecessary O(n) scans.
  if (!children.empty()) {
    RemoveChild(name);
  }
  attributes[name].SetBool(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   const gd::String& value) {
  if (!children.empty()) {
    RemoveChild(name);
  }
  attributes[name].SetString(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   int value) {
  if (!children.empty()) {
    RemoveChild(name);
  }
  attributes[name].SetInt(value);
  return *this;
}

SerializerElement& SerializerElement::SetAttribute(const gd::String& name,
                                                   double value) {
  if (!children.empty()) {
    RemoveChild(name);
  }

  if (std::isnan(value)) {
    gd::LogError("Attribute \"" + name +
                 "\" was set to NaN - this is not allowed (would not be "
                 "serialized correctly to JSON). Defaulting to 0.");
    attributes[name].SetDouble(0);
  } else {
    attributes[name].SetDouble(value);
  }

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

  // Optimization: Using make_unique instead of make_shared to avoid the
  // overhead of reference counting. unique_ptr is sufficient since children
  // are exclusively owned by their parent.
  auto newElement = std::make_unique<SerializerElement>();
  SerializerElement& ref = *newElement;
  children.push_back(std::make_pair(std::move(name), std::move(newElement)));

  return ref;
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
    if (!children[i].second) continue;

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
    if (!children[i].second) continue;

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
    if (!children[i].second) continue;

    if (children[i].first == name || (isArray && children[i].first.empty()) ||
        (!deprecatedName.empty() && children[i].first == deprecatedName))
      currentIndex++;
  }

  return currentIndex;
}

bool SerializerElement::HasChild(const gd::String& name,
                                 gd::String deprecatedName) const {
  for (size_t i = 0; i < children.size(); ++i) {
    if (!children[i].second) continue;

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
  children.reserve(other.children.size());  // Optimization: pre-allocate
  for (const auto& child : other.children) {
    children.push_back(
        std::make_pair(child.first,
                       std::make_unique<SerializerElement>(*child.second)));
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
