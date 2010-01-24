#include "EditPropJeu.h"

#ifdef DEBUG
#include "nommgr.h"
#endif

//(*InternalHeaders(EditPropJeu)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "sstream"
#include "StdAlgo.h"
#include <wx/help.h>
#include <SFML/System.hpp>
#include <SFML/Graphics.hpp>
#include <wx/filedlg.h>
#include <wx/config.h>

#ifdef DEBUG

#endif

#include "GDL/Game.h"

//(*IdInit(EditPropJeu)
const long EditPropJeu::ID_STATICBITMAP5 = wxNewId();
const long EditPropJeu::ID_STATICTEXT6 = wxNewId();
const long EditPropJeu::ID_PANEL1 = wxNewId();
const long EditPropJeu::ID_STATICLINE1 = wxNewId();
const long EditPropJeu::ID_STATICTEXT2 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL1 = wxNewId();
const long EditPropJeu::ID_STATICTEXT3 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL2 = wxNewId();
const long EditPropJeu::ID_STATICTEXT4 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL3 = wxNewId();
const long EditPropJeu::ID_STATICTEXT5 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL4 = wxNewId();
const long EditPropJeu::ID_STATICBITMAP1 = wxNewId();
const long EditPropJeu::ID_CHECKBOX5 = wxNewId();
const long EditPropJeu::ID_SPINCTRL1 = wxNewId();
const long EditPropJeu::ID_CHECKBOX6 = wxNewId();
const long EditPropJeu::ID_STATICTEXT12 = wxNewId();
const long EditPropJeu::ID_SPINCTRL2 = wxNewId();
const long EditPropJeu::ID_PANEL2 = wxNewId();
const long EditPropJeu::ID_CHECKBOX4 = wxNewId();
const long EditPropJeu::ID_STATICTEXT1 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL11 = wxNewId();
const long EditPropJeu::ID_STATICTEXT11 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL12 = wxNewId();
const long EditPropJeu::ID_STATICBITMAP2 = wxNewId();
const long EditPropJeu::ID_CHECKBOX1 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL5 = wxNewId();
const long EditPropJeu::ID_STATICTEXT7 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL6 = wxNewId();
const long EditPropJeu::ID_STATICTEXT8 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL7 = wxNewId();
const long EditPropJeu::ID_STATICBITMAP3 = wxNewId();
const long EditPropJeu::ID_CHECKBOX2 = wxNewId();
const long EditPropJeu::ID_STATICTEXT9 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL9 = wxNewId();
const long EditPropJeu::ID_STATICTEXT10 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL10 = wxNewId();
const long EditPropJeu::ID_STATICBITMAP4 = wxNewId();
const long EditPropJeu::ID_CHECKBOX3 = wxNewId();
const long EditPropJeu::ID_TEXTCTRL8 = wxNewId();
const long EditPropJeu::ID_BUTTON3 = wxNewId();
const long EditPropJeu::ID_CHECKBOX7 = wxNewId();
const long EditPropJeu::ID_CHECKBOX8 = wxNewId();
const long EditPropJeu::ID_STATICTEXT13 = wxNewId();
const long EditPropJeu::ID_BUTTON4 = wxNewId();
const long EditPropJeu::ID_PANEL3 = wxNewId();
const long EditPropJeu::ID_NOTEBOOK1 = wxNewId();
const long EditPropJeu::ID_STATICLINE3 = wxNewId();
const long EditPropJeu::ID_BUTTON1 = wxNewId();
const long EditPropJeu::ID_BUTTON2 = wxNewId();
//*)

BEGIN_EVENT_TABLE( EditPropJeu, wxDialog )
    //(*EventTable(EditPropJeu)
    //*)
END_EVENT_TABLE()

EditPropJeu::EditPropJeu( wxWindow* parent, Game * pJeu )
{
    //(*Initialize(EditPropJeu)
    wxFlexGridSizer* FlexGridSizer4;
    wxFlexGridSizer* FlexGridSizer16;
    wxFlexGridSizer* FlexGridSizer19;
    wxFlexGridSizer* FlexGridSizer10;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxFlexGridSizer* FlexGridSizer15;
    wxFlexGridSizer* FlexGridSizer18;
    wxFlexGridSizer* FlexGridSizer8;
    wxFlexGridSizer* FlexGridSizer21;
    wxFlexGridSizer* FlexGridSizer14;
    wxFlexGridSizer* FlexGridSizer20;
    wxFlexGridSizer* FlexGridSizer13;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer6;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _("Editer les propriétés du jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE, _T("wxID_ANY"));
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 3, 0, 0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(420,54), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    Panel1->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer18 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticBitmap5 = new wxStaticBitmap(Panel1, ID_STATICBITMAP5, wxBitmap(wxImage(_T("res/paraJeu.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP5"));
    FlexGridSizer18->Add(StaticBitmap5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText6 = new wxStaticText(Panel1, ID_STATICTEXT6, _("Vous pouvez régler les principaux paramètres de votre jeu,\nainsi que les écrans annexes, comme celui du chargement."), wxDefaultPosition, wxSize(371,32), 0, _T("ID_STATICTEXT6"));
    FlexGridSizer18->Add(StaticText6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel1->SetSizer(FlexGridSizer18);
    FlexGridSizer18->SetSizeHints(Panel1);
    FlexGridSizer17->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(this, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer1->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Notebook1 = new wxNotebook(this, ID_NOTEBOOK1, wxDefaultPosition, wxDefaultSize, 0, _T("ID_NOTEBOOK1"));
    Panel2 = new wxPanel(Notebook1, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    FlexGridSizer5 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer5->AddGrowableCol(0);
    FlexGridSizer2 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer2->AddGrowableCol(1);
    StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT2, _("Nom :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer2->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL1, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL1"));
    FlexGridSizer2->Add(NomEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(1);
    StaticText3 = new wxStaticText(Panel2, ID_STATICTEXT3, _("Auteur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer3->Add(StaticText3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    AuteurEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL2, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    FlexGridSizer3->Add(AuteurEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4 = new wxFlexGridSizer(0, 5, 0, 0);
    StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT4, _("Taille de la fenêtre de jeu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer4->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    WidthEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL3, wxEmptyString, wxDefaultPosition, wxSize(34,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL3"));
    WidthEdit->SetToolTip(_("Largeur de la fenêtre de jeu.\nGénéralement, 640, 800 ( défaut ) ou 1024."));
    FlexGridSizer4->Add(WidthEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText5 = new wxStaticText(Panel2, ID_STATICTEXT5, _("x"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT5"));
    FlexGridSizer4->Add(StaticText5, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    HeightEdit = new wxTextCtrl(Panel2, ID_TEXTCTRL4, wxEmptyString, wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL4"));
    HeightEdit->SetToolTip(_("Hauteur de la fenêtre de jeu.\nGénéralement, 480, 600 ( Défaut ) ou 768."));
    FlexGridSizer4->Add(HeightEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap1 = new wxStaticBitmap(Panel2, ID_STATICBITMAP1, wxBitmap(wxImage(_T("res/ok.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP1"));
    FlexGridSizer4->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer19 = new wxFlexGridSizer(0, 3, 0, 0);
    FPSmaxCheck = new wxCheckBox(Panel2, ID_CHECKBOX5, _("FPS maximum :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX5"));
    FPSmaxCheck->SetValue(false);
    FlexGridSizer19->Add(FPSmaxCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FPSmax = new wxSpinCtrl(Panel2, ID_SPINCTRL1, _T("60"), wxDefaultPosition, wxSize(58,21), 0, 0, 1000, 60, _T("ID_SPINCTRL1"));
    FPSmax->SetValue(_T("60"));
    FlexGridSizer19->Add(FPSmax, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    SyncCheck = new wxCheckBox(Panel2, ID_CHECKBOX6, _("Sychronisation verticale"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX6"));
    SyncCheck->SetValue(false);
    FlexGridSizer19->Add(SyncCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer20 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText12 = new wxStaticText(Panel2, ID_STATICTEXT12, _("FPS minimum :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT12"));
    FlexGridSizer20->Add(StaticText12, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FPSmin = new wxSpinCtrl(Panel2, ID_SPINCTRL2, _T("0"), wxDefaultPosition, wxSize(80,21), 0, 0, 1000, 0, _T("ID_SPINCTRL2"));
    FPSmin->SetValue(_T("0"));
    FlexGridSizer20->Add(FPSmin, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer5->Add(FlexGridSizer20, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel2->SetSizer(FlexGridSizer5);
    FlexGridSizer5->Fit(Panel2);
    FlexGridSizer5->SetSizeHints(Panel2);
    Panel3 = new wxPanel(Notebook1, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer13 = new wxFlexGridSizer(0, 1, 0, 0);
    afficherEcranCheck = new wxCheckBox(Panel3, ID_CHECKBOX4, _("Afficher une fenêtre au lancement du jeu"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX4"));
    afficherEcranCheck->SetValue(true);
    FlexGridSizer13->Add(afficherEcranCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer16 = new wxFlexGridSizer(0, 5, 0, 0);
    StaticText1 = new wxStaticText(Panel3, ID_STATICTEXT1, _("Taille de la fenêtre de chargement :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer16->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    widthECEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL11, wxEmptyString, wxDefaultPosition, wxSize(34,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL11"));
    FlexGridSizer16->Add(widthECEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText11 = new wxStaticText(Panel3, ID_STATICTEXT11, _("x"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT11"));
    FlexGridSizer16->Add(StaticText11, 1, wxTOP|wxBOTTOM|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    heightECEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL12, wxEmptyString, wxDefaultPosition, wxSize(34,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL12"));
    FlexGridSizer16->Add(heightECEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap2 = new wxStaticBitmap(Panel3, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/ok.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP2"));
    FlexGridSizer16->Add(StaticBitmap2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer13->Add(FlexGridSizer16, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer14 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer14->AddGrowableCol(0);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel3, _("Paramètre de la fenêtre :"));
    FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer8->AddGrowableCol(0);
    FlexGridSizer9 = new wxFlexGridSizer(0, 7, 0, 0);
    texteCheck = new wxCheckBox(Panel3, ID_CHECKBOX1, _("Afficher un texte :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    texteCheck->SetValue(true);
    FlexGridSizer9->Add(texteCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    texteEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL5, _("Chargement..."), wxDefaultPosition, wxSize(116,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL5"));
    FlexGridSizer9->Add(texteEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText7 = new wxStaticText(Panel3, ID_STATICTEXT7, _("en"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT7"));
    FlexGridSizer9->Add(StaticText7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    texteXPosEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL6, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL6"));
    FlexGridSizer9->Add(texteXPosEdit, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText8 = new wxStaticText(Panel3, ID_STATICTEXT8, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT8"));
    FlexGridSizer9->Add(StaticText8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    texteYPosEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL7, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL7"));
    FlexGridSizer9->Add(texteYPosEdit, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap3 = new wxStaticBitmap(Panel3, ID_STATICBITMAP3, wxBitmap(wxImage(_T("res/ok.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP3"));
    FlexGridSizer9->Add(StaticBitmap3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer10 = new wxFlexGridSizer(0, 7, 0, 0);
    pourcentCheck = new wxCheckBox(Panel3, ID_CHECKBOX2, _("Afficher un pourcentage"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    pourcentCheck->SetValue(false);
    pourcentCheck->Disable();
    FlexGridSizer10->Add(pourcentCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer10->Add(88,20,1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText9 = new wxStaticText(Panel3, ID_STATICTEXT9, _("en"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT9"));
    FlexGridSizer10->Add(StaticText9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    pourcentXPosEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL9, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL9"));
    pourcentXPosEdit->Disable();
    FlexGridSizer10->Add(pourcentXPosEdit, 1, wxTOP|wxBOTTOM|wxLEFT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText10 = new wxStaticText(Panel3, ID_STATICTEXT10, _(";"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT10"));
    FlexGridSizer10->Add(StaticText10, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    pourcentYPosEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL10, _("0"), wxDefaultPosition, wxSize(35,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL10"));
    pourcentYPosEdit->Disable();
    FlexGridSizer10->Add(pourcentYPosEdit, 1, wxTOP|wxBOTTOM|wxRIGHT|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBitmap4 = new wxStaticBitmap(Panel3, ID_STATICBITMAP4, wxBitmap(wxImage(_T("res/ok.png"))), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICBITMAP4"));
    FlexGridSizer10->Add(StaticBitmap4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(1);
    imageCheck = new wxCheckBox(Panel3, ID_CHECKBOX3, _("Afficher une image :"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX3"));
    imageCheck->SetValue(false);
    FlexGridSizer11->Add(imageCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    imageEdit = new wxTextCtrl(Panel3, ID_TEXTCTRL8, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_TEXTCTRL8"));
    FlexGridSizer11->Add(imageEdit, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BrowseBt = new wxButton(Panel3, ID_BUTTON3, _("Parcourir..."), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer11->Add(BrowseBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15 = new wxFlexGridSizer(0, 3, 0, 0);
    borderCheck = new wxCheckBox(Panel3, ID_CHECKBOX7, _("Bordure autour de la fenêtre"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX7"));
    borderCheck->SetValue(true);
    FlexGridSizer15->Add(borderCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    smoothCheck = new wxCheckBox(Panel3, ID_CHECKBOX8, _("Image lissée"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX8"));
    smoothCheck->SetValue(true);
    FlexGridSizer15->Add(smoothCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer14->Add(StaticBoxSizer1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer21 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText13 = new wxStaticText(Panel3, ID_STATICTEXT13, _("Pressez une touche pour fermer l\'aperçu"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT13"));
    wxFont StaticText13Font(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_ITALIC,wxNORMAL,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    StaticText13->SetFont(StaticText13Font);
    FlexGridSizer21->Add(StaticText13, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Button2 = new wxButton(Panel3, ID_BUTTON4, _("Aperçu"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer21->Add(Button2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer14->Add(FlexGridSizer21, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(FlexGridSizer14, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel3->SetSizer(FlexGridSizer7);
    FlexGridSizer7->Fit(Panel3);
    FlexGridSizer7->SetSizeHints(Panel3);
    Notebook1->AddPage(Panel2, _("Paramètres du jeu"), false);
    Notebook1->AddPage(Panel3, _("Ecran de chargement"), false);
    FlexGridSizer1->Add(Notebook1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer12->AddGrowableCol(0);
    StaticLine3 = new wxStaticLine(this, ID_STATICLINE3, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE3"));
    FlexGridSizer12->Add(StaticLine3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer12, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer6 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer6->AddGrowableCol(0);
    OkBt = new wxButton(this, ID_BUTTON1, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    FlexGridSizer6->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(this, ID_BUTTON2, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    FlexGridSizer6->Add(AideBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer1->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    FlexGridSizer1->Fit(this);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_CHECKBOX5,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditPropJeu::OnFPSmaxCheckClick);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropJeu::OnBrowseBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropJeu::OnButton2Click);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropJeu::OnOkBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditPropJeu::OnAideBtClick);
    //*)

    m_jeu = pJeu;
    NomEdit->SetValue( m_jeu->name );
    AuteurEdit->SetValue( m_jeu->author );

    HeightEdit->SetValue( st( m_jeu->windowHeight ) );
    WidthEdit->SetValue( st( m_jeu->windowWidth ) );

    afficherEcranCheck->SetValue( true );
    if ( !m_jeu->loadingScreen.afficher )
        afficherEcranCheck->SetValue( false );


    widthECEdit->SetValue( st( m_jeu->loadingScreen.width ) );
    heightECEdit->SetValue( st( m_jeu->loadingScreen.height ) );

    texteCheck->SetValue( true );
    if ( !m_jeu->loadingScreen.texte )
        texteCheck->SetValue( false );

    texteXPosEdit->SetValue( st( m_jeu->loadingScreen.texteXPos ) );
    texteYPosEdit->SetValue( st( m_jeu->loadingScreen.texteYPos ) );
    texteEdit->SetValue( m_jeu->loadingScreen.texteChargement );

    pourcentCheck->SetValue( false );
    if ( m_jeu->loadingScreen.pourcent )
        pourcentCheck->SetValue( true );

    pourcentXPosEdit->SetValue( st( m_jeu->loadingScreen.pourcentXPos ) );
    pourcentYPosEdit->SetValue( st( m_jeu->loadingScreen.pourcentYPos ) );

    imageCheck->SetValue( false );
    if ( m_jeu->loadingScreen.image )
        imageCheck->SetValue( true );

    imageEdit->SetValue( m_jeu->loadingScreen.imageFichier );

    borderCheck->SetValue(m_jeu->loadingScreen.border);
    smoothCheck->SetValue(m_jeu->loadingScreen.smooth);

    SyncCheck->SetValue( m_jeu->verticalSync );
    if ( m_jeu->maxFPS == -1 )
    {
        FPSmaxCheck->SetValue(false);
        FPSmax->Enable(false);
    }
    else
    {
        FPSmaxCheck->SetValue(true);
        FPSmax->SetValue(m_jeu->maxFPS);
    }

    FPSmin->SetValue(m_jeu->minFPS);


    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        FPSmax->Enable(false);
        FPSmaxCheck->Enable(false);
        FPSmin->Enable(false);
        afficherEcranCheck->Enable(false);
        StaticText1->Enable(false);
        widthECEdit->Enable(false);
        StaticText11->Enable(false);
        heightECEdit->Enable(false);
        StaticBitmap2->Enable(false);
        texteCheck->Enable(false);
        texteEdit->Enable(false);
        StaticText7->Enable(false);
        texteXPosEdit->Enable(false);
        texteYPosEdit->Enable(false);
        StaticBitmap3->Enable(false);
        pourcentCheck->Enable(false);
        StaticText9->Enable(false);
        pourcentXPosEdit->Enable(false);
        StaticText10->Enable(false);
        pourcentYPosEdit->Enable(false);
        StaticBitmap4->Enable(false);
        imageCheck->Enable(false);
        imageEdit->Enable(false);
        BrowseBt->Enable(false);
        Button2->Enable(false);
    }

}

EditPropJeu::~EditPropJeu()
{
    //(*Destroy(EditPropJeu)
    //*)
}


void EditPropJeu::OnOkBtClick( wxCommandEvent& event )
{
    m_jeu->name = NomEdit->GetValue();
    m_jeu->author = AuteurEdit->GetValue();

    {
        int i;
        string width = ( string ) WidthEdit->GetValue();
        std::istringstream iss( width );
        if (( iss >> i ) && ( iss.eof() ) )
        {
            m_jeu->windowWidth = i;
            StaticBitmap1->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap1->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    {
        int j;
        string height = ( string ) HeightEdit->GetValue();
        std::istringstream iss2( height );
        if (( iss2 >> j ) && ( iss2.eof() ) )
        {
            m_jeu->windowHeight = j;
            StaticBitmap1->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap1->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    m_jeu->loadingScreen.afficher=true;
    if ( !afficherEcranCheck->GetValue() )
        m_jeu->loadingScreen.afficher=false;

    {
        int j;
        string str = ( string ) widthECEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.width = j;
            StaticBitmap2->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap2->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    {
        int j;
        string str = ( string ) heightECEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.height = j;
            StaticBitmap2->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap2->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    m_jeu->loadingScreen.texte=true;
    if ( !texteCheck->GetValue() )
        m_jeu->loadingScreen.texte=false;

    m_jeu->loadingScreen.texteChargement = static_cast<string>(texteEdit->GetValue());
    {
        int j;
        string str = ( string ) texteXPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.texteXPos = j;
            StaticBitmap3->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap3->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    {
        int j;
        string str = ( string ) texteYPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.texteYPos = j;
            StaticBitmap3->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap3->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }


    m_jeu->loadingScreen.pourcent=false;
    if ( pourcentCheck->GetValue() )
        m_jeu->loadingScreen.pourcent=true;
    {
        int j;
        string str = ( string ) pourcentXPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.pourcentXPos = j;
            StaticBitmap4->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap4->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    {
        int j;
        string str = ( string ) pourcentYPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            m_jeu->loadingScreen.pourcentYPos = j;
            StaticBitmap4->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap4->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    m_jeu->loadingScreen.image=false;
    if ( imageCheck->GetValue() )
        m_jeu->loadingScreen.image=true;

    m_jeu->loadingScreen.imageFichier = imageEdit->GetValue();
    m_jeu->loadingScreen.border = borderCheck->GetValue();
    m_jeu->loadingScreen.smooth = smoothCheck->GetValue();

    if ( FPSmaxCheck->GetValue() )
        m_jeu->maxFPS = FPSmax->GetValue();
    else
        m_jeu->maxFPS = -1;

    m_jeu->minFPS = FPSmin->GetValue();
    m_jeu->verticalSync = SyncCheck->GetValue();

    EndModal( 0 );
}

void EditPropJeu::OnAideBtClick( wxCommandEvent& event )
{
    wxHelpController * help = new wxHelpController;
    help->Initialize( "aide.chm" );
    help->DisplaySection( 8 );
}


////////////////////////////////////////////////////////////
/// Affichage de l'aperçu de la fenêtre de chargement
////////////////////////////////////////////////////////////
void EditPropJeu::OnButton2Click(wxCommandEvent& event)
{
    int width;
    int height;
    {
        int j;
        string str = ( string ) widthECEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            width = j;
            StaticBitmap2->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap2->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }
    {
        int j;
        string str = ( string ) heightECEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            height = j;
            StaticBitmap2->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap2->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    int texteXPos;
    int texteYPos;
    {
        int j;
        string str = ( string ) texteXPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            texteXPos = j;
            StaticBitmap3->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap3->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }
    {
        int j;
        string str = ( string ) texteYPosEdit->GetValue();
        std::istringstream iss( str );
        if (( iss >> j ) && ( iss.eof() ) )
        {
            texteYPos = j;
            StaticBitmap3->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
        }
        else
        {
            StaticBitmap3->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
            return;
        }
    }

    // Fenêtre
    unsigned long style = 0;
    if ( borderCheck->GetValue() )
    {
        style |= sf::Style::Titlebar;
        style |= sf::Style::Close;
    }
    sf::RenderWindow App( sf::VideoMode( width, height, 32 ), "Chargement en cours...", style );

    sf::Image image;
    if ( imageCheck->GetValue() )
        image.LoadFromFile( static_cast<string>(imageEdit->GetValue()) );

    if ( !smoothCheck->GetValue() ) image.SetSmooth(false);

    sf::Sprite sprite( image );

    sf::Text Chargement( static_cast<string>(texteEdit->GetValue()) );
    Chargement.SetPosition(texteXPos, texteYPos);
    App.Draw( Chargement );

    App.Clear( sf::Color( 100, 100, 100 ) );
    App.SetFramerateLimit( 30 );
    App.Display();

    bool Running = true;
    sf::Event Event;
    while ( Running )
    {
        App.Clear( sf::Color( 100, 100, 100 ) );

        // Process events
        while ( App.GetEvent( Event ) )
        {
            // Close window : exit
            if ( Event.Type == sf::Event::Closed || Event.Type == sf::Event::KeyPressed )
                Running = false;
        }

        if ( imageCheck->GetValue() )
            App.Draw( sprite );
        if ( texteCheck->GetValue() )
            App.Draw(Chargement);

        App.Display();
    }
}

void EditPropJeu::OnBrowseBtClick(wxCommandEvent& event)
{

    wxFileDialog dialog(this, _("Choisissez une image"), "", "", "Images|*.*");
    dialog.ShowModal();

    if ( dialog.GetPath() != "" )
        imageEdit->SetValue(dialog.GetPath());
}

void EditPropJeu::OnFPSmaxCheckClick(wxCommandEvent& event)
{
    if ( FPSmaxCheck->GetValue() )
        FPSmax->Enable(true);
    else
        FPSmax->Enable(false);
}
