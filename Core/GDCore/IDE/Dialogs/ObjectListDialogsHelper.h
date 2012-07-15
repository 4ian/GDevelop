/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_OBJECTLISTDIALOGSHELPER_H
#define GDCORE_OBJECTLISTDIALOGSHELPER_H

#include <string>
namespace gd { class Project; }
namespace gd { class Layout; }
class wxTreeCtrl;

namespace gd
{

/**
 * \brief Utility class used to display objects lists into wxWidgets tree controls.
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
                      wxTreeCtrl * globalGroupsList,
                      std::string objectTypeAllowed = "",
                      std::string searchText = "");

private:
    const Project & project;
    const Layout & layout;
};

}

#endif // GDCORE_OBJECTLISTDIALOGSHELPER_H
