/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "ObjectListDialogsHelper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"

#if !defined(GD_NO_WX_GUI)
#include <wx/treectrl.h>
#include <wx/bitmap.h>
#include <wx/log.h>
#endif

namespace gd
{

void ObjectListDialogsHelper::SetSearchText(std::string searchText_)
{
    searchText = searchText_;
    searchText = gd::StrUppercase(searchText);
}

std::vector<std::string> ObjectListDialogsHelper::GetMatchingObjects() const
{
    bool searching = searchText.empty() ? false : true;
    std::vector<std::string> results;

    for ( unsigned int i = 0;i < project.GetObjectsCount();i++ )
    {
        std::string name = project.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if ((objectTypeAllowed.empty() || project.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(name).find(gd::StrUppercase(searchText)) != std::string::npos)))
        {
            results.push_back(name);
        }
    }
    for ( unsigned int i = 0;i < project.GetObjectGroups().size();i++ )
    {
        std::string name = project.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, project.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(name).find(gd::StrUppercase(searchText)) != std::string::npos)))
        {
            results.push_back(name);
        }
    }
    for ( unsigned int i = 0;i < layout.GetObjectsCount();i++ )
    {
        std::string name = layout.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if (( objectTypeAllowed.empty() || layout.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(name).find(gd::StrUppercase(searchText)) != std::string::npos)))
        {
            results.push_back(name);
        }
    }

    for ( unsigned int i = 0;i < layout.GetObjectGroups().size();i++ )
    {
        std::string name = layout.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, layout.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(name).find(gd::StrUppercase(searchText)) != std::string::npos)))
        {
            results.push_back(name);
        }
    }

    return results;
}

#if !defined(GD_NO_WX_GUI)
void ObjectListDialogsHelper::RefreshList(wxTreeCtrl * objectsList, wxTreeItemId * objectsRootItem_, wxTreeItemId * groupsRootItem_)
{
    objectsList->DeleteAllItems();
    objectsList->AddRoot( "Root" );

    if (!objectsList->GetImageList())
        objectsList->AssignImageList(new wxImageList(24,24, true));

    objectsList->GetImageList()->RemoveAll();
    objectsList->GetImageList()->Add(gd::SkinHelper::GetIcon("object", 24));
    objectsList->GetImageList()->Add(gd::SkinHelper::GetIcon("group", 24));

    wxTreeItemId objectsRootItem = objectsList->AppendItem(objectsList->GetRootItem(), _("Objects"), 0);
    wxTreeItemId groupsRootItem = objectsList->AppendItem(objectsList->GetRootItem(), _("Groups"), 1);

    AddObjectsToList(objectsList, objectsRootItem, layout, false);
    if ( groupsAllowed ) AddGroupsToList(objectsList, groupsRootItem, layout.GetObjectGroups(), false);
    AddObjectsToList(objectsList, objectsRootItem, project, true);
    if ( groupsAllowed ) AddGroupsToList(objectsList, groupsRootItem, project.GetObjectGroups(), true);

    objectsList->Expand(objectsRootItem);
    objectsList->Expand(groupsRootItem);

    //If asked, return the root items for the objects and groups.
    if (objectsRootItem_) *objectsRootItem_ = objectsRootItem;
    if (groupsRootItem_) *groupsRootItem_ = groupsRootItem;
}

wxTreeItemId ObjectListDialogsHelper::AddObjectsToList(wxTreeCtrl * objectsList, wxTreeItemId rootItem, const gd::ClassWithObjects & objects, bool globalObjects)
{
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for ( unsigned int i = 0;i < objects.GetObjectsCount();i++ )
    {
        std::string name = objects.GetObject(i).GetName();

        //Only add objects if they match the search criteria
        if ((objectTypeAllowed.empty() || objects.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(name).find(searchText) != std::string::npos)) )
        {
            wxLogNull noLogPlease; //Discard any warning when loading thumbnaiils.

            int thumbnailID = -1;
            wxBitmap thumbnail;
            if (objectsList->GetImageList() &&
                objects.GetObject(i).GenerateThumbnail(project, thumbnail) &&
                thumbnail.IsOk() )
            {
                objectsList->GetImageList()->Add(thumbnail);
                thumbnailID = objectsList->GetImageList()->GetImageCount()-1;
            }

            wxTreeItemId item = objectsList->AppendItem( rootItem,
                objects.GetObject(i).GetName(), thumbnailID );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalObjects ? "GlobalObject" : "LayoutObject"));
            if ( globalObjects ) objectsList->SetItemBold(item, true);

            lastAddedItem = item;
        }
    }

    return lastAddedItem;
}

wxTreeItemId ObjectListDialogsHelper::AddGroupsToList(wxTreeCtrl * objectsList, wxTreeItemId rootItem, const std::vector <ObjectGroup> & groups, bool globalGroup)
{
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for (unsigned int i = 0;i<groups.size();++i)
    {
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, groups[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && gd::StrUppercase(groups[i].GetName()).find(searchText) != std::string::npos)) )
        {
            wxTreeItemId item = objectsList->AppendItem( rootItem, groups[i].GetName(), 1 );
            objectsList->SetItemData(item, new gd::TreeItemStringData(globalGroup ? "GlobalGroup" : "LayoutGroup"));
            if ( globalGroup ) objectsList->SetItemBold(item, true);

            if (hasGroupExtraRendering) groupExtraRendering(item);

            lastAddedItem = item;
        }
    }

    return lastAddedItem;
}
#endif

}
#endif
