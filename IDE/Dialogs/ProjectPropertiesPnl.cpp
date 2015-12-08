/*
 * GDevelop IDE
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */
#include "ProjectPropertiesPnl.h"

//(*InternalHeaders(ProjectPropertiesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/settings.h>
#include <wx/treectrl.h>
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "../ProjectManager.h"

//(*IdInit(ProjectPropertiesPnl)
const long ProjectPropertiesPnl::ID_PROPGRID = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectPropertiesPnl,wxPanel)
	//(*EventTable(ProjectPropertiesPnl)
	//*)
END_EVENT_TABLE()

ProjectPropertiesPnl::ProjectPropertiesPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
    project(NULL),
    associatedProjectManager(NULL),
    associatedTree(NULL)
{
	//(*Initialize(ProjectPropertiesPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	propertyGrid = new wxPropertyGrid(this,ID_PROPGRID,wxDefaultPosition,wxSize(359,438),wxPG_HIDE_MARGIN|wxPG_SPLITTER_AUTO_CENTER,_T("ID_PROPGRID"));
	FlexGridSizer1->Add(propertyGrid, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
    Connect(ID_PROPGRID, wxEVT_PG_SELECTED, (wxObjectEventFunction)&ProjectPropertiesPnl::OnPropertySelected);
    Connect(ID_PROPGRID, wxEVT_PG_CHANGED, (wxObjectEventFunction)&ProjectPropertiesPnl::OnPropertyChanged);

    //Offer nice theme to property grid
    gd::SkinHelper::ApplyCurrentSkin(*propertyGrid);
}

ProjectPropertiesPnl::~ProjectPropertiesPnl()
{
	//(*Destroy(ProjectPropertiesPnl)
	//*)
}

void ProjectPropertiesPnl::SetProject(gd::Project * project_)
{
    project = project_;
    propertyGrid->Clear();

    if (project)
    {
        project->PopulatePropertyGrid(propertyGrid);
        propertyGrid->SetPropertyAttributeAll(wxPG_BOOL_USE_CHECKBOX, true);
    }
}

void ProjectPropertiesPnl::OnPropertySelected(wxPropertyGridEvent& event)
{
    if (project) project->OnSelectionInPropertyGrid(propertyGrid, event);
}

void ProjectPropertiesPnl::OnPropertyChanged(wxPropertyGridEvent& event)
{
    if (project) project->OnChangeInPropertyGrid(propertyGrid, event);

    //Handle some special properties:
    if ( event.GetPropertyName() == _("Name of the project") && associatedTree != NULL)
        associatedTree->SetItemText(associatedTreeItem, event.GetProperty()->GetValue());

    if ( event.GetPropertyName() == _("Activate the use of C++/JS source files") && associatedProjectManager != NULL)
        associatedProjectManager->Refresh();

    if (project) project->SetDirty();
}

void ProjectPropertiesPnl::SetAssociatedTreeCtrlProjectItem(wxTreeCtrl * tree, wxTreeItemId item)
{
    associatedTree = tree;
    associatedTreeItem = item;
}

void ProjectPropertiesPnl::SetAssociatedProjectManager(ProjectManager * associatedProjectManager_)
{
    associatedProjectManager = associatedProjectManager_;
}

