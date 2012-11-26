/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "LayoutEditorPropertiesPnl.h"

//(*InternalHeaders(LayoutEditorPropertiesPnl)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "GDCore/IDE/wxTools/SkinHelper.h"

//(*IdInit(LayoutEditorPropertiesPnl)
const long LayoutEditorPropertiesPnl::ID_PROPGRID = wxNewId();
//*)

BEGIN_EVENT_TABLE(LayoutEditorPropertiesPnl,wxPanel)
	//(*EventTable(LayoutEditorPropertiesPnl)
	//*)
END_EVENT_TABLE()

LayoutEditorPropertiesPnl::LayoutEditorPropertiesPnl(wxWindow* parent,wxWindowID id,const wxPoint& pos,const wxSize& size)
{
	//(*Initialize(LayoutEditorPropertiesPnl)
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
    Connect(ID_PROPGRID, wxEVT_PG_SELECTED, (wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnPropertySelected);
    Connect(ID_PROPGRID, wxEVT_PG_CHANGED, (wxObjectEventFunction)&LayoutEditorPropertiesPnl::OnPropertyChanged);

    //Offer nice theme to property grid
    gd::SkinHelper::ApplyCurrentSkin(*propertyGrid);
}

LayoutEditorPropertiesPnl::~LayoutEditorPropertiesPnl()
{
	//(*Destroy(LayoutEditorPropertiesPnl)
	//*)
}

void LayoutEditorPropertiesPnl::SelectInitialPosition(const gd::InitialInstance & instance)
{
    propertyGrid->Append( new wxPropertyCategory(_("Coucou")) );
}

void LayoutEditorPropertiesPnl::OnPropertySelected(wxPropertyGridEvent& event)
{
}

void LayoutEditorPropertiesPnl::OnPropertyChanged(wxPropertyGridEvent& event)
{
}
