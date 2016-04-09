/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeGame.h"
#include "GDCpp/Runtime/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <memory>

RuntimeGame::RuntimeGame()
{
    soundManager.SetResourcesManager(&GetResourcesManager());
}

void RuntimeGame::LoadFromProject(const gd::Project & project)
{
    //Copy inherited project
    gd::Project::operator=(project);

    variables.Merge(project.GetVariables());
    soundManager.SetResourcesManager(&GetResourcesManager());
}
