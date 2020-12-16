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

/**
 * Get value as a double
 */
double Variable::GetValue() const {
  if (type == Type::Number) {
    return value;
  } else if (type == Type::String) {
    value = str.To<double>();
    type = Type::Number;
    return value;
  } else if (type == Type::Boolean) {
    value = boolVal ? 1.0 : 0.0;
    type = Type::Number;
    return value;
  }

  // It isn't possible to convert a structural type to a number
  value = 0.0;
  type = Type::Number;
  return value;
}

const gd::String& Variable::GetString() const {
  if (type == Type::String) {
    return str;
  } else if (type == Type::Number) {
    str = gd::String::From(value);
    type = Type::String;
    return str;
  } else if (type == Type::Boolean) {
    str = boolVal ? "1" : "0";
    type = Type::String;
    return str;
  }

  // It isn't possible to convert a structural type to a string
  str = "0";
  type = Type::String;
  return str;
}

bool Variable::GetBool() const {
  if (type == Type::Boolean) {
    return boolVal;
  } else if (type == Type::String) {
    boolVal = !(str.empty() || str == "0");
    type = Type::Boolean;
    return boolVal;
  } else if (type == Type::Number) {
    boolVal = value != 0;
    type = Type::Boolean;
    return boolVal;
  }

  // It isn't possible to convert a structural type to a boolean
  boolVal = false;
  type = Type::Boolean;
  return boolVal;
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
  while (childrenList.size() < index)
    childrenList.push_back(std::make_shared<gd::Variable>());
  return *childrenList[index];
};

const Variable& Variable::GetAtIndex(const size_t index) const {
  if (childrenList.size() < index) return *std::make_shared<gd::Variable>();
  return *childrenList.at(index);
};

void Variable::RemoveAtIndex(const size_t index) {
  if (index >= childrenList.size()) return;
  childrenList.erase(childrenList.begin() + index);
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
    SerializerElement& childrenElement = element.AddChild("childrenList");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto child : childrenList) {
      child->SerializeTo(childrenElement.AddChild("variable"));
    }
  }
}

void Variable::UnserializeFrom(const SerializerElement& element) {
  const Type typeName = StringAsType(element.GetStringAttribute("type"));

  if (element.HasChild("children", "Children")) {
    const SerializerElement& childrenElement =
        element.GetChild("children", 0, "Children");
    childrenElement.ConsiderAsArrayOf("variable", "Variable");
    if (childrenElement.GetChildrenCount() == 0) return;
    bool isStructure = childrenElement.GetChild(0).HasAttribute("name");
    for (int i = 0; i < childrenElement.GetChildrenCount(); ++i) {
      const SerializerElement& childElement = childrenElement.GetChild(i);
      if (isStructure) {
        gd::String name = childElement.GetStringAttribute("name", "", "Name");
        children[name] = std::make_shared<gd::Variable>();
        children[name]->UnserializeFrom(childElement);
      } else {
        childrenList.push_back(std::make_shared<gd::Variable>());
        childrenList.back()->UnserializeFrom(childrenElement);
      }
    }
  } else if (typeName == Type::String) {
    SetString(element.GetStringAttribute("value", "0", "Value"));
  } else if (typeName == Type::Number) {
    SetValue(element.GetDoubleAttribute("value", 0.0, "Value"));
  } else if (typeName == Type::Boolean) {
    SetBool(element.GetBoolAttribute("value", false, "Value"));
  };
}

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
