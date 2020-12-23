/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/Variable.h"

#include <sstream>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

gd::String Variable::TypeAsString(Type t) {
  switch (t) {
    case Type::String:
      return "string";
    case Type::Number:
      return "number";
    case Type::Boolean:
      return "boolean";
    case Type::Structure:
      return "structure";
    case Type::Array:
      return "array";
    default:
      return "error-type";
  }
};

Variable::Type Variable::StringAsType(const gd::String& str) {
  if (str == "string")
    return Type::String;
  else if (str == "number")
    return Type::Number;
  else if (str == "boolean")
    return Type::Boolean;
  else if (str == "structure")
    return Type::Structure;
  else if (str == "array")
    return Type::Array;

  // Default to number
  return Type::Number;
}

bool Variable::IsPrimitive(const Type type) {
  return type == Type::String || type == Type::Number || type == Type::Boolean;
}

void Variable::CastTo(const Type newType) {
  if (newType == Type::Number)
    SetValue(GetValue());
  else if (newType == Type::String)
    SetString(GetString());
  else if (newType == Type::Boolean)
    SetBool(GetBool());
  else if (newType == Type::Structure) {
    children.clear();

    // Conversion is only possible for non prmitive types
    if (type == Type::Array)
      for (auto i = childrenList.begin(); i != childrenList.end(); ++i)
        children.insert(
            std::make_pair(gd::String::From(i - childrenList.begin()), (*i)));

    type = Type::Structure;
    // A valid structure has at least 1 child
    if (children.empty()) GetChild("ChildVariable");
  } else if (newType == Type::Array) {
    childrenList.clear();

    // Conversion is only possible for non prmitive types
    if (type == Type::Structure)
      for (auto i = children.begin(); i != children.end(); ++i)
        childrenList.push_back((*i).second);

    type = Type::Array;
    // A valid array has at least 1 element
    if (childrenList.empty()) GetAtIndex(0);
  }
}

double Variable::GetValue() const {
  if (type == Type::Number) {
    return value;
  } else if (type == Type::String) {
    return str.To<double>();
  } else if (type == Type::Boolean) {
    return boolVal ? 1.0 : 0.0;
  }

  // It isn't possible to convert a non-primitive type to a number
  return 0.0;
}

const gd::String& Variable::GetString() const {
  if (type == Type::String) {
    return str;
  } else if (type == Type::Number) {
    str = gd::String::From(value);
    return str;
  } else if (type == Type::Boolean) {
    str = boolVal ? "1" : "0";
    return str;
  }

  // It isn't possible to convert a structural type to a string
  str = "0";
  return str;
}

bool Variable::GetBool() const {
  if (type == Type::Boolean) {
    return boolVal;
  } else if (type == Type::String) {
    return !str.empty() && str != "0" && str != "false";
  } else if (type == Type::Number) {
    return value != 0;
  }

  // It isn't possible to convert a non-primitive type to a boolean
  return false;
}

bool Variable::HasChild(const gd::String& name) const {
  return type == Type::Structure && children.find(name) != children.end();
}

/**
 * \brief Return the child with the specified name.
 *
 * If the variable is not a structure or has not
 * the specified child, an empty variable is returned.
 */
Variable& Variable::GetChild(const gd::String& name) {
  auto it = children.find(name);
  if (it != children.end()) return *it->second;

  type = Type::Structure;
  children[name] = std::make_shared<gd::Variable>();
  return *children[name];
}

/**
 * \brief Return the child with the specified name.
 *
 * If the variable is not a structure or has not
 * the specified child, an empty variable is returned.
 */
const Variable& Variable::GetChild(const gd::String& name) const {
  auto it = children.find(name);
  if (it != children.end()) return *it->second;

  type = Type::Structure;
  children[name] = std::make_shared<gd::Variable>();
  return *children[name];
}

void Variable::RemoveChild(const gd::String& name) {
  if (type != Type::Structure) return;
  children.erase(name);

  // If the structure is empty, make it a default empty variable again.
  if (children.empty()) {
    type = Type::Number;
    value = 0;
  }
}

bool Variable::RenameChild(const gd::String& oldName,
                           const gd::String& newName) {
  if (type != Type::Structure || !HasChild(oldName) || HasChild(newName))
    return false;

  children[newName] = children[oldName];
  children.erase(oldName);

  return true;
}

Variable& Variable::GetAtIndex(const size_t index) {
  type = Type::Array;
  while (childrenList.size() <= index)
    childrenList.push_back(std::make_shared<gd::Variable>());
  return *childrenList[index];
};

const Variable& Variable::GetAtIndex(const size_t index) const {
  if (childrenList.size() <= index) return *std::make_shared<gd::Variable>();
  return *childrenList.at(index);
};

Variable& Variable::PushNew() { return GetAtIndex(GetChildrenCount()); };

void Variable::RemoveAtIndex(const size_t index) {
  if (index >= childrenList.size()) return;
  childrenList.erase(childrenList.begin() + index);

  // If the array is now empty, demote back to a primitive.
  if (childrenList.empty()) {
    type = Type::Number;
    value = 0.0;
  }
};

void Variable::SerializeTo(SerializerElement& element) const {
  element.SetStringAttribute("type", TypeAsString(GetType()));

  if (type == Type::String) {
    element.SetStringAttribute("value", GetString());
  } else if (type == Type::Number) {
    element.SetDoubleAttribute("value", GetValue());
  } else if (type == Type::Boolean) {
    element.SetBoolAttribute("value", GetBool());
  } else if (type == Type::Structure) {
    SerializerElement& childrenElement = element.AddChild("children");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto i = children.begin(); i != children.end(); ++i) {
      SerializerElement& variableElement = childrenElement.AddChild("variable");
      variableElement.SetAttribute("name", i->first);
      i->second->SerializeTo(variableElement);
    }
  } else if (type == Type::Array) {
    SerializerElement& childrenElement = element.AddChild("children");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto child : childrenList) {
      child->SerializeTo(childrenElement.AddChild("variable"));
    }
  }
}

void Variable::UnserializeFrom(const SerializerElement& element) {
  type = StringAsType(element.GetStringAttribute("type", "string"));

  // Compatibility with GD <= 5.0.0-beta102
  // Before, everything was stored as strings.
  // We can unserialize primitives as string as they can be converted from/to
  // strings anyways, but structures cannot be converted from a string.
  // If we detect children, but the type is primitive (meaning the default type
  // is used as a type if missing), then it should be unserialized as a
  // structure instead of a string.
  if (element.HasChild("children", "Children") && IsPrimitive(type))
    type = Type::Structure;
  // end of compatibility code

  if (IsPrimitive(type)) {
    if (type == Type::String) {
      SetString(element.GetStringAttribute("value", "0", "Value"));
    } else if (type == Type::Number) {
      SetValue(element.GetDoubleAttribute("value", 0.0, "Value"));
    } else if (type == Type::Boolean) {
      SetBool(element.GetBoolAttribute("value", false, "Value"));
    }
  } else {
    const SerializerElement& childrenElement =
        element.GetChild("children", 0, "Children");
    childrenElement.ConsiderAsArrayOf("variable", "Variable");
    if (childrenElement.GetChildrenCount() == 0) return;

    for (int i = 0; i < childrenElement.GetChildrenCount(); ++i) {
      const SerializerElement& childElement = childrenElement.GetChild(i);
      if (type == Type::Structure) {
        gd::String name = childElement.GetStringAttribute("name", "", "Name");
        children[name] = std::make_shared<gd::Variable>();
        children[name]->UnserializeFrom(childElement);
      } else if (type == Type::Array)
        PushNew().UnserializeFrom(childElement);
    }
  }
}  // namespace gd

std::vector<gd::String> Variable::GetAllChildrenNames() const {
  std::vector<gd::String> names;
  for (auto& it : children) {
    names.push_back(it.first);
  }

  return names;
}

bool Variable::Contains(const gd::Variable& variableToSearch,
                        bool recursive) const {
  for (auto& it : children) {
    if (it.second.get() == &variableToSearch) return true;
    if (recursive && it.second->Contains(variableToSearch, true)) return true;
  }
  for (auto& it : childrenList) {
    if (it.get() == &variableToSearch) return true;
    if (recursive && it->Contains(variableToSearch, true)) return true;
  }

  return false;
}

void Variable::RemoveRecursively(const gd::Variable& variableToRemove) {
  for (auto it = children.begin(); it != children.end();) {
    if (it->second.get() == &variableToRemove) {
      it = children.erase(it);
    } else {
      it->second->RemoveRecursively(variableToRemove);
      it++;
    }
  }
  for (auto it = childrenList.begin(); it != childrenList.end();) {
    if (it->get() == &variableToRemove) {
      childrenList.erase(it);
    } else {
      (*it)->RemoveRecursively(variableToRemove);
      it++;
    }
    if ((type == Type::Structure && children.empty()) ||
        (type == Type::Array && childrenList.empty())) {
      type = Type::Number;
      value = 0.0;
    }
  }
}

Variable::Variable(const Variable& other)
    : value(other.value),
      str(other.str),
      boolVal(other.boolVal),
      type(other.type) {
  CopyChildren(other);
}

Variable& Variable::operator=(const Variable& other) {
  if (this != &other) {
    value = other.value;
    str = other.str;
    boolVal = other.boolVal;
    type = other.type;
    CopyChildren(other);
  }

  return *this;
}

void Variable::CopyChildren(const gd::Variable& other) {
  children.clear();
  for (auto& it : other.children) {
    children[it.first] = std::make_shared<gd::Variable>(*it.second);
  }
  for (auto child : other.childrenList) {
    childrenList.push_back(std::make_shared<gd::Variable>(*child.get()));
  }
}
}  // namespace gd
