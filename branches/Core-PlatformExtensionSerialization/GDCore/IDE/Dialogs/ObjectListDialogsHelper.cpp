/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ObjectListDialogsHelper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"
#include <boost/algorithm/string.hpp>
#include <wx/treectrl.h>
#include <wx/bitmap.h>

namespace gd
{

void ObjectListDialogsHelper::SetSearchText(std::string searchText_) 
{ 
    searchText = searchText_; 
    boost::to_upper(searchText);
}

void ObjectListDialogsHelper::RefreshLists(wxTreeCtrl * sceneObjectsList, wxTreeCtrl * sceneGroupsList, wxTreeCtrl * globalObjectsList, wxTreeCtrl * globalGroupsList)
{
    bool searching = searchText.empty() ? false : true;

    sceneObjectsList->DeleteAllItems();
    sceneObjectsList->AddRoot( _( "All objects groups of the scene" ) );

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
    sceneGroupsList->AddRoot( _( "All groups of the scene" ) );

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
    globalObjectsList->AddRoot( _( "All globals objects" ) );

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
    globalGroupsList->AddRoot( _( "All globals groups" ) );

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

void ObjectListDialogsHelper::RefreshList(wxTreeCtrl * objectsList)
{
    objectsList->DeleteAllItems();
    objectsList->AddRoot( "Root" );

    AddObjectsToList(objectsList, layout, false, false);
    if ( groupsAllowed ) AddGroupsToList(objectsList, layout.GetObjectGroups(), false, false);
    AddObjectsToList(objectsList, project, true, false);
    if ( groupsAllowed ) AddGroupsToList(objectsList, project.GetObjectGroups(), true, false);

    objectsList->ExpandAll();
}

wxTreeItemId ObjectListDialogsHelper::AddObjectsToList(wxTreeCtrl * objectsList, const gd::ClassWithObjects & objects, bool globalObjects, bool substituteIfEmpty)
{
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for ( unsigned int i = 0;i < objects.GetObjectsCount();i++ )
    {
        std::string name = objects.GetObject(i).GetName();

        //Only add objects if they match the search criteria
        if ((objectTypeAllowed.empty() || objects.GetObject(i).GetType() == objectTypeAllowed ) && 
            ( !searching || (searching && boost::to_upper_copy(name).find(searchText) != std::string::npos)) )
        {
            /*int thumbnailID = -1;
            wxBitmap thumbnail;
            if ( objects.GetObject(i).GenerateThumbnail(project, thumbnail)  && thumbnail.IsOk() )
            {
                objectsImagesList->Add(thumbnail);
                thumbnailID = objectsImagesList->GetImageCount()-1;
            }*/

            wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(),
                objects.GetObject(i).GetName()/*, thumbnailID*/ );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalObjects ? "GlobalObject" : "LayoutObject"));
            if ( globalObjects ) objectsList->SetItemTextColour(item, wxColour(40,40,45));

            lastAddedItem = item;
        }
    }

    if ( substituteIfEmpty && !globalObjects && objects.GetObjectsCount() == 0 )
    {
        wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), _("No objects"), 0 );
        //substituteObjItem = item; Todo: Getter for the substitute.
        lastAddedItem = item;
    }

    return lastAddedItem;
}

wxTreeItemId ObjectListDialogsHelper::AddGroupsToList(wxTreeCtrl * objectsList, const std::vector <ObjectGroup> & groups, bool globalGroup, bool substituteIfEmpty)
{
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for (unsigned int i = 0;i<groups.size();++i)
    {
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, groups[i].GetName()) == objectTypeAllowed ) && 
            ( !searching || (searching && boost::to_upper_copy(groups[i].GetName()).find(searchText) != std::string::npos)) )
        {
            wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), groups[i].GetName()/*, 1*/ );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalGroup ? "GlobalGroup" : "LayoutGroup"));
            if ( globalGroup ) objectsList->SetItemTextColour(item, wxColour(40,40,45));

            lastAddedItem = item;
        }
    }

    if ( substituteIfEmpty && !globalGroup && groups.empty() )
    {
        wxTreeItemId item = objectsList->AppendItem( objectsList->GetRootItem(), _("No groups"), 1 );
        //substituteGroupItem = item; Todo: Getter for the substitute.
        lastAddedItem = item;
    }

    return lastAddedItem;
}

}