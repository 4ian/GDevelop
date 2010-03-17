#if defined(GDE)

#include "GDL/EditorObjet.h"

//(*InternalHeaders(EditorObjet)
#include <wx/bitmap.h>
#include <wx/settings.h>
#include <wx/font.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include <wx/log.h>
#include <wx/msgdlg.h>
#include <string>
#include <vector>
#include <wx/help.h>
#include <wx/numdlg.h>
#include <wx/config.h>
#include <sstream>
#include <wx/dcbuffer.h>
#include <wx/settings.h>
#include <wx/textdlg.h>
#include <wx/choicdlg.h>
#include <wx/textdlg.h>
#include <wx/msgdlg.h>

#include "GDL/HelpFileAccess.h"
#include "GDL/StdAlgo.h"
#include "GDL/Game.h"
#include "GDL/Animation.h"
#include "GDL/algo.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/AjoutPlusImage.h"
#include "GDL/BitmapGUIManager.h"

#ifdef __WXGTK__
#include <gtk/gtk.h>
#endif

using namespace std;

//(*IdInit(EditorObjet)
const long EditorObjet::ID_STATICTEXT6 = wxNewId();
const long EditorObjet::ID_STATICTEXT1 = wxNewId();
const long EditorObjet::ID_PANEL2 = wxNewId();
const long EditorObjet::ID_STATICLINE1 = wxNewId();
const long EditorObjet::ID_CHOICE1 = wxNewId();
const long EditorObjet::ID_BUTTON1 = wxNewId();
const long EditorObjet::ID_BUTTON2 = wxNewId();
const long EditorObjet::ID_CHECKBOX1 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON8 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON7 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON6 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON5 = wxNewId();
const long EditorObjet::ID_STATICBITMAP2 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON1 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON2 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON3 = wxNewId();
const long EditorObjet::ID_TOGGLEBUTTON4 = wxNewId();
const long EditorObjet::ID_CHECKBOX2 = wxNewId();
const long EditorObjet::ID_PANEL6 = wxNewId();
const long EditorObjet::ID_STATICLINE3 = wxNewId();
const long EditorObjet::ID_PANEL3 = wxNewId();
const long EditorObjet::ID_SCROLLBAR1 = wxNewId();
const long EditorObjet::ID_SCROLLBAR3 = wxNewId();
const long EditorObjet::ID_PANEL4 = wxNewId();
const long EditorObjet::ID_SCROLLBAR2 = wxNewId();
const long EditorObjet::ID_PANEL5 = wxNewId();
const long EditorObjet::ID_STATICBITMAP1 = wxNewId();
const long EditorObjet::ID_STATICTEXT2 = wxNewId();
const long EditorObjet::ID_TEXTCTRL2 = wxNewId();
const long EditorObjet::ID_STATICTEXT3 = wxNewId();
const long EditorObjet::ID_STATICTEXT4 = wxNewId();
const long EditorObjet::ID_RADIOBUTTON3 = wxNewId();
const long EditorObjet::ID_RADIOBUTTON4 = wxNewId();
const long EditorObjet::ID_STATICLINE2 = wxNewId();
const long EditorObjet::ID_BUTTON3 = wxNewId();
const long EditorObjet::ID_BUTTON5 = wxNewId();
const long EditorObjet::ID_BUTTON4 = wxNewId();
const long EditorObjet::ID_PANEL1 = wxNewId();
const long EditorObjet::idMenuAddEnd = wxNewId();
const long EditorObjet::idMenuAddAfter = wxNewId();
const long EditorObjet::idMenuAddBefore = wxNewId();
const long EditorObjet::idMenuAdd = wxNewId();
const long EditorObjet::idMenuAddMoreEnd = wxNewId();
const long EditorObjet::idMenuAddMoreAfter = wxNewId();
const long EditorObjet::idMenuAddMoreBefore = wxNewId();
const long EditorObjet::idMenuAddMulti = wxNewId();
const long EditorObjet::idMenuAddFromEnd = wxNewId();
const long EditorObjet::idMenuAddFromAfter = wxNewId();
const long EditorObjet::idMenuAddFromBefore = wxNewId();
const long EditorObjet::ID_MENUITEM1 = wxNewId();
const long EditorObjet::idMenuDel = wxNewId();
const long EditorObjet::idMenuDelAll = wxNewId();
const long EditorObjet::idMenuCopyFrom = wxNewId();
const long EditorObjet::idPosPoint = wxNewId();
const long EditorObjet::idPosPrecis = wxNewId();
const long EditorObjet::idMenuPosEverywhere = wxNewId();
const long EditorObjet::idMenuOptions = wxNewId();
const long EditorObjet::idAddPoint = wxNewId();
const long EditorObjet::idDelPoint = wxNewId();
//*)

const long EditorObjet::ID_BUTTONARRAY = wxNewId();
const long EditorObjet::ID_BITMAPARRAY = wxNewId();
const long EditorObjet::ID_EDITARRAY = wxNewId();

BEGIN_EVENT_TABLE( EditorObjet, wxDialog )
    //(*EventTable(EditorObjet)
    //*)
END_EVENT_TABLE()

EditorObjet::EditorObjet( wxWindow* parent, Game & game_, SpriteObject & object_, MainEditorCommand & mainEditorCommand_ ) :
animation(0),
direction(0),
position(0),
game(game_),
mainEditorCommand(mainEditorCommand_),
object(object_),
selectedImage(0),
placingPoint(false)
{
    //(*Initialize(EditorObjet)
    wxFlexGridSizer* FlexGridSizer16;
    wxFlexGridSizer* FlexGridSizer3;
    wxFlexGridSizer* FlexGridSizer5;
    wxFlexGridSizer* FlexGridSizer9;
    wxFlexGridSizer* FlexGridSizer2;
    wxBoxSizer* BoxSizer2;
    wxFlexGridSizer* FlexGridSizer7;
    wxFlexGridSizer* thumbsSizer;
    wxFlexGridSizer* FlexGridSizer15;
    wxFlexGridSizer* FlexGridSizer8;
    wxStaticBoxSizer* animationSizer;
    wxFlexGridSizer* FlexGridSizer14;
    wxFlexGridSizer* FlexGridSizer13;
    wxFlexGridSizer* FlexGridSizer12;
    wxFlexGridSizer* FlexGridSizer6;
    wxMenuItem* MenuItem21;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;
    wxFlexGridSizer* FlexGridSizer17;
    wxMenu* MenuItem17;

    Create(parent, wxID_ANY, _("Editer l\'objet"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX|wxMINIMIZE_BOX, _T("wxID_ANY"));
    SetClientSize(wxSize(356,215));
    wxIcon FrameIcon;
    FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/objeticon.png"))));
    SetIcon(FrameIcon);
    FlexGridSizer1 = new wxFlexGridSizer(1, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(0);
    Core = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    BoxSizer2 = new wxBoxSizer(wxVERTICAL);
    FlexGridSizer3 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(0);
    Panel2 = new wxPanel(Core, ID_PANEL2, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    Panel2->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOW));
    FlexGridSizer12 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT6, _("Objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer12->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObjetTxt = new wxStaticText(Panel2, ID_STATICTEXT1, _("Sans nom"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    wxFont NomObjetTxtFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    NomObjetTxt->SetFont(NomObjetTxtFont);
    FlexGridSizer12->Add(NomObjetTxt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel2->SetSizer(FlexGridSizer12);
    FlexGridSizer12->Fit(Panel2);
    FlexGridSizer12->SetSizeHints(Panel2);
    FlexGridSizer3->Add(Panel2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer2->Add(FlexGridSizer3, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine1 = new wxStaticLine(Core, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    BoxSizer2->Add(StaticLine1, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(1);
    animationSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Animation"));
    FlexGridSizer5 = new wxFlexGridSizer(1, 3, 0, 0);
    AnimationsBox = new wxChoice(Core, ID_CHOICE1, wxDefaultPosition, wxSize(139,21), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
    AnimationsBox->Append(_("Pas d\'animations"));
    FlexGridSizer5->Add(AnimationsBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    AddAnimBt = new wxButton(Core, ID_BUTTON1, _("Ajouter une animation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    AddAnimBt->SetToolTip(_("Ajoutez des animations à l\'objet avec ce bouton."));
    FlexGridSizer5->Add(AddAnimBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DelAnimBt = new wxButton(Core, ID_BUTTON2, _("Supprimer l\'animation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    DelAnimBt->SetToolTip(_("Supprime l\'animation actuelle."));
    FlexGridSizer5->Add(DelAnimBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    animationSizer->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(animationSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(0);
    animAndDirecSizer = new wxFlexGridSizer(0, 2, 0, 0);
    animAndDirecSizer->AddGrowableCol(1);
    animAndDirecSizer->AddGrowableRow(0);
    directionSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Direction"));
    FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
    NormalCheck = new wxCheckBox(Core, ID_CHECKBOX1, _("Normal"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    NormalCheck->SetValue(false);
    NormalCheck->SetToolTip(_("En mode normal, 8 directions sont disponibles.\nVous pouvez changer la direction de l\'objet en cours de jeu grâce aux actions du thème \"Direction\"."));
    FlexGridSizer6->Add(NormalCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    GridSizer3 = new wxGridSizer(3, 3, 0, 0);
    Bt5 = new wxToggleButton(Core, ID_TOGGLEBUTTON8, _("5"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON8"));
    GridSizer3->Add(Bt5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt6 = new wxToggleButton(Core, ID_TOGGLEBUTTON7, _("6"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON7"));
    GridSizer3->Add(Bt6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt7 = new wxToggleButton(Core, ID_TOGGLEBUTTON6, _("7"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON6"));
    GridSizer3->Add(Bt7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Bt4 = new wxToggleButton(Core, ID_TOGGLEBUTTON5, _("4"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON5"));
    GridSizer3->Add(Bt4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBitmap1 = new wxStaticBitmap(Core, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/direction.png")).Rescale(wxSize(25,25).GetWidth(),wxSize(25,25).GetHeight())), wxDefaultPosition, wxSize(25,25), 0, _T("ID_STATICBITMAP2"));
    GridSizer3->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt0 = new wxToggleButton(Core, ID_TOGGLEBUTTON1, _("0"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON1"));
    Bt0->SetValue(true);
    GridSizer3->Add(Bt0, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt3 = new wxToggleButton(Core, ID_TOGGLEBUTTON2, _("3"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON2"));
    GridSizer3->Add(Bt3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt2 = new wxToggleButton(Core, ID_TOGGLEBUTTON3, _("2"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON3"));
    GridSizer3->Add(Bt2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt1 = new wxToggleButton(Core, ID_TOGGLEBUTTON4, _("1"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON4"));
    GridSizer3->Add(Bt1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer6->Add(GridSizer3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    RotationCheck = new wxCheckBox(Core, ID_CHECKBOX2, _("Rotation automatique"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    RotationCheck->SetValue(false);
    RotationCheck->SetToolTip(_("En mode Rotation automatique, Game Develop fera tourner l\'objet suivant sa direction, de 0 à 360.\nVous pouvez changer la direction de l\'objet en cours de jeu grâce aux actions du thème \"Direction\"."));
    FlexGridSizer6->Add(RotationCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    directionSizer->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    animAndDirecSizer->Add(directionSizer, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
    imagesSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _("Images"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer7->AddGrowableRow(2);
    FlexGridSizer13 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer13->AddGrowableCol(0);
    FlexGridSizer13->AddGrowableRow(0);
    toolbarPanel = new wxPanel(Core, ID_PANEL6, wxDefaultPosition, wxSize(-1,25), wxTAB_TRAVERSAL, _T("ID_PANEL6"));
    FlexGridSizer13->Add(toolbarPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(FlexGridSizer13, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine3 = new wxStaticLine(Core, ID_STATICLINE3, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE3"));
    FlexGridSizer7->Add(StaticLine3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer15->AddGrowableCol(0);
    FlexGridSizer15->AddGrowableRow(0);
    FlexGridSizer17 = new wxFlexGridSizer(0, 2, 0, 0);
    FlexGridSizer17->AddGrowableCol(0);
    FlexGridSizer17->AddGrowableRow(0);
    imagePanel = new wxPanel(Core, ID_PANEL3, wxDefaultPosition, wxSize(307,160), wxSUNKEN_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    imagePanel->SetBackgroundColour(wxColour(128,128,128));
    imagePanel->SetToolTip(_("Aperçu de l\'image"));
    FlexGridSizer17->Add(imagePanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    scrollHeight = new wxScrollBar(Core, ID_SCROLLBAR1, wxDefaultPosition, wxDefaultSize, wxSB_VERTICAL, wxDefaultValidator, _T("ID_SCROLLBAR1"));
    scrollHeight->SetScrollbar(0, 1, 10, 1);
    FlexGridSizer17->Add(scrollHeight, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    scrollWidth = new wxScrollBar(Core, ID_SCROLLBAR3, wxDefaultPosition, wxDefaultSize, wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR3"));
    scrollWidth->SetScrollbar(0, 1, 10, 1);
    FlexGridSizer17->Add(scrollWidth, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer15->Add(FlexGridSizer17, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(FlexGridSizer15, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    thumbsSizer = new wxFlexGridSizer(0, 1, 0, 0);
    thumbsSizer->AddGrowableCol(0);
    Panel1 = new wxPanel(Core, ID_PANEL5, wxDefaultPosition, wxDefaultSize, wxRAISED_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL5"));
    FlexGridSizer16 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer16->AddGrowableCol(0);
    thumbsPanel = new wxPanel(Panel1, ID_PANEL4, wxDefaultPosition, wxSize(296,54), wxNO_BORDER|wxTAB_TRAVERSAL, _T("ID_PANEL4"));
    thumbsPanel->SetBackgroundColour(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWFRAME));
    thumbsPanel->SetToolTip(_("Liste des images de la direction.\nUtilisez le clic droit ou la barre d\'outils pour modifier les images."));
    FlexGridSizer16->Add(thumbsPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    thumbsScroll = new wxScrollBar(Panel1, ID_SCROLLBAR2, wxDefaultPosition, wxSize(296,17), wxSB_HORIZONTAL, wxDefaultValidator, _T("ID_SCROLLBAR2"));
    thumbsScroll->SetScrollbar(0, 1, 10, 1);
    FlexGridSizer16->Add(thumbsScroll, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(FlexGridSizer16);
    FlexGridSizer16->Fit(Panel1);
    FlexGridSizer16->SetSizeHints(Panel1);
    thumbsSizer->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(thumbsSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer8 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer9 = new wxFlexGridSizer(0, 4, 0, 0);
    CheckTempsEntreImg = new wxStaticBitmap(Core, ID_STATICBITMAP1, wxNullBitmap, wxDefaultPosition, wxSize(16,16), 0, _T("ID_STATICBITMAP1"));
    FlexGridSizer9->Add(CheckTempsEntreImg, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText2 = new wxStaticText(Core, ID_STATICTEXT2, _("Temps entre chaque image :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer9->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    TempsEdit = new wxTextCtrl(Core, ID_TEXTCTRL2, _("1"), wxDefaultPosition, wxSize(68,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    TempsEdit->SetToolTip(_("Utilisez le point ( . ) pour entrer des valeurs intermédiaires :\n0.35, 1.75..."));
    FlexGridSizer9->Add(TempsEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(Core, ID_STATICTEXT3, _("secondes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer9->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText1 = new wxStaticText(Core, ID_STATICTEXT4, _("Répéter les images :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer11->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoucleOuiCheck = new wxRadioButton(Core, ID_RADIOBUTTON3, _("Oui"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
    BoucleOuiCheck->SetToolTip(_("Après la dernière image, l\'animation reprendra du départ."));
    FlexGridSizer11->Add(BoucleOuiCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoucleNonCheck = new wxRadioButton(Core, ID_RADIOBUTTON4, _("Non"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON4"));
    BoucleNonCheck->SetValue(true);
    BoucleNonCheck->SetToolTip(_("Une fois l\'animation arrivée à la dernière image, elle s\'arrêtera à celle ci."));
    FlexGridSizer11->Add(BoucleNonCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer11, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer7->Add(FlexGridSizer8, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    imagesSizer->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    animAndDirecSizer->Add(imagesSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer10->Add(animAndDirecSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(FlexGridSizer10, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    BoxSizer2->Add(FlexGridSizer4, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticLine2 = new wxStaticLine(Core, ID_STATICLINE2, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE2"));
    BoxSizer2->Add(StaticLine2, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer14 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer14->AddGrowableCol(0);
    ListImageBt = new wxButton(Core, ID_BUTTON3, _("Afficher la banque d\'images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    ListImageBt->SetToolTip(_("Consulter et/ou éditer la banque d\'image."));
    FlexGridSizer14->Add(ListImageBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    OkBt = new wxButton(Core, ID_BUTTON5, _("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer14->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(Core, ID_BUTTON4, _("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer14->Add(AideBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer2->Add(FlexGridSizer14, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2->Add(BoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Core->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Core);
    FlexGridSizer2->SetSizeHints(Core);
    FlexGridSizer1->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem1 = new wxMenu();
    MenuItem2 = new wxMenuItem(MenuItem1, idMenuAddEnd, _("...à la fin"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/2rightarrow.png"))));
    MenuItem1->Append(MenuItem2);
    MenuItem3 = new wxMenuItem(MenuItem1, idMenuAddAfter, _("...après celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem3->SetBitmap(wxBitmap(wxImage(_T("res/1rightarrow.png"))));
    MenuItem1->Append(MenuItem3);
    MenuItem4 = new wxMenuItem(MenuItem1, idMenuAddBefore, _("...avant celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/1leftarrow.png"))));
    MenuItem1->Append(MenuItem4);
    contextMenu.Append(idMenuAdd, _("Ajouter une image..."), MenuItem1, wxEmptyString);
    MenuItem5 = new wxMenu();
    MenuItem8 = new wxMenuItem(MenuItem5, idMenuAddMoreEnd, _("...à la fin"), wxEmptyString, wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/2rightarrow.png"))));
    MenuItem5->Append(MenuItem8);
    MenuItem9 = new wxMenuItem(MenuItem5, idMenuAddMoreAfter, _("...après celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/1rightarrow.png"))));
    MenuItem5->Append(MenuItem9);
    MenuItem10 = new wxMenuItem(MenuItem5, idMenuAddMoreBefore, _("...avant celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/1leftarrow.png"))));
    MenuItem5->Append(MenuItem10);
    contextMenu.Append(idMenuAddMulti, _("Ajouter plusieurs images"), MenuItem5, wxEmptyString);
    MenuItem6 = new wxMenu();
    MenuItem11 = new wxMenuItem(MenuItem6, idMenuAddFromEnd, _("...à la fin"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/2rightarrow.png"))));
    MenuItem6->Append(MenuItem11);
    MenuItem12 = new wxMenuItem(MenuItem6, idMenuAddFromAfter, _("...après celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/1rightarrow.png"))));
    MenuItem6->Append(MenuItem12);
    MenuItem13 = new wxMenuItem(MenuItem6, idMenuAddFromBefore, _("...avant celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/1leftarrow.png"))));
    MenuItem6->Append(MenuItem13);
    contextMenu.Append(ID_MENUITEM1, _("Ajouter l\'image selectionnée dans la banque d\'image"), MenuItem6, wxEmptyString);
    contextMenu.AppendSeparator();
    MenuItem7 = new wxMenuItem((&contextMenu), idMenuDel, _("Supprimer l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    contextMenu.Append(MenuItem7);
    MenuItem14 = new wxMenuItem((&contextMenu), idMenuDelAll, _("Supprimer toutes les images"), wxEmptyString, wxITEM_NORMAL);
    contextMenu.Append(MenuItem14);
    contextMenu.AppendSeparator();
    MenuItem15 = new wxMenuItem((&contextMenu), idMenuCopyFrom, _("Copier toutes les images depuis..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem15->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    contextMenu.Append(MenuItem15);
    MenuItem16 = new wxMenuItem((&imageContextMenu), idPosPoint, _("Positionner un point"), wxEmptyString, wxITEM_NORMAL);
    MenuItem16->SetBitmap(wxBitmap(wxImage(_T("res/pointmod.png"))));
    imageContextMenu.Append(MenuItem16);
    MenuItem19 = new wxMenuItem((&imageContextMenu), idPosPrecis, _("Positionner précisement un point"), wxEmptyString, wxITEM_NORMAL);
    imageContextMenu.Append(MenuItem19);
    MenuItem17 = new wxMenu();
    posEverywhereMenuItem = new wxMenuItem(MenuItem17, idMenuPosEverywhere, _("Positionner le point sur les autres images de la direction"), wxEmptyString, wxITEM_CHECK);
    MenuItem17->Append(posEverywhereMenuItem);
    imageContextMenu.Append(idMenuOptions, _("Options"), MenuItem17, wxEmptyString);
    imageContextMenu.AppendSeparator();
    MenuItem21 = new wxMenuItem((&imageContextMenu), idAddPoint, _("Ajouter un point"), wxEmptyString, wxITEM_NORMAL);
    MenuItem21->SetBitmap(wxBitmap(wxImage(_T("res/pointadd.png"))));
    imageContextMenu.Append(MenuItem21);
    MenuItem18 = new wxMenuItem((&imageContextMenu), idDelPoint, _("Supprimer un point"), wxEmptyString, wxITEM_NORMAL);
    MenuItem18->SetBitmap(wxBitmap(wxImage(_T("res/pointdel.png"))));
    imageContextMenu.Append(MenuItem18);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_CHOICE1,wxEVT_COMMAND_CHOICE_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAnimationsBoxSelect);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnAddAnimBtClick);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnDelAnimBtClick);
    Connect(ID_CHECKBOX1,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditorObjet::OnNormalCheckSelect);
    Connect(ID_TOGGLEBUTTON8,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt5Toggle);
    Connect(ID_TOGGLEBUTTON7,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt6Toggle);
    Connect(ID_TOGGLEBUTTON6,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt7Toggle);
    Connect(ID_TOGGLEBUTTON5,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt4Toggle);
    Connect(ID_TOGGLEBUTTON1,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt0Toggle);
    Connect(ID_TOGGLEBUTTON2,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt3Toggle);
    Connect(ID_TOGGLEBUTTON3,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt2Toggle);
    Connect(ID_TOGGLEBUTTON4,wxEVT_COMMAND_TOGGLEBUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnBt1Toggle);
    Connect(ID_CHECKBOX2,wxEVT_COMMAND_CHECKBOX_CLICKED,(wxObjectEventFunction)&EditorObjet::OnRotationCheckSelect);
    toolbarPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjet::OntoolbarPanelResize,0,this);
    imagePanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EditorObjet::OnimagePanelPaint,0,this);
    imagePanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EditorObjet::OnimagePanelEraseBackground,0,this);
    imagePanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EditorObjet::OnimagePanelLeftUp,0,this);
    imagePanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&EditorObjet::OnimagePanelRightUp,0,this);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollHeightScroll);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollHeightScroll);
    Connect(ID_SCROLLBAR3,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollWidthScroll);
    Connect(ID_SCROLLBAR3,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollWidthScroll);
    thumbsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelPaint,0,this);
    thumbsPanel->Connect(wxEVT_ERASE_BACKGROUND,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelEraseBackground,0,this);
    thumbsPanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelLeftUp,0,this);
    thumbsPanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelRightUp,0,this);
    thumbsPanel->Connect(wxEVT_SIZE,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelResize,0,this);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnthumbsScrollScroll);
    Connect(ID_SCROLLBAR2,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnthumbsScrollScroll);
    Connect(ID_TEXTCTRL2,wxEVT_COMMAND_TEXT_UPDATED,(wxObjectEventFunction)&EditorObjet::OnTempsEditText);
    Connect(ID_RADIOBUTTON3,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditorObjet::OnBoucleOuiCheckSelect);
    Connect(ID_RADIOBUTTON4,wxEVT_COMMAND_RADIOBUTTON_SELECTED,(wxObjectEventFunction)&EditorObjet::OnBoucleNonCheckSelect);
    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnButton1Click);
    Connect(ID_BUTTON5,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnOkBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&EditorObjet::OnAideBtClick);
    Connect(idMenuAddEnd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddImageEndSelected);
    Connect(idMenuAddAfter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddImageAfterSelected);
    Connect(idMenuAddBefore,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddImageBeforeSelected);
    Connect(idMenuAddMoreEnd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreEndSelected);
    Connect(idMenuAddMoreAfter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreAfterSelected);
    Connect(idMenuAddMoreBefore,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreBeforeSelected);
    Connect(idMenuAddFromEnd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromEndSelected);
    Connect(idMenuAddFromAfter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromAfterSelected);
    Connect(idMenuAddFromBefore,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromBeforeSelected);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDeleteSelected);
    Connect(idMenuDelAll,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDeleteAllBtClick);
    Connect(idMenuCopyFrom,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnCopyBtClick);
    Connect(idPosPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModPointSelected);
    Connect(idPosPrecis,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModPointPrecisSelected);
    Connect(idAddPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddPointSelected);
    Connect(idDelPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDelPointSelected);
    //*)

    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                             wxTB_FLAT | wxTB_NODIVIDER | wxTB_HORIZONTAL );

    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idMenuAddEnd, wxT( "Ajouter une image à la fin" ), wxBitmap( wxImage( "res/addicon.png" ) ), _( "Ajouter une image à la fin" ) );
    toolbar->AddTool( idMenuAddFromEnd, wxT( "Ajouter une image à la fin depuis la banque d'image" ), wxBitmap( wxImage( "res/addfromimagebanque.png" ) ), _( "Ajouter une image à la fin depuis la banque d'image" ) );
    toolbar->AddTool( idMenuDel, wxT( "Supprimer l'image selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _( "Supprimer l'image selectionnée" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idMenuCopyFrom, wxT( "Copier les images depuis une animation/direction" ), wxBitmap( wxImage( "res/copyicon.png" ) ), _( "Copier les images depuis une animation/direction" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idPosPoint, wxT( "Positionner un point" ), wxBitmap( wxImage( "res/pointmod.png" ) ), _( "Positionner un point" ) );
    toolbar->AddTool( idAddPoint, wxT( "Ajouter un point" ), wxBitmap( wxImage( "res/pointadd.png" ) ), _( "Ajouter un point" ) );
    toolbar->AddTool( idDelPoint, wxT( "Supprimer un point" ), wxBitmap( wxImage( "res/pointdel.png" ) ), _( "Supprimer un point" ) );
    toolbar->Realize();

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    NomObjetTxt->SetLabel( object.GetName() );

    //On vérifie si on est pas en mode simple.
    wxConfigBase * pConfig = wxConfigBase::Get();

    bool result = false;
    pConfig->Read("/ModeSimple", &result);

    if ( result )
    {
        toolbar->EnableTool(idPosPoint, false);
        toolbar->EnableTool(idAddPoint, false);
        toolbar->EnableTool(idDelPoint, false);
        toolbar->EnableTool(idMenuCopyFrom, false);
        MenuItem11->Enable(false);
        MenuItem12->Enable(false);
        MenuItem13->Enable(false);
        MenuItem15->Enable(false);
        MenuItem16->Enable(false);
        MenuItem21->Enable(false);
        MenuItem18->Enable(false);
        MenuItem19->Enable(false);
        posEverywhereMenuItem->Enable(false);
    }

    m_mgr.SetManagedWindow( this );

    editorImagesPnl = new EditorImages( this, game, mainEditorCommand );
    editorImagesPnl->Refresh();

    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( editorImagesPnl, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _( "Editeur de la banque d'images" ) ).MaximizeButton( true ).MinimizeButton( false ).Show(false).MinSize(150, 100) );

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();

    RefreshFromObjet();
    Core->Layout();
    Center();
}

EditorObjet::~EditorObjet()
{
    //(*Destroy(EditorObjet)
    //*)

    m_mgr.UnInit();
}

////////////////////////////////////////////////////////////
/// Rafraichit les controles
///
/// Rafraichit les controles ( Animation, type de direction ) en fonction de l'objet
////////////////////////////////////////////////////////////
void EditorObjet::RefreshFromObjet()
{
    //Les animations
    AnimationsBox->Clear();
    for ( unsigned int i = 0;i < object.GetAnimationsNumber();i++ )
    {
        string num = st( i );
        AnimationsBox->Append( num );
    }
    if ( !object.HasNoAnimations() )
    {
        AnimationsBox->SetSelection( animation );
        animAndDirecSizer->Show(directionSizer);
        animAndDirecSizer->Show(imagesSizer);
    }
    else //Pas d'animations
    {
        AnimationsBox->SetSelection( -1 );
        NormalCheck->SetValue( true );
        RotationCheck->SetValue( false );
        Bt0->Enable( true );
        Bt1->Enable( true );
        Bt2->Enable( true );
        Bt3->Enable( true );
        Bt4->Enable( true );
        Bt5->Enable( true );
        Bt6->Enable( true );
        Bt7->Enable( true );
        animAndDirecSizer->Show(directionSizer, false);
        animAndDirecSizer->Show(imagesSizer, false);
    }


    RefreshImages();
}

void EditorObjet::OnScrollBar1Scroll( wxScrollEvent& event )
{
    position = event.GetPosition();
    printf( "%i", position );

    RefreshImages();
}


////////////////////////////////////////////////////////////
/// Rafraichir les images
///
/// Rafraichit la liste des images en fonction de la position
////////////////////////////////////////////////////////////
void EditorObjet::RefreshImages()
{
    //La valeur des boutons par défaut
    NormalCheck->SetValue( true );
    RotationCheck->SetValue( false );
    Bt0->Enable( true );
    Bt1->Enable( true );
    Bt2->Enable( true );
    Bt3->Enable( true );
    Bt4->Enable( true );
    Bt5->Enable( true );
    Bt6->Enable( true );
    Bt7->Enable( true );

    if ( animation < object.GetAnimationsNumber() )
    {
        if ( direction < 0 ) return;

        //On ajoute des directions à l'objet si besoin
        if ( static_cast<unsigned>(direction) >= object.GetAnimation( animation ).GetDirectionsNumber() )
            object.GetAnimation( animation ).SetDirectionsNumber(direction+1);

        //Type de directions
        if ( !object.GetAnimation( animation ).typeNormal )
        {
            RotationCheck->SetValue( true );
            NormalCheck->SetValue( false );
            Bt0->Enable( false );
            Bt1->Enable( false );
            Bt2->Enable( false );
            Bt3->Enable( false );
            Bt4->Enable( false );
            Bt5->Enable( false );
            Bt6->Enable( false );
            Bt7->Enable( false );
        }

        if ( direction < object.GetAnimation( animation ).GetDirectionsNumber() )
        {
            //Temps
            TempsEdit->SetValue( stFromFloat( object.GetAnimation( animation ).GetDirection( direction ).GetTimeBetweenFrames() ) );

            //Boucle
            if ( object.GetAnimation( animation ).GetDirection( direction ).IsLooping() )
            {
                BoucleOuiCheck->SetValue( true );
                BoucleNonCheck->SetValue( false );
            }
            else
            {
                BoucleOuiCheck->SetValue( false );
                BoucleNonCheck->SetValue( true );
            }
        }
    }

    //Rafraichissement du reste
    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
    Core->Layout();
}

void EditorObjet::OnBt0Toggle( wxCommandEvent& event )
{
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );

    direction = 0;
    RefreshImages();
}

void EditorObjet::OnBt1Toggle( wxCommandEvent& event )
{
    Bt0->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );
    direction = 1;
    RefreshImages();
}

void EditorObjet::OnBt2Toggle( wxCommandEvent& event )
{
    Bt0->SetValue( false );
    Bt1->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );
    direction = 2;
    RefreshImages();
}

void EditorObjet::OnBt3Toggle( wxCommandEvent& event )
{
    Bt0->SetValue( false );
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );
    direction = 3;
    RefreshImages();
}

void EditorObjet::OnBt4Toggle( wxCommandEvent& event )
{
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt0->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );
    direction = 4;
    RefreshImages();
}

void EditorObjet::OnBt5Toggle( wxCommandEvent& event )
{
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt0->SetValue( false );
    Bt6->SetValue( false );
    Bt7->SetValue( false );
    direction = 5;
    RefreshImages();
}

void EditorObjet::OnBt6Toggle( wxCommandEvent& event )
{
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt0->SetValue( false );
    Bt7->SetValue( false );
    direction = 6;
    RefreshImages();
}

void EditorObjet::OnBt7Toggle( wxCommandEvent& event )
{
    Bt1->SetValue( false );
    Bt2->SetValue( false );
    Bt3->SetValue( false );
    Bt4->SetValue( false );
    Bt5->SetValue( false );
    Bt6->SetValue( false );
    Bt0->SetValue( false );
    direction = 7;
    RefreshImages();
}

void EditorObjet::OnAddAnimBtClick( wxCommandEvent& event )
{
    Animation AnimToadd;
    object.AddAnimation( AnimToadd );

    string num = st( object.GetAnimationsNumber() - 1 );

    AnimationsBox->Append( num );

    RefreshFromObjet();
}

void EditorObjet::OnDelAnimBtClick( wxCommandEvent& event )
{
    int animNb = AnimationsBox->GetSelection();
    if ( animNb == wxNOT_FOUND )
        return;

    if ( static_cast<unsigned>(animNb) < object.GetAnimationsNumber() && animNb > -1 )
        object.RemoveAnimation( animNb );

    animation--;

    RefreshFromObjet();
}

void EditorObjet::OnAnimationsBoxSelect( wxCommandEvent& event )
{
    animation = AnimationsBox->GetSelection();

    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Changement valeur tempsEntre
///
/// Changement de la valeur du temps entre les images
////////////////////////////////////////////////////////////
void EditorObjet::OnTempsEditText( wxCommandEvent& event )
{

    string num = ( string ) TempsEdit->GetValue();
    std::istringstream iss( num );
    float tmp;
    // tenter la conversion et
    // vérifier qu'il ne reste plus rien dans la chaîne
    if (( iss >> tmp ) && ( iss.eof() ) )
    {
        if ( animation < object.GetAnimationsNumber() )
        {
            if ( direction < object.GetAnimation( animation ).GetDirectionsNumber() )
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).SetTimeBetweenFrames( tmp );
            }
        }

        CheckTempsEntreImg->SetBitmap( wxBitmap( "res/ok.png", wxBITMAP_TYPE_ANY ) );
    }
    else
    {
        CheckTempsEntreImg->SetBitmap( wxBitmap( "res/error.png", wxBITMAP_TYPE_ANY ) );
    }

}

////////////////////////////////////////////////////////////
/// Clic sur le bouton Oui
///
/// Change le bouclage de la direction en true
////////////////////////////////////////////////////////////
void EditorObjet::OnBoucleOuiCheckSelect( wxCommandEvent& event )
{
    if ( animation < object.GetAnimationsNumber() )
    {
        if ( direction < object.GetAnimation( animation ).GetDirectionsNumber() )
        {
            object.GetAnimation( animation ).GetDirectionToModify( direction ).SetLoop( true );
        }
    }
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton Non
///
/// Change le bouclage de la direction en false
////////////////////////////////////////////////////////////
void EditorObjet::OnBoucleNonCheckSelect( wxCommandEvent& event )
{
    if ( animation < object.GetAnimationsNumber() )
    {
        if ( direction < object.GetAnimation( animation ).GetDirectionsNumber() )
        {
            object.GetAnimation( animation ).GetDirectionToModify( direction ).SetLoop( false );
        }
    }
}

/**
 * Display Image Editor
 */
void EditorObjet::OnButton1Click( wxCommandEvent& event )
{
    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
        SetSize(GetSize().GetWidth()+150, GetSize().GetHeight());

    m_mgr.GetPane( editorImagesPnl ).Show();
    m_mgr.Update();
}

void EditorObjet::OnRotationCheckSelect( wxCommandEvent& event )
{
    if ( !RotationCheck->GetValue() ) //Imitation d'un radio button
    {
        RotationCheck->SetValue( true );
        return;
    }
    NormalCheck->SetValue( false );

    if ( animation < object.GetAnimationsNumber() )
    {
        object.GetAnimation( animation ).typeNormal = false;
    }
    Bt0->Enable( false );
    Bt1->Enable( false );
    Bt2->Enable( false );
    Bt3->Enable( false );
    Bt4->Enable( false );
    Bt5->Enable( false );
    Bt6->Enable( false );
    Bt7->Enable( false );
}

void EditorObjet::OnNormalCheckSelect( wxCommandEvent& event )
{
    if ( !NormalCheck->GetValue() ) //Imitation d'un radio button
    {
        NormalCheck->SetValue( true );
        return;
    }
    RotationCheck->SetValue( false );

    if ( animation < object.GetAnimationsNumber() )
    {
        object.GetAnimation( animation ).typeNormal = true;
    }
    Bt0->Enable( true );
    Bt1->Enable( true );
    Bt2->Enable( true );
    Bt3->Enable( true );
    Bt4->Enable( true );
    Bt5->Enable( true );
    Bt6->Enable( true );
    Bt7->Enable( true );

}

void EditorObjet::OnAideBtClick( wxCommandEvent& event )
{
    HelpFileAccess * helpFileAccess = HelpFileAccess::getInstance();
    helpFileAccess->DisplaySection(47);
}

void EditorObjet::OnOkBtClick(wxCommandEvent& event)
{
    EndModal(0);
}


////////////////////////////////////////////////////////////
/// Suppression de toutes les images
////////////////////////////////////////////////////////////
void EditorObjet::OnDeleteAllBtClick(wxCommandEvent& event)
{
    if (wxMessageBox("Etes-vous sûr de vouloir supprimer toutes les images ?", "Êtes vous sur ?",wxYES_NO ) == wxYES)
    {
        if ( animation < object.GetAnimationsNumber() )
        {
            if ( direction < object.GetAnimation( animation ).GetDirectionsNumber() )
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).RemoveAllSprites();
            }
        }
    }

    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Ajout rapide de plusieurs images
////////////////////////////////////////////////////////////
void EditorObjet::OnAjoutPlusBtClick(wxCommandEvent& event)
{
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 1 )
    {
        //Ajout des images
        if ( animation < object.GetAnimationsNumber() && direction < object.GetAnimation( animation ).GetDirectionsNumber())
        {
            for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
            {
                Sprite sprite;
                sprite.SetImage(dialog.ImagesToAdd.at(i));
            	object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);
            }
        }
    }
    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Copier les images d'une animation/direction à la place de celle ci
////////////////////////////////////////////////////////////
void EditorObjet::OnCopyBtClick(wxCommandEvent& event)
{

    if (object.GetAnimationsNumber() == 0)
        return;

    int anim = wxGetNumberFromUser( "Animation à copier", "", "Entrez le numéro de l'animation dans laquelle se trouve la direction à copier", 0, 0, object.GetAnimationsNumber()-1, this);
    int direc = 0;

    if (anim == -1)
        return;

    if (object.GetAnimation( anim ).typeNormal)
    {
        direc = wxGetNumberFromUser( "Direction à copier", "", "Entrez le numéro de la direction dans laquelle se trouve les images à copier", 0, 0, object.GetAnimation( anim ).GetDirectionsNumber()-1, this);
        if (direc == -1)
            return;
    }

    object.GetAnimation( animation ).GetDirectionToModify( direction ).SetSprites( object.GetAnimation(anim).GetDirection(direc).GetSprites() );
    object.GetAnimation( animation ).GetDirectionToModify( direction ).SetLoop( object.GetAnimation(anim).GetDirection(direc).IsLooping() );
    object.GetAnimation( animation ).GetDirectionToModify( direction ).SetTimeBetweenFrames( object.GetAnimation(anim).GetDirection(direc).GetTimeBetweenFrames() );

    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Mise à jour de la barre de miniatures si redimensionnement
////////////////////////////////////////////////////////////
void EditorObjet::OnthumbsPanelResize(wxSizeEvent& event)
{
    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Mise à jour de la barre de miniatures
////////////////////////////////////////////////////////////
void EditorObjet::OnthumbsPanelPaint(wxPaintEvent& event)
{
    thumbsPanel->SetBackgroundStyle( wxBG_STYLE_PAINT );
    wxPaintDC dc( thumbsPanel ); //Création obligatoire du wxBufferedPaintDC

    wxSize size = thumbsPanel->GetSize();

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    //Fond gris avec des flèches
    dc.SetPen(wxPen(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWFRAME )));
    dc.SetBrush(bitmapGUIManager->backthumbsBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    int decalage = thumbsScroll->GetThumbPosition();

    //Fond en damier pour les images
    dc.SetBrush(bitmapGUIManager->transparentBg);

    //Affichage des images
    const Direction & directionToDisplay = object.GetAnimation( animation ).GetDirection( direction );

    for (unsigned int i = 0;i<directionToDisplay.GetSpritesNumber();++i)
    {
        dc.SetPen(*wxBLACK_PEN);

        if ( selectedImage >= 0 && i == static_cast<unsigned>(selectedImage) )
            dc.SetPen(wxPen(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));
        dc.DrawRectangle(wxRect(2+i*48+i*3-decalage,2,50,50));

        //On cherche l'ID de l'image à afficher
        int j = ChercherNomImage( game.images, directionToDisplay.GetSprite(i).GetImage() );
        if ( j != -1 )
        {
            wxBitmap bmp( game.images.at( j ).fichier, wxBITMAP_TYPE_ANY);
            if ( bmp.GetWidth() != 48 || bmp.GetHeight() != 48 )
            {
                wxImage image = bmp.ConvertToImage();
                bmp = wxBitmap(image.Scale(48, 48));
            }

            dc.DrawBitmap(bmp, 2+i*48+i*3+1-decalage, 3, true);
        }
        else
        {
            dc.DrawBitmap(wxBitmap( "res/error48.png", wxBITMAP_TYPE_ANY ), 2+i*48+i*3+1-decalage, 3);
        }
    }
    if ( directionToDisplay.HasNoSprites() )
    {
        dc.SetFont(*wxNORMAL_FONT);
        dc.DrawLabel(_("Pas d'images. \nUtilisez le clic droit ou la barre d'outils pour ajouter des images."), wxRect(thumbsPanel->GetSize()),  wxALIGN_LEFT | wxALIGN_CENTER);
    }

    //Rafraichissement de la scrollbar
    thumbsScroll->SetScrollbar(thumbsScroll->GetThumbPosition(),
                               thumbsPanel->GetSize().GetWidth(),
                               (directionToDisplay.GetSpritesNumber())*48+(directionToDisplay.GetSpritesNumber())*3,
                               thumbsPanel->GetSize().GetWidth());
}

////////////////////////////////////////////////////////////
/// Scroll de la barre de miniatures
////////////////////////////////////////////////////////////
void EditorObjet::OnthumbsScrollScroll(wxScrollEvent& event)
{
    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Clic sur la barre de miniatures
////////////////////////////////////////////////////////////
void EditorObjet::OnthumbsPanelLeftUp(wxMouseEvent& event)
{
    int X = event.GetX() + thumbsScroll->GetThumbPosition()-2;
    selectedImage = X/(48+3);

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

void EditorObjet::OnthumbsPanelEraseBackground(wxEraseEvent& event)
{
}
void EditorObjet::OnimagePanelEraseBackground(wxEraseEvent& event)
{
}

////////////////////////////////////////////////////////////
/// Affichage de l'image selectionnée
////////////////////////////////////////////////////////////
void EditorObjet::OnimagePanelPaint(wxPaintEvent& event)
{
    imagePanel->SetBackgroundStyle( wxBG_STYLE_PAINT );
    wxPaintDC dc( imagePanel ); //Création obligatoire du wxBufferedPaintDC

    wxSize size = imagePanel->GetSize();

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::getInstance();

    //Fond en damier
    dc.SetBrush(bitmapGUIManager->transparentBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirection( direction ).GetSpritesNumber() )
    {
        const Sprite & sprite = object.GetAnimation( animation ).GetDirection( direction ).GetSprite(selectedImage);
        int j = ChercherNomImage( game.images, sprite.GetImage() );
        if ( j != -1 )
        {
            //Chargement de l'image
            wxBitmap bmp( game.images.at( j ).fichier, wxBITMAP_TYPE_ANY);
            wxBitmap point( bitmapGUIManager->point );

            scrollWidth->SetScrollbar(scrollWidth->GetThumbPosition(),
                                       size.GetWidth(),
                                       bmp.GetWidth(),
                                       size.GetWidth());

            scrollHeight->SetScrollbar(scrollHeight->GetThumbPosition(),
                                       size.GetHeight(),
                                       bmp.GetHeight(),
                                       size.GetHeight());

            int SpritePosX = (size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2;
            int SpritePosY = (size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2;

            dc.DrawBitmap(bmp, SpritePosX, SpritePosY, true /* use mask */); //Affichage de l'image

            //Affichage du point
            if ( sprite.HasPoint(selectedPoint))
            {
                dc.DrawBitmap(point,
                              sprite.GetPoint(selectedPoint).GetX() - point.GetWidth()/2 + ((size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2),
                              sprite.GetPoint(selectedPoint).GetY() - point.GetHeight()/2 + ((size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2),
                              true /* use mask */);
            }
        }
        else
        {
            dc.DrawBitmap(wxBitmap( "res/errorimage.png", wxBITMAP_TYPE_ANY ), 0, 0);
        }
    }
}

////////////////////////////////////////////////////////////
/// Clic droit sur la barre de miniatures
////////////////////////////////////////////////////////////
void EditorObjet::OnthumbsPanelRightUp(wxMouseEvent& event)
{
    //On vérifie que la banque d'image est affichée
    if ( m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        MenuItem11->Enable();
        MenuItem12->Enable();
        MenuItem13->Enable();
    }
    else
    {
        MenuItem11->Enable(false);
        MenuItem12->Enable(false);
        MenuItem13->Enable(false);
    }

    PopupMenu(&contextMenu);
}

////////////////////////////////////////////////////////////
/// Ajouter une image
////////////////////////////////////////////////////////////
void EditorObjet::OnAddImageEndSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    string nom = static_cast<string> (wxGetTextFromUser(_("Entrez le nom de l'image à ajouter"), _("Nom de l'image"), "", this));
    if ( nom != "" )
    {
        Sprite sprite;
        sprite.SetImage(nom);
        object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddImageAfterSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    string nom = static_cast<string> (wxGetTextFromUser(_("Entrez le nom de l'image à ajouter"), _("Nom de l'image"), "", this));
    if ( nom != "" )
    {
        Sprite sprite;
        sprite.SetImage(nom);
        vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

        if ( static_cast<unsigned>(selectedImage)+1 < sprites.size() )
            sprites.insert(sprites.begin() + selectedImage + 1, sprite);
        else
            sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddImageBeforeSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    string nom = static_cast<string> (wxGetTextFromUser(_("Entrez le nom de l'image à ajouter"), _("Nom de l'image"), "", this));
    if ( nom != "" )
    {
        Sprite sprite;
        sprite.SetImage(nom);
        vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

        if ( static_cast<unsigned>(selectedImage) < sprites.size() )
            sprites.insert(sprites.begin() + selectedImage, sprite);
        else
            sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddMoreEndSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImage(dialog.ImagesToAdd.at(i));
        object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddMoreAfterSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImage(dialog.ImagesToAdd.at(i));

        if ( static_cast<unsigned>(selectedImage)+1+i < sprites.size() )
            sprites.insert(sprites.begin() + selectedImage + 1 + i, sprite);
        else
            sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddMoreBeforeSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImage(dialog.ImagesToAdd.at(i));

        if ( static_cast<unsigned>(selectedImage)+i < sprites.size() )
            sprites.insert(sprites.begin() + selectedImage+i, sprite);
        else
            sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddFromEndSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        wxLogMessage(_("Affichez l'éditeur de la banque d'image, et sélectionnez une image avant de cliquer sur ce bouton."));
        return;
    }

    string nom = static_cast<string>(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected));
    if ( nom == _("Toutes les images") || nom == "" ) return;

    Sprite sprite;
    sprite.SetImage(nom);
    object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddFromAfterSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    string nom = static_cast<string>(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected));
    if ( nom == _("Toutes les images") || nom == "" ) return;

    Sprite sprite;
    sprite.SetImage(nom);

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    if ( static_cast<unsigned>(selectedImage)+1 < sprites.size() )
    {
        sprites.insert(sprites.begin() + selectedImage+1, sprite);
    }
    else
    {
        sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddFromBeforeSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    string nom = static_cast<string>(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected));
    if ( nom == _("Toutes les images") || nom == "" ) return;

    Sprite sprite;
    sprite.SetImage(nom);

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    if ( static_cast<unsigned>(selectedImage) < sprites.size() )
    {
        sprites.insert(sprites.begin() + selectedImage, sprite);
    }
    else
    {
        sprites.push_back(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnDeleteSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < sprites.size() )
        sprites.erase(sprites.begin() + selectedImage);

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}


////////////////////////////////////////////////////////////
/// Redimensionnement de la toolbar : Mise à jour
////////////////////////////////////////////////////////////
void EditorObjet::OntoolbarPanelResize(wxSizeEvent& event)
{
    toolbar->SetSize(toolbarPanel->GetSize().x, -1);
}

////////////////////////////////////////////////////////////
/// Rafraichissement de l'aperçu quand on se déplace avec la scrollbar
////////////////////////////////////////////////////////////
void EditorObjet::OnscrollHeightScroll(wxScrollEvent& event)
{
    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Rafraichissement de l'aperçu quand on se déplace avec la scrollbar
////////////////////////////////////////////////////////////
void EditorObjet::OnscrollWidthScroll(wxScrollEvent& event)
{
    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Clic droit sur l'aperçu
////////////////////////////////////////////////////////////
void EditorObjet::OnimagePanelRightUp(wxMouseEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
        PopupMenu(&imageContextMenu);
}

////////////////////////////////////////////////////////////
/// Clic gauche
////////////////////////////////////////////////////////////
void EditorObjet::OnimagePanelLeftUp(wxMouseEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( placingPoint && selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size())
    {
        Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(selectedImage);

        int j = ChercherNomImage( game.images, sprite.GetImage() );
        if ( j == -1 ) return;

        //Tailles nécessaire pour placer le point
        wxSize size = imagePanel->GetSize();
        wxBitmap bmp( game.images.at( j ).fichier, wxBITMAP_TYPE_ANY);

        int SpritePosX = (size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2;
        int SpritePosY = (size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2;

        MovePoint(sprite, selectedPoint, event.GetX() - SpritePosX, event.GetY() - SpritePosY);

        //Repositionnement pour les autres sprites si besoin
        if ( posEverywhereMenuItem->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesNumber();++i)
            {
                MovePoint(object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(i),
                          selectedPoint, event.GetX() - SpritePosX, event.GetY() - SpritePosY);
            }
        }
    }

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Choisir le point à placer
////////////////////////////////////////////////////////////
void EditorObjet::OnModPointSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
    {
        Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(selectedImage);

        wxArrayString points;
        points.Add("Origin");
        points.Add("Centre");
        for (unsigned int i =0;i<sprite.GetNonDefaultPoints().size();++i)
        	points.Add(sprite.GetNonDefaultPoints().at(i).GetName());

        string name = static_cast<string>(wxGetSingleChoice(_("Choisissez le point à éditer.\nVous pourrez ensuite le placer en faisant un clic gauche sur l'image."), _("Choisir le point à positionner"), points));
        if ( name == "" ) return;
        if ( name == "Centre" )
        {
            if (wxMessageBox(_("Le point centre peut être positionné automatiquement par Game Develop au centre (comportement par défaut).\nVoulez vous modifier ce point ?\nCliquez sur oui pour le modifier, cliquez sur non pour que Game Develop le place automatiquement."),
                           _("Position du point \"Centre\""), wxYES_NO ) == wxNO)
            {
                sprite.SetCentreAutomatic(true);

                imagePanel->Refresh();
                imagePanel->Update(); //Immédiatement

                return;
            }
            sprite.SetCentreAutomatic(false);
        }

        placingPoint = true;
        selectedPoint = name;
    }

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Placer un point de façon précise
////////////////////////////////////////////////////////////
void EditorObjet::OnModPointPrecisSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
    {
        Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(selectedImage);

        //Choix du point
        wxArrayString points;
        points.Add("Origin");
        points.Add("Centre");
        for (unsigned int i =0;i<sprite.GetNonDefaultPoints().size();++i)
        	points.Add(sprite.GetNonDefaultPoints().at(i).GetName());

        string name = static_cast<string>(wxGetSingleChoice(_("Choisissez le point à éditer.\nVous pourrez ensuite le placer en faisant un clic gauche sur l'image."), _("Choisir le point à positionner"), points));
        if ( name == "" ) return;
        if ( name == "Centre" )
        {
            if (wxMessageBox(_("Le point centre peut être positionné automatiquement par Game Develop au centre (comportement par défaut).\nVoulez vous modifier ce point ?\nCliquez sur oui pour le modifier, cliquez sur non pour que Game Develop le place automatiquement."),
                           _("Position du point \"Centre\""), wxYES_NO ) == wxNO)
            {
                sprite.SetCentreAutomatic(true);

                imagePanel->Refresh();
                imagePanel->Update(); //Immédiatement

                return;
            }
            sprite.SetCentreAutomatic(false);
        }

        selectedPoint = name;

        string x_str = static_cast<string>(wxGetTextFromUser(_("Entrez la position X du point par rapport à l'image"), "Position X du point", st(sprite.GetPoint(name).GetX())));
        string y_str = static_cast<string>(wxGetTextFromUser(_("Entrez la position Y du point par rapport à l'image"), "Position Y du point", st(sprite.GetPoint(name).GetY())));

        MovePoint(sprite, name, toInt(x_str), toInt(y_str));

        //Repositionnement pour les autres sprites si besoin
        if ( posEverywhereMenuItem->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesNumber();++i)
            {
                MovePoint(object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(i),
                          name, toInt(x_str), toInt(y_str));
            }
        }
    }

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

void EditorObjet::MovePoint(Sprite & sprite, string pointName, int X, int Y)
{
    //Vérification de la validité
    if ( !sprite.HasPoint(pointName) )
        sprite.AddPoint(pointName);

    Point & point = sprite.ModPoint(pointName);

    point.SetX(X);
    point.SetY(Y);
}


////////////////////////////////////////////////////////////
/// Ajouter un point
////////////////////////////////////////////////////////////
void EditorObjet::OnAddPointSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
    {
        Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(selectedImage);

        string name = static_cast<string>(wxGetTextFromUser(_("Entrez le nom du nouveau point"), _("Création d'un point")));
        if ( name == "" ) return;
        if ( sprite.HasPoint(name) )
        {
            wxLogMessage(_("Un point ayant ce nom existe déjà !"));
            return;
        }

        sprite.AddPoint(name);
        if (wxMessageBox(_("Voulez vous ajouter ce point à toutes les images de la direction ?"),
                       _("Ajouter ce point à toutes les images"), wxYES_NO ) == wxYES)
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
            	object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(i).AddPoint(name);
            }
        }

    }
}

////////////////////////////////////////////////////////////
/// Supprimer un point
////////////////////////////////////////////////////////////
void EditorObjet::OnDelPointSelected(wxCommandEvent& event)
{
    if ( animation >= object.GetAnimationsNumber() || animation < 0)
        return;

    if ( direction >= object.GetAnimation( animation ).GetDirectionsNumber() || direction < 0)
        return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
    {
        Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(selectedImage);

        wxArrayString points;
        for (unsigned int i =0;i<sprite.GetNonDefaultPoints().size();++i)
        	points.Add(sprite.GetNonDefaultPoints().at(i).GetName());

        if ( points.IsEmpty() )
        {
            wxLogMessage(_("Aucun point à éditer. Ajoutez un point avant de pouvoir le positionner."));
            return;
        }

        string name = static_cast<string>(wxGetSingleChoice(_("Choisissez le point à éditer."), _("Choisir le point à positionner"), points));
        if ( name == "" ) return;

        sprite.DelPoint(name);

        if (wxMessageBox(_("Voulez vous supprimer ce point de toutes les images de la direction ?"),
                       _("Supprimer ce point de toutes les images"), wxYES_NO ) == wxYES)
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
            	object.GetAnimation( animation ).GetDirectionToModify( direction ).ModSprite(i).DelPoint(name);
            }
        }
    }
}

/*
TEST( Dialogues, EditorObjet )
{
    //wxLogNull log;

    Game game;
    SpriteObject object("unnamed");
    Animation AnimToAdd;
    MainEditorCommand nrC(nr, 3);

    EditorObjet Dialog( NULL, game, object, nrC );

    object.AddAnimation( AnimToAdd ); //Ajout de 1 animation
    object.AddAnimation( AnimToAdd ); //Et d'une autre

    Dialog.RefreshImages();

    CHECK_EQUAL( false ,Dialog.BoucleOuiCheck->GetValue() ); //Valeurs par défaut
    CHECK_EQUAL( true, Dialog.BoucleNonCheck->GetValue() );
    CHECK_EQUAL( "1", static_cast<string>(Dialog.TempsEdit->GetValue()) );

    Direction direction;
    direction.SetTimeBetweenFrames(0.95);
    direction.SetLoop(true);
    vector < Sprite > sprites;
    sprites.push_back(Sprite());
    sprites.push_back(Sprite());
    direction.SetSprites(sprites);

    object.GetAnimation(0).SetDirection(direction, 0);
    Dialog.RefreshImages();

    CHECK_EQUAL( true, Dialog.BoucleOuiCheck->GetValue() ); //Boucle : oui
    CHECK_EQUAL( false, Dialog.BoucleNonCheck->GetValue() );
    CHECK_EQUAL( "0.95", static_cast<string>(Dialog.TempsEdit->GetValue()) ); //Temps entre : 0.95


    Dialog.animation = 1; //Animation 1
    Dialog.direction = 0; //Direction par défaut
    Dialog.RefreshImages();

    CHECK_EQUAL( false, Dialog.BoucleOuiCheck->GetValue() ); //Boucle : non
    CHECK_EQUAL( true, Dialog.BoucleNonCheck->GetValue() );
    CHECK_EQUAL( "1", static_cast<string>(Dialog.TempsEdit->GetValue()) ); //Temps entre : 1
}*/
#endif
