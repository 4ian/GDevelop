/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ObjectListDialogsHelper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include <boost/algorithm/string.hpp>
#include <wx/treectrl.h>

namespace gd
{

void ObjectListDialogsHelper::RefreshLists(wxTreeCtrl * sceneObjectsList, wxTreeCtrl * sceneGroupsList, wxTreeCtrl * globalObjectsList, wxTreeCtrl * globalGroupsList, std::string objectTypeAllowed, std::string searchText)
{
    bool searching = searchText.empty() ? false : true;

    sceneObjectsList->DeleteAllItems();
    sceneObjectsList->AddRoot( _( "Tous les objets de la scène" ) );

    for ( unsigned int i = 0;i < layout.GetObjectsCount();i++ )
    {
        std::string name = layout.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if (( objectTypeAllowed.empty() || layout.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            sceneObjectsList->AppendItem( sceneObjectsList->GetRootItem(), name );
        }
    }

    sceneObjectsList->ExpandAll();

    sceneGroupsList->DeleteAllItems();
    sceneGroupsList->AddRoot( _( "Tous les groupes de la scène" ) );

    for ( unsigned int i = 0;i < layout.GetObjectGroups().size();i++ )
    {
        std::string name = layout.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, layout.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            sceneGroupsList->AppendItem( sceneGroupsList->GetRootItem(), name );
        }
    }

    sceneGroupsList->ExpandAll();

    globalObjectsList->DeleteAllItems();
    globalObjectsList->AddRoot( _( "Tous les objets globaux" ) );

    for ( unsigned int i = 0;i < project.GetObjectsCount();i++ )
    {
        std::string name = project.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if ((objectTypeAllowed.empty() || project.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            globalObjectsList->AppendItem( globalObjectsList->GetRootItem(), name );
        }
    }

    globalObjectsList->ExpandAll();

    globalGroupsList->DeleteAllItems();
    globalGroupsList->AddRoot( _( "Tous les groupes globaux" ) );

    for ( unsigned int i = 0;i < project.GetObjectGroups().size();i++ )
    {
        std::string name = project.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, project.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && boost::to_upper_copy(name).find(boost::to_upper_copy(searchText)) != std::string::npos)))
        {
            globalGroupsList->AppendItem( globalGroupsList->GetRootItem(), name );
        }
    }

    globalGroupsList->ExpandAll();
}


}
