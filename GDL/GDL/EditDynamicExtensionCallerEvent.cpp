/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)
#if defined(GD_IDE_ONLY)

#include "EditDynamicExtensionCallerEvent.h"

//(*InternalHeaders(EditDynamicExtensionCallerEvent)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDL/DynamicExtensionCallerEvent.h"
#include "GDL/Game.h"

//(*IdInit(EditDynamicExtensionCallerEvent)
const long EditDynamicExtensionCallerEvent::ID_STATICBITMAP3 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_STATICTEXT3 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_PANEL1 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_STATICLINE2 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_STATICTEXT1 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_TEXTCTRL1 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_STATICTEXT2 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_STATICLINE1 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_BUTTON1 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_BUTTON2 = wxNewId();
const long EditDynamicExtensionCallerEvent::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(EditDynamicExtensionCallerEvent,wxDialog)
	//(*EventTable(EditDynamicExtensionCallerEvent)
	//*)
END_EVENT_TABLE()

EditDynamicExtensionCallerEvent::EditDynamicExtensionCallerEvent(wxWindow* parent, Game & game_, DynamicExtensionCallerEvent & event_) :
    game(game_),
    editedEvent(event_)
{
	//(*Initialize(EditDynamicExtensionCallerEvent)
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Appel d\'un évènement C++"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/source_cpp24.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Cet évènement va appeler un évènement codé en C++. N\'oubliez pas de déclarer vos évènements à l\'aide d\'un fichier de déclaration."), wxDefaultPosition, wxSize(253,42), wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
	FlexGridSizer6->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer3->AddGrowableCol(1);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Nom de l\'évènement :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer3->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	eventName = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	eventName->SetToolTip(_("Nom de la scène liée"));
	FlexGridSizer3->Add(eventName, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	warnTxt = new wxStaticText(this, ID_STATICTEXT2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	wxFont warnTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	warnTxt->SetFont(warnTxtFont);
	FlexGridSizer1->Add(warnTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(0);
	OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer5->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer5->Add(helpBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDynamicExtensionCallerEvent::OnOkBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDynamicExtensionCallerEvent::OncancelBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditDynamicExtensionCallerEvent::OnhelpBtClick);
	//*)
    eventName->SetValue(editedEvent.GetDynamicExtensionEventName());

    if ( game.externalSourceFiles.empty() )
        warnTxt->SetLabel(_("Le jeu ne possède pas de sources C++.\nAjoutez au moins un fichier de déclaration permettant de signaler\nà Game Develop les évènements C++ disponibles."));
    if ( !game.useExternalSourceFiles )
        warnTxt->SetLabel(_("Le jeu n'utilise pas de sources C++.\nActivez l'utilisation dans les propriétés du jeu afin de pouvoir créer\net appeler des évènements C++."));

    Update();
    Fit();
}

EditDynamicExtensionCallerEvent::~EditDynamicExtensionCallerEvent()
{
	//(*Destroy(EditDynamicExtensionCallerEvent)
	//*)
}


void EditDynamicExtensionCallerEvent::OnOkBtClick(wxCommandEvent& event)
{
    editedEvent.SetDynamicExtensionEventName(string(eventName->GetValue().mb_str()));

    EndModal(1);
}

void EditDynamicExtensionCallerEvent::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void EditDynamicExtensionCallerEvent::OnhelpBtClick(wxCommandEvent& event)
{
}

#endif
#endif
