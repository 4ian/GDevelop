/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_OBJECTLISTDIALOGSHELPER_H
#define GDCORE_OBJECTLISTDIALOGSHELPER_H

#include "GDCore/String.h"
#include <functional>
#include <vector>
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Object; }
namespace gd { class ClassWithObjects; }
namespace gd { class ObjectGroupsContainer; }
namespace gd { class ObjectGroup; }
class wxTreeCtrl;
class wxTreeItemId;
#if !defined(GD_NO_WX_GUI)
#include <wx/image.h>
#include <wx/imaglist.h>
#endif

namespace gd
{

/**
 * \brief Utility class used to display objects lists into controls.
 *
 * \see ChooseObjectDialog
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API ObjectListDialogsHelper
{
public:
    /**
     * Default constructor.
     * \param project Project
     * \param layout Layout
     */
    ObjectListDialogsHelper(const gd::Project & project_, const gd::Layout & layout_) :
        project(project_),
        layout(layout_),
        groupsAllowed(true),
        hasGroupExtraRendering(false)
    {
    };

    virtual ~ObjectListDialogsHelper() {};

    /**
     * \brief Specify the filter text: only objects and groups having a name
     * containing this text will be shown when calling RefreshList.
     * \param searchText The filter text
     */
    void SetSearchText(gd::String searchText_);

    /**
     * \brief Specify a type of object to display. Only objects of this type will
     * be shown when calling RefreshList.
     * \param allowedObjectType The type of objects. For example, "Sprite" or "TextObject::Text".
     */
    void SetAllowedObjectType(gd::String allowedObjectType_) { objectTypeAllowed = allowedObjectType_; }

    /**
     * \brief Set if groups of objects are displayed when calling RefreshList (true by default).
     * \param canSelectGroup true to show groups, false to hide them.
     */
    void SetGroupsAllowed(bool canSelectGroup) { groupsAllowed = canSelectGroup; }

    /**
     * \brief Return a list of objects (and groups if allowed) that matches the criteria.
     */
    std::vector<gd::String> GetMatchingObjects() const;

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Update a tree control with all objects and objects groups from the project and layout
     * \param objectsList The wxTreeCtrl which will contain the objects and groups
     * \aram objectsRootItem Optional pointer to a wxTreeItemId which will be filled with the item being the root item for objects.
     * \aram groupsRootItem Optional pointer to a wxTreeItemId which will be filled with the item being the root item for groups.
     */
    void RefreshList(wxTreeCtrl * objectsList, wxTreeItemId * objectsRootItem = NULL,
        wxTreeItemId * groupsRootItem = NULL);

    /**
     * \brief Format the specified wxTreeItemId for the object (label, thumbnail...).
     */
    void MakeObjectItem(wxTreeCtrl * objectsList, wxTreeItemId item, const gd::Object & object, bool globalObject);

    /**
     * \brief Format the specified wxTreeItemId for the group (label, thumbnail...).
     */
    void MakeGroupItem(wxTreeCtrl * objectsList, wxTreeItemId item, const gd::ObjectGroup & group, bool globalGroup);

    /**
     * \brief Set a callback that will be called whenever a group item is being rendered.
     * \see gd::ObjectListDialogsHelper::MakeGroupItem
     */
    void SetGroupExtraRendering(std::function<void(wxTreeItemId)> function)
    {
        hasGroupExtraRendering = true;
        groupExtraRendering = function;
    }
    #endif

private:
    #if !defined(GD_NO_WX_GUI)
    wxTreeItemId AddObjectsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const gd::ClassWithObjects & objects, bool globalObjects);
    wxTreeItemId AddGroupsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const gd::ObjectGroupsContainer & groups, bool globalGroup);

    /**
     * \brief Generate the thumnail for the specified object, add it to the image list of the
     * wxTreeCtrl and return the id on the thumbnail.
     * \param objectsList the wxTreeCtrl containing the objects list.
     * \param object The object for which thumbnail should be generated.
     */
    int MakeObjectItemThumbnail(wxTreeCtrl * objectsList, const gd::Object & object);
    #endif

    const Project & project;
    const Layout & layout;
    gd::String objectTypeAllowed;
    gd::String searchText;
    bool groupsAllowed;

    bool hasGroupExtraRendering;
    std::function<void(wxTreeItemId)> groupExtraRendering;
};

}
#endif // GDCORE_OBJECTLISTDIALOGSHELPER_H
#endif
