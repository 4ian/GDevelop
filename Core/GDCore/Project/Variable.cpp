/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Project/Variable.h"

#include <sstream>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/UUID/UUID.h"

using namespace std;

namespace gd {

gd::Variable Variable::badVariable;

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

    // Conversion is only possible for non primitive types
    if (type == Type::Array)
      for (auto i = childrenArray.begin(); i != childrenArray.end(); ++i)
        children.insert(
            std::make_pair(gd::String::From(i - childrenArray.begin()), (*i)));

    type = Type::Structure;
    // Free now unused memory
    childrenArray.clear();
  } else if (newType == Type::Array) {
    childrenArray.clear();

    // Conversion is only possible for non primitive types
    if (type == Type::Structure)
      for (auto i = children.begin(); i != children.end(); ++i)
        childrenArray.push_back((*i).second);

    type = Type::Array;
    // Free now unused memory
    children.clear();
  }
}

double Variable::GetValue() const {
  if (type == Type::Number) {
    return value;
  } else if (type == Type::String) {
    double retVal = str.empty() ? 0.0 : str.To<double>();
    if (std::isnan(retVal)) retVal = 0.0;
    return retVal;
  } else if (type == Type::Boolean) {
    return boolVal ? 1.0 : 0.0;
  }

  // It isn't possible to convert a non-primitive type to a number
  return 0.0;
}

const gd::String& Variable::GetString() const {
  if (type == Type::Number)
    str = gd::String::From(value);
  else if (type == Type::Boolean)
    str = boolVal ? "1" : "0";
  else if (type != Type::String)
    str.clear();

  return str;
}

bool Variable::GetBool() const {
  if (type == Type::Boolean) {
    return boolVal;
  } else if (type == Type::String) {
    return !str.empty();
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
  while (childrenArray.size() <= index)
    childrenArray.push_back(std::make_shared<gd::Variable>());
  return *childrenArray[index];
};

const Variable& Variable::GetAtIndex(const size_t index) const {
  if (childrenArray.size() <= index) return badVariable;
  return *childrenArray.at(index);
};

void Variable::MoveChildInArray(const size_t oldIndex, const size_t newIndex) {
  if (oldIndex >= childrenArray.size() || newIndex >= childrenArray.size())
    return;

  std::shared_ptr<gd::Variable> object = std::move(childrenArray[oldIndex]);
  childrenArray.erase(childrenArray.begin() + oldIndex);
  childrenArray.insert(childrenArray.begin() + newIndex, std::move(object));
}

Variable& Variable::PushNew() { return GetAtIndex(GetChildrenCount()); };

void Variable::RemoveAtIndex(const size_t index) {
  if (index >= childrenArray.size()) return;
  childrenArray.erase(childrenArray.begin() + index);
};

bool Variable::InsertAtIndex(const gd::Variable& variable, const size_t index) {
  if (type != Type::Array) return false;
  auto newVariable = std::make_shared<gd::Variable>(variable);
  if (index < childrenArray.size()) {
    childrenArray.insert(childrenArray.begin() + index, newVariable);
  } else {
    childrenArray.push_back(newVariable);
  }
  return true;
};

bool Variable::InsertChild(const gd::String& name,
                           const gd::Variable& variable) {
  if (type != Type::Structure || HasChild(name)) {
    return false;
  }
  children[name] = std::make_shared<gd::Variable>(variable);
  return true;
};

void Variable::SerializeTo(SerializerElement& element) const {
  element.SetStringAttribute("type", TypeAsString(GetType()));
  if (IsFolded()) element.SetBoolAttribute("folded", true);

  if (!persistentUuid.empty())
    element.SetStringAttribute("persistentUuid", persistentUuid);

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
    for (auto child : childrenArray) {
      child->SerializeTo(childrenElement.AddChild("variable"));
    }
  }
}

void Variable::UnserializeFrom(const SerializerElement& element) {
  type = StringAsType(element.GetStringAttribute("type", "string"));

  persistentUuid = element.GetStringAttribute("persistentUuid");

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
  SetFolded(element.GetBoolAttribute("folded", false));

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
}

Variable& Variable::ResetPersistentUuid() {
  persistentUuid = UUID::MakeUuid4();
  return *this;
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
  for (auto& it : childrenArray) {
    if (it.get() == &variableToSearch) return true;
    if (recursive && it->Contains(variableToSearch, true)) return true;
  }

  return false;
}

void Variable::RemoveRecursively(const gd::Variable& variableToRemove) {
  for (auto it = children.begin(); it != children.end();) {
    if (it->second.get() == &variableToRemove)
      it = children.erase(it);
    else {
      it->second->RemoveRecursively(variableToRemove);
      it++;
    }
  }
  for (auto it = childrenArray.begin(); it != childrenArray.end();)
    if (it->get() == &variableToRemove)
      childrenArray.erase(it);
    else {
      (*it)->RemoveRecursively(variableToRemove);
      it++;
    };
}

Variable::Variable(const Variable& other)
    : value(other.value),
      str(other.str),
      folded(other.folded),
      boolVal(other.boolVal),
      type(other.type),
      persistentUuid(other.persistentUuid) {
  CopyChildren(other);
}

Variable& Variable::operator=(const Variable& other) {
  if (this != &other) {
    value = other.value;
    str = other.str;
    folded = other.folded;
    boolVal = other.boolVal;
    type = other.type;
    persistentUuid = other.persistentUuid;
    CopyChildren(other);
  }

  return *this;
}

void Variable::CopyChildren(const gd::Variable& other) {
  children.clear();
  for (auto& it : other.children) {
    children[it.first] = std::make_shared<gd::Variable>(*it.second);
  }
  for (auto child : other.childrenArray) {
    childrenArray.push_back(std::make_shared<gd::Variable>(*child.get()));
  }
}
}  // namespace gd
