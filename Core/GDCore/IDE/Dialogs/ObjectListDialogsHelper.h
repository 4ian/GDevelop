/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
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

namespace gd
{

/**
 * \brief Utility class used to display objects lists into wxWidgets tree controls.
 * \todo Thumbnail support
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
    ObjectListDialogsHelper(const gd::Project & project_, const gd::Layout & layout_) : project(project_), layout(layout_) {};
    virtual ~ObjectListDialogsHelper() {};

    void SetSearchText(std::string searchText_) { searchText = searchText_; }
    void SetAllowedObjectType(std::string allowedObjectType_) { objectTypeAllowed = allowedObjectType_; }

    /**
     * Update tree controls with objects and objects groups from the project and layout
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


private:
    wxTreeItemId AddObjectsToList(wxTreeCtrl * tree, const gd::ClassWithObjects & objects, bool globalObjects, bool substituteIfEmpty);
    wxTreeItemId AddGroupsToList(wxTreeCtrl * tree, const std::vector <gd::ObjectGroup> & groups, bool globalGroup, bool substituteIfEmpty);

    const Project & project;
    const Layout & layout;
    std::string objectTypeAllowed;
    std::string searchText;
};

}

#endif // GDCORE_OBJECTLISTDIALOGSHELPER_H
