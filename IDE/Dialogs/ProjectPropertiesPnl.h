/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef PROJECTPROPERTIESPNL_H
#define PROJECTPROPERTIESPNL_H

//(*Headers(ProjectPropertiesPnl)
#include <wx/sizer.h>
#include <wx/propgrid/propgrid.h>
#include <wx/panel.h>
//*)
#include <wx/treectrl.h>
class ProjectManager;
namespace gd { class Project; }

class ProjectPropertiesPnl: public wxPanel
{
public:

    ProjectPropertiesPnl(wxWindow* parent,wxWindowID id=wxID_ANY,const wxPoint& pos=wxDefaultPosition,const wxSize& size=wxDefaultSize);
    virtual ~ProjectPropertiesPnl();

    /**
     * Change project being edited.
     * If \a project is NULL, no property is shown.
     */
    void SetProject(gd::Project * project);

    /**
     * Return a pointer to the project being edited.
     * Can be NULL.
     */
    gd::Project * GetProject() { return project; };

    /**
     * This method allows to provide a wxTreeCtrl and the item representing the project in the tree,
     * so as to update the item if Project name is changed.
     * \a tree can be NULL.
     */
    void SetAssociatedTreeCtrlProjectItem(wxTreeCtrl * tree, wxTreeItemId item);

    /**
     * This method allows to provide the ProjectManager displaying the project, so that a full refresh can
     * be done when needed.
     */
     void SetAssociatedProjectManager(ProjectManager * associatedProjectManager);

protected:

    //(*Identifiers(ProjectPropertiesPnl)
    static const long ID_PROPGRID;
    //*)

private:

    //(*Declarations(ProjectPropertiesPnl)
    wxPropertyGrid* propertyGrid;
    //*)

    //(*Handlers(ProjectPropertiesPnl)
    //*)
    void OnPropertySelected(wxPropertyGridEvent& event);
    void OnPropertyChanged(wxPropertyGridEvent& event);

    gd::Project * project; ///< The project being edited
    ProjectManager * associatedProjectManager;
    wxTreeCtrl * associatedTree;
    wxTreeItemId associatedTreeItem;

    DECLARE_EVENT_TABLE()
};

#endif

