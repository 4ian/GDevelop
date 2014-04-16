/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(EMSCRIPTEN)
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeGame.h"
#include "GDCpp/RuntimeVariablesContainer.h"
#include <vector>
#include <string>
#include <map>
#include <boost/shared_ptr.hpp>

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
#endif