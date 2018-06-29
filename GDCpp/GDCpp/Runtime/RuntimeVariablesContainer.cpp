/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"
#include <iostream>
#include <string>
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/TinyXml/tinyxml.h"

BadVariable RuntimeVariablesContainer::badVariable;
BadRuntimeVariablesContainer RuntimeVariablesContainer::badVariablesContainer;

RuntimeVariablesContainer::RuntimeVariablesContainer(
    const gd::VariablesContainer& container) {
  Merge(container);
}

RuntimeVariablesContainer& RuntimeVariablesContainer::operator=(
    const gd::VariablesContainer& container) {
  Clear();
  Merge(container);

  return *this;
}

void RuntimeVariablesContainer::Clear() {
  variablesArray.clear();
  for (std::map<gd::String, gd::Variable*>::iterator it = variables.begin();
       it != variables.end();
       ++it)
    delete it->second;
  variables.clear();
}

void RuntimeVariablesContainer::Merge(const gd::VariablesContainer& container) {
  for (std::size_t i = 0; i < container.Count(); ++i) {
    const gd::String& name = container.GetNameAt(i);
    const gd::Variable& variable = container.Get(i);

    if (Has(name))
      Get(name) = variable;
    else {
      gd::Variable* newVariable = new gd::Variable(variable);
      variablesArray.push_back(newVariable);
      variables[name] = newVariable;
    }
  }
}

gd::Variable& RuntimeVariablesContainer::Get(const gd::String& name) {
  std::map<gd::String, gd::Variable*>::const_iterator var =
      variables.find(name);

  if (var != variables.end()) return *(var->second);

  gd::Variable* newVariable = new gd::Variable;
  variables[name] = newVariable;
  return *newVariable;
}

const gd::Variable& RuntimeVariablesContainer::Get(
    const gd::String& name) const {
  std::map<gd::String, gd::Variable*>::const_iterator var =
      variables.find(name);

  if (var != variables.end()) return *(var->second);

  gd::Variable* newVariable = new gd::Variable;
  variables[name] = newVariable;
  return *newVariable;
}

gd::Variable& RuntimeVariablesContainer::GetBadVariable() {
  return badVariable;
}

/**
 * \brief Return a "bad" variables container that can be used when no other
 * valid container can be used.
 */
RuntimeVariablesContainer&
RuntimeVariablesContainer::GetBadVariablesContainer() {
  return badVariablesContainer;
}
