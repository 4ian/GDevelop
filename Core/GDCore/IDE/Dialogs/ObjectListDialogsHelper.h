/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_OBJECTLISTDIALOGSHELPER_H
#define GDCORE_OBJECTLISTDIALOGSHELPER_H

#include <string>
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
    ObjectListDialogsHelper(const gd::Project & project_, const gd::Layout & layout_) : project(project_), layout(layout_), groupsAllowed(true), imageList(new wxImageList(24,24, true)) {};
    virtual ~ObjectListDialogsHelper() {};

    void SetSearchText(std::string searchText_);
    void SetAllowedObjectType(std::string allowedObjectType_) { objectTypeAllowed = allowedObjectType_; }
    void SetGroupsAllowed(bool canSelectGroup) { groupsAllowed = canSelectGroup; }

    /**
     * \brief Return a list of objects (and groups if allowed) that matches the criteria.
     */
    std::vector<std::string> GetMatchingObjects() const;

    #if !defined(GD_NO_WX_GUI)
    /**
     * \brief Update tree controls with objects and objects groups from the project and layout
     * \param sceneObjectsList The wxTreeCtrl which will contain the layout objects
     * \param sceneGroupsList The wxTreeCtrl which will contain the layout groups
     * \param globalObjectsList The wxTreeCtrl which will contain the project objects
     * \param globalGroupsList The wxTreeCtrl which will contain the project groups
     * \param objectTypeAllowed If not empty, only objects of this type will be displayed
     * \param searchText The text in the search box, which is used to filter objects
     */
    void RefreshLists(wxTreeCtrl * sceneObjectsList,
                      wxTreeCtrl * sceneGroupsList,
                      wxTreeCtrl * globalObjectsList,
                      wxTreeCtrl * globalGroupsList);

    /**
     * \brief Update a tree control with all objects and objects groups from the project and layout
     * \note The wxTreeCtrl must have an image list containing the object icon and the object group icon
     * ( at index 0 and 1 )
     * \param objectsList The wxTreeCtrl which will contain the objects and groups
     * \param objectTypeAllowed If not empty, only objects of this type will be displayed
     * \param searchText The text in the search box, which is used to filter objects
     */
    void RefreshList(wxTreeCtrl * objectsList);
    #endif

private:
    wxTreeItemId AddObjectsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const gd::ClassWithObjects & objects, bool globalObjects, bool substituteIfEmpty);
    wxTreeItemId AddGroupsToList(wxTreeCtrl * tree, wxTreeItemId rootItem, const std::vector <gd::ObjectGroup> & groups, bool globalGroup, bool substituteIfEmpty);

    const Project & project;
    const Layout & layout;
    std::string objectTypeAllowed;
    std::string searchText;
    bool groupsAllowed;

#if !defined(GD_NO_WX_GUI)
    wxImageList *imageList;
#endif
};

}
#endif // GDCORE_OBJECTLISTDIALOGSHELPER_H
#endif
