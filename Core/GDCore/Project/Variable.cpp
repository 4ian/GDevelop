/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/Variable.h"

#include <sstream>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd {

/**
 * Get value as a double
 */
double Variable::GetValue() const {
  if (type == TYPES::NUMBER) {
    return value;
  } else if (type == TYPES::STRING) {
    value = str.To<double>();
    type = TYPES::NUMBER;
    return value;
  } else if (type == TYPES::BOOLEAN) {
    value = boolVal ? 1.0 : 0.0;
    type = TYPES::NUMBER;
    return value;
  }

  // It isn't possible to convert a structural type to a number
  value = 0.0;
  type = TYPES::NUMBER;
  return value;
}

const gd::String& Variable::GetString() const {
  if (type == TYPES::STRING) {
    return str;
  } else if (type == TYPES::NUMBER) {
    str = gd::String::From(value);
    type = TYPES::STRING;
    return str;
  } else if (type == TYPES::BOOLEAN) {
    str = boolVal ? "1" : "0";
    type = TYPES::STRING;
    return str;
  }

  // It isn't possible to convert a structural type to a string
  str = "0";
  type = TYPES::STRING;
  return str;
}

bool Variable::GetBool() const {
  if (type == TYPES::BOOLEAN) {
    return boolVal;
  } else if (type == TYPES::STRING) {
    boolVal = !(str.empty() || str == "0");
    type = TYPES::BOOLEAN;
    return boolVal;
  } else if (type == TYPES::NUMBER) {
    boolVal = value != 0;
    type = TYPES::BOOLEAN;
    return boolVal;
  }

  // It isn't possible to convert a structural type to a boolean
  boolVal = false;
  type = TYPES::BOOLEAN;
  return boolVal;
}

bool Variable::HasChild(const gd::String& name) const {
  return type == TYPES::STRUCTURE && children.find(name) != children.end();
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

  type = TYPES::STRUCTURE;
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

  type = TYPES::STRUCTURE;
  children[name] = std::make_shared<gd::Variable>();
  return *children[name];
}

void Variable::RemoveChild(const gd::String& name) {
  if (type == TYPES::STRUCTURE) return;
  children.erase(name);

  // If the structure is empty, make it a default empty variable again.
  if (children.empty()) {
    type = TYPES::NUMBER;
    value = 0;
  }
}

bool Variable::RenameChild(const gd::String& oldName,
                           const gd::String& newName) {
  if (type != TYPES::STRUCTURE || !HasChild(oldName) || HasChild(newName))
    return false;

  children[newName] = children[oldName];
  children.erase(oldName);

  return true;
}

bool Variable::HasIndex(const size_t index) const {
  return type == TYPES::ARRAY && childrenList.size() < index;
};

Variable& Variable::GetIndex(const size_t index) {
  while (childrenList.size() < index)
    childrenList.push_back(std::make_shared<gd::Variable>());
  return *childrenList[index];
};

const Variable& Variable::GetIndex(const size_t index) const {
  if (childrenList.size() < index) return *std::make_shared<gd::Variable>();
  return *childrenList.at(index);
};

void Variable::RemoveIndex(const size_t index) {
  if (!HasIndex(index)) return;
  childrenList.erase(childrenList.begin() + index);
};

void Variable::SerializeTo(SerializerElement& element) const {
  element.SetIntAttribute("type", static_cast<int>(GetType()));

  if (type == TYPES::STRING) {
    element.SetStringAttribute("value", GetString());
  } else if (type == TYPES::NUMBER) {
    element.SetBoolAttribute("value", GetValue());
  } else if (type == TYPES::BOOLEAN) {
    element.SetBoolAttribute("value", GetBool());
  } else if (type == TYPES::STRUCTURE) {
    SerializerElement& childrenElement = element.AddChild("children");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto i = children.begin(); i != children.end(); ++i) {
      SerializerElement& variableElement = childrenElement.AddChild("variable");
      variableElement.SetAttribute("name", i->first);
      i->second->SerializeTo(variableElement);
    }
  } else if (type == TYPES::ARRAY) {
    SerializerElement& childrenElement = element.AddChild("childrenList");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto child : childrenList) {
      child->SerializeTo(childrenElement.AddChild("variable"));
    }
  }
}

void Variable::UnserializeFrom(const SerializerElement& element) {
  const TYPES typeName = static_cast<TYPES>(element.GetIntAttribute("type"));

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
  } else if (typeName == TYPES::STRING) {
    SetString(element.GetStringAttribute("value", "0", "Value"));
  } else if (typeName == TYPES::NUMBER) {
    SetValue(element.GetDoubleAttribute("value", 0.0, "Value"));
  } else if (typeName == TYPES::BOOLEAN) {
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
      it->get()->RemoveRecursively(variableToRemove);
      it++;
    }
    if ((type == TYPES::STRUCTURE && children.empty()) ||
        (type == TYPES::ARRAY && childrenList.empty())) {
      type = TYPES::NUMBER;
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
