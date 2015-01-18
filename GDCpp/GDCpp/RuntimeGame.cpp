/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <memory>

RuntimeGame::RuntimeGame()
{
}

void RuntimeGame::LoadFromProject(const gd::Project & project)
{
    //Copy inherited project
    gd::Project::operator=(project);

    //Initialize variables
    variables.Merge(project.GetVariables());
}
