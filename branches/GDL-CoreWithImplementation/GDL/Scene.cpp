/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include "GDL/Scene.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/Game.h"
#include "GDL/Position.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedData.h"
#include "GDL/CodeExecutionEngine.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/Layer.h"
#include "GDL/XmlMacros.h"
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/Serialization.h"
#endif
#undef GetObject //Disable an annoying macro

Scene::Scene() :
    gd::Layout(),
    codeExecutionEngine(boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine))
    #if defined(GD_IDE_ONLY)
    ,profiler(NULL),
    refreshNeeded(false),
    compilationNeeded(true)
    #endif
{
}

Scene::~Scene()
{
    #if defined(GD_IDE_ONLY) //Make sure a compilation is not being run on this scene.
    CodeCompiler::GetInstance()->RemovePendingTasksRelatedTo(*this);
    while ( CodeCompiler::GetInstance()->HasTaskRelatedTo(*this) )
        ;
    #endif
}

void Scene::Init(const Scene & scene)
{
    codeExecutionEngine = boost::shared_ptr<CodeExecutionEngine>(new CodeExecutionEngine);

    #if defined(GD_IDE_ONLY)
    profiler = scene.profiler;

    SetCompilationNeeded(); //Force recompilation/refreshing
    SetRefreshNeeded();
    #endif
}

Scene::Scene(const Scene & scene) :
    gd::Layout(scene)
{
    Init(scene);
}

Scene& Scene::operator=(const Scene & scene)
{
    if ( this != &scene )
    {
        gd::Layout::operator=(scene);
        Init(scene);
    }

    return *this;
}

