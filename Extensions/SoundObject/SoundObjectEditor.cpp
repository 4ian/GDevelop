/**

Sound Object Extension
Copyright (c) 2011-2012 Thomas Flecy

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

#include "SoundObjectEditor.h"

//(*InternalHeaders(SoundObjectEditor)
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/string.h>
//*)
#include <wx/colordlg.h>
#include <wx/filename.h>
#include <wx/filedlg.h>

#include "GDCpp/Project.h"
#include "SoundObject.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCpp/CommonTools.h"

//(*IdInit(SoundObjectEditor)
const long SoundObjectEditor::ID_RADIOBUTTON2 = wxNewId();
const long SoundObjectEditor::ID_RADIOBUTTON1 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT6 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT7 = wxNewId();
const long SoundObjectEditor::ID_PANEL1 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT1 = wxNewId();
const long SoundObjectEditor::ID_SPINCTRL1 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT2 = wxNewId();
const long SoundObjectEditor::ID_TEXTCTRL3 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT3 = wxNewId();
const long SoundObjectEditor::ID_SPINCTRL3 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT4 = wxNewId();
const long SoundObjectEditor::ID_TEXTCTRL2 = wxNewId();
const long SoundObjectEditor::ID_CHECKBOX1 = wxNewId();
const long SoundObjectEditor::ID_STATICTEXT5 = wxNewId();
const long SoundObjectEditor::ID_TEXTCTRL1 = wxNewId();
const long SoundObjectEditor::ID_BUTTON2 = wxNewId();
const long SoundObjectEditor::ID_PANEL2 = wxNewId();
const long SoundObjectEditor::ID_NOTEBOOK1 = wxNewId();
const long SoundObjectEditor::ID_STATICLINE1 = wxNewId();
const long SoundObjectEditor::ID_BUTTON1 = wxNewId();
const long SoundObjectEditor::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE(SoundObjectEditor,wxDialog)
	//(*EventTable(SoundObjectEditor)
	//*)
END_EVENT_TABLE()

SoundObjectEditor::SoundObjectEditor( wxWindow* parent, gd::Project & game_, SoundObject & object_ ) :
game(game_),
object(object_)
{
	//(*Initialize(SoundObjectEditor)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer4;
	wxStaticBoxSizer* StaticBoxSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxStaticBoxSizer* StaticBoxSizer3;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Edit the Sound object"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER, _T("wxID_ANY"));
	SetClientSize(wxSize(399,399));
	FlexGridSizer3 = new wxFlexGridSizer(3, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(0);
	FlexGridSizer1 = new wxFlexGridSizer(2, 1, 0, 0);
	FlexGridSizer1->AddGrowableCol(0);
	FlexGridSizer1->AddGrowableRow(1);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(1);
	StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Sound type"));
	MusicRadioBt = new wxRadioButton(Panel1, ID_RADIOBUTTON2, _("Music"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON2"));
	MusicRadioBt->SetToolTip(_("Load the content of the sound file only partially when the sound is played. Useful for long sounds and musics."));
	StaticBoxSizer4->Add(MusicRadioBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SoundRadioBt = new wxRadioButton(Panel1, ID_RADIOBUTTON1, _("Sound"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON1"));
	SoundRadioBt->SetToolTip(_("The sound file is entirely loaded into memory so as to be quicly played. Adapted to small sounds and noises."));
	StaticBoxSizer4->Add(SoundRadioBt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(StaticBoxSizer4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(-1,-1,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer3 = new wxStaticBoxSizer(wxHORIZONTAL, Panel1, _("Note"));
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(Panel1, ID_STATICTEXT6, _("\"Music\" mode is more appropriate for long sound file, during more than 10 seconds:\nThe sound file is only partially loaded in memory when it is played.\n\"Sound\" mode is to be used with smaller sound file, as the sound files are in this case\ntotally loaded into the memory."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	wxFont StaticText6Font(8,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText6->SetFont(StaticText6Font);
	FlexGridSizer8->Add(StaticText6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText7 = new wxStaticText(Panel1, ID_STATICTEXT7, _("Sound spatialisation is only available for \"mono\" sound ( and not stereo ones )."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	wxFont StaticText7Font(8,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText7->SetFont(StaticText7Font);
	FlexGridSizer8->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer3->Add(FlexGridSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(StaticBoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Properties"));
	FlexGridSizer4 = new wxFlexGridSizer(5, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT1, _("Sound level:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	VolumeSpinCtrl = new wxSpinCtrl(Panel2, ID_SPINCTRL1, _T("0"), wxDefaultPosition, wxDefaultSize, 0, 0, 100, 0, _T("ID_SPINCTRL1"));
	VolumeSpinCtrl->SetValue(_T("0"));
	FlexGridSizer4->Add(VolumeSpinCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("Pitch:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	pitchTextCtrl = new wxTextCtrl(Panel2, ID_TEXTCTRL3, _("1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
	FlexGridSizer4->Add(pitchTextCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel2, ID_STATICTEXT3, _("Minimal distance:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	MinDistanceSpinCtrl = new wxSpinCtrl(Panel2, ID_SPINCTRL3, _T("1"), wxDefaultPosition, wxDefaultSize, 0, 1, 100, 1, _T("ID_SPINCTRL3"));
	MinDistanceSpinCtrl->SetValue(_T("1"));
	FlexGridSizer4->Add(MinDistanceSpinCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT4, _("Attenuation:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	AttenuationSpinCtrl = new wxTextCtrl(Panel2, ID_TEXTCTRL2, _("1"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
	FlexGridSizer4->Add(AttenuationSpinCtrl, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4->Add(-1,-1,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	LoopCheckBox = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Loop"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	LoopCheckBox->SetValue(false);
	FlexGridSizer4->Add(LoopCheckBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Filename"));
	FlexGridSizer5 = new wxFlexGridSizer(1, 3, 0, 0);
	FlexGridSizer5->AddGrowableCol(1);
	StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("Name of the sound file:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FileNameTextCtrl = new wxTextCtrl(Panel2, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxSize(99,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer5->Add(FileNameTextCtrl, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	Button1 = new wxButton(Panel2, ID_BUTTON2, _("..."), wxDefaultPosition, wxSize(30,23), 0, wxDefaultValidator, _T("ID_BUTTON2"));
	Button1->SetToolTip(_("Browse"));
	FlexGridSizer5->Add(Button1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer6->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel2->SetSizer(FlexGridSizer6);
	FlexGridSizer6->Fit(Panel2);
	FlexGridSizer6->SetSizeHints(Panel2);
	Notebook1->AddPage(Panel1, _("Type"), false);
	Notebook1->AddPage(Panel2, _("Sound/Music"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer3->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	ValidateButton = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer7->Add(ValidateButton, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Button2 = new wxButton(this, ID_BUTTON3, _("Cancel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer7->Add(Button2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer7, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer3);
	FlexGridSizer3->SetSizeHints(this);
	Center();

	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SoundObjectEditor::OnButton1Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SoundObjectEditor::OnValidateButtonClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&SoundObjectEditor::OnButton2Click);
	//*)

    VolumeSpinCtrl->SetValue(object.GetVolume());
    AttenuationSpinCtrl->SetValue(wxString(ToString(object.GetAttenuation()).c_str()));
    pitchTextCtrl->SetValue(wxString(ToString(object.GetPitch()).c_str()));
    LoopCheckBox->SetValue(object.IsLooping());
    FileNameTextCtrl->SetValue(object.GetSoundFileName());
    MinDistanceSpinCtrl->SetValue(object.GetMinDistance());

    MusicRadioBt->SetValue(object.GetSoundType() == "Music");
    SoundRadioBt->SetValue(object.GetSoundType() == "Sound");
}

SoundObjectEditor::~SoundObjectEditor()
{
	//(*Destroy(SoundObjectEditor)
	//*)
}

void SoundObjectEditor::OnValidateButtonClick(wxCommandEvent& event)
{
    if(SoundRadioBt->GetValue())
        object.SetSoundType("Sound");
    else
        object.SetSoundType("Music");

    object.SetVolume(VolumeSpinCtrl->GetValue());
    object.SetAttenuation(ToFloat(ToString(AttenuationSpinCtrl->GetValue())));
    object.SetPitch(ToFloat(ToString(pitchTextCtrl->GetValue())));
    object.SetMinDistance(MinDistanceSpinCtrl->GetValue());
    object.SetLooping(LoopCheckBox->IsChecked());
    object.SetSoundFileName(ToString(FileNameTextCtrl->GetValue()));

    EndModal(1);
}

void SoundObjectEditor::OnButton2Click(wxCommandEvent& event)
{
    EndModal(0);
}

void SoundObjectEditor::OnButton1Click(wxCommandEvent& event)
{
    wxString gameDirectory = wxFileName::FileName(game.GetProjectFile()).GetPath();
    wxFileDialog fileDialog(this, _("Choose a sound ( wav or ogg file )"), gameDirectory, "", "Fichiers son (*.wav, *.ogg)|*.wav;*.ogg");

    if ( fileDialog.ShowModal() == wxID_OK )
    {
        //Note that the file is relative to the project directory
        wxFileName filename(fileDialog.GetPath()); filename.MakeRelativeTo(gameDirectory);
        FileNameTextCtrl->SetValue(filename.GetFullPath());
    }
}
#endif

