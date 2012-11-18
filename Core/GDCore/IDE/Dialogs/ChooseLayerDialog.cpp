/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

//(*InternalHeaders(ChooseLayerDialog)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Layer.h"
#include "GDCore/CommonTools.h"
#include "ChooseLayerDialog.h"

namespace gd
{

//(*IdInit(ChooseLayerDialog)
const long ChooseLayerDialog::ID_STATICBITMAP3 = wxNewId();
const long ChooseLayerDialog::ID_STATICTEXT1 = wxNewId();
const long ChooseLayerDialog::ID_PANEL1 = wxNewId();
const long ChooseLayerDialog::ID_STATICLINE2 = wxNewId();
const long ChooseLayerDialog::ID_LISTBOX1 = wxNewId();
const long ChooseLayerDialog::ID_STATICLINE1 = wxNewId();
const long ChooseLayerDialog::ID_BUTTON2 = wxNewId();
const long ChooseLayerDialog::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseLayerDialog,wxDialog)
	//(*EventTable(ChooseLayerDialog)
	//*)
END_EVENT_TABLE()

ChooseLayerDialog::ChooseLayerDialog(wxWindow* parent, const gd::Layout & layout, bool addQuotes_) :
addQuotes(addQuotes_)
{
	//(*Initialize(ChooseLayerDialog)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a layer "), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/layers64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Choose one of the layer of the scene.\nTo add or modify layers,\nuse the layers editor of the scene."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel1);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	layersList = new wxListBox(this, ID_LISTBOX1, wxDefaultPosition, wxSize(268,171), 0, 0, wxLB_SINGLE, wxDefaultValidator, _T("ID_LISTBOX1"));
	FlexGridSizer2->Add(layersList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON2, _("Choose"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON1, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseLayerDialog::OnokBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseLayerDialog::OncancelBtClick);
	//*)

	for (unsigned int i =0;i<layout.GetLayersCount();++i)
	{
	    std::string name = layout.GetLayer(i).GetName();
	    if ( name == "" ) name = _("Base layer");
		layersList->Insert(name, 0);
	}
}

ChooseLayerDialog::~ChooseLayerDialog()
{
	//(*Destroy(ChooseLayerDialog)
	//*)
}

void ChooseLayerDialog::OnokBtClick(wxCommandEvent& event)
{
    chosenLayer = ToString(layersList->GetStringSelection());
    if ( chosenLayer == _("Base layer") ) chosenLayer = "";

    if ( addQuotes ) chosenLayer = "\""+chosenLayer+"\"";

    EndModal(1);
}

void ChooseLayerDialog::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

}
