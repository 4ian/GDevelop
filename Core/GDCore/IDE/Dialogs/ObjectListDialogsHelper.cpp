/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "ObjectListDialogsHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ObjectGroupsContainer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/wxTools/TreeItemStringData.h"

#if !defined(GD_NO_WX_GUI)
#include <wx/treectrl.h>
#include <wx/bitmap.h>
#include <wx/log.h>
#endif

namespace gd
{

void ObjectListDialogsHelper::SetSearchText(gd::String searchText_)
{
    searchText = searchText_;
    searchText = searchText.CaseFold();
}

std::vector<gd::String> ObjectListDialogsHelper::GetMatchingObjects() const
{
    bool searching = searchText.empty() ? false : true;
    std::vector<gd::String> results;

    for ( std::size_t i = 0;i < project.GetObjectsCount();i++ )
    {
        gd::String name = project.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if ((objectTypeAllowed.empty() || project.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && name.CaseFold().find(searchText.CaseFold()) != gd::String::npos)))
        {
            results.push_back(name);
        }
    }
    for ( std::size_t i = 0;i < project.GetObjectGroups().size();i++ )
    {
        gd::String name = project.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, project.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && name.CaseFold().find(searchText.CaseFold()) != gd::String::npos)))
        {
            results.push_back(name);
        }
    }
    for ( std::size_t i = 0;i < layout.GetObjectsCount();i++ )
    {
        gd::String name = layout.GetObject(i).GetName();

        //Only add the object if it has the correct type
        if (( objectTypeAllowed.empty() || layout.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && name.CaseFold().find(searchText.CaseFold()) != gd::String::npos)))
        {
            results.push_back(name);
        }
    }

    for ( std::size_t i = 0;i < layout.GetObjectGroups().size();i++ )
    {
        gd::String name = layout.GetObjectGroups()[i].GetName();

        //Only add the group if it has all objects of the correct type
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, layout.GetObjectGroups()[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && name.CaseFold().find(searchText.CaseFold()) != gd::String::npos)))
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
    for ( std::size_t i = 0;i < objects.GetObjectsCount();i++ )
    {
        gd::String name = objects.GetObject(i).GetName();

        //Only add objects if they match the search criteria
        if ((objectTypeAllowed.empty() || objects.GetObject(i).GetType() == objectTypeAllowed ) &&
            ( !searching || (searching && name.CaseFold().find(searchText.CaseFold()) != gd::String::npos)) )
        {
            wxTreeItemId item = objectsList->AppendItem(rootItem, "theobject");
            MakeObjectItem(objectsList, item, objects.GetObject(i), globalObjects);

            lastAddedItem = item;
        }
    }

    return lastAddedItem;
}

wxTreeItemId ObjectListDialogsHelper::AddGroupsToList(wxTreeCtrl * objectsList, wxTreeItemId rootItem, const gd::ObjectGroupsContainer & groups, bool globalGroups)
{
    bool searching = searchText.empty() ? false : true;

    wxTreeItemId lastAddedItem;
    for (std::size_t i = 0;i<groups.size();++i)
    {
        if (( objectTypeAllowed.empty() || gd::GetTypeOfObject(project, layout, groups[i].GetName()) == objectTypeAllowed ) &&
            ( !searching || (searching && groups[i].GetName().CaseFold().find(searchText.CaseFold()) != gd::String::npos)) )
        {
            wxTreeItemId item = objectsList->AppendItem(rootItem, "thegroup");
            MakeGroupItem(objectsList, item, groups[i], globalGroups);

            lastAddedItem = item;
        }
    }

    return lastAddedItem;
}

void ObjectListDialogsHelper::MakeGroupItem(wxTreeCtrl * objectsList, wxTreeItemId item, const gd::ObjectGroup & group, bool globalGroup)
{
    objectsList->SetItemText(item, group.GetName());
    objectsList->SetItemImage(item, 1);
    objectsList->SetItemData(item, new gd::TreeItemStringData(globalGroup ? "GlobalGroup" : "LayoutGroup"));
    if ( globalGroup ) objectsList->SetItemBold(item, true);

    if (hasGroupExtraRendering) groupExtraRendering(item);
}

void ObjectListDialogsHelper::MakeObjectItem(wxTreeCtrl * objectsList, wxTreeItemId item, const gd::Object & object, bool globalObject)
{
    objectsList->SetItemText(item, object.GetName());
    objectsList->SetItemImage(item, MakeObjectItemThumbnail(objectsList, object));
    objectsList->SetItemData(item, new gd::TreeItemStringData(globalObject ? "GlobalObject" : "LayoutObject"));
    if (globalObject) objectsList->SetItemBold(item, true);
}

int ObjectListDialogsHelper::MakeObjectItemThumbnail(wxTreeCtrl * objectsList, const gd::Object & object)
{
    wxLogNull noLogPlease; //Discard any warning when loading thumbnails.

    int thumbnailID = -1;
    wxBitmap thumbnail;
    if (objectsList->GetImageList() &&
        object.GenerateThumbnail(project, thumbnail) &&
        thumbnail.IsOk() )
    {
        objectsList->GetImageList()->Add(thumbnail);
        thumbnailID = objectsList->GetImageList()->GetImageCount()-1;
    }

    return thumbnailID;
}
#endif

}
#endif
