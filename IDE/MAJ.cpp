#include "MAJ.h"

//(*InternalHeaders(MAJ)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <wx/mimetype.h>
#include <wx/protocol/http.h>
#include <wx/filename.h>
#include <wx/msgdlg.h>
#include <wx/url.h>
#include <wx/progdlg.h>
#include <wx/wfstream.h>
#include "GDL/CommonTools.h"
#include "GDL/VersionWrapper.h"
#include "CheckMAJ.h"
#include "GDL/tinyxml.h"
#include "GDL/LocaleManager.h"

//(*IdInit(MAJ)
const long MAJ::ID_STATICBITMAP3 = wxNewId();
const long MAJ::ID_STATICTEXT1 = wxNewId();
const long MAJ::ID_PANEL1 = wxNewId();
const long MAJ::ID_STATICLINE1 = wxNewId();
const long MAJ::ID_STATICTEXT2 = wxNewId();
const long MAJ::ID_STATICTEXT3 = wxNewId();
const long MAJ::ID_STATICTEXT4 = wxNewId();
const long MAJ::ID_STATICTEXT5 = wxNewId();
const long MAJ::ID_TEXTCTRL1 = wxNewId();
const long MAJ::ID_STATICTEXT7 = wxNewId();
const long MAJ::ID_BUTTON4 = wxNewId();
const long MAJ::ID_STATICTEXT6 = wxNewId();
const long MAJ::ID_HYPERLINKCTRL1 = wxNewId();
const long MAJ::ID_STATICLINE2 = wxNewId();
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
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer17;

	Create(parent, wxID_ANY, _("Vérifier les mises à jour"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer17->AddGrowableCol(0);
	Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/maj.png"))), wxDefaultPosition, wxDefaultSize, wxNO_BORDER, _T("ID_STATICBITMAP3"));
	FlexGridSizer6->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText1 = new wxStaticText(Panel1, ID_STATICTEXT1, _("Game Develop peut vérifier si une nouvelle version est\ndisponible. Les nouvelles versions apportent des corrections de \nbugs, ainsi que des améliorations et nouvelles fonctionnalités."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT1"));
	FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Panel1->SetSizer(FlexGridSizer6);
	FlexGridSizer6->SetSizeHints(Panel1);
	FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
	FlexGridSizer17->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText2 = new wxStaticText(this, ID_STATICTEXT2, _("Version actuelle :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
	FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	versionTxt = new wxStaticText(this, ID_STATICTEXT3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
	wxFont versionTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	versionTxt->SetFont(versionTxtFont);
	FlexGridSizer2->Add(versionTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText4 = new wxStaticText(this, ID_STATICTEXT4, _("Version disponible :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer2->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	versionMAJTxt = new wxStaticText(this, ID_STATICTEXT5, _("Aucune information disponible"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	wxFont versionMAJTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	versionMAJTxt->SetFont(versionMAJTxtFont);
	FlexGridSizer2->Add(versionMAJTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("Pas d\'informations complémentaire à propos de la nouvelle version"), wxDefaultPosition, wxSize(365,130), wxTE_AUTO_SCROLL|wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
	StaticText5 = new wxStaticText(this, ID_STATICTEXT7, _("Téléchargement automatique :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer4->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	downloadAndInstallBt = new wxButton(this, ID_BUTTON4, _("Installer la nouvelle version"), wxDefaultPosition, wxSize(234,23), 0, wxDefaultValidator, _T("ID_BUTTON4"));
	downloadAndInstallBt->Disable();
	FlexGridSizer4->Add(downloadAndInstallBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT6, _("Téléchargement manuel :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	linkCtrl = new wxHyperlinkCtrl(this, ID_HYPERLINKCTRL1, _("Pas de lien"), wxEmptyString, wxDefaultPosition, wxDefaultSize, wxHL_CONTEXTMENU|wxHL_ALIGN_CENTRE|wxNO_BORDER, _T("ID_HYPERLINKCTRL1"));
	FlexGridSizer4->Add(linkCtrl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	VerifMAJBt = new wxButton(this, ID_BUTTON2, _("Revérifier les mises à jour"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	VerifMAJBt->SetDefault();
	FlexGridSizer3->Add(VerifMAJBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON1, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OndownloadAndInstallBtClick);
	Connect(ID_HYPERLINKCTRL1,wxEVT_COMMAND_HYPERLINK,(wxObjectEventFunction)&MAJ::OnLienBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnVerifMAJBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnFermerBtClick);
	//*)

	versionTxt->SetLabel( GDLVersionWrapper::FullString() );

	if ( wasAutomaticallyOpened )
    {
        StaticText1->SetLabel(_("Une nouvelle version de Game Develop est disponible !"));
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
    CheckMAJ checker;
    checker.DownloadInformation();

    versionMAJTxt->SetLabel(ToString(checker.newMajor)+"."+ToString(checker.newMinor)+"."+ToString(checker.newBuild)+"."+ToString(checker.newRevision));

    wxString info = _("Pas d'informations complémentaires sur la nouvelle version.");
    if ( !checker.info.empty() ) info = checker.info;

    wxString link = _("Pas de lien");
    if ( !checker.link.empty() ) link = checker.link;

    infoEdit->ChangeValue(info);
    linkCtrl->SetLabel(link);
    linkCtrl->SetURL(link);
    linkCtrl->Refresh(); //Need to call manually update.

    if ( checker.newVersionAvailable )
        downloadAndInstallBt->Enable(true);
}


void MAJ::OnVerifMAJBtClick(wxCommandEvent& event)
{
    CheckForUpdate();
}

void MAJ::OnLienBtClick(wxCommandEvent& event)
{
    if ( linkCtrl->GetLabel() == _("Pas de lien"))
    {
        wxLogMessage(_("Aucun lien de téléchargement n'est disponible.\nRendez vous sur notre site pour télécharger la denière version de Game Develop."));
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
    if ( wxMessageBox(_("Attention, Game Develop sera fermé à la fin du téléchargement afin d'installer la nouvelle version. Pensez à sauvegarder votre travail.\nContinuer ?"), _("Installation de la nouvelle version"), wxYES_NO | wxICON_QUESTION, this) == wxNO )
        return;

    wxString tempDir = wxFileName::GetHomeDir()+"/.Game Develop";

    //Open connection to file
    wxHTTP http;
    wxURL *url = new wxURL(_T("http://www.compilgames.net/dl/gd.exe"));
    wxInputStream * input = url->GetInputStream();

    if (input!=NULL) {
        unsigned int current_progress = 0;
        char buffer[1024];

        wxProgressDialog progress(_("Téléchargement"),_("Progression du téléchargement"),(int)input->GetSize(), NULL, wxPD_CAN_ABORT | wxPD_AUTO_HIDE | wxPD_APP_MODAL | wxPD_ELAPSED_TIME | wxPD_REMAINING_TIME);
        wxFileOutputStream outputfile(tempDir+"/newgd.exe");
        while(!input->Eof() && current_progress!=input->GetSize()) { //Download part as long we haven't reached the end
            input->Read((void *)buffer,1024);
            outputfile.Write((const void *)buffer,input->LastRead());
            current_progress+=input->LastRead();
            if ( !progress.Update(current_progress) ) //Enable the user to stop downloading
            {
                if ( wxMessageBox(_("Arrêter le téléchargement de la nouvelle version ?\n\nVous pouvez également obtenir la nouvelle version en la téléchargeant sur notre site."), _("Arrêter le téléchargement"), wxYES_NO | wxICON_QUESTION, this) == wxYES )
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
        wxLogWarning( _( "Impossible de se connecter au serveur de vérification des mises à jour de Compil Games.\nVérifiez :\n-Votre connexion internet\n-Votre pare-feu\n-Si il vous est possible d'accéder à notre site.\n\nVous pouvez désactiver la vérification des mises à jour dans les préférences." ) );
        return;
    }

    wxExecute(tempDir+"/newgd.exe /SILENT /LANG="+GDpriv::LocaleManager::GetInstance()->locale->GetLocale(), wxEXEC_ASYNC);
    EndModal(2);
}
