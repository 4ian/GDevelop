#if defined(GD_IDE_ONLY)
#include "ChooseAutomatismDlg.h"

//(*InternalHeaders(ChooseAutomatismDlg)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/PlatformDefinition/Layout.h"
#include <boost/algorithm/string.hpp>
#include "GDL/Game.h"
#include "GDL/Scene.h"

//(*IdInit(ChooseAutomatismDlg)
const long ChooseAutomatismDlg::ID_STATICBITMAP3 = wxNewId();
const long ChooseAutomatismDlg::ID_STATICTEXT1 = wxNewId();
const long ChooseAutomatismDlg::ID_PANEL1 = wxNewId();
const long ChooseAutomatismDlg::ID_STATICLINE2 = wxNewId();
const long ChooseAutomatismDlg::ID_LISTBOX1 = wxNewId();
const long ChooseAutomatismDlg::ID_TEXTCTRL1 = wxNewId();
const long ChooseAutomatismDlg::ID_BUTTON1 = wxNewId();
const long ChooseAutomatismDlg::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChooseAutomatismDlg,wxDialog)
	//(*EventTable(ChooseAutomatismDlg)
	//*)
END_EVENT_TABLE()

ChooseAutomatismDlg::ChooseAutomatismDlg(wxWindow* parent, Game & game_, Scene & scene_, std::string parentObject_, std::string automatismTypeAllowed_) :
game(game_),
scene(scene_),
parentObject(parentObject_),
automatismTypeAllowed(automatismTypeAllowed_)
{
	//(*Initialize(ChooseAutomatismDlg)
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choisir un automatisme"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/automatism64.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Choisissez un automatisme de l\'objet."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	automatismsList = new wxListBox(this, ID_LISTBOX1, wxDefaultPosition, wxSize(255,128), 0, 0, 0, wxDefaultValidator, _T("ID_LISTBOX1"));
	FlexGridSizer1->Add(automatismsList, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	searchCtrl = new wxSearchCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(searchCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	ChoisirBt = new wxButton(this, ID_BUTTON1, _("Choisir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(ChoisirBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_LISTBOX1,wxEVT_COMMAND_LISTBOX_DOUBLECLICKED,(wxObjectEventFunction)&ChooseAutomatismDlg::OnChoisirBtClick);
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChooseAutomatismDlg::OnsearchCtrlText);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseAutomatismDlg::OnChoisirBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChooseAutomatismDlg::OnCancelBtClick);
	//*)

	searchCtrl->SetFocus();

    RefreshList();
}

ChooseAutomatismDlg::~ChooseAutomatismDlg()
{
	//(*Destroy(ChooseAutomatismDlg)
	//*)
}

void ChooseAutomatismDlg::RefreshList()
{
    std::string search = string(searchCtrl->GetValue().mb_str());
    bool searching = search.empty() ? false : true;

	vector <std::string> automatisms = gd::GetAutomatismsOfObject(game, scene, parentObject);

	automatismsList->Clear();
	for (unsigned int i = 0;i<automatisms.size();++i)
	{
	    std::string automatismName = automatisms[i];

		if ( (automatismTypeAllowed.empty() || automatismTypeAllowed == gd::GetTypeOfAutomatism(game, scene, automatismName)) &&
             (!searching || (searching && boost::to_upper_copy(automatismName).find(boost::to_upper_copy(search)) != std::string::npos) ))
            automatismsList->Append(automatismName);
	}

	if ( automatismsList->GetCount() == 1)
        automatismsList->SetSelection(0);
}

void ChooseAutomatismDlg::OnChoisirBtClick(wxCommandEvent& event)
{
    automatismChosen = automatismsList->GetStringSelection();
    EndModal(1);
}

void ChooseAutomatismDlg::OnCancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChooseAutomatismDlg::OnsearchCtrlText(wxCommandEvent& event)
{
    RefreshList();
}
#endif
