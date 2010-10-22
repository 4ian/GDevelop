#include "Demarrage.h"

#ifdef DEBUG
#include "nommgr.h"
#endif

//(*InternalHeaders(Demarrage)
#include <wx/bitmap.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/help.h>
#include <wx/fs_zip.h>
#include <wx/config.h>
#include <wx/mimetype.h> // mimetype support
#include <string>
#include <vector>
#include "GDL/HelpFileAccess.h"

using namespace std;

//(*IdInit(Demarrage)
const long Demarrage::ID_STATICBITMAP1 = wxNewId();
const long Demarrage::ID_STATICTEXT2 = wxNewId();
const long Demarrage::ID_STATICTEXT5 = wxNewId();
const long Demarrage::ID_STATICTEXT3 = wxNewId();
const long Demarrage::ID_STATICBITMAP2 = wxNewId();
const long Demarrage::ID_BUTTON6 = wxNewId();
const long Demarrage::ID_PANEL1 = wxNewId();
const long Demarrage::ID_STATICTEXT1 = wxNewId();
const long Demarrage::ID_CHECKBOX1 = wxNewId();
const long Demarrage::ID_STATICBITMAP3 = wxNewId();
const long Demarrage::ID_STATICTEXT6 = wxNewId();
const long Demarrage::ID_CHECKBOX2 = wxNewId();
const long Demarrage::ID_STATICBITMAP4 = wxNewId();
const long Demarrage::ID_BUTTON7 = wxNewId();
const long Demarrage::ID_PANEL2 = wxNewId();
const long Demarrage::ID_STATICTEXT7 = wxNewId();
const long Demarrage::ID_BUTTON1 = wxNewId();
const long Demarrage::ID_STATICTEXT9 = wxNewId();
const long Demarrage::ID_BUTTON5 = wxNewId();
const long Demarrage::ID_STATICTEXT8 = wxNewId();
const long Demarrage::ID_BUTTON2 = wxNewId();
const long Demarrage::ID_STATICTEXT4 = wxNewId();
const long Demarrage::ID_BUTTON3 = wxNewId();
const long Demarrage::ID_BUTTON8 = wxNewId();
const long Demarrage::ID_BUTTON4 = wxNewId();
const long Demarrage::ID_PANEL3 = wxNewId();
const long Demarrage::ID_NOTEBOOK1 = wxNewId();
//*)

BEGIN_EVENT_TABLE(Demarrage,wxDialog)
	//(*EventTable(Demarrage)
	//*)
END_EVENT_TABLE()

Demarrage::Demarrage(wxWindow* parent)
{
	//(*Initialize(Demarrage)
	wxFlexGridSizer* FlexGridSizer4;
	wxFlexGridSizer* FlexGridSizer16;
	wxFlexGridSizer* FlexGridSizer10;
	wxFlexGridSizer* FlexGridSizer3;
	wxFlexGridSizer* FlexGridSizer5;
	wxFlexGridSizer* FlexGridSizer9;
	wxFlexGridSizer* FlexGridSizer2;
	wxFlexGridSizer* FlexGridSizer7;
	wxFlexGridSizer* FlexGridSizer15;
	wxFlexGridSizer* FlexGridSizer8;
	wxFlexGridSizer* FlexGridSizer14;
	wxFlexGridSizer* FlexGridSizer13;
	wxFlexGridSizer* FlexGridSizer12;
	wxFlexGridSizer* FlexGridSizer6;
	wxFlexGridSizer* FlexGridSizer1;
	wxFlexGridSizer* FlexGridSizer11;

	Create(parent, wxID_ANY, _("Premier démarrage de Game Develop"), wxDefaultPosition, wxDefaultSize, wxCAPTION|wxSYSTEM_MENU, _T("wxID_ANY"));
	SetClientSize(wxSize(662,325));
	FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer4 = new wxFlexGridSizer(0, 3, 0, 0);
	StaticBitmap1 = new wxStaticBitmap(this, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/gd-logo.png"))), wxPoint(-56,-64), wxDefaultSize, wxSIMPLE_BORDER, _T("ID_STATICBITMAP1"));
	FlexGridSizer4->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
	Panel1 = new wxPanel(Notebook1, ID_PANEL1, wxPoint(32,47), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
	FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer2->AddGrowableCol(0);
	FlexGridSizer2->AddGrowableRow(0);
	FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer7->AddGrowableCol(0);
	FlexGridSizer7->AddGrowableRow(0);
	FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText2 = new wxStaticText(Panel1, ID_STATICTEXT2, _("Game Develop vous permet de créer vos propres jeux de façon \nsimple et rapide.  La création s\'effectue au moyen de l\'éditeur,\net aucune connaissance particulière n\'est demandée pour\nutiliser Game Develop."), wxDefaultPosition, wxSize(309,59), 0, _T("ID_STATICTEXT2"));
	wxFont StaticText2Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText2->SetFont(StaticText2Font);
	FlexGridSizer5->Add(StaticText2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText5 = new wxStaticText(Panel1, ID_STATICTEXT5, _("Cet écran s\'affiche au premier démarrage,  afin de vous guider\npour vos premiers pas avec le logiciel et pour que vous soyez\nrapidement en mesure de créer vos propres jeux.\nCliquez sur suivant pour continuer."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
	FlexGridSizer5->Add(StaticText5, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	StaticText3 = new wxStaticText(Panel1, ID_STATICTEXT3, _("Game Develop est un freeware.  Si vous l\'avez payé autrement \nque par un don à l\'auteur, nous vous recommandons d\'obtenir\nun remboursement."), wxDefaultPosition, wxSize(333,59), 0, _T("ID_STATICTEXT3"));
	wxFont StaticText3Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
	StaticText3->SetFont(StaticText3Font);
	FlexGridSizer5->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer7->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap2 = new wxStaticBitmap(Panel1, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/presentation.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP2"));
	FlexGridSizer7->Add(StaticBitmap2, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer6->AddGrowableCol(0);
	FlexGridSizer6->AddGrowableRow(0);
	Button1 = new wxButton(Panel1, ID_BUTTON6, _("Suivant"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
	FlexGridSizer6->Add(Button1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer2->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Panel1->SetSizer(FlexGridSizer2);
	FlexGridSizer2->Fit(Panel1);
	FlexGridSizer2->SetSizeHints(Panel1);
	Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxPoint(93,-1), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
	FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer8->AddGrowableCol(0);
	FlexGridSizer8->AddGrowableRow(0);
	FlexGridSizer9 = new wxFlexGridSizer(0, 2, 0, 0);
	FlexGridSizer9->AddGrowableCol(1);
	FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT1, _("Game Develop vérifie par défaut au démarrage si de nouvelles mises à jour sont\ndisponibles. Si vous possédez un pare feu, il est possible que celui ci  vous demande\nsi le logiciel peut accéder à internet. Dans ce cas, répondez par l\'affirmative."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
	FlexGridSizer10->Add(StaticText1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	majCheck = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Vérifier les mises à jour au démarrage"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
	majCheck->SetValue(true);
	FlexGridSizer10->Add(majCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap3 = new wxStaticBitmap(Panel2, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/maj.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
	FlexGridSizer9->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer11 = new wxFlexGridSizer(0, 1, 0, 0);
	StaticText6 = new wxStaticText(Panel2, ID_STATICTEXT6, _("Si vous débutez, en plus des guides et tutoriels ( voir page suivante ), vous pouvez\nactiver le mode simple. Celui ci désactive certaines options de Game Develop qui ne\nsont pas utiles au débutant, afin d\'éviter de vous perdre dans des fonctionnalités\nqui n\'ont pas d\'intêret à ce stade.\nVous pourrez désactiver ce mode en allant dans le menu Outils > Mode Simple."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
	FlexGridSizer11->Add(StaticText6, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	simpleCheck = new wxCheckBox(Panel2, ID_CHECKBOX2, _("Activer le mode Simple"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
	simpleCheck->SetValue(false);
	FlexGridSizer11->Add(simpleCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer9->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	StaticBitmap4 = new wxStaticBitmap(Panel2, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/modesimple.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP4"));
	FlexGridSizer9->Add(StaticBitmap4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	Button2 = new wxButton(Panel2, ID_BUTTON7, _("Suivant"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
	FlexGridSizer8->Add(Button2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
	Panel2->SetSizer(FlexGridSizer8);
	FlexGridSizer8->Fit(Panel2);
	FlexGridSizer8->SetSizeHints(Panel2);
	Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxPoint(140,-3), wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
	FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
	FlexGridSizer3->AddGrowableCol(0);
	FlexGridSizer3->AddGrowableRow(4);
	FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer12->AddGrowableCol(1);
	StaticText7 = new wxStaticText(Panel3, ID_STATICTEXT7, _("Pour commencer à utiliser Game Develop,  lisez le guide de démarrage,\ndisponible dans l\'aide."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
	FlexGridSizer12->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	GuideBt = new wxButton(Panel3, ID_BUTTON1, _("Guide de démarrage"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
	FlexGridSizer12->Add(GuideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer14->AddGrowableCol(1);
	StaticText9 = new wxStaticText(Panel3, ID_STATICTEXT9, _("Il est aussi recommandé de lire le tutoriel Pas à Pas pour Game Develop.\nInutile de chercher sur internet, il est livré avec le logiciel."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
	FlexGridSizer14->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	TutorielBt = new wxButton(Panel3, ID_BUTTON5, _("Tutoriel"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
	FlexGridSizer14->Add(TutorielBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer13->AddGrowableCol(1);
	StaticText8 = new wxStaticText(Panel3, ID_STATICTEXT8, _("Vous pouvez ensuite ouvrir les différents exemples disponibles pour voir \nles différentes possibilités de création."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
	FlexGridSizer13->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	ExempleBt = new wxButton(Panel3, ID_BUTTON2, _("Exemples"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
	FlexGridSizer13->Add(ExempleBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer3->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
	FlexGridSizer15->AddGrowableCol(1);
	StaticText4 = new wxStaticText(Panel3, ID_STATICTEXT4, _("Si vous avez un problème au cours de la création de votre jeu, reportez\nvous à l\'aide, qui contient une explication pour chaque partie du \nprogramme. Si vous ne trouvez pas de solution ou si vous rencontrez un\nbug, visitez notre forum ou notre wiki."), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
	FlexGridSizer15->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
	ForumBt = new wxButton(Panel3, ID_BUTTON3, _("Forum"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
	FlexGridSizer16->Add(ForumBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
	wikiBt = new wxButton(Panel3, ID_BUTTON8, _("Wiki"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON8"));
	FlexGridSizer16->Add(wikiBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	FlexGridSizer15->Add(FlexGridSizer16, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
	FlexGridSizer3->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
	FermerBt = new wxButton(Panel3, ID_BUTTON4, _("Fermer"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
	FlexGridSizer3->Add(FermerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_BOTTOM, 5);
	Panel3->SetSizer(FlexGridSizer3);
	FlexGridSizer3->Fit(Panel3);
	FlexGridSizer3->SetSizeHints(Panel3);
	Notebook1->AddPage(Panel1, _("Présentation"), false);
	Notebook1->AddPage(Panel2, _("Paramétrage"), false);
	Notebook1->AddPage(Panel3, _("Débuter avec Game Develop"), false);
	FlexGridSizer1->Add(Notebook1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
	SetSizer(FlexGridSizer1);
	FlexGridSizer1->SetSizeHints(this);
	Center();

	Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnButton1Click);
	Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnButton2Click);
	Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnGuideBtClick);
	Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnTutorielBtClick);
	Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnExempleBtClick);
	Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnForumBtClick);
	Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnwikiBtClick);
	Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Demarrage::OnFermerBtClick);
	//*)
}

Demarrage::~Demarrage()
{
	//(*Destroy(Demarrage)
	//*)
}

void Demarrage::OnGuideBtClick(wxCommandEvent& event)
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(16);
}

void Demarrage::OnForumBtClick(wxCommandEvent& event)
{
    wxString link = "http://forum.compilgames.net";
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

void Demarrage::OnExempleBtClick(wxCommandEvent& event)
{
    wxConfigBase *pConfig = wxConfigBase::Get();

    if ( majCheck->GetValue() )
        pConfig->Write("Démarrage/MAJ", "true");
    else
        pConfig->Write("Démarrage/MAJ", "false");

    if ( simpleCheck->GetValue() )
        pConfig->Write("/ModeSimple", true);
    else
        pConfig->Write("/ModeSimple", false);

    EndModal(1);
}

void Demarrage::OnFermerBtClick(wxCommandEvent& event)
{
    wxConfigBase *pConfig = wxConfigBase::Get();

    if ( majCheck->GetValue() )
        pConfig->Write("Démarrage/MAJ", "true");
    else
        pConfig->Write("Démarrage/MAJ", "false");

    if ( simpleCheck->GetValue() )
        pConfig->Write("/ModeSimple", true);
    else
        pConfig->Write("/ModeSimple", false);

    EndModal(0);
}

void Demarrage::OnTutorielBtClick(wxCommandEvent& event)
{
    wxString link = wxGetCwd() + "\\Tutorial\\"+_("Tutoriel.pdf");
    wxString mimetype = "application/pdf";
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

void Demarrage::OnwikiBtClick(wxCommandEvent& event)
{
    wxString link = "http://wiki.compilgames.net";
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

void Demarrage::OnButton1Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(1);
}

void Demarrage::OnButton2Click(wxCommandEvent& event)
{
    Notebook1->SetSelection(2);
}
