/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "ChoiceFile.h"

//(*InternalHeaders(ChoiceFile)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/filedlg.h>
#include <wx/filename.h>
#include "GDL/IDE/Dialogs/EditTextDialog.h"
#include "GDL/Game.h"
class Scene;

//(*IdInit(ChoiceFile)
const long ChoiceFile::ID_STATICTEXT1 = wxNewId();
const long ChoiceFile::ID_TEXTCTRL1 = wxNewId();
const long ChoiceFile::ID_BUTTON1 = wxNewId();
const long ChoiceFile::ID_STATICTEXT2 = wxNewId();
const long ChoiceFile::ID_STATICLINE1 = wxNewId();
const long ChoiceFile::ID_BUTTON2 = wxNewId();
const long ChoiceFile::ID_BUTTON4 = wxNewId();
const long ChoiceFile::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoiceFile,wxDialog)
	//(*EventTable(ChoiceFile)
	//*)
END_EVENT_TABLE()

ChoiceFile::ChoiceFile(wxWindow* parent, string file_, Game & game_, Scene & scene_, bool canSelectGroup_) :
file(file_),
game(game_),
scene(scene_),
canSelectGroup(canSelectGroup_)
{
	//(*Initialize(ChoiceFile)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Choisir un fichier"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Entrez le nom d\'un fichier :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	fileEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(fileEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseBt = new wxButton(this, ID_BUTTON1, _("..."), wxDefaultPosition, wxSize(38,23), 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(browseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Le nom du fichier est relatif à l\'emplacement du fichier .gdg du jeu."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer4->AddGrowableCol(0);
	advancedBt = new wxButton(this, ID_BUTTON2, _("Avancé"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(advancedBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	okBt = new wxButton(this, ID_BUTTON4, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer4->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnbrowseBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnadvancedBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OncancelBtClick);
	//*)

	if ( file.empty() ) file = "\"\"";

    fileEdit->ChangeValue(file);
}

ChoiceFile::~ChoiceFile()
{
	//(*Destroy(ChoiceFile)
	//*)
}

void ChoiceFile::OnadvancedBtClick(wxCommandEvent& event)
{
    EditTextDialog dialog(this, file, game, scene);
    if ( dialog.ShowModal() == 1 )
    {
        file = dialog.returnedText;
        fileEdit->ChangeValue(file);
    }
}

void ChoiceFile::OnokBtClick(wxCommandEvent& event)
{
    file = static_cast<string>(fileEdit->GetValue());
    EndModal(1);
}

void ChoiceFile::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChoiceFile::OnbrowseBtClick(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog(this, _("Choisissez un fichier"), gameDirectory, "", "*.*");

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        fileEdit->SetValue("\""+filename.GetFullPath()+"\"");
    }
}
