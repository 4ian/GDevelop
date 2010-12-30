#if defined(GDE)

#include "ResourcesMergingHelper.h"
#include "Game.h"
#include "GDL/ExtensionBase.h"
#include "GDL/ExtensionsManager.h"
#include <wx/filename.h>
#include <string>

std::string ResourcesMergingHelper::GetNewFilename(std::string resourceFilename)
{
    if ( resourcesNewFilename.find(resourceFilename) != resourcesNewFilename.end() )
        return resourcesNewFilename[resourceFilename];

    //Currently, just strip the filename and add the resource, don't take care of resources with same filename.
    resourcesNewFilename[resourceFilename] = std::string( wxFileNameFromPath(resourceFilename).mb_str() );
    return resourcesNewFilename[resourceFilename];
}

void InventoryEventsResources(const Game & game, vector < BaseEventSPtr > & events, ResourcesMergingHelper & resourcesMergingHelper)
{
    //Get all extensions used
    std::vector< boost::shared_ptr<ExtensionBase> > allGameExtensions;
    for (unsigned int i = 0;i<game.extensionsUsed.size();++i)
    {
        boost::shared_ptr<ExtensionBase> extension = gdp::ExtensionsManager::getInstance()->GetExtension(game.extensionsUsed[i]);

        if ( extension != boost::shared_ptr<ExtensionBase>() )
            allGameExtensions.push_back(extension);
    }

    for ( unsigned int j = 0;j < events.size() ;j++ )
    {
        vector < vector<Instruction>* > allActionsVectors = events[j]->GetAllActionsVectors();
        for (unsigned int i = 0;i<allActionsVectors.size();++i)
        {
            for ( unsigned int k = 0;k < allActionsVectors[i]->size() ;k++ )
            {
                for (unsigned int e = 0;e<allGameExtensions.size();++e)
                {
                    std::string type = allActionsVectors[i]->at( k ).GetType();
                    bool extensionHasAction = false;

                    const std::map<string, InstructionInfos> & allActions = allGameExtensions[e]->GetAllActions();
                    if ( allActions.find(type) != allActions.end() )
                        extensionHasAction = true;

                    const vector < string > & objects = allGameExtensions[e]->GetExtensionObjectsTypes();
                    for (unsigned int o = 0;o<objects.size();++o)
                    {
                        const std::map<string, InstructionInfos> & allObjectsActions = allGameExtensions[e]->GetAllActionsForObject(objects[o]);
                        if ( allObjectsActions.find(type) != allObjectsActions.end() )
                            extensionHasAction = true;
                    }

                    const vector < string > & autos = allGameExtensions[e]->GetAutomatismsTypes();
                    for (unsigned int a = 0;a<autos.size();++a)
                    {
                        const std::map<string, InstructionInfos> & allAutosActions = allGameExtensions[e]->GetAllActionsForAutomatism(autos[a]);
                        if ( allAutosActions.find(type) != allAutosActions.end() )
                            extensionHasAction = true;
                    }

                    if ( extensionHasAction )
                    {
                        allGameExtensions[e]->PrepareActionsResourcesForMerging(allActionsVectors[i]->at( k ), resourcesMergingHelper);
                        break;
                    }
                }

            }
        }

        vector < vector<Instruction>* > allConditionsVector = events[j]->GetAllConditionsVectors();
        for (unsigned int i = 0;i<allConditionsVector.size();++i)
        {
            for ( unsigned int k = 0;k < allConditionsVector[i]->size() ;k++ )
            {
                for (unsigned int e = 0;e<allGameExtensions.size();++e)
                {
                    std::string type = allConditionsVector[i]->at( k ).GetType();
                    bool extensionHasCondition = false;

                    const std::map<string, InstructionInfos> & allConditions = allGameExtensions[e]->GetAllConditions();
                    if ( allConditions.find(type) != allConditions.end() )
                        extensionHasCondition = true;

                    const vector < string > & objects = allGameExtensions[e]->GetExtensionObjectsTypes();
                    for (unsigned int j = 0;j<objects.size();++j)
                    {
                        const std::map<string, InstructionInfos> & allObjectsConditions = allGameExtensions[e]->GetAllConditionsForObject(objects[j]);
                        if ( allObjectsConditions.find(type) != allObjectsConditions.end() )
                            extensionHasCondition = true;
                    }

                    const vector < string > & autos = allGameExtensions[e]->GetAutomatismsTypes();
                    for (unsigned int j = 0;j<autos.size();++j)
                    {
                        const std::map<string, InstructionInfos> & allAutosConditions = allGameExtensions[e]->GetAllConditionsForAutomatism(autos[j]);
                        if ( allAutosConditions.find(type) != allAutosConditions.end() )
                            extensionHasCondition = true;
                    }

                    if ( extensionHasCondition ) allGameExtensions[e]->PrepareConditionsResourcesForMerging(allConditionsVector[i]->at( k ), resourcesMergingHelper);
                }

            }
        }

        if ( events.at(j)->CanHaveSubEvents() )
            InventoryEventsResources(game, events.at(j)->GetSubEvents(), resourcesMergingHelper);
    }

    return;
}

#endif
