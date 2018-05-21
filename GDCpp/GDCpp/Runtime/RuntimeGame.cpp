/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCpp/Runtime/RuntimeGame.h"
#include <map>
#include <memory>
#include <string>
#include <vector>
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"

RuntimeGame::RuntimeGame() {
  soundManager.SetResourcesManager(&GetResourcesManager());
}

void RuntimeGame::LoadFromProject(const gd::Project& project) {
  // Copy inherited project
  gd::Project::operator=(project);

  variables.Merge(project.GetVariables());
  soundManager.SetResourcesManager(&GetResourcesManager());
}
