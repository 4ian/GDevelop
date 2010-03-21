#include "Preferences.h"

//(*InternalHeaders(Preferences)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/fileconf.h>
#include <wx/filename.h>
#include <wx/config.h>
#include "wx/aui/aui.h"
#include <wx/filedlg.h>
#include <wx/colordlg.h>
#include <wx/help.h>
#include <wx/dirdlg.h>
#include <wx/log.h>
#include "GDL/HelpFileAccess.h"

#include <string>
#include <vector>
#include <iostream>

using namespace std;

//(*IdInit(Preferences)
const long Preferences::ID_STATICBITMAP3 = wxNewId();
const long Preferences::ID_STATICTEXT7 = wxNewId();
const long Preferences::ID_PANEL5 = wxNewId();
const long Preferences::ID_STATICLINE2 = wxNewId();
const long Preferences::ID_CHECKBOX1 = wxNewId();
const long Preferences::ID_CHECKBOX4 = wxNewId();
const long Preferences::ID_STATICTEXT5 = wxNewId();
const long Preferences::ID_CHOICE1 = wxNewId();
const long Preferences::ID_PANEL6 = wxNewId();
const long Preferences::ID_STATICTEXT13 = wxNewId();
const long Preferences::ID_CHOICE2 = wxNewId();
const long Preferences::ID_PANEL15 = wxNewId();
const long Preferences::ID_STATICTEXT6 = wxNewId();
const long Preferences::ID_TEXTCTRL3 = wxNewId();
const long Preferences::ID_BUTTON5 = wxNewId();
const long Preferences::ID_STATICTEXT8 = wxNewId();
const long Preferences::ID_TEXTCTRL4 = wxNewId();
const long Preferences::ID_BUTTON4 = wxNewId();
const long Preferences::ID_PANEL7 = wxNewId();
const long Preferences::ID_BUTTON6 = wxNewId();
const long Preferences::ID_BUTTON7 = wxNewId();
const long Preferences::ID_BUTTON8 = wxNewId();
const long Preferences::ID_RADIOBOX1 = wxNewId();
const long Preferences::ID_STATICTEXT1 = wxNewId();
const long Preferences::ID_PANEL9 = wxNewId();
const long Preferences::ID_STATICTEXT2 = wxNewId();
const long Preferences::ID_PANEL10 = wxNewId();
const long Preferences::ID_CHECKBOX2 = wxNewId();
const long Preferences::ID_STATICTEXT4 = wxNewId();
const long Preferences::ID_PANEL3 = wxNewId();
const long Preferences::ID_PANEL4 = wxNewId();
const long Preferences::ID_STATICTEXT3 = wxNewId();
const long Preferences::ID_PANEL1 = wxNewId();
const long Preferences::ID_PANEL2 = wxNewId();
const long Preferences::ID_STATICTEXT9 = wxNewId();
const long Preferences::ID_PANEL11 = wxNewId();
const long Preferences::ID_STATICTEXT10 = wxNewId();
const long Preferences::ID_PANEL13 = wxNewId();
const long Preferences::ID_STATICTEXT11 = wxNewId();
const long Preferences::ID_PANEL12 = wxNewId();
const long Preferences::ID_STATICTEXT12 = wxNewId();
const long Preferences::ID_PANEL14 = wxNewId();
const long Preferences::ID_PANEL8 = wxNewId();
const long Preferences::ID_LISTBOOK1 = wxNewId();
const long Preferences::ID_STATICLINE1 = wxNewId();
const long Preferences::ID_BUTTON1 = wxNewId();
const long Preferences::ID_BUTTON2 = wxNewId();
const long Preferences::ID_BUTTON3 = wxNewId();
//*)

BEGIN_EVENT_TABLE( Preferences, wxDialog )
    //(*EventTable(Preferences)
    //*)
END_EVENT_TABLE()

Preferences::Preferences( wxWindow* parent ) :
changesNeedRestart(false)
{
    //(*Initialize(Preferences)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer16;
    wxStaticBoxSizer* StaticBoxSizer4;
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxStaticBoxSizer* StaticBoxSizer9;
    wxFlexGridSizer* FlexGridSizer7;
    wxStaticBoxSizer* StaticBoxSizer7;
    wxStaticBoxSizer* StaticBoxSizer10;
    wxStaticBoxSizer* StaticBoxSizer8;
    wxStaticBoxSizer* StaticBoxSizer3;
    wxStaticBoxSizer* StaticBoxSizer6;
    wxFlexGridSizer* FlexGridSizer15;
    wxFlexGridSizer* FlexGridSizer18;
    wxFlexGridSizer* FlexGridSizer8;
    wxFlexGridSizer* FlexGridSizer14;
    wxFlexGridSizer* FlexGridSizer13;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;
    wxFlexGridSizer* FlexGridSizer17;
    wxStaticBoxSizer* StaticBoxSizer5;

    Create(parent, wxID_ANY, _("Préférences de Game Develop"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxMINIMIZE_BOX, _T("wxID_ANY"));
    SetClientSize(wxSize(467,330));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    Panel1 = new wxPanel(this, ID_PANEL5, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL5"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap3 = new wxStaticBitmap(Panel1, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/preferencelogo.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
    FlexGridSizer12->Add(StaticBitmap3, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText7 = new wxStaticText(Panel1, ID_STATICTEXT7, _("La fenêtre des préférences vous permet de personnaliser\nGame Develop. Chaque utilisateur de l\'ordinateur possède\nses propres préférences."), wxDefaultPosition, wxSize(417,48), wxALIGN_LEFT, _T("ID_STATICTEXT7"));
    FlexGridSizer12->Add(StaticText7, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer12);
    FlexGridSizer12->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(this, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    FlexGridSizer17->Add(StaticLine2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Listbook1 = new wxListbook(this, ID_LISTBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_LISTBOOK1"));
    Panel2 = new wxPanel(Listbook1, ID_PANEL6, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL6"));
    FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer14->AddGrowableCol(0);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxVERTICAL, Panel2, _("Démarrage"));
    GuideCheck = new wxCheckBox(Panel2, ID_CHECKBOX1, _("Afficher le guide de démarrage"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    GuideCheck->SetValue(false);
    StaticBoxSizer1->Add(GuideCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    MAJCheck = new wxCheckBox(Panel2, ID_CHECKBOX4, _("Vérification des mises à jour"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
    MAJCheck->SetValue(false);
    StaticBoxSizer1->Add(MAJCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer14->Add(StaticBoxSizer1, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer4 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Réponses automatiques"));
    FlexGridSizer10 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("Redimensionner l\'éditeur de scène à la taille \nde la fenêtre du jeu"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    FlexGridSizer10->Add(StaticText5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    TailleEditeurScene = new wxChoice(Panel2, ID_CHOICE1, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
    TailleEditeurScene->SetSelection( TailleEditeurScene->Append(_("Demander")) );
    TailleEditeurScene->Append(_("Oui"));
    TailleEditeurScene->Append(_("Non"));
    TailleEditeurScene->SetToolTip(_("Choisir une réponse automatique, ou laisser sur \"Demander\" pour que Game Develop vous pose la question au moment voulu."));
    FlexGridSizer10->Add(TailleEditeurScene, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer4->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer14->Add(StaticBoxSizer4, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    Panel2->SetSizer(FlexGridSizer14);
    FlexGridSizer14->Fit(Panel2);
    FlexGridSizer14->SetSizeHints(Panel2);
    Panel5 = new wxPanel(Listbook1, ID_PANEL15, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL15"));
    FlexGridSizer9 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText13 = new wxStaticText(Panel5, ID_STATICTEXT13, _("Langue :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
    FlexGridSizer9->Add(StaticText13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    langChoice = new wxChoice(Panel5, ID_CHOICE2, wxDefaultPosition, wxDefaultSize, 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE2"));
    langChoice->Append(_("English"));
    langChoice->Append(_("Français"));
    FlexGridSizer9->Add(langChoice, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel5->SetSizer(FlexGridSizer9);
    FlexGridSizer9->Fit(Panel5);
    FlexGridSizer9->SetSizeHints(Panel5);
    Panel3 = new wxPanel(Listbook1, ID_PANEL7, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL7"));
    FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer15->AddGrowableCol(0);
    StaticBoxSizer5 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("Programmes externes"));
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(1);
    StaticText6 = new wxStaticText(Panel3, ID_STATICTEXT6, _("Edition images :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer11->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    EditeurImageEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    EditeurImageEdit->SetToolTip(_("Chemin vers le programme d\'édition d\'images."));
    FlexGridSizer11->Add(EditeurImageEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BrowseEditionImage = new wxButton(Panel3, ID_BUTTON5, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer11->Add(BrowseEditionImage, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer5->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15->Add(StaticBoxSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer6 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("Compilation"));
    FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer13->AddGrowableCol(1);
    StaticText8 = new wxStaticText(Panel3, ID_STATICTEXT8, _("Dossier temporaire de compilation :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    FlexGridSizer13->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DossierTempCompEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    DossierTempCompEdit->SetToolTip(_("Dossier servant à compiler un jeu.\nVous devez posséder les droits d\'écriture pour ce dossier.\nPar défaut, il s\'agit du dossier \"Compil\" dans le répertoire de Game Develop."));
    FlexGridSizer13->Add(DossierTempCompEdit, 1, wxALL|wxEXPAND|wxALIGN_BOTTOM|wxALIGN_CENTER_HORIZONTAL, 5);
    BrowseDossierTempBt = new wxButton(Panel3, ID_BUTTON4, _("Parcourir"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer13->Add(BrowseDossierTempBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer6->Add(FlexGridSizer13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15->Add(StaticBoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel3->SetSizer(FlexGridSizer15);
    FlexGridSizer15->Fit(Panel3);
    FlexGridSizer15->SetSizeHints(Panel3);
    Panel4 = new wxPanel(Listbook1, ID_PANEL8, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL8"));
    FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer16->AddGrowableCol(0);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Apparence prédéfinie"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    gdStyleBt = new wxButton(Panel4, ID_BUTTON6, _("Standard Game Develop"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON6"));
    FlexGridSizer2->Add(gdStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    officeStyleBt = new wxButton(Panel4, ID_BUTTON7, _("Microsoft Office"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON7"));
    FlexGridSizer2->Add(officeStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    auiStyleBt = new wxButton(Panel4, ID_BUTTON8, _("wxAUI"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON8"));
    FlexGridSizer2->Add(auiStyleBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer16->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(2);
    wxString __wxRadioBoxChoices_1[2] =
    {
    	_("Microsoft Office"),
    	_("wxAUI")
    };
    ribbonStyleBox = new wxRadioBox(Panel4, ID_RADIOBOX1, _("Style du ruban"), wxDefaultPosition, wxDefaultSize, 2, __wxRadioBoxChoices_1, 1, 0, wxDefaultValidator, _T("ID_RADIOBOX1"));
    FlexGridSizer3->Add(ribbonStyleBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer7 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Couleurs du ruban"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText1 = new wxStaticText(Panel4, ID_STATICTEXT1, _("Principale :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer4->Add(StaticText1, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    ribbonColor1Pnl = new wxPanel(Panel4, ID_PANEL9, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL9"));
    FlexGridSizer4->Add(ribbonColor1Pnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Panel4, ID_STATICTEXT2, _("Secondaire :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer4->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ribbonColor2Pnl = new wxPanel(Panel4, ID_PANEL10, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL10"));
    FlexGridSizer4->Add(ribbonColor2Pnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer7->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3->Add(StaticBoxSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer10 = new wxStaticBoxSizer(wxHORIZONTAL, Panel4, _("Textes"));
    hideLabelsCheck = new wxCheckBox(Panel4, ID_CHECKBOX2, _("Cacher les noms des boutons"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    hideLabelsCheck->SetValue(false);
    StaticBoxSizer10->Add(hideLabelsCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_TOP, 5);
    FlexGridSizer3->Add(StaticBoxSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer16->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer18 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBoxSizer3 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Couleur des panneaux"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText4 = new wxStaticText(Panel4, ID_STATICTEXT4, _("Editeur actif :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer7->Add(StaticText4, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    ActifColorPnl = new wxPanel(Panel4, ID_PANEL3, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer7->Add(ActifColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ActifColor2Pnl = new wxPanel(Panel4, ID_PANEL4, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    FlexGridSizer7->Add(ActifColor2Pnl, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(Panel4, ID_STATICTEXT3, _("Editeur inactif :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer7->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    InactifColorPnl = new wxPanel(Panel4, ID_PANEL1, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer7->Add(InactifColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    InactifColor2Pnl = new wxPanel(Panel4, ID_PANEL2, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer7->Add(InactifColor2Pnl, 0, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer3->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer18->Add(StaticBoxSizer3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer8 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Couleur des séparations"));
    FlexGridSizer8 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText9 = new wxStaticText(Panel4, ID_STATICTEXT9, _("Arrière plan :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
    FlexGridSizer8->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    backColorPnl = new wxPanel(Panel4, ID_PANEL11, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL11"));
    FlexGridSizer8->Add(backColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText10 = new wxStaticText(Panel4, ID_STATICTEXT10, _("Bordures :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
    FlexGridSizer8->Add(StaticText10, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    borderColorPnl = new wxPanel(Panel4, ID_PANEL13, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL13"));
    FlexGridSizer8->Add(borderColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer8->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer18->Add(StaticBoxSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer9 = new wxStaticBoxSizer(wxVERTICAL, Panel4, _("Couleur du texte"));
    FlexGridSizer6 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText11 = new wxStaticText(Panel4, ID_STATICTEXT11, _("Actif :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
    FlexGridSizer6->Add(StaticText11, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    activeTextColorPnl = new wxPanel(Panel4, ID_PANEL12, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL12"));
    FlexGridSizer6->Add(activeTextColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText12 = new wxStaticText(Panel4, ID_STATICTEXT12, _("Inactif :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
    FlexGridSizer6->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    inactiveTextColorPnl = new wxPanel(Panel4, ID_PANEL14, wxDefaultPosition, wxSize(39,16), wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL14"));
    FlexGridSizer6->Add(inactiveTextColorPnl, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer9->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer18->Add(StaticBoxSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer16->Add(FlexGridSizer18, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel4->SetSizer(FlexGridSizer16);
    FlexGridSizer16->Fit(Panel4);
    FlexGridSizer16->SetSizeHints(Panel4);
    Listbook1->AddPage(Panel2, _("Général"), false);
    Listbook1->AddPage(Panel5, _("Langue"), false);
    Listbook1->AddPage(Panel3, _("Répertoires"), false);
    Listbook1->AddPage(Panel4, _("Apparence"), false);
    FlexGridSizer1->Add(Listbook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer5 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer5->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AnnulerBt = new wxButton(this, ID_BUTTON2, _("Annuler"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer5->Add(AnnulerBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON3, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer5->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_CHOICE2,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&Preferences::OnlangChoiceSelect);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnBrowseEditionImageClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnBrowseDossierTempBtClick);
    Connect(ID_BUTTON6,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OngdStyleBtClick);
    Connect(ID_BUTTON7,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnofficeStyleBtClick);
    Connect(ID_BUTTON8,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnauiStyleBtClick);
    ribbonColor1Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnribbonColor1PnlLeftUp,0,this);
    ribbonColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnribbonColor2PnlLeftUp,0,this);
    Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&Preferences::OnhideLabelsCheckClick);
    ActifColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnActifColorPnlRightUp,0,this);
    ActifColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnActifColor2PnlRightUp,0,this);
    InactifColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnInactifColorPnlRightUp,0,this);
    InactifColor2Pnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnInactifColor2PnlRightUp,0,this);
    backColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnbackColorPnlLeftUp,0,this);
    borderColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnborderColorPnlLeftUp,0,this);
    activeTextColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnbackColorPnlLeftUp,0,this);
    inactiveTextColorPnl->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&Preferences::OnbackColorPnlLeftUp,0,this);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnAnnulerBtClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Preferences::OnAideBtClick);
    //*)

    wxConfigBase *pConfig = wxConfigBase::Get();

    {
        wxString result;

        pConfig->Read( _T( "/Démarrage/Guide" ), &result );
        if ( result == "false" )
        {
            GuideCheck->SetValue( false );
        }
        else { GuideCheck->SetValue( true ); }
    }

    {
        wxString result;

        pConfig->Read( _T( "/Démarrage/MAJ" ), &result );
        if ( result == "false" )
        {
            MAJCheck->SetValue( false );
        }
        else { MAJCheck->SetValue( true ); }
    }

    {
        wxString result;
        pConfig->Read( _T( "/Auto/TailleEditeurScene" ), result );
        if ( result == "" )
            TailleEditeurScene->SetSelection( 0 );
        else if ( result == "Y" )
            TailleEditeurScene->SetSelection( 1 );
        else if ( result == "N" )
            TailleEditeurScene->SetSelection( 2 );
    }

    {
        wxString result;
        wxColour couleur;
        int r, v, b;
        pConfig->Read( _T( "/Skin/RDefined" ), &result );

        if ( result == "true" )
        {
            pConfig->Read( _T( "/Skin/RibbonStyle" ), &result );

            if ( result == "Office" )
                ribbonStyleBox->SetSelection(0);
            else if ( result == "AUI" )
                ribbonStyleBox->SetSelection(1);
            else
                ribbonStyleBox->SetSelection(0);

            pConfig->Read( _T( "/Skin/Ribbon1R" ), &r );
            pConfig->Read( _T( "/Skin/Ribbon1G" ), &v );
            pConfig->Read( _T( "/Skin/Ribbon1B" ), &b );
            ribbonColor1Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ribbonColor1Pnl->Refresh();

            pConfig->Read( _T( "/Skin/Ribbon2R" ), &r );
            pConfig->Read( _T( "/Skin/Ribbon2G" ), &v );
            pConfig->Read( _T( "/Skin/Ribbon2B" ), &b );
            ribbonColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ribbonColor2Pnl->Refresh();

            bool hideLabels = false;
            pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
            if ( hideLabels )
                hideLabelsCheck->SetValue(true);
        }
        else
            SetSkinDefault();

        pConfig->Read( _T( "/Skin/Defined" ), &result );

        if ( result == "true" )
        {
            pConfig->Read( _T( "/Skin/PaneA1R" ), &r );
            pConfig->Read( _T( "/Skin/PaneA1G" ), &v );
            pConfig->Read( _T( "/Skin/PaneA1B" ), &b );
            ActifColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            ActifColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneA2R" ), &r );
            pConfig->Read( _T( "/Skin/PaneA2G" ), &v );
            pConfig->Read( _T( "/Skin/PaneA2B" ), &b );
            ActifColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            ActifColor2Pnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneI1R" ), &r );
            pConfig->Read( _T( "/Skin/PaneI1G" ), &v );
            pConfig->Read( _T( "/Skin/PaneI1B" ), &b );
            InactifColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            InactifColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/PaneI2R" ), &r );
            pConfig->Read( _T( "/Skin/PaneI2G" ), &v );
            pConfig->Read( _T( "/Skin/PaneI2B" ), &b );
            InactifColor2Pnl->SetBackgroundColour( wxColour( r, v, b ) );
            InactifColor2Pnl->Refresh();

            pConfig->Read( _T( "/Skin/BorderR" ), &r );
            pConfig->Read( _T( "/Skin/BorderG" ), &v );
            pConfig->Read( _T( "/Skin/BorderB" ), &b );
            borderColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            borderColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/BackR" ), &r );
            pConfig->Read( _T( "/Skin/BackG" ), &v );
            pConfig->Read( _T( "/Skin/BackB" ), &b );
            backColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            backColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/ATextR" ), &r );
            pConfig->Read( _T( "/Skin/ATextG" ), &v );
            pConfig->Read( _T( "/Skin/ATextB" ), &b );
            activeTextColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            activeTextColorPnl->Refresh();

            pConfig->Read( _T( "/Skin/ATextR" ), &r );
            pConfig->Read( _T( "/Skin/ATextG" ), &v );
            pConfig->Read( _T( "/Skin/ATextB" ), &b );
            inactiveTextColorPnl->SetBackgroundColour( wxColour( r, v, b ) );
            inactiveTextColorPnl->Refresh();
        }
        else
            SetSkinDefault();

    }

    {
        wxString result;

        if ( pConfig->Read( _T( "/EditeursExternes/Image" ), &result ) )
            EditeurImageEdit->SetValue( result );
        if ( pConfig->Read( _T( "/Dossier/Compilation" ), &result ) )
            DossierTempCompEdit->SetValue( result );
    }

    {
        wxString result;

        if ( pConfig->Read( _T( "/Lang" ), &result ) )
        {
            if ( result == "English")
                langChoice->SetSelection(0);
            else if ( result == "French")
                langChoice->SetSelection(1);
        }
    }
}

Preferences::~Preferences()
{
    //(*Destroy(Preferences)
    //*)
}


void Preferences::OnOkBtClick( wxCommandEvent& event )
{
    wxConfigBase * pConfig = wxConfigBase::Get();

    //Démarrage
    if ( GuideCheck->GetValue() )
    {
        pConfig->Write( _T( "/Démarrage/Guide" ), "true" );
    }
    else { pConfig->Write( _T( "/Démarrage/Guide" ), "false" ); }


    if ( MAJCheck->GetValue() )
    {
        pConfig->Write( _T( "/Démarrage/MAJ" ), "true" );
    }
    else { pConfig->Write( _T( "/Démarrage/MAJ" ), "false" ); }


    //Apparence
    wxColourData cData;

    if ( ribbonStyleBox->GetSelection() == 0)
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "Office" );
    else if ( ribbonStyleBox->GetSelection() == 1 )
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "AUI" );
    else
        pConfig->Write( _T( "/Skin/RibbonStyle" ), "Office" );

    pConfig->Write( _T( "/Skin/RDefined" ), "true" );
    pConfig->Write( _T( "/Skin/Defined" ), "true" );

    //Ribbon Primary Color
    cData.SetColour( ribbonColor1Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/Ribbon1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/Ribbon1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/Ribbon1B" ), cData.GetColour().Blue() );

    //Ribbon Secondary Color
    cData.SetColour( ribbonColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/Ribbon2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/Ribbon2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/Ribbon2B" ), cData.GetColour().Blue() );

    //Panes caption colors
    cData.SetColour( ActifColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneA1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneA1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneA1B" ), cData.GetColour().Blue() );

    cData.SetColour( ActifColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneA2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneA2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneA2B" ), cData.GetColour().Blue() );

    cData.SetColour( InactifColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneI1R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneI1G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneI1B" ), cData.GetColour().Blue() );

    cData.SetColour( InactifColor2Pnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/PaneI2R" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/PaneI2G" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/PaneI2B" ), cData.GetColour().Blue() );

    //Panes' borders color
    cData.SetColour( borderColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/BorderR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/BorderG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/BorderB" ), cData.GetColour().Blue() );

    //Background color
    cData.SetColour( backColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/BackR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/BackG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/BackB" ), cData.GetColour().Blue() );

    //Active texte color
    cData.SetColour( activeTextColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/ATextR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/ATextG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/ATextB" ), cData.GetColour().Blue() );

    //Inactive texte color
    cData.SetColour( inactiveTextColorPnl->GetBackgroundColour() );
    pConfig->Write( _T( "/Skin/ITextR" ), cData.GetColour().Red() );
    pConfig->Write( _T( "/Skin/ITextG" ), cData.GetColour().Green() );
    pConfig->Write( _T( "/Skin/ITextB" ), cData.GetColour().Blue() );

    if ( TailleEditeurScene->GetSelection() == 0 )
        pConfig->Write( _T( "/Auto/TailleEditeurScene" ), "" );
    if ( TailleEditeurScene->GetSelection() == 1 )
        pConfig->Write( _T( "/Auto/TailleEditeurScene" ), "Y" );
    if ( TailleEditeurScene->GetSelection() == 2 )
        pConfig->Write( _T( "/Auto/TailleEditeurScene" ), "N" );

    pConfig->Write( _T( "/Skin/HideLabels"), hideLabelsCheck->GetValue() );

    pConfig->Write( _T( "/EditeursExternes/Image" ), EditeurImageEdit->GetValue() );
    pConfig->Write( _T( "/Dossier/Compilation" ), DossierTempCompEdit->GetValue() );

    if ( langChoice->GetSelection() == 0 )
        pConfig->Write( _T( "/Lang" ), "English" );
    else if ( langChoice->GetSelection() == 1 )
        pConfig->Write( _T( "/Lang" ), "French" );

    if ( changesNeedRestart )
    {
        wxLogMessage(_("Certains changements nécessitent de redémarrer Game Develop pour prendre effet."));
    }

    EndModal( 1 );
}

void Preferences::OnAnnulerBtClick( wxCommandEvent& event )
{
    EndModal( 0 );
}

/**
 * Set standard Game Develop skin
 */
void Preferences::OngdStyleBtClick(wxCommandEvent& event)
{
    SetSkinDefault();
}

void Preferences::SetSkinDefault()
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(244, 245, 247) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(231, 241, 254) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(221,229,246) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(221,229,246) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(214,221,233) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(214,221,233) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(172,183,208) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(211,222,246) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(104,114,138) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(104,114,138) );
    inactiveTextColorPnl->Refresh();
}

/**
 * Set Office-like skin
 */
void Preferences::OnofficeStyleBtClick(wxCommandEvent& event)
{
    SetSkinOffice();
}
void Preferences::SetSkinOffice()
{
    ribbonStyleBox->SetSelection(0);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(194, 216, 241) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(255, 223, 114) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(201,224,252) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(201,224,252) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(192,216,240) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(192,216,240) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(140,178,226) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(188,218,254) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(62,106,166) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(62,106,166) );
    inactiveTextColorPnl->Refresh();
}

/**
 * Set AUI style skin
 */
void Preferences::OnauiStyleBtClick(wxCommandEvent& event)
{
    SetSkinAUI();
}

void Preferences::SetSkinAUI()
{
    ribbonStyleBox->SetSelection(1);

    ribbonColor1Pnl->SetBackgroundColour( wxColour(240, 240, 240) );
    ribbonColor1Pnl->Refresh();

    ribbonColor2Pnl->SetBackgroundColour( wxColour(51, 153, 255) );
    ribbonColor2Pnl->Refresh();

    ActifColorPnl->SetBackgroundColour( wxColour(151,203,255) );
    ActifColorPnl->Refresh();

    ActifColor2Pnl->SetBackgroundColour( wxColour(66,160,255) );
    ActifColor2Pnl->Refresh();

    InactifColorPnl->SetBackgroundColour( wxColour(183,183,183) );
    InactifColorPnl->Refresh();

    InactifColor2Pnl->SetBackgroundColour( wxColour(206,206,206) );
    InactifColor2Pnl->Refresh();

    borderColorPnl->SetBackgroundColour( wxColour(161,161,161) );
    borderColorPnl->Refresh();

    backColorPnl->SetBackgroundColour( wxColour(240,240,240) );
    backColorPnl->Refresh();

    activeTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    activeTextColorPnl->Refresh();

    inactiveTextColorPnl->SetBackgroundColour( wxColour(0,0,0) );
    inactiveTextColorPnl->Refresh();
}

void Preferences::OnActifColorPnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( ActifColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ActifColorPnl->SetBackgroundColour( cData.GetColour() );
        ActifColorPnl->Refresh();
    }
}

void Preferences::OnActifColor2PnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( ActifColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ActifColor2Pnl->SetBackgroundColour( cData.GetColour() );
        ActifColor2Pnl->Refresh();
    }
}

void Preferences::OnInactifColorPnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( InactifColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        InactifColorPnl->SetBackgroundColour( cData.GetColour() );
        InactifColorPnl->Refresh();
    }
}

void Preferences::OnInactifColor2PnlRightUp( wxMouseEvent& event )
{
    wxColourData cData;
    cData.SetColour( InactifColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        InactifColor2Pnl->SetBackgroundColour( cData.GetColour() );
        InactifColor2Pnl->Refresh();
    }
}

void Preferences::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplayContents();
}

void Preferences::OnBrowseDossierTempBtClick( wxCommandEvent& event )
{
    wxDirDialog dialog( this, _( "Choisissez le répertoire temporaire pour la compilation" ), "");
    dialog.ShowModal();

    if ( dialog.GetPath() != "" )
    {
        DossierTempCompEdit->SetValue(dialog.GetPath());
    }
}

void Preferences::OnBrowseEditionImageClick(wxCommandEvent& event)
{
    wxFileDialog dialog( this, _( "Choisissez un programme d'édition d'image" ), "", "", "Programme (*.exe)|*.exe" );
    dialog.ShowModal();

    if ( dialog.GetPath() != "" )
    {
        EditeurImageEdit->SetValue(dialog.GetPath());
    }
}

void Preferences::OnribbonColor1PnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( ribbonColor1Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ribbonColor1Pnl->SetBackgroundColour( cData.GetColour() );
        ribbonColor1Pnl->Refresh();
    }
}

void Preferences::OnribbonColor2PnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( ribbonColor2Pnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        ribbonColor2Pnl->SetBackgroundColour( cData.GetColour() );
        ribbonColor2Pnl->Refresh();
    }
}

void Preferences::OnbackColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( backColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        backColorPnl->SetBackgroundColour( cData.GetColour() );
        backColorPnl->Refresh();
    }
}

void Preferences::OnborderColorPnlLeftUp(wxMouseEvent& event)
{
    wxColourData cData;
    cData.SetColour( borderColorPnl->GetBackgroundColour() );
    wxColourDialog Dialog( this, &cData );
    if ( Dialog.ShowModal() == wxID_OK )
    {
        cData = Dialog.GetColourData();
        borderColorPnl->SetBackgroundColour( cData.GetColour() );
        borderColorPnl->Refresh();
    }
}

void Preferences::OnhideLabelsCheckClick(wxCommandEvent& event)
{
    changesNeedRestart = true;
}

void Preferences::OnlangChoiceSelect(wxCommandEvent& event)
{
    changesNeedRestart = true;
}
