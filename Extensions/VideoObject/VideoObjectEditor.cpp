/**

Game Develop - Video Object Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#if defined(GD_IDE_ONLY)

#include "VideoObjectEditor.h"

//(*InternalHeaders(VideoObjectEditor)
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/msgdlg.h>
#include "GDCore/Tools/Log.h"
#include <wx/colordlg.h>
#include <wx/filename.h>
#include <wx/filedlg.h>

#include "GDCpp/Project.h"
#include "VideoObject.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include <wx/progdlg.h>

//(*IdInit(VideoObjectEditor)
const long VideoObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long VideoObjectEditor::ID_BUTTON2 = wxNewId();
const long VideoObjectEditor::ID_STATICTEXT1 = wxNewId();
const long VideoObjectEditor::ID_BUTTON4 = wxNewId();
const long VideoObjectEditor::ID_STATICTEXT2 = wxNewId();
const long VideoObjectEditor::ID_SPINCTRL1 = wxNewId();
const long VideoObjectEditor::ID_CHECKBOX1 = wxNewId();
const long VideoObjectEditor::ID_STATICLINE1 = wxNewId();
const long VideoObjectEditor::ID_BUTTON1 = wxNewId();
const long VideoObjectEditor::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(VideoObjectEditor,wxDialog)
	//(*EventTable(VideoObjectEditor)
	//*)
END_EVENT_TABLE()

VideoObjectEditor::VideoObjectEditor( wxWindow* parent, gd::Project & game_, VideoObject & object_, gd::MainFrameWrapper & mainFrameWrapper_ ) :
game(game_),
object(object_)
{
	//(*Initialize(VideoObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Video file"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	videoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(278,23), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer6->Add(videoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	browseBt = new wxButton(this, ID_BUTTON2, _("Browse"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer6->Add(browseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, _("Video files must be Ogg Theora video files."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer5->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	converterBt = new wxButton(this, ID_BUTTON4, _("Converter"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer5->Add(converterBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Others properties"));
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Volume:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	soundSpin = new wxSpinCtrl(this, ID_SPINCTRL1, _T("0"), wxDefaultPosition, wxDefaultSize, 0, 0, 100, 0, _T("ID_SPINCTRL1"));
	soundSpin->SetValue(_T("0"));
	FlexGridSizer4->Add(soundSpin, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(-1,-1,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	loopCheck = new wxCheckBox(this, ID_CHECKBOX1, _("Automatically restart video"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	loopCheck->SetValue(true);
	FlexGridSizer4->Add(loopCheck, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
	okBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer2->Add(okBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	cancelBt = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer2->Add(cancelBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&VideoObjectEditor::OnbrowseBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&VideoObjectEditor::OnconverterBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&VideoObjectEditor::OnokBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&VideoObjectEditor::OncancelBtClick);
	//*)

    videoEdit->SetValue(object.GetVideoFile());
    loopCheck->SetValue(object.GetLooping());
    soundSpin->SetValue(object.GetVolume());
}

VideoObjectEditor::~VideoObjectEditor()
{
	//(*Destroy(VideoObjectEditor)
	//*)
}


void VideoObjectEditor::OnokBtClick(wxCommandEvent& event)
{
    object.SetVideoFile(string(videoEdit->GetValue().mb_str()));
    object.SetLooping(loopCheck->GetValue());
    object.SetVolume(soundSpin->GetValue());
    EndModal(1);
}

void VideoObjectEditor::OncancelBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void VideoObjectEditor::OnbrowseBtClick(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog( this, _("Choose video file"), gameDirectory, "", _("Ogg Theora Video|*.ogg;*.ogv|All files|*.*"));

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        videoEdit->SetValue(filename.GetFullPath());
    }
}

void VideoObjectEditor::OnconverterBtClick(wxCommandEvent& event)
{
    if ( !wxFileExists(wxGetCwd()+"/Extensions/ffmpeg2theora.exe"))
    {
        gd::LogError(_("ffmpeg2theora.exe executable was not found in Extensions directory of Game Develop."));
        return;
    }

    wxFileDialog fileDialog( this, _("Choose the video file to encode in OGG Theora"), "", "", _("Video|*.*"));

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        string parameters;
        if ( wxMessageBox(_("Do you want to remove the audio track from the video\?"), _("Delete the audio track"), wxYES_NO | wxICON_QUESTION, this) == wxYES )
            parameters += " --noaudio";

        wxProgressDialog dialog(_("Converting"), _("Please wait during conversion"));
        wxExecute(wxGetCwd()+"/Extensions/ffmpeg2theora.exe "+fileDialog.GetPath()+parameters, wxEXEC_SYNC);;
        gd::LogMessage(_("Conversion ended."));
    }
}

#endif

