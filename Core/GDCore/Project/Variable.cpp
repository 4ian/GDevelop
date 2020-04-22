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
  if (!isNumber) {
    stringstream ss;
    ss << str;
    ss >> value;
    isNumber = true;
  }

  return value;
}

const gd::String& Variable::GetString() const {
  if (isNumber) {
    stringstream s;
    s << (value);
    str = s.str();
    isNumber = false;
  }

  return str;
}

bool Variable::HasChild(const gd::String& name) const {
  return isStructure && children.find(name) != children.end();
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

  isStructure = true;
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

  isStructure = true;
  children[name] = std::make_shared<gd::Variable>();
  return *children[name];
}

void Variable::RemoveChild(const gd::String& name) {
  if (!isStructure) return;
  children.erase(name);
  isStructure = !children.empty();
}

bool Variable::RenameChild(const gd::String& oldName,
                           const gd::String& newName) {
  if (!isStructure || !HasChild(oldName) || HasChild(newName)) return false;

  children[newName] = children[oldName];
  children.erase(oldName);

  return true;
}

void Variable::ClearChildren() {
  if (!isStructure) return;
  children.clear();
}

void Variable::SerializeTo(SerializerElement& element) const {
  if (!isStructure)
    element.SetAttribute("value", GetString());
  else {
    SerializerElement& childrenElement = element.AddChild("children");
    childrenElement.ConsiderAsArrayOf("variable");
    for (auto i = children.begin(); i != children.end(); ++i) {
      SerializerElement& variableElement = childrenElement.AddChild("variable");
      variableElement.SetAttribute("name", i->first);
      i->second->SerializeTo(variableElement);
    }
  }
}

void Variable::UnserializeFrom(const SerializerElement& element) {
  isStructure = element.HasChild("children", "Children");

  if (isStructure) {
    const SerializerElement& childrenElement =
        element.GetChild("children", 0, "Children");
    childrenElement.ConsiderAsArrayOf("variable", "Variable");
    for (int i = 0; i < childrenElement.GetChildrenCount(); ++i) {
      const SerializerElement& childElement = childrenElement.GetChild(i);
      gd::String name = childElement.GetStringAttribute("name", "", "Name");
      children[name] = std::make_shared<gd::Variable>();
      children[name]->UnserializeFrom(childElement);
    }
  } else
    SetString(element.GetStringAttribute("value", "", "Value"));
}

void Variable::SaveToXml(TiXmlElement* element) const {
  if (!element) return;

  if (!isStructure)
    element->SetAttribute("Value", GetString().c_str());
  else {
    TiXmlElement* childrenElem = new TiXmlElement("Children");
    element->LinkEndChild(childrenElem);
    for (auto i = children.begin(); i != children.end(); ++i) {
      TiXmlElement* variable = new TiXmlElement("Variable");
      childrenElem->LinkEndChild(variable);

      variable->SetAttribute("Name", i->first.c_str());
      i->second->SaveToXml(variable);
    }
  }
}

void Variable::LoadFromXml(const TiXmlElement* element) {
  if (!element) return;

  isStructure = element->FirstChildElement("Children") != NULL;

  if (isStructure) {
    const TiXmlElement* child =
        element->FirstChildElement("Children")->FirstChildElement();
    while (child) {
      gd::String name =
          child->Attribute("Name") ? child->Attribute("Name") : "";
      children[name] = std::make_shared<gd::Variable>();
      children[name]->LoadFromXml(child);

      child = child->NextSiblingElement();
    }
  } else if (element->Attribute("Value"))
    SetString(element->Attribute("Value"));
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
  isStructure = !children.empty();
}

Variable::Variable(const Variable& other)
    : value(other.value),
      str(other.str),
      isNumber(other.isNumber),
      isStructure(other.isStructure) {
  CopyChildren(other);
}

Variable& Variable::operator=(const Variable& other) {
  if (this != &other) {
    value = other.value;
    str = other.str;
    isNumber = other.isNumber;
    isStructure = other.isStructure;
    CopyChildren(other);
  }

  return *this;
}

void Variable::CopyChildren(const gd::Variable& other) {
  children.clear();
  for (auto& it : other.children) {
    children[it.first] = std::make_shared<gd::Variable>(*it.second);
  }
}
}  // namespace gd
