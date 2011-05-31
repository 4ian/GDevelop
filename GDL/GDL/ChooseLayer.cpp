#if defined(GD_IDE_ONLY)
#include "GDL/ChooseLayer.h"

//(*InternalHeaders(ChooseLayer)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)

//(*IdInit(ChooseLayer)
const long ChooseLayer::ID_STATICBITMAP3 = wxNewId();
const long ChooseLayer::ID_STATICTEXT1 = wxNewId();
const long ChooseLayer::ID_PANEL1 = wxNewId();
const long ChooseLayer::ID_STATICLINE2 = wxNewId();
const long ChooseLayer::ID_LISTBOX1 = wxNewId();
const long ChooseLayer::ID_STATICLINE1 = wxNewId();
const long ChooseLayer::ID_BUTTON2 = wxNewId();
const long ChooseLayer::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseLayer,wxDialog)
	//(*EventTable(ChooseLayer)
	//*)
END_EVENT_TABLE()

ChooseLayer::ChooseLayer(wxWindow* parent, vector < Layer > & layers, bool addQuotes_) :
addQuotes(addQuotes_)
{
	//(*Initialize(ChooseLayer)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _T("Choisir un calque"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/layers64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _T("Choisissez un des calques de la scène.\nPour ajouter ou modifier des calques,\nutilisez l\'éditeur des calques de la scène."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	layersList = new wxListBox(this, ID_LISTBOX1, wxDefaultPosition, wxSize(268,171), 0, 0, wxLB_SINGLE, wxDefaultValidator, _T("ID_LISTBOX1"));
	FlexGridSizer2->Add(layersList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer2->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON2, _T("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON1, _T("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseLayer::OnokBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseLayer::OncancelBtClick);
	//*)

	for (unsigned int i =0;i<layers.size();++i)
	{
	    string name = layers[i].GetName();
	    if ( name == "" ) name = _T("Calque de base");
		layersList->Insert(name, 0);
	}

}

ChooseLayer::~ChooseLayer()
{
	//(*Destroy(ChooseLayer)
	//*)
}


void ChooseLayer::OnokBtClick(wxCommandEvent& event)
{
    layerChosen = string(layersList->GetStringSelection().mb_str());
    if ( layerChosen == _T("Calque de base") ) layerChosen = "";

    if ( addQuotes ) layerChosen = "\""+layerChosen+"\"";

    EndModal(1);
}

void ChooseLayer::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}
#endif
