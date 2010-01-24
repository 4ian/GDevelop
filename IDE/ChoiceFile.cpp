#include "ChoiceFile.h"

//(*InternalHeaders(ChoiceFile)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include "EditTexte.h"

//(*IdInit(ChoiceFile)
const long ChoiceFile::ID_STATICTEXT1 = wxNewId();
const long ChoiceFile::ID_TEXTCTRL1 = wxNewId();
const long ChoiceFile::ID_STATICTEXT2 = wxNewId();
const long ChoiceFile::ID_STATICLINE1 = wxNewId();
const long ChoiceFile::ID_BUTTON4 = wxNewId();
const long ChoiceFile::ID_BUTTON3 = wxNewId();
const long ChoiceFile::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoiceFile,wxDialog)
	//(*EventTable(ChoiceFile)
	//*)
END_EVENT_TABLE()

ChoiceFile::ChoiceFile(wxWindow* parent, string file_, Game & game_, Scene & scene_, bool canSelectGroup_, const vector < string > & mainObjectsName_) :
file(file_),
game(game_),
scene(scene_),
canSelectGroup(canSelectGroup_),
mainObjectsName(mainObjectsName_)
{
	//(*Initialize(ChoiceFile)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	
	Create(parent, wxID_ANY, _("Choisir un fichier"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Entrez le nom d\'un fichier :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	fileEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer2->Add(fileEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Le fichier devra être ou sera créé dans le répertoire...\n-...de l\'éditeur, quand vous éditez le jeu.\n-...dans le répertoire du jeu, une fois le jeu compilé."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON4, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer4->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	advancedBt = new wxButton(this, ID_BUTTON2, _("Avancé"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(advancedBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);
	
	Connect(ID_TEXTCTRL1,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&ChoiceFile::OnfileEditText);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnadvancedBtClick);
	//*)
    fileEdit->SetValue(file);
}

ChoiceFile::~ChoiceFile()
{
	//(*Destroy(ChoiceFile)
	//*)
}

void ChoiceFile::OnadvancedBtClick(wxCommandEvent& event)
{
    EditTexte dialog(this, file, game, scene, canSelectGroup, mainObjectsName);
    if ( dialog.ShowModal() == 1 )
    {
        file = dialog.texteFinal;
        fileEdit->SetValue(file);
    }
}

void ChoiceFile::OnokBtClick(wxCommandEvent& event)
{
    EndModal(1);
}

void ChoiceFile::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChoiceFile::OnfileEditText(wxCommandEvent& event)
{
    file = static_cast<string>(fileEdit->GetValue());
}
