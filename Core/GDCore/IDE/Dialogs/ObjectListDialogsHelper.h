/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_OBJECTLISTDIALOGSHELPER_H
#define GDCORE_OBJECTLISTDIALOGSHELPER_H

#include <string>
#include <functional>
#include <vector>
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class ClassWithObjects; }
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
    void SetSearchText(std::string searchText_);

    /**
     * \brief Specify a type of object to display. Only objects of this type will
     * be shown when calling RefreshList.
     * \param allowedObjectType The type of objects. For example, "Sprite" or "TextObject::Text".
     */
    void SetAllowedObjectType(std::string allowedObjectType_) { objectTypeAllowed = allowedObjectType_; }

    /**
     * \brief Set if groups of objects are displayed when calling RefreshList (true by default).
     * \param canSelectGroup true to show groups, false to hide them.
     */
    void SetGroupsAllowed(bool canSelectGroup) { groupsAllowed = canSelectGroup; }

    /**
     * \brief Return a list of objects (and groups if allowed) that matches the criteria.
     */
    std::vector<std::string> GetMatchingObjects() const;

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Update a tree control with all objects and objects groups from the project and layout
     * \param objectsList The wxTreeCtrl which will contain the objects and groups
     * \aram objectsRootItem Optional pointer to a wxTreeItemId which will be filled with the item being the root item for objects.
     * \aram groupsRootItem Optional pointer to a wxTreeItemId which will be filled with the item being the root item for groups.
     */
    void RefreshList(wxTreeCtrl * objectsList, wxTreeItemId * objectsRootItem = NULL,
        wxTreeItemId * groupsRootItem = NULL);

    void SetGroupExtraRendering(std::function<void(wxTreeItemId)> function)
    {
        hasGroupExtraRendering = true;
        groupExtraRendering = function;
    }
    #endif

private:
    wxTreeItemId AddObjectsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const gd::ClassWithObjects & objects, bool globalObjects);
    wxTreeItemId AddGroupsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const std::vector <gd::ObjectGroup> & groups, bool globalGroup);

    const Project & project;
    const Layout & layout;
    std::string objectTypeAllowed;
    std::string searchText;
    bool groupsAllowed;

    bool hasGroupExtraRendering;
    std::function<void(wxTreeItemId)> groupExtraRendering;
};

}
#endif // GDCORE_OBJECTLISTDIALOGSHELPER_H
#endif
