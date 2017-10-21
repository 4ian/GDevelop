/*
 * GDevelop IDE
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU General Public License version 3.
 */

#ifndef GD_NO_UPDATE_CHECKER

#include "MAJ.h"

//(*InternalHeaders(MAJ)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "GDCore/Tools/Log.h"
#include <wx/mimetype.h>
#include <wx/protocol/http.h>
#include <wx/filename.h>
#include <wx/msgdlg.h>
#include <wx/url.h>
#include <wx/progdlg.h>
#include <wx/wfstream.h>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/Tools/Locale/LocaleManager.h"
#include "GDCore/Tools/HelpFileAccess.h"
#include "UpdateChecker.h"
#include "GDCore/IDE/wxTools/SkinHelper.h"

//(*IdInit(MAJ)
const long MAJ::ID_STATICTEXT2 = wxNewId();
const long MAJ::ID_STATICTEXT3 = wxNewId();
const long MAJ::ID_STATICTEXT4 = wxNewId();
const long MAJ::ID_STATICTEXT5 = wxNewId();
const long MAJ::ID_STATICTEXT1 = wxNewId();
const long MAJ::ID_TEXTCTRL1 = wxNewId();
const long MAJ::ID_STATICTEXT7 = wxNewId();
const long MAJ::ID_BUTTON4 = wxNewId();
const long MAJ::ID_STATICTEXT6 = wxNewId();
const long MAJ::ID_HYPERLINKCTRL1 = wxNewId();
const long MAJ::ID_STATICLINE2 = wxNewId();
const long MAJ::ID_STATICBITMAP2 = wxNewId();
const long MAJ::ID_HYPERLINKCTRL2 = wxNewId();
const long MAJ::ID_BUTTON2 = wxNewId();
const long MAJ::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(MAJ,wxDialog)
	//(*EventTable(MAJ)
	//*)
END_EVENT_TABLE()

MAJ::MAJ(wxWindow* parent_, bool wasAutomaticallyOpened) :
parent(parent_)
{
	//(*Initialize(MAJ)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;

	Create(parent, wxID_ANY, _("Check for updates"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Your version :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	versionTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont versionTxtFont(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	versionTxt->SetFont(versionTxtFont);
	FlexGridSizer2->Add(versionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Available version :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer2->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	versionMAJTxt = new wxStaticText(this, ID_STATICTEXT5, _("No informations available"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer2->Add(versionMAJTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	StaticText1 = new wxStaticText(this, ID_STATICTEXT1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	wxFont StaticText1Font(wxDEFAULT,wxFONTFAMILY_DEFAULT,wxFONTSTYLE_NORMAL,wxFONTWEIGHT_BOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText1->SetFont(StaticText1Font);
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("No informations about the new version"), wxDefaultPosition, wxSize(400,227), wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(0,0,1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer4->AddGrowableCol(1);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT7, _("Automatic download :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	StaticText5->Hide();
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	downloadAndInstallBt = new wxButton(this, ID_BUTTON4, _("Install the new version"), wxDefaultPosition, wxSize(234,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	downloadAndInstallBt->Disable();
	downloadAndInstallBt->Hide();
	FlexGridSizer4->Add(downloadAndInstallBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT6, _("Download it here:"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	linkCtrl = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("No link"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer4->Add(linkCtrl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer5->AddGrowableRow(0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP2, gd::SkinHelper::GetIcon("help", 16), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP2"));
	FlexGridSizer5->Add(StaticBitmap1, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	HyperlinkCtrl1 = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL2, _("Help"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL2"));
	HyperlinkCtrl1->SetToolTip(_("Display help about this window"));
	FlexGridSizer5->Add(HyperlinkCtrl1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	VerifMAJBt = new wxButton(this, ID_BUTTON2, _("Check for updates again"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	VerifMAJBt->SetDefault();
	FlexGridSizer3->Add(VerifMAJBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON1, _("Close"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OndownloadAndInstallBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&MAJ::OnLienBtClick);
	Connect(ID_HYPERLINKCTRL2,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&MAJ::OnHelpBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnVerifMAJBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnFermerBtClick);
	//*)

	versionTxt->SetLabel( gd::VersionWrapper::FullString() );

	if ( wasAutomaticallyOpened )
    {
        StaticText1->SetLabel(_("A new version of GDevelop is available !"));
        VerifMAJBt->Show(false);
    }

    CheckForUpdate();
}

MAJ::~MAJ()
{
	//(*Destroy(MAJ)
	//*)
}

void MAJ::CheckForUpdate()
{
    UpdateChecker * checker = UpdateChecker::Get();
    checker->DownloadInformation(/*excludeFromStatistics=*/true);

    versionMAJTxt->SetLabel(gd::String::From(checker->newMajor)+"."+gd::String::From(checker->newMinor)+"."+gd::String::From(checker->newBuild)+"."+gd::String::From(checker->newRevision));

    wxString info = _("No informations about the new version.");
    if ( !checker->info.empty() ) info = checker->info;

    wxString link = _("No link");
    if ( !checker->link.empty() ) link = checker->link;

    infoEdit->ChangeValue(info);
    linkCtrl->SetLabel(link);
    linkCtrl->SetURL(link);
    linkCtrl->Refresh(); //Need to call manually update.

    //Too slow
    /*if ( checker->newVersionAvailable )
        downloadAndInstallBt->Enable(true);*/
}


void MAJ::OnVerifMAJBtClick(wxCommandEvent& event)
{
    CheckForUpdate();
}

void MAJ::OnLienBtClick(wxCommandEvent& event)
{
    if ( linkCtrl->GetLabel() == _("No link"))
    {
        gd::LogMessage(_("No download link is available.\nGo on our web site so as to download the last version of GDevelop."));
        return;
    }

    wxString link = linkCtrl->GetLabel();
    wxString mimetype = wxEmptyString;
    if (link.StartsWith (_T("http://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("ftp://"))) {
        mimetype = _T("text/html");
    }else if (link.StartsWith (_T("mailto:"))) {
        mimetype = _T("message/rfc822");
    }else{
        return;
    }
    wxFileType *filetype = wxTheMimeTypesManager->GetFileTypeFromMimeType (mimetype);
    if (filetype) {
        wxString cmd;
        if (filetype->GetOpenCommand (&cmd, wxFileType::MessageParameters (link))) {
            cmd.Replace(_T("file://"), wxEmptyString);
            ::wxExecute(cmd);
        }
        delete filetype;
    }
}

void MAJ::OnFermerBtClick(wxCommandEvent& event)
{
    EndModal(0);
}

void MAJ::OndownloadAndInstallBtClick(wxCommandEvent& event)
{
    //Warn the user his work can be lost
    if ( wxMessageBox(_("GDevelop will be closed at the end of the download so as to install the new version. Don't forget to save your work.\nDownload and install the new version \?"), _("Installation of the new version"), wxYES_NO | wxICON_QUESTION, this) == wxNO )
        return;

    wxString tempDir = wxFileName::GetHomeDir()+"/.GDevelop";

    //Open connection to file
    wxHTTP http;
    wxURL *url = new wxURL(_T("http://www.compilgames.net/dl/gd.exe"));
    wxInputStream * input = url->GetInputStream();

    if (input!=NULL) {
        unsigned int current_progress = 0;
        char buffer[1024];

        wxProgressDialog progress(_("Download"),_("Progress"),(int)input->GetSize(), NULL, wxPD_CAN_ABORT | wxPD_AUTO_HIDE | wxPD_APP_MODAL | wxPD_ELAPSED_TIME | wxPD_REMAINING_TIME);
        wxFileOutputStream outputfile(tempDir+"/newgd.exe");
        while(!input->Eof() && current_progress!=input->GetSize()) { //Download part as long we haven't reached the end
            input->Read((void *)buffer,1024);
            outputfile.Write((const void *)buffer,input->LastRead());
            current_progress+=input->LastRead();
            if ( !progress.Update(current_progress) ) //Enable the user to stop downloading
            {
                if ( wxMessageBox(_("Stop the download \?\n\nYou can also get the new version by downloading it on our website."), _("Stop the download"), wxYES_NO | wxICON_QUESTION, this) == wxYES )
                {
                    wxRemoveFile(tempDir+"/newgd.exe");
                    return;
                }
                else
                    progress.Resume();
            }
        }

        delete input;
    }
    else
    {
        gd::LogWarning( _( "Unable to connect to the server so as to check for updates.\nCheck :\n-Your internet connection\n-Your firewall-If you can manually access our site.\n\nYou can disable Check for updates in the preferences of GDevelop." ) );
        return;
    }

    wxExecute(tempDir+"/newgd.exe /SILENT /LANG="+gd::LocaleManager::Get()->locale->GetLocale(), wxEXEC_ASYNC);
    EndModal(2);
}


void MAJ::OnHelpBtClick(wxCommandEvent& event)
{
    gd::HelpFileAccess::Get()->OpenPage("game_develop/documentation/manual/update");
}

#endif
