/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "ProjectPropertiesPnl.h"

//(*InternalHeaders(ProjectPropertiesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/treectrl.h>
#include "GDCore/PlatformDefinition/Project.h"

//(*IdInit(ProjectPropertiesPnl)
const long ProjectPropertiesPnl::ID_PROPGRID = wxNewId();
//*)

BEGIN_EVENT_TABLE(ProjectPropertiesPnl,wxPanel)
	//(*EventTable(ProjectPropertiesPnl)
	//*)
END_EVENT_TABLE()

ProjectPropertiesPnl::ProjectPropertiesPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size) :
    project(NULL),
    associatedTree(NULL)
{
	//(*Initialize(ProjectPropertiesPnl)
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, id, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("id"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	propertyGrid = new wxPropertyGrid(this,ID_PROPGRID,wxDefaultPosition,wxSize(359,438),0,_T("ID_PROPGRID"));
	FlexGridSizer1->Add(propertyGrid, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	//*)
    Connect(ID_PROPGRID, wxEVT_PG_SELECTED, (wxObjectEventFunction)&ProjectPropertiesPnl::OnPropertySelected);
    Connect(ID_PROPGRID, wxEVT_PG_CHANGED, (wxObjectEventFunction)&ProjectPropertiesPnl::OnPropertyChanged);

    wxColour my_grey_1(212,208,200);
    wxColour my_grey_2(217,226,226);
    propertyGrid->SetMarginColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid->SetCaptionBackgroundColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid->SetEmptySpaceColour( wxSystemSettings::GetColour(wxSYS_COLOUR_MENU) );
    propertyGrid->SetCellBackgroundColour( *wxWHITE );
    propertyGrid->SetCellTextColour( *wxBLACK );
    propertyGrid->SetLineColour( my_grey_1 );
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

    if ( project != NULL ) project->PopulatePropertyGrid(propertyGrid);
}

void ProjectPropertiesPnl::OnPropertySelected(wxPropertyGridEvent& event)
{
    if (project != NULL) project->OnSelectionInPropertyGrid(propertyGrid, event);
}

void ProjectPropertiesPnl::OnPropertyChanged(wxPropertyGridEvent& event)
{
    if (project != NULL) project->OnChangeInPropertyGrid(propertyGrid, event);

    if ( event.GetPropertyName() == _("Nom du projet") && associatedTree != NULL)
        associatedTree->SetItemText(associatedTreeItem, event.GetProperty()->GetValue());
}

void ProjectPropertiesPnl::SetAssociatedTreeCtrlProjectItem(wxTreeCtrl * tree, wxTreeItemId item)
{
    associatedTree = tree;
    associatedTreeItem = item;
}
