/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)

#include "ArbitraryResourceWorker.h"
#include <memory>
#include <vector>
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/PlatformDefinition/ResourcesManager.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

using namespace std;

namespace gd
{

void ArbitraryResourceWorker::ExposeResource(gd::Resource & resource)
{
    if (!resource.UseFile()) return;

    gd::String file = resource.GetFile();
    ExposeFile(file);
    if (file != resource.GetFile())
        resource.SetFile(file);
}


ArbitraryResourceWorker::~ArbitraryResourceWorker()
{
}

void LaunchResourceWorkerOnEvents(const gd::Project & project, gd::EventsList & events, gd::ArbitraryResourceWorker & worker)
{
    //Get all extensions used
    std::vector< std::shared_ptr<gd::PlatformExtension> > allGameExtensions;
    std::vector<gd::String> usedExtensions = project.GetUsedExtensions();
    for (unsigned int i = 0;i<usedExtensions.size();++i)
    {
        std::shared_ptr<gd::PlatformExtension> extension = project.GetCurrentPlatform().GetExtension(usedExtensions[i]);

        if ( extension != std::shared_ptr<gd::PlatformExtension>() )
            allGameExtensions.push_back(extension);
    }

    for ( unsigned int j = 0;j < events.size() ;j++ )
    {
        vector < gd::InstructionsList* > allActionsVectors = events[j].GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
        {
            for ( unsigned int k = 0;k < allActionsVectors[i]->size() ;k++ )
            {
                gd::String type = allActionsVectors[i]->Get( k ).GetType();
                for (unsigned int e = 0;e<allGameExtensions.size();++e)
                {
                    bool extensionHasAction = false;

                    const std::map<gd::String, gd::InstructionMetadata> & allActions = allGameExtensions[e]->GetAllActions();
                    if ( allActions.find(type) != allActions.end() )
                        extensionHasAction = true;

                    const vector < gd::String > & objects = allGameExtensions[e]->GetExtensionObjectsTypes();
                    for (unsigned int o = 0;o<objects.size();++o)
                    {
                        const std::map<gd::String, gd::InstructionMetadata> & allObjectsActions = allGameExtensions[e]->GetAllActionsForObject(objects[o]);
                        if ( allObjectsActions.find(type) != allObjectsActions.end() )
                            extensionHasAction = true;
                    }

                    const vector < gd::String > & autos = allGameExtensions[e]->GetBehaviorsTypes();
                    for (unsigned int a = 0;a<autos.size();++a)
                    {
                        const std::map<gd::String, gd::InstructionMetadata> & allAutosActions = allGameExtensions[e]->GetAllActionsForBehavior(autos[a]);
                        if ( allAutosActions.find(type) != allAutosActions.end() )
                            extensionHasAction = true;
                    }

                    if ( extensionHasAction )
                    {
                        allGameExtensions[e]->ExposeActionsResources(allActionsVectors[i]->Get( k ), worker);
                        break;
                    }
                }

            }
        }

        vector < gd::InstructionsList* > allConditionsVector = events[j].GetAllConditionsVectors();
        for (unsigned int i = 0;i<allConditionsVector.size();++i)
        {
            for ( unsigned int k = 0;k < allConditionsVector[i]->size() ;k++ )
            {
                gd::String type = allConditionsVector[i]->Get( k ).GetType();
                for (unsigned int e = 0;e<allGameExtensions.size();++e)
                {
                    bool extensionHasCondition = false;

                    const std::map<gd::String, gd::InstructionMetadata> & allConditions = allGameExtensions[e]->GetAllConditions();
                    if ( allConditions.find(type) != allConditions.end() )
                        extensionHasCondition = true;

                    const vector < gd::String > & objects = allGameExtensions[e]->GetExtensionObjectsTypes();
                    for (unsigned int j = 0;j<objects.size();++j)
                    {
                        const std::map<gd::String, gd::InstructionMetadata> & allObjectsConditions = allGameExtensions[e]->GetAllConditionsForObject(objects[j]);
                        if ( allObjectsConditions.find(type) != allObjectsConditions.end() )
                            extensionHasCondition = true;
                    }

                    const vector < gd::String > & autos = allGameExtensions[e]->GetBehaviorsTypes();
                    for (unsigned int j = 0;j<autos.size();++j)
                    {
                        const std::map<gd::String, gd::InstructionMetadata> & allAutosConditions = allGameExtensions[e]->GetAllConditionsForBehavior(autos[j]);
                        if ( allAutosConditions.find(type) != allAutosConditions.end() )
                            extensionHasCondition = true;
                    }

                    if ( extensionHasCondition ) allGameExtensions[e]->ExposeConditionsResources(allConditionsVector[i]->Get( k ), worker);
                }

            }
        }

        if ( events[j].CanHaveSubEvents() )
            LaunchResourceWorkerOnEvents(project, events[j].GetSubEvents(), worker);
    }

    return;
}

}
#endif
