/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#include "ChoiceFile.h"

//(*InternalHeaders(ChoiceFile)
#include <wx/bitmap.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/filedlg.h>
#include <wx/filename.h>
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"
#include "GDCore/IDE/Dialogs/EditStrExpressionDialog.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/HelpFileAccess.h"
namespace gd { class Layout; }

//(*IdInit(ChoiceFile)
const long ChoiceFile::ID_STATICTEXT1 = wxNewId();
const long ChoiceFile::ID_TEXTCTRL1 = wxNewId();
const long ChoiceFile::ID_BUTTON1 = wxNewId();
const long ChoiceFile::ID_STATICTEXT2 = wxNewId();
const long ChoiceFile::ID_STATICLINE1 = wxNewId();
const long ChoiceFile::ID_STATICBITMAP2 = wxNewId();
const long ChoiceFile::ID_HYPERLINKCTRL1 = wxNewId();
const long ChoiceFile::ID_BUTTON4 = wxNewId();
const long ChoiceFile::ID_BUTTON3 = wxNewId();
const long ChoiceFile::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(ChoiceFile,wxDialog)
	//(*EventTable(ChoiceFile)
	//*)
END_EVENT_TABLE()

ChoiceFile::ChoiceFile(wxWindow* parent, gd::String file_, gd::Project & game_, gd::Layout & scene_) :
file(file_),
game(game_),
scene(scene_)
{
	//(*Initialize(ChoiceFile)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Choose a file"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Enter a file name :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer2->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	fileEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer3->Add(fileEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseBt = new wxButton(this, ID_BUTTON1, _("..."), wxDefaultPosition, wxSize(38,23), 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(browseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("The file is relative to the directory of the .gdg file."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 4, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	FlexGridSizer4->AddGrowableRow(0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer17->AddGrowableRow(0);
	StaticBitmap2 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer17->Add(StaticBitmap2, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	helpBt = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	helpBt->SetToolTip(_("Display help about this window"));
	FlexGridSizer17->Add(helpBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(FlexGridSizer17, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	okBt = new wxButton(this, ID_BUTTON4, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer4->Add(okBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer4->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	advancedBt = new wxButton(this, ID_BUTTON2, _("Advanced"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer4->Add(advancedBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnbrowseBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&ChoiceFile::OnhelpBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OncancelBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&ChoiceFile::OnadvancedBtClick);
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
    gd::EditStrExpressionDialog dialog(this, file, game, scene);
    if ( dialog.ShowModal() == 1 )
    {
        file = dialog.GetExpression();
        fileEdit->ChangeValue(file);
    }
}

void ChoiceFile::OnokBtClick(wxCommandEvent& event)
{
    file = fileEdit->GetValue();
    EndModal(1);
}

void ChoiceFile::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void ChoiceFile::OnbrowseBtClick(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog(this, _("Choose a file"), gameDirectory, "", "*.*");

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        fileEdit->SetValue("\""+filename.GetFullPath()+"\"");
    }
}


void ChoiceFile::OnhelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("gevelop/documentation/manual/events_editor/parameters");
}
