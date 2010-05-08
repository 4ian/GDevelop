#include "MAJ.h"

//(*InternalHeaders(MAJ)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "CheckMAJ.h"
#include "tinyxml.h"
#include "GDL/StdAlgo.h"
#include "GDL/VersionWrapper.h"
#include <wx/log.h>
#include <wx/mimetype.h>

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
const long MAJ::ID_STATICTEXT6 = wxNewId();
const long MAJ::ID_BUTTON3 = wxNewId();
const long MAJ::ID_STATICLINE2 = wxNewId();
const long MAJ::ID_BUTTON2 = wxNewId();
const long MAJ::ID_BUTTON1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(MAJ,wxDialog)
	//(*EventTable(MAJ)
	//*)
END_EVENT_TABLE()

MAJ::MAJ(wxWindow* parent)
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
	StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/maj.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
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
	infoEdit = new wxTextCtrl(this, ID_TEXTCTRL1, _("Pas d\'informations complémentaire à propos de la nouvelle version"), wxDefaultPosition, wxSize(319,86), wxTE_AUTO_SCROLL|wxTE_MULTILINE|wxTE_READONLY, wxDefaultValidator, _T("ID_TEXTCTRL1"));
	FlexGridSizer1->Add(infoEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticText3 = new wxStaticText(this, ID_STATICTEXT6, _("Lien de téléchargement :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer4->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	LienBt = new wxButton(this, ID_BUTTON3, _("Pas de lien"), wxDefaultPosition, wxSize(234,23), 0, wxDefaultValidator, _T("ID_BUTTON3"));
	wxFont LienBtFont(7,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	LienBt->SetFont(LienBtFont);
	FlexGridSizer4->Add(LienBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
	FlexGridSizer1->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
	VerifMAJBt = new wxButton(this, ID_BUTTON2, _("Vérifier les mises à jour"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer3->Add(VerifMAJBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FermerBt = new wxButton(this, ID_BUTTON1, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer1->Add(FlexGridSizer3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->Fit(this);
	FlexGridSizer1->SetSizeHints(this);

	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnLienBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnVerifMAJBtClick);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&MAJ::OnFermerBtClick);
	//*)

	versionTxt->SetLabel( GDLVersionWrapper::FullString() );
}

MAJ::~MAJ()
{
	//(*Destroy(MAJ)
	//*)
}


void MAJ::OnVerifMAJBtClick(wxCommandEvent& event)
{
    CheckMAJ check;

    TiXmlDocument doc( "news.txt" );
    if ( !doc.LoadFile() )
    {
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement : " ) + ErrorDescription;
        wxLogError(Error);
        return;
    }

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();

    //Récupération de la version
    int Major = 0;
    elem->QueryIntAttribute( "Major", &Major );
    int Minor = 0;
    elem->QueryIntAttribute( "Minor", &Minor );
    int Build = 0;
    elem->QueryIntAttribute( "Build", &Build );
    int Revision = 0;
    elem->QueryIntAttribute( "Revision", &Revision );

    versionMAJTxt->SetLabel(st(Major)+"."+st(Minor)+"."+st(Build)+"."+st(Revision));

    elem = hdl.FirstChildElement().FirstChildElement("Info").Element();

    wxString info = _("Pas d'informations complémentaires sur la nouvelle version.");
    if ( elem->Attribute( "Info") != NULL )
         info = elem->Attribute( "Info");

    wxString lien = _("Pas de lien");
    if ( elem->Attribute( "Lien") != NULL )
         lien = elem->Attribute( "Lien");

    infoEdit->ChangeValue(info);
    LienBt->SetLabel(lien);

    return;
}

void MAJ::OnLienBtClick(wxCommandEvent& event)
{
    if ( LienBt->GetLabel() == ("Pas de lien"))
    {
        wxLogMessage("Aucun lien de téléchargement n'est disponible.\nRendez vous sur notre site pour télécharger la denière version de Game Develop.");
        return;
    }

    wxString link = LienBt->GetLabel();
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
