/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

//(*InternalHeaders(mp3ogg)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/filedlg.h>
#include "GDCore/Tools/Log.h"
#include <string>
#include <vector>
#include <wx/filename.h>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "mp3ogg.h"
using namespace std;

//(*IdInit(mp3ogg)
const long mp3ogg::ID_STATICBITMAP3 = wxNewId();
const long mp3ogg::ID_STATICTEXT1 = wxNewId();
const long mp3ogg::ID_PANEL1 = wxNewId();
const long mp3ogg::ID_STATICLINE1 = wxNewId();
const long mp3ogg::ID_STATICTEXT3 = wxNewId();
const long mp3ogg::ID_BUTTON1 = wxNewId();
const long mp3ogg::ID_STATICTEXT4 = wxNewId();
const long mp3ogg::ID_BUTTON3 = wxNewId();
const long mp3ogg::ID_STATICTEXT2 = wxNewId();
const long mp3ogg::ID_STATICLINE2 = wxNewId();
const long mp3ogg::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE(mp3ogg,wxDialog)
	//(*EventTable(mp3ogg)
	//*)
END_EVENT_TABLE()

mp3ogg::mp3ogg(wxWindow* parent)
{
	//(*Initialize(mp3ogg)
	wxStaticBoxSizer* StaticBoxSizer2;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxStaticBoxSizer* StaticBoxSizer1;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Convert MP3 to OGG Vorbis"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/mp3ogg.png"))), wxDefaultPosition, wxDefaultSize, wxSIMPLE_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("GDevelop can not read the MP3 format (owing to license\nand algorithms patented by Fraunhofer-Gesellschaft), you can\nconvert a MP3 file to the free OGG Vorbis format or WAV."), wxDefaultPosition, wxSize(336,54), wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Conversion"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT3, _("A MP3 file is a music, or is meant to be played as a music :"), wxDefaultPosition, wxSize(317,36), 0, _T("ID_STATICTEXT3"));
	FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	EncoderBt = new wxButton(this, ID_BUTTON1, _("Choose a MP3 file and encode in OGG Vorbis"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(EncoderBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("A WAV file is a sound, an effect, or is meant to be played as a sound :"), wxDefaultPosition, wxSize(331,35), 0, _T("ID_STATICTEXT4"));
	FlexGridSizer3->Add(StaticText4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	EncoderWAVBt = new wxButton(this, ID_BUTTON3, _("Choose a MP3 file and encode in WAV"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer3->Add(EncoderWAVBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer2->Add(FlexGridSizer3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, this, _("Note"));
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("This utility uses lame.exe ( free MP3 Encoder )\nand OGGENC.EXE (free OGG Vorbis Encoder ).\nThese latter are included in the GDevelop directory."), wxDefaultPosition, wxSize(331,61), 0, _T("ID_STATICTEXT2"));
	StaticBoxSizer1->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	FermerBt = new wxButton(this, ID_BUTTON2, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer2->Add(FermerBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&mp3ogg::OnEncoderBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&mp3ogg::OnEncoderWAVBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&mp3ogg::OnFermerBtClick);
	//*)

	if ( !wxFileExists("oggenc.exe") || !wxFileExists("lame.exe") )
	{
	    StaticText2->SetLabel(_("This utility uses lame.exe ( free MP3 Encoder )\nand OGGENC.EXE (free OGG Vorbis Encoder ).\nThese latter were not detected in\nGDevelop directory. Download them or use the installer\nof GDevelop."));
	    StaticText2->Layout();
	    Layout();
	}
}

mp3ogg::~mp3ogg()
{
	//(*Destroy(mp3ogg)
	//*)
}


void mp3ogg::OnFermerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}


////////////////////////////////////////////////////////////
/// Encodage en OGG
///
/// Appel � LAME puis � OGGENC
////////////////////////////////////////////////////////////
void mp3ogg::OnEncoderBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog(this, _("Choose the MP3 file to encode in OGG Vorbis"), "", "", "Fichier audio MP3 ( *.mp3)|*.mp3");
    dialog.ShowModal();

    wxString originalFile = dialog.GetPath();
    if ( originalFile == "" ) return;

    wxExecute("lame \""+originalFile+"\" \""+originalFile+".wav\" --decode", wxEXEC_SYNC);
    wxExecute("oggenc \""+originalFile+".wav\"", wxEXEC_SYNC);

    //Suppression du wav interm�diaire
    wxRemoveFile(originalFile+".wav");

    //Renommage du file.mp3.ogg en file.ogg
    wxFileName filename(originalFile);
    filename.SetExt("ogg");
    wxRenameFile(originalFile+".ogg", filename.GetFullPath());

    gd::LogMessage(_("The encoding is finished. The OGG file is located in the same directory as the MP3 file."));

}

////////////////////////////////////////////////////////////
/// Encodage en WAV
///
/// Appel � LAME
////////////////////////////////////////////////////////////
void mp3ogg::OnEncoderWAVBtClick(wxCommandEvent& event)
{
    wxFileDialog dialog(this, _("Choose the MP3 file to encode in OGG Vorbis"), "", "", "Fichier audio MP3 ( *.mp3)|*.mp3");
    dialog.ShowModal();

    string rep = static_cast<string> ( dialog.GetPath() );
    if ( rep == "" ) return;

    wxExecute("lame \""+rep+"\" --decode", wxEXEC_SYNC);

    //Renommage du file.mp3.wav en file.wav
    wxFileName filename(rep);
    filename.SetExt("wav");
    wxRenameFile(rep+".wav", filename.GetFullPath());

    gd::LogMessage(_("The encoding is finished. The WAV file is located in the same directory as the MP3 file."));
}
