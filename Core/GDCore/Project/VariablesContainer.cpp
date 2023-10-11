/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/VariablesContainer.h"

#include <algorithm>
#include <iostream>

#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/UUID/UUID.h"

namespace gd {

gd::Variable VariablesContainer::badVariable;
gd::String VariablesContainer::badName;

namespace {

// Tool functor used below
class VariableHasName {
 public:
  VariableHasName(gd::String const& name_) : name(name_) {}

  bool operator()(
      const std::pair<gd::String, std::shared_ptr<gd::Variable>>& p) {
    return (p.first == name);
  }

  gd::String name;
};
}  // namespace

VariablesContainer::VariablesContainer() {}

bool VariablesContainer::Has(const gd::String& name) const {
  auto i =
      std::find_if(variables.begin(), variables.end(), VariableHasName(name));
  return (i != variables.end());
}

Variable& VariablesContainer::Get(const gd::String& name) {
  auto i =
      std::find_if(variables.begin(), variables.end(), VariableHasName(name));
  if (i != variables.end()) return *i->second;

  return badVariable;
}

const Variable& VariablesContainer::Get(const gd::String& name) const {
  auto i =
      std::find_if(variables.begin(), variables.end(), VariableHasName(name));
  if (i != variables.end()) return *i->second;

  return badVariable;
}

Variable& VariablesContainer::Get(std::size_t index) {
  if (index < variables.size()) return *variables[index].second;

  return badVariable;
}

const Variable& VariablesContainer::Get(std::size_t index) const {
  if (index < variables.size()) return *variables[index].second;

  return badVariable;
}

const gd::String& VariablesContainer::GetNameAt(std::size_t index) const {
  if (index < variables.size()) return variables[index].first;

  return badName;
}

Variable& VariablesContainer::Insert(const gd::String& name,
                                     const gd::Variable& variable,
                                     std::size_t position) {
  auto newVariable = std::make_shared<gd::Variable>(variable);
  if (position < variables.size()) {
    variables.insert(variables.begin() + position,
                     std::make_pair(name, newVariable));
    return *variables[position].second;
  } else {
    variables.push_back(std::make_pair(name, newVariable));
    return *variables.back().second;
  }
}

void VariablesContainer::Remove(const gd::String& varName) {
  variables.erase(
      std::remove_if(
          variables.begin(), variables.end(), VariableHasName(varName)),
      variables.end());
}

void VariablesContainer::RemoveRecursively(
    const gd::Variable& variableToRemove) {
  variables.erase(
      std::remove_if(
          variables.begin(),
          variables.end(),
          [&variableToRemove](
              const std::pair<gd::String, std::shared_ptr<gd::Variable>>&
                  nameAndVariable) {
            return &variableToRemove == nameAndVariable.second.get();
          }),
      variables.end());

  for (auto& it : variables) {
    it.second->RemoveRecursively(variableToRemove);
  }
}

std::size_t VariablesContainer::GetPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < variables.size(); ++i) {
    if (variables[i].first == name) return i;
  }

  return gd::String::npos;
}

Variable& VariablesContainer::InsertNew(const gd::String& name,
                                        std::size_t position) {
  Variable newVariable;
  return Insert(name, newVariable, position);
}

bool VariablesContainer::Rename(const gd::String& oldName,
                                const gd::String& newName) {
  if (Has(newName)) return false;

  auto i = std::find_if(
      variables.begin(), variables.end(), VariableHasName(oldName));
  if (i != variables.end()) i->first = newName;

  return true;
}

void VariablesContainer::Swap(std::size_t firstVariableIndex,
                              std::size_t secondVariableIndex) {
  if (firstVariableIndex >= variables.size() ||
      secondVariableIndex >= variables.size())
    return;

  auto temp = variables[firstVariableIndex];
  variables[firstVariableIndex] = variables[secondVariableIndex];
  variables[secondVariableIndex] = temp;
}

void VariablesContainer::Move(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= variables.size() || newIndex >= variables.size() ||
      oldIndex == newIndex)
    return;

  auto nameAndVariable = variables[oldIndex];
  variables.erase(variables.begin() + oldIndex);
  variables.insert(variables.begin() + newIndex, nameAndVariable);
}

void VariablesContainer::ForEachVariableMatchingSearch(
    const gd::String& search,
    std::function<void(const gd::String& name, const gd::Variable& variable)>
        fn) const {
  for (const auto& nameAndVariable : variables) {
    if (nameAndVariable.first.FindCaseInsensitive(search) != gd::String::npos)
      fn(nameAndVariable.first, *nameAndVariable.second);
  }
}

void VariablesContainer::SerializeTo(SerializerElement& element) const {
  if (!persistentUuid.empty())
    element.SetStringAttribute("persistentUuid", persistentUuid);

  element.ConsiderAsArrayOf("variable");
  for (std::size_t j = 0; j < variables.size(); j++) {
    SerializerElement& variableElement = element.AddChild("variable");
    variableElement.SetAttribute("name", variables[j].first);
    variables[j].second->SerializeTo(variableElement);
  }
}

void VariablesContainer::UnserializeFrom(const SerializerElement& element) {
  persistentUuid = element.GetStringAttribute("persistentUuid");

  Clear();
  element.ConsiderAsArrayOf("variable", "Variable");
  for (std::size_t j = 0; j < element.GetChildrenCount(); j++) {
    const SerializerElement& variableElement = element.GetChild(j);

    Variable variable;
    variable.UnserializeFrom(variableElement);
    Insert(
        variableElement.GetStringAttribute("name", "", "Name"), variable, -1);
  }
}

VariablesContainer& VariablesContainer::ResetPersistentUuid() {
  persistentUuid = UUID::MakeUuid4();
  for (auto& variable : variables) {
    variable.second->ResetPersistentUuid();
  }

  return *this;
}

VariablesContainer& VariablesContainer::ClearPersistentUuid() {
  persistentUuid = "";
  for (auto& variable : variables) {
    variable.second->ClearPersistentUuid();
  }

  return *this;
}

VariablesContainer::VariablesContainer(const VariablesContainer& other) {
  Init(other);
}

VariablesContainer& VariablesContainer::operator=(
    const VariablesContainer& other) {
  if (this != &other) Init(other);

  return *this;
}

void VariablesContainer::Init(const gd::VariablesContainer& other) {
  persistentUuid = other.persistentUuid;
  variables.clear();
  for (auto& it : other.variables) {
    variables.push_back(
        std::make_pair(it.first, std::make_shared<gd::Variable>(*it.second)));
  }
}
}  // namespace gd
