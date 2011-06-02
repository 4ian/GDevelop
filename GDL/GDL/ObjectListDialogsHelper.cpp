/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ObjectListDialogsHelper.h"
#include <wx/treectrl.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include <boost/algorithm/string.hpp>

void ObjectListDialogsHelper::RefreshLists(wxTreeCtrl * sceneObjectsList, wxTreeCtrl * sceneGroupsList, wxTreeCtrl * globalObjectsList, wxTreeCtrl * globalGroupsList, std::string objectTypeAllowed, std::string searchText)
{
    bool searching = searchText.empty() ? false : true;

    sceneObjectsList->DeleteAllItems();
    sceneObjectsList->AddRoot( _( "Tous les objets de la scène" ) );

    //Search the typeId we are allowed to pick
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
    unsigned int typeIdAllowed = extensionsManager->GetTypeIdFromString(objectTypeAllowed);

    for ( unsigned int i = 0;i < scene.initialObjects.size();i++ )
    {
        std::string name = scene.initialObjects[i]->GetName();

        //Only add the object if it has the correct typeId
        if (( typeIdAllowed == 0 || scene.initialObjects[i]->GetTypeId() == typeIdAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            sceneObjectsList->AppendItem( sceneObjectsList->GetRootItem(), name );
        }
    }

    sceneObjectsList->ExpandAll();

    sceneGroupsList->DeleteAllItems();
    sceneGroupsList->AddRoot( _( "Tous les groupes de la scène" ) );

    for ( unsigned int i = 0;i < scene.objectGroups.size();i++ )
    {
        std::string name = scene.objectGroups.at( i ).GetName();

        //Only add the group if it has all objects of the correct typeId
        if (( typeIdAllowed == 0 || GetTypeIdOfObject(game, scene, scene.objectGroups.at( i ).GetName()) == typeIdAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            sceneGroupsList->AppendItem( sceneGroupsList->GetRootItem(), name );
        }
    }

    sceneGroupsList->ExpandAll();

    globalObjectsList->DeleteAllItems();
    globalObjectsList->AddRoot( _( "Tous les objets globaux" ) );

    for ( unsigned int i = 0;i < game.globalObjects.size();i++ )
    {
        std::string name = game.globalObjects[i]->GetName();

        //Only add the object if it has the correct typeId
        if ((typeIdAllowed == 0 || game.globalObjects[i]->GetTypeId() == typeIdAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            globalObjectsList->AppendItem( globalObjectsList->GetRootItem(), name );
        }
    }

    globalObjectsList->ExpandAll();

    globalGroupsList->DeleteAllItems();
    globalGroupsList->AddRoot( _( "Tous les groupes globaux" ) );

    for ( unsigned int i = 0;i < game.objectGroups.size();i++ )
    {
        std::string name = game.objectGroups.at( i ).GetName();

        //Only add the group if it has all objects of the correct typeId
        if (( typeIdAllowed == 0 || GetTypeIdOfObject(game, scene, game.objectGroups.at( i ).GetName()) == typeIdAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            globalGroupsList->AppendItem( globalGroupsList->GetRootItem(), name );
        }
    }

    globalGroupsList->ExpandAll();
}
#endif
