#if defined(GD_IDE_ONLY)

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
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/Animation.h"
#include "GDL/CommonTools.h"
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
const long EditorObjet::idMenuAddFromEnd = wxNewId();
const long EditorObjet::idMenuAddFromAfter = wxNewId();
const long EditorObjet::idMenuAddFromBefore = wxNewId();
const long EditorObjet::ID_MENUITEM1 = wxNewId();
const long EditorObjet::idMenuAddMoreEnd = wxNewId();
const long EditorObjet::idMenuAddMoreAfter = wxNewId();
const long EditorObjet::idMenuAddMoreBefore = wxNewId();
const long EditorObjet::idMenuAddMulti = wxNewId();
const long EditorObjet::idMenuDel = wxNewId();
const long EditorObjet::idMenuDelAll = wxNewId();
const long EditorObjet::idMenuCopyFrom = wxNewId();
const long EditorObjet::idPosPoint = wxNewId();
const long EditorObjet::ID_MENUITEM3 = wxNewId();
const long EditorObjet::ID_MENUITEM5 = wxNewId();
const long EditorObjet::ID_MENUITEM8 = wxNewId();
const long EditorObjet::ID_MENUITEM9 = wxNewId();
const long EditorObjet::ID_MENUITEM6 = wxNewId();
const long EditorObjet::idMenuPosEverywhere2 = wxNewId();
const long EditorObjet::ID_MENUITEM4 = wxNewId();
const long EditorObjet::ID_MENUITEM13 = wxNewId();
const long EditorObjet::ID_MENUITEM12 = wxNewId();
const long EditorObjet::ID_MENUITEM10 = wxNewId();
const long EditorObjet::ID_MENUITEM11 = wxNewId();
const long EditorObjet::ID_MENUITEM2 = wxNewId();
const long EditorObjet::ID_MENUITEM7 = wxNewId();
const long EditorObjet::idMenuPosEverywhere = wxNewId();
const long EditorObjet::ID_MENUITEM14 = wxNewId();
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
placingPoint(false),
spritePosX(0),
spritePosY(0),
editingMask(false),
movingBox(false),
selectedBox(0),
xSelectionOffset(0),
ySelectionOffset(0)
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
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;
    wxFlexGridSizer* FlexGridSizer17;

    Create(parent, wxID_ANY, _T("Editer l\'objet"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_DIALOG_STYLE|wxRESIZE_BORDER|wxMAXIMIZE_BOX|wxMINIMIZE_BOX, _T("wxID_ANY"));
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
    StaticText4 = new wxStaticText(Panel2, ID_STATICTEXT6, _T("Objet :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer12->Add(StaticText4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    NomObjetTxt = new wxStaticText(Panel2, ID_STATICTEXT1, _T("Sans nom"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
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
    animationSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _T("Animation"));
    FlexGridSizer5 = new wxFlexGridSizer(1, 3, 0, 0);
    AnimationsBox = new wxChoice(Core, ID_CHOICE1, wxDefaultPosition, wxSize(139,21), 0, 0, 0, wxDefaultValidator, _T("ID_CHOICE1"));
    AnimationsBox->Append(_T("Pas d\'animations"));
    FlexGridSizer5->Add(AnimationsBox, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    AddAnimBt = new wxButton(Core, ID_BUTTON1, _T("Ajouter une animation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON1"));
    AddAnimBt->SetToolTip(_T("Ajoutez des animations à l\'objet avec ce bouton."));
    FlexGridSizer5->Add(AddAnimBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    DelAnimBt = new wxButton(Core, ID_BUTTON2, _T("Supprimer l\'animation"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    DelAnimBt->SetToolTip(_T("Supprime l\'animation actuelle."));
    FlexGridSizer5->Add(DelAnimBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    animationSizer->Add(FlexGridSizer5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(animationSizer, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer10 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer10->AddGrowableCol(0);
    FlexGridSizer10->AddGrowableRow(0);
    animAndDirecSizer = new wxFlexGridSizer(0, 2, 0, 0);
    animAndDirecSizer->AddGrowableCol(1);
    animAndDirecSizer->AddGrowableRow(0);
    directionSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _T("Direction"));
    FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
    NormalCheck = new wxCheckBox(Core, ID_CHECKBOX1, _T("Normal"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX1"));
    NormalCheck->SetValue(false);
    NormalCheck->SetToolTip(_T("En mode normal, 8 directions sont disponibles.\nVous pouvez changer la direction de l\'objet en cours de jeu grâce aux actions du thème \"Direction\"."));
    FlexGridSizer6->Add(NormalCheck, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    GridSizer3 = new wxGridSizer(3, 3, 0, 0);
    Bt5 = new wxToggleButton(Core, ID_TOGGLEBUTTON8, _T("5"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON8"));
    GridSizer3->Add(Bt5, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt6 = new wxToggleButton(Core, ID_TOGGLEBUTTON7, _T("6"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON7"));
    GridSizer3->Add(Bt6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt7 = new wxToggleButton(Core, ID_TOGGLEBUTTON6, _T("7"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON6"));
    GridSizer3->Add(Bt7, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Bt4 = new wxToggleButton(Core, ID_TOGGLEBUTTON5, _T("4"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON5"));
    GridSizer3->Add(Bt4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBitmap1 = new wxStaticBitmap(Core, ID_STATICBITMAP2, wxBitmap(wxImage(_T("res/direction.png")).Rescale(wxSize(25,25).GetWidth(),wxSize(25,25).GetHeight())), wxDefaultPosition, wxSize(25,25), wxNO_BORDER, _T("ID_STATICBITMAP2"));
    GridSizer3->Add(StaticBitmap1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt0 = new wxToggleButton(Core, ID_TOGGLEBUTTON1, _T("0"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON1"));
    Bt0->SetValue(true);
    GridSizer3->Add(Bt0, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt3 = new wxToggleButton(Core, ID_TOGGLEBUTTON2, _T("3"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON2"));
    GridSizer3->Add(Bt3, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt2 = new wxToggleButton(Core, ID_TOGGLEBUTTON3, _T("2"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON3"));
    GridSizer3->Add(Bt2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Bt1 = new wxToggleButton(Core, ID_TOGGLEBUTTON4, _T("1"), wxDefaultPosition, wxSize(26,23), 0, wxDefaultValidator, _T("ID_TOGGLEBUTTON4"));
    GridSizer3->Add(Bt1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer6->Add(GridSizer3, 1, wxALL|wxEXPAND|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 0);
    RotationCheck = new wxCheckBox(Core, ID_CHECKBOX2, _T("Rotation automatique"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_CHECKBOX2"));
    RotationCheck->SetValue(false);
    RotationCheck->SetToolTip(_T("En mode Rotation automatique, Game Develop fera tourner l\'objet suivant sa direction, de 0 à 360.\nVous pouvez changer la direction de l\'objet en cours de jeu grâce aux actions du thème \"Direction\"."));
    FlexGridSizer6->Add(RotationCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    directionSizer->Add(FlexGridSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    animAndDirecSizer->Add(directionSizer, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
    imagesSizer = new wxStaticBoxSizer(wxHORIZONTAL, Core, _T("Images"));
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
    imagePanel->SetToolTip(_T("Aperçu de l\'image"));
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
    thumbsPanel->SetToolTip(_T("Liste des images de la direction.\nUtilisez le clic droit ou la barre d\'outils pour modifier les images."));
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
    StaticText2 = new wxStaticText(Core, ID_STATICTEXT2, _T("Temps entre chaque image :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer9->Add(StaticText2, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    TempsEdit = new wxTextCtrl(Core, ID_TEXTCTRL2, _T("1"), wxDefaultPosition, wxSize(68,21), 0, wxDefaultValidator, _T("ID_TEXTCTRL2"));
    TempsEdit->SetToolTip(_T("Utilisez le point ( . ) pour entrer des valeurs intermédiaires :\n0.35, 1.75..."));
    FlexGridSizer9->Add(TempsEdit, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticText3 = new wxStaticText(Core, ID_STATICTEXT3, _T("secondes"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT3"));
    FlexGridSizer9->Add(StaticText3, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer8->Add(FlexGridSizer9, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    StaticText1 = new wxStaticText(Core, ID_STATICTEXT4, _T("Répéter les images :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT4"));
    FlexGridSizer11->Add(StaticText1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoucleOuiCheck = new wxRadioButton(Core, ID_RADIOBUTTON3, _T("Oui"), wxDefaultPosition, wxDefaultSize, wxRB_GROUP, wxDefaultValidator, _T("ID_RADIOBUTTON3"));
    BoucleOuiCheck->SetToolTip(_T("Après la dernière image, l\'animation reprendra du départ."));
    FlexGridSizer11->Add(BoucleOuiCheck, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoucleNonCheck = new wxRadioButton(Core, ID_RADIOBUTTON4, _T("Non"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_RADIOBUTTON4"));
    BoucleNonCheck->SetValue(true);
    BoucleNonCheck->SetToolTip(_T("Une fois l\'animation arrivée à la dernière image, elle s\'arrêtera à celle ci."));
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
    ListImageBt = new wxButton(Core, ID_BUTTON3, _T("Afficher la banque d\'images"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON3"));
    ListImageBt->SetToolTip(_T("Consulter et/ou éditer la banque d\'image."));
    FlexGridSizer14->Add(ListImageBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    OkBt = new wxButton(Core, ID_BUTTON5, _T("Ok"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON5"));
    FlexGridSizer14->Add(OkBt, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AideBt = new wxButton(Core, ID_BUTTON4, _T("Aide"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer14->Add(AideBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer2->Add(FlexGridSizer14, 0, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer2->Add(BoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Core->SetSizer(FlexGridSizer2);
    FlexGridSizer2->Fit(Core);
    FlexGridSizer2->SetSizeHints(Core);
    FlexGridSizer1->Add(Core, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuItem6 = new wxMenu();
    MenuItem11 = new wxMenuItem(MenuItem6, idMenuAddFromEnd, _T("...à la fin"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/2rightarrow.png"))));
    MenuItem6->Append(MenuItem11);
    MenuItem12 = new wxMenuItem(MenuItem6, idMenuAddFromAfter, _T("...après celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/1rightarrow.png"))));
    MenuItem6->Append(MenuItem12);
    MenuItem13 = new wxMenuItem(MenuItem6, idMenuAddFromBefore, _T("...avant celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/1leftarrow.png"))));
    MenuItem6->Append(MenuItem13);
    contextMenu.Append(ID_MENUITEM1, _T("Ajouter l\'image selectionnée dans la banque d\'image"), MenuItem6, wxEmptyString);
    MenuItem5 = new wxMenu();
    MenuItem8 = new wxMenuItem(MenuItem5, idMenuAddMoreEnd, _T("...à la fin"), wxEmptyString, wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/2rightarrow.png"))));
    MenuItem5->Append(MenuItem8);
    MenuItem9 = new wxMenuItem(MenuItem5, idMenuAddMoreAfter, _T("...après celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/1rightarrow.png"))));
    MenuItem5->Append(MenuItem9);
    MenuItem10 = new wxMenuItem(MenuItem5, idMenuAddMoreBefore, _T("...avant celle-ci"), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/1leftarrow.png"))));
    MenuItem5->Append(MenuItem10);
    contextMenu.Append(idMenuAddMulti, _T("Ajouter plusieurs images"), MenuItem5, wxEmptyString);
    contextMenu.AppendSeparator();
    MenuItem7 = new wxMenuItem((&contextMenu), idMenuDel, _T("Supprimer l\'image"), wxEmptyString, wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    contextMenu.Append(MenuItem7);
    MenuItem14 = new wxMenuItem((&contextMenu), idMenuDelAll, _T("Supprimer toutes les images"), wxEmptyString, wxITEM_NORMAL);
    contextMenu.Append(MenuItem14);
    contextMenu.AppendSeparator();
    MenuItem15 = new wxMenuItem((&contextMenu), idMenuCopyFrom, _T("Copier toutes les images depuis..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem15->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    contextMenu.Append(MenuItem15);
    MenuItem1 = new wxMenuItem((&imageContextMenu), idPosPoint, _T("Editer les points"), wxEmptyString, wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/pointmod.png"))));
    imageContextMenu.Append(MenuItem1);
    MenuItem2 = new wxMenuItem((&imageContextMenu), ID_MENUITEM3, _T("Editer le masque de collision"), wxEmptyString, wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/maskEdit16.png"))));
    imageContextMenu.Append(MenuItem2);
    MenuItem3 = new wxMenuItem((&maskContextMenu), ID_MENUITEM5, _T("Arrêter l\'édition du masque"), wxEmptyString, wxITEM_NORMAL);
    maskContextMenu.Append(MenuItem3);
    maskContextMenu.AppendSeparator();
    MenuItem4 = new wxMenuItem((&maskContextMenu), ID_MENUITEM8, _T("Ajouter un rectangle de collision"), wxEmptyString, wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/maskAdd16.png"))));
    maskContextMenu.Append(MenuItem4);
    MenuItem22 = new wxMenu();
    MenuItem23 = new wxMenuItem(MenuItem22, ID_MENUITEM9, _T("Supprimer"), wxEmptyString, wxITEM_NORMAL);
    MenuItem23->SetBitmap(wxBitmap(wxImage(_T("res/maskRemove16.png"))));
    MenuItem22->Append(MenuItem23);
    MenuItem20 = new wxMenuItem(MenuItem22, ID_MENUITEM6, _T("Modifier"), wxEmptyString, wxITEM_NORMAL);
    MenuItem22->Append(MenuItem20);
    MenuItem25 = new wxMenuItem(MenuItem22, idMenuPosEverywhere2, _T("Positionner précisement"), wxEmptyString, wxITEM_NORMAL);
    MenuItem22->Append(MenuItem25);
    maskContextMenu.Append(ID_MENUITEM4, _T("Rectangle sélectionné"), MenuItem22, wxEmptyString);
    MenuItem16 = new wxMenu();
    applyMaskToAllDirectionSprites = new wxMenuItem(MenuItem16, ID_MENUITEM13, _T("Appliquer à toutes les images de la direction"), wxEmptyString, wxITEM_CHECK);
    MenuItem16->Append(applyMaskToAllDirectionSprites);
    maskContextMenu.Append(ID_MENUITEM12, _T("Options"), MenuItem16, wxEmptyString);
    maskContextMenu.AppendSeparator();
    MenuItem24 = new wxMenuItem((&maskContextMenu), ID_MENUITEM10, _T("Retourner au masque par défaut"), wxEmptyString, wxITEM_NORMAL);
    maskContextMenu.Append(MenuItem24);
    MenuItem26 = new wxMenuItem((&pointsContextMenu), ID_MENUITEM11, _T("Arrêter de positionner les points"), wxEmptyString, wxITEM_NORMAL);
    pointsContextMenu.Append(MenuItem26);
    pointsContextMenu.AppendSeparator();
    MenuItem27 = new wxMenuItem((&pointsContextMenu), ID_MENUITEM2, _T("Choisir le point"), wxEmptyString, wxITEM_NORMAL);
    pointsContextMenu.Append(MenuItem27);
    MenuItem28 = new wxMenuItem((&pointsContextMenu), ID_MENUITEM7, _T("Positionner précisement"), wxEmptyString, wxITEM_NORMAL);
    pointsContextMenu.Append(MenuItem28);
    MenuItem29 = new wxMenu();
    posEverywhereMenuItem = new wxMenuItem(MenuItem29, idMenuPosEverywhere, _T("Positionner en même temps sur les autres images"), wxEmptyString, wxITEM_CHECK);
    MenuItem29->Append(posEverywhereMenuItem);
    pointsContextMenu.Append(ID_MENUITEM14, _T("Options"), MenuItem29, wxEmptyString);
    pointsContextMenu.AppendSeparator();
    MenuItem31 = new wxMenuItem((&pointsContextMenu), idAddPoint, _T("Ajouter un point"), wxEmptyString, wxITEM_NORMAL);
    pointsContextMenu.Append(MenuItem31);
    MenuItem32 = new wxMenuItem((&pointsContextMenu), idDelPoint, _T("Supprimer un point"), wxEmptyString, wxITEM_NORMAL);
    pointsContextMenu.Append(MenuItem32);
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
    imagePanel->Connect(wxEVT_LEFT_DOWN,(wxObjectEventFunction)&EditorObjet::OnimagePanelLeftDown,0,this);
    imagePanel->Connect(wxEVT_LEFT_UP,(wxObjectEventFunction)&EditorObjet::OnimagePanelLeftUp,0,this);
    imagePanel->Connect(wxEVT_RIGHT_UP,(wxObjectEventFunction)&EditorObjet::OnimagePanelRightUp,0,this);
    imagePanel->Connect(wxEVT_MOTION,(wxObjectEventFunction)&EditorObjet::OnimagePanelMouseMove,0,this);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollHeightScroll);
    Connect(ID_SCROLLBAR1,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollHeightScroll);
    Connect(ID_SCROLLBAR3,wxEVT_SCROLL_TOP|wxEVT_SCROLL_BOTTOM|wxEVT_SCROLL_LINEUP|wxEVT_SCROLL_LINEDOWN|wxEVT_SCROLL_PAGEUP|wxEVT_SCROLL_PAGEDOWN|wxEVT_SCROLL_THUMBTRACK|wxEVT_SCROLL_THUMBRELEASE|wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollWidthScroll);
    Connect(ID_SCROLLBAR3,wxEVT_SCROLL_CHANGED,(wxObjectEventFunction)&EditorObjet::OnscrollWidthScroll);
    thumbsPanel->Connect(wxEVT_PAINT,(wxObjectEventFunction)&EditorObjet::OnthumbsPanelPaint,0,this);
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
    Connect(idMenuAddFromEnd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromEndSelected);
    Connect(idMenuAddFromAfter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromAfterSelected);
    Connect(idMenuAddFromBefore,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddFromBeforeSelected);
    Connect(idMenuAddMoreEnd,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreEndSelected);
    Connect(idMenuAddMoreAfter,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreAfterSelected);
    Connect(idMenuAddMoreBefore,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMoreBeforeSelected);
    Connect(idMenuDel,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDeleteSelected);
    Connect(idMenuDelAll,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDeleteAllBtClick);
    Connect(idMenuCopyFrom,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnCopyBtClick);
    Connect(idPosPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModPointSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnEditMaskSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnEditMaskSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddMaskRectangleSelected);
    Connect(ID_MENUITEM9,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDelMaskRectangleSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModifyMaskRectangleSelected);
    Connect(idMenuPosEverywhere2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnEnterMaskRectanglePositionSelected);
    Connect(ID_MENUITEM10,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnautomaticMaskSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModPointSelected);
    Connect(ID_MENUITEM7,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnModPointPrecisSelected);
    Connect(idAddPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnAddPointSelected);
    Connect(idDelPoint,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&EditorObjet::OnDelPointSelected);
    //*)

    toolbar = new wxToolBar( toolbarPanel, -1, wxDefaultPosition, wxDefaultSize,
                             wxTB_FLAT | wxTB_NODIVIDER | wxTB_HORIZONTAL );

    toolbar->ClearTools();
    toolbar->SetToolBitmapSize( wxSize( 16, 16 ) );
    toolbar->AddTool( idMenuAddFromEnd, wxT( "Ajouter l'image à la fin" ), wxBitmap( wxImage( "res/addfromimagebanque.png" ) ), _T( "Ajouter une image à la fin depuis la banque d'image" ) );
    toolbar->AddTool( idMenuDel, wxT( "Supprimer l'image selectionnée" ), wxBitmap( wxImage( "res/deleteicon.png" ) ), _T( "Supprimer l'image selectionnée" ) );
    toolbar->AddTool( idMenuCopyFrom, wxT( "Copier les images depuis une animation/direction" ), wxBitmap( wxImage( "res/copyicon.png" ) ), _T( "Copier les images depuis une animation/direction" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( idPosPoint, wxT( "Positionner un point" ), wxBitmap( wxImage( "res/pointmod.png" ) ), _T( "Positionner un point" ) );
    toolbar->AddTool( idAddPoint, wxT( "Ajouter un point" ), wxBitmap( wxImage( "res/pointadd.png" ) ), _T( "Ajouter un point" ) );
    toolbar->AddTool( idDelPoint, wxT( "Supprimer un point" ), wxBitmap( wxImage( "res/pointdel.png" ) ), _T( "Supprimer un point" ) );
    toolbar->AddSeparator();
    toolbar->AddTool( ID_MENUITEM3, wxT( "Editer le masque de collision" ), wxBitmap( wxImage( "res/maskEdit16.png" ) ), _T( "Editer le masque de collision" ) );
    toolbar->AddTool( ID_MENUITEM8, wxT( "Ajouter un rectangle au masque" ), wxBitmap( wxImage( "res/maskAdd16.png" ) ), _T( "Ajouter un rectangle au masque" ) );
    toolbar->AddTool( ID_MENUITEM9, wxT( "Supprimer le rectangle selectionné du masque" ), wxBitmap( wxImage( "res/maskRemove16.png" ) ), _T( "Supprimer le rectangle selectionné du masque" ) );
    toolbar->Realize();

    toolbar->EnableTool(idAddPoint, false);
    toolbar->EnableTool(idDelPoint, false);
    toolbar->EnableTool(ID_MENUITEM8, false);
    toolbar->EnableTool(ID_MENUITEM9, false);

    //Obligatoire avec wxGTK, sinon la toolbar ne s'affiche pas
#ifdef __WXGTK__
    wxSize tbSize = toolbar->GetSize();
    gtk_widget_set_usize( toolbar->m_widget, tbSize.GetWidth(), tbSize.GetHeight() );
#endif

    NomObjetTxt->SetLabel( object.GetName() );

    m_mgr.SetManagedWindow( this );

    editorImagesPnl = new EditorImages( this, game, mainEditorCommand );
    editorImagesPnl->Refresh();

    m_mgr.AddPane( Core, wxAuiPaneInfo().Name( wxT( "Core" ) ).Center().CaptionVisible(false) );
    m_mgr.AddPane( editorImagesPnl, wxAuiPaneInfo().Name( wxT( "EI" ) ).Left().Caption( _T( "Editeur de la banque d'images" ) ).MaximizeButton( true ).MinimizeButton( false ).MinSize(150, 100).Show(true) );

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();

    RefreshFromObjet();
    Core->Layout();
    SetSize(GetSize().GetWidth()+150, GetSize().GetHeight());
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
        AnimationsBox->Append( ToString( i ) );
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

    RefreshImages();
}


////////////////////////////////////////////////////////////
/// Rafraichir les images
///
/// Rafraichit la liste des images en fonction de la position
////////////////////////////////////////////////////////////
void EditorObjet::RefreshImages()
{
    if ( animation >= object.GetAnimationsNumber() || direction >= object.GetAnimation( animation ).GetDirectionsNumber())
        return;

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
    else
    {
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
    }

    //Temps
    TempsEdit->ChangeValue( ToString( object.GetAnimation( animation ).GetDirection( direction ).GetTimeBetweenFrames() ) );

    //Boucle
    BoucleOuiCheck->SetValue( object.GetAnimation( animation ).GetDirection( direction ).IsLooping() );
    BoucleNonCheck->SetValue( !object.GetAnimation( animation ).GetDirection( direction ).IsLooping() );

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

bool EditorObjet::AnimationAndDirectionValid()
{
    if ( animation < object.GetAnimationsNumber() && direction < object.GetAnimation( animation ).GetDirectionsNumber())
        return true;

    return false;
}

bool EditorObjet::SpriteValid()
{
    if ( AnimationAndDirectionValid() && selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size() )
        return true;

    return false;
}

Sprite & EditorObjet::GetEditedSprite()
{
    return object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(selectedImage);
}

Animation & EditorObjet::GetEditedAnimation()
{
    return object.GetAnimation( animation );
}

Direction & EditorObjet::GetEditedDirection()
{
    return object.GetAnimation( animation ).GetDirectionToModify( direction );
}

void EditorObjet::OnAddAnimBtClick( wxCommandEvent& event )
{
    Animation newAnimation;
    newAnimation.SetDirectionsNumber(8);
    object.AddAnimation( newAnimation );

    AnimationsBox->Append( ToString( object.GetAnimationsNumber() - 1 ) );

    RefreshFromObjet();
}

void EditorObjet::OnDelAnimBtClick( wxCommandEvent& event )
{
    int animNb = AnimationsBox->GetSelection();
    if ( animNb == wxNOT_FOUND ) return;

    if ( animNb >= 0 && static_cast<unsigned>(animNb) < object.GetAnimationsNumber() )
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
    if ( AnimationAndDirectionValid() ) GetEditedDirection().SetTimeBetweenFrames( ToFloat(string(TempsEdit->GetValue().mb_str())) );
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton Oui
///
/// Change le bouclage de la direction en true
////////////////////////////////////////////////////////////
void EditorObjet::OnBoucleOuiCheckSelect( wxCommandEvent& event )
{
   if ( AnimationAndDirectionValid() ) GetEditedDirection().SetLoop( true );
}

////////////////////////////////////////////////////////////
/// Clic sur le bouton Non
///
/// Change le bouclage de la direction en false
////////////////////////////////////////////////////////////
void EditorObjet::OnBoucleNonCheckSelect( wxCommandEvent& event )
{
    if ( AnimationAndDirectionValid() ) GetEditedDirection().SetLoop( false );
}

/**
 * Display Image Bank Editor
 */
void EditorObjet::OnButton1Click( wxCommandEvent& event )
{
    //Update the window size
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

    if ( AnimationAndDirectionValid() ) GetEditedAnimation().typeNormal = false;

    direction = 0;
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

    if ( AnimationAndDirectionValid() ) GetEditedAnimation().typeNormal = true;


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
    HelpFileAccess * helpFileAccess = HelpFileAccess::GetInstance();
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
    if ( !AnimationAndDirectionValid() ) return;

    if (wxMessageBox("Etes-vous sûr de vouloir supprimer toutes les images ?", "Êtes vous sur ?",wxYES_NO ) == wxYES)
        GetEditedDirection().RemoveAllSprites();

    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Ajout rapide de plusieurs images
////////////////////////////////////////////////////////////
void EditorObjet::OnAjoutPlusBtClick(wxCommandEvent& event)
{
    if ( !AnimationAndDirectionValid() ) return;

    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 ) return;

    //Ajout des images
    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImageName(dialog.ImagesToAdd.at(i));
        GetEditedDirection().AddSprite(sprite);
    }

    RefreshImages();
}

////////////////////////////////////////////////////////////
/// Copier les images d'une animation/direction à la place de celle ci
////////////////////////////////////////////////////////////
void EditorObjet::OnCopyBtClick(wxCommandEvent& event)
{
    if ( !AnimationAndDirectionValid() ) return;

    int animToCopy = wxGetNumberFromUser( "Animation à copier", "", "Entrez le numéro de l'animation dans laquelle se trouve la direction à copier", 0, 0, object.GetAnimationsNumber()-1, this);
    if (animToCopy < 0 || static_cast<unsigned int>(animToCopy) >= object.GetAnimationsNumber()) return;

    int directionToCopy = 0;

    if (object.GetAnimation( animToCopy ).typeNormal)
    {
        directionToCopy = wxGetNumberFromUser( "Direction à copier", "", "Entrez le numéro de la direction dans laquelle se trouve les images à copier", 0, 0, object.GetAnimation( animToCopy ).GetDirectionsNumber()-1, this);
        if (directionToCopy < 0 || static_cast<unsigned int>(directionToCopy) >= object.GetAnimation( animToCopy ).GetDirectionsNumber() ) return;
    }

    GetEditedAnimation().SetDirection(object.GetAnimation(animToCopy).GetDirection(directionToCopy), direction);

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

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::GetInstance();

    //Fond gris avec des flèches
    dc.SetPen(wxPen(wxSystemSettings::GetColour(wxSYS_COLOUR_WINDOWFRAME )));
    dc.SetBrush(bitmapGUIManager->backthumbsBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    int decalage = thumbsScroll->GetThumbPosition();

    //Fond en damier pour les images
    dc.SetBrush(bitmapGUIManager->transparentBg);

    //Affichage des images
    if ( !AnimationAndDirectionValid() ) return;
    const Direction & directionToDisplay = object.GetAnimation( animation ).GetDirection( direction );

    for (unsigned int i = 0;i<directionToDisplay.GetSpritesNumber();++i)
    {
        dc.SetPen(*wxBLACK_PEN);

        if ( selectedImage >= 0 && i == static_cast<unsigned>(selectedImage) )
            dc.SetPen(wxPen(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));
        dc.DrawRectangle(wxRect(2+i*48+i*3-decalage,2,50,50));

        //On cherche l'ID de l'image à afficher
        int j = FindImage( game.images, directionToDisplay.GetSprite(i).GetImageName() );
        if ( j != -1 )
        {
            wxBitmap bmp( game.images.at( j ).file, wxBITMAP_TYPE_ANY);
            if ( bmp.GetWidth() != 48 || bmp.GetHeight() != 48 )
            {
                wxImage image = bmp.ConvertToImage();
                bmp = wxBitmap(image.Scale(48, 48));
            }

            if ( bmp.IsOk() ) dc.DrawBitmap(bmp, 2+i*48+i*3+1-decalage, 3, true);
        }
        else
        {
            dc.DrawBitmap(wxBitmap( "res/error48.png", wxBITMAP_TYPE_ANY ), 2+i*48+i*3+1-decalage, 3);
        }
    }
    if ( directionToDisplay.HasNoSprites() )
    {
        dc.SetFont(*wxNORMAL_FONT);
        dc.DrawLabel(_T("Pas d'images. \nUtilisez le clic droit ou la barre d'outils pour ajouter des images."), wxRect(thumbsPanel->GetSize()),  wxALIGN_LEFT | wxALIGN_CENTER);
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

////////////////////////////////////////////////////////////
/// Affichage de l'image selectionnée
////////////////////////////////////////////////////////////
void EditorObjet::OnimagePanelPaint(wxPaintEvent& event)
{
    imagePanel->SetBackgroundStyle( wxBG_STYLE_PAINT );
    wxPaintDC dc( imagePanel ); //Création obligatoire du wxBufferedPaintDC

    wxSize size = imagePanel->GetSize();

    BitmapGUIManager * bitmapGUIManager = BitmapGUIManager::GetInstance();

    //Fond en damier
    dc.SetBrush(bitmapGUIManager->transparentBg);
    dc.DrawRectangle(0,0, size.GetWidth(), size.GetHeight());

    if ( !AnimationAndDirectionValid() ) return;

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < object.GetAnimation( animation ).GetDirection( direction ).GetSpritesNumber() )
    {
        const Sprite & sprite = object.GetAnimation( animation ).GetDirection( direction ).GetSprite(selectedImage);
        int j = FindImage( game.images, sprite.GetImageName() );
        if ( j != -1 )
        {
            //Chargement de l'image
            wxBitmap bmp( game.images.at( j ).file, wxBITMAP_TYPE_ANY);
            wxBitmap point( bitmapGUIManager->point );

            scrollWidth->SetScrollbar(scrollWidth->GetThumbPosition(),
                                       size.GetWidth(),
                                       bmp.GetWidth(),
                                       size.GetWidth());

            scrollHeight->SetScrollbar(scrollHeight->GetThumbPosition(),
                                       size.GetHeight(),
                                       bmp.GetHeight(),
                                       size.GetHeight());

            spritePosX = (size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2;
            spritePosY = (size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2;

            if ( bmp.IsOk() )
                dc.DrawBitmap(bmp, spritePosX, spritePosY, true /* use mask */); //Affichage de l'image

            //Affichage du point
            if ( placingPoint && sprite.HasPoint(selectedPoint))
            {
                dc.DrawBitmap(point,
                              sprite.GetPoint(selectedPoint).GetX() - point.GetWidth()/2 + ((size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2),
                              sprite.GetPoint(selectedPoint).GetY() - point.GetHeight()/2 + ((size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2),
                              true /* use mask */);
            }

            //Display hit boxes
            if ( editingMask )
            {
                //dc.SetLogicalFunction(wxINVERT);
                std::vector<RotatedRectangle> boxes = sprite.GetCollisionMask();
                for (unsigned int i = 0;i<boxes.size();++i)
                {
                    dc.SetBrush(wxBrush(wxColour(128,128,128), wxBRUSHSTYLE_FDIAGONAL_HATCH));
                    if ( i == selectedBox ) dc.SetBrush(wxBrush(wxColour(255,255,255), wxBRUSHSTYLE_FDIAGONAL_HATCH));
                    dc.DrawRectangle(spritePosX+boxes[i].center.x-boxes[i].halfSize.x,
                                     spritePosY+boxes[i].center.y-boxes[i].halfSize.y,
                                     boxes[i].halfSize.x*2,
                                     boxes[i].halfSize.y*2);
                }
                //dc.SetLogicalFunction(wxCOPY);
            }
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

void EditorObjet::OnAddMoreEndSelected(wxCommandEvent& event)
{
    if ( !AnimationAndDirectionValid() ) return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImageName(dialog.ImagesToAdd.at(i));
        object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);
    }

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddMoreAfterSelected(wxCommandEvent& event)
{
    if ( !AnimationAndDirectionValid() ) return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImageName(dialog.ImagesToAdd.at(i));

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
    if ( !AnimationAndDirectionValid() ) return;

    //Fenêtre d'ajouts de plusieurs images
    AjoutPlusImage dialog(this);
    if ( dialog.ShowModal() == 0 )
        return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    for (unsigned int i = 0;i<dialog.ImagesToAdd.size();++i)
    {
        Sprite sprite;
        sprite.SetImageName(dialog.ImagesToAdd.at(i));

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
    cout << "called";
    if ( !AnimationAndDirectionValid() )
    {
        cout << "return";
        return;
    }

    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        wxLogMessage(_T("Affichez l'éditeur de la banque d'image, et sélectionnez une image avant de cliquer sur ce bouton."));
        return;
    }

    if ( !editorImagesPnl->m_itemSelected.IsOk() || editorImagesPnl->m_itemSelected == editorImagesPnl->BanqueImageList->GetRootItem())
    {
        wxLogMessage(_T("Choisissez une image dans la banque d'image."));
        return;
    }

    Sprite sprite;
    sprite.SetImageName(string(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected).mb_str()));
    object.GetAnimation( animation ).GetDirectionToModify( direction ).AddSprite(sprite);

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement
}

void EditorObjet::OnAddFromAfterSelected(wxCommandEvent& event)
{
    if ( !AnimationAndDirectionValid() ) return;

    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        wxLogMessage(_T("Affichez l'éditeur de la banque d'image, et sélectionnez une image avant de cliquer sur ce bouton."));
        return;
    }

    if ( !editorImagesPnl->m_itemSelected.IsOk() || editorImagesPnl->m_itemSelected == editorImagesPnl->BanqueImageList->GetRootItem())
    {
        wxLogMessage(_T("Choisissez une image dans la banque d'image."));
        return;
    }

    Sprite sprite;
    sprite.SetImageName(string(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected).mb_str()));

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
    if ( !AnimationAndDirectionValid() ) return;

    if ( !m_mgr.GetPane( editorImagesPnl ).IsShown() )
    {
        wxLogMessage(_T("Affichez l'éditeur de la banque d'image, et sélectionnez une image avant de cliquer sur ce bouton."));
        return;
    }

    if ( !editorImagesPnl->m_itemSelected.IsOk() || editorImagesPnl->m_itemSelected == editorImagesPnl->BanqueImageList->GetRootItem())
    {
        wxLogMessage(_T("Choisissez une image dans la banque d'image."));
        return;
    }

    Sprite sprite;
    sprite.SetImageName(string(editorImagesPnl->BanqueImageList->GetItemText(editorImagesPnl->m_itemSelected).mb_str()));

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
    if ( !AnimationAndDirectionValid() ) return;

    vector < Sprite > & sprites = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify();

    if ( selectedImage >= 0 && static_cast<unsigned>(selectedImage) < sprites.size() )
        sprites.erase(sprites.begin() + selectedImage);

    thumbsPanel->Refresh();
    thumbsPanel->Update(); //Immédiatement

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
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
    if ( !SpriteValid() )return;

    if ( !editingMask && !placingPoint )
        PopupMenu(&imageContextMenu);
    else if ( editingMask )
        PopupMenu(&maskContextMenu);
    else if ( placingPoint )
        PopupMenu(&pointsContextMenu);

}

////////////////////////////////////////////////////////////
/// Clic gauche
////////////////////////////////////////////////////////////
void EditorObjet::OnimagePanelLeftUp(wxMouseEvent& event)
{
    if ( !SpriteValid() ) return;

    if ( editingMask && movingBox )
        movingBox = false;
    else if ( placingPoint )
    {
        int j = FindImage( game.images, GetEditedSprite().GetImageName() );
        if ( j == -1 ) return;

        //Tailles nécessaire pour placer le point
        wxSize size = imagePanel->GetSize();
        wxBitmap bmp( game.images.at( j ).file, wxBITMAP_TYPE_ANY);

        int SpritePosX = (size.GetWidth() - bmp.GetWidth() - scrollWidth->GetThumbPosition()) / 2;
        int SpritePosY = (size.GetHeight() - bmp.GetHeight() - scrollHeight->GetThumbPosition()) / 2;

        MovePoint(GetEditedSprite(), selectedPoint, event.GetX() - SpritePosX, event.GetY() - SpritePosY);

        //Repositionnement pour les autres sprites si besoin
        if ( posEverywhereMenuItem->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesNumber();++i)
            {
                MovePoint(object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i),
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
    if ( !SpriteValid() ) return;

    Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(selectedImage);

    wxArrayString points;
    points.Add("Origin");
    points.Add("Centre");
    for (unsigned int i =0;i<sprite.GetAllNonDefaultPoints().size();++i)
        points.Add(sprite.GetAllNonDefaultPoints().at(i).GetName());

    string name = static_cast<string>(wxGetSingleChoice(_T("Choisissez le point à éditer.\nVous pourrez ensuite le placer en faisant un clic gauche sur l'image."), _T("Choisir le point à positionner"), points));
    if ( name == "" ) return;
    if ( name == "Centre" )
    {
        if (wxMessageBox(_T("Le point centre peut être positionné automatiquement par Game Develop au centre (comportement par défaut).\nVoulez vous modifier ce point ?\nCliquez sur oui pour le modifier, cliquez sur non pour que Game Develop le place automatiquement."),
                       _T("Position du point \"Centre\""), wxYES_NO ) == wxNO)
        {
            sprite.SetCentreAutomatic(true);

            imagePanel->Refresh();
            imagePanel->Update(); //Immédiatement

            return;
        }
        sprite.SetCentreAutomatic(false);
    }

    placingPoint = true;
    toolbar->EnableTool(ID_MENUITEM8, false);
    toolbar->EnableTool(ID_MENUITEM9, false);
    toolbar->EnableTool(idAddPoint, true);
    toolbar->EnableTool(idDelPoint, true);
    editingMask = false;

    selectedPoint = name;

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

////////////////////////////////////////////////////////////
/// Placer un point de façon précise
////////////////////////////////////////////////////////////
void EditorObjet::OnModPointPrecisSelected(wxCommandEvent& event)
{
    if ( !SpriteValid() ) return;

    Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(selectedImage);

    //Choix du point
    wxArrayString points;
    points.Add("Origin");
    points.Add("Centre");
    for (unsigned int i =0;i<sprite.GetAllNonDefaultPoints().size();++i)
        points.Add(sprite.GetAllNonDefaultPoints().at(i).GetName());

    string name = static_cast<string>(wxGetSingleChoice(_T("Choisissez le point à éditer.\nVous pourrez ensuite le placer en faisant un clic gauche sur l'image."), _T("Choisir le point à positionner"), points));
    if ( name == "" ) return;
    if ( name == "Centre" )
    {
        if (wxMessageBox(_T("Le point centre peut être positionné automatiquement par Game Develop au centre (comportement par défaut).\nVoulez vous modifier ce point ?\nCliquez sur oui pour le modifier, cliquez sur non pour que Game Develop le place automatiquement."),
                       _T("Position du point \"Centre\""), wxYES_NO ) == wxNO)
        {
            sprite.SetCentreAutomatic(true);

            imagePanel->Refresh();
            imagePanel->Update(); //Immédiatement

            return;
        }
        sprite.SetCentreAutomatic(false);
    }

    selectedPoint = name;

    string x_str = static_cast<string>(wxGetTextFromUser(_T("Entrez la position X du point par rapport à l'image"), "Position X du point",ToString(sprite.GetPoint(name).GetX())));
    string y_str = static_cast<string>(wxGetTextFromUser(_T("Entrez la position Y du point par rapport à l'image"), "Position Y du point",ToString(sprite.GetPoint(name).GetY())));

    MovePoint(sprite, name, ToInt(x_str), ToInt(y_str));

    //Repositionnement pour les autres sprites si besoin
    if ( posEverywhereMenuItem->IsChecked() )
    {
        for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesNumber();++i)
        {
            MovePoint(object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i),
                      name, ToInt(x_str), ToInt(y_str));
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

    Point & point = sprite.GetPoint(pointName);

    point.SetX(X);
    point.SetY(Y);
}

////////////////////////////////////////////////////////////
/// Ajouter un point
////////////////////////////////////////////////////////////
void EditorObjet::OnAddPointSelected(wxCommandEvent& event)
{
    if ( !SpriteValid() ) return;

    Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(selectedImage);

    string name = static_cast<string>(wxGetTextFromUser(_T("Entrez le nom du nouveau point"), _T("Création d'un point")));
    if ( name == "" ) return;
    if ( sprite.HasPoint(name) )
    {
        wxLogMessage(_T("Un point ayant ce nom existe déjà !"));
        return;
    }

    sprite.AddPoint(name);
    if (wxMessageBox(_T("Voulez vous ajouter ce point à toutes les images de la direction ?"),
                   _T("Ajouter ce point à toutes les images"), wxYES_NO ) == wxYES)
    {
        for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
        {
            object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).AddPoint(name);
        }
    }

}

////////////////////////////////////////////////////////////
/// Supprimer un point
////////////////////////////////////////////////////////////
void EditorObjet::OnDelPointSelected(wxCommandEvent& event)
{
    if ( !SpriteValid() ) return;

    Sprite & sprite = GetEditedSprite();

    wxArrayString points;
    for (unsigned int i =0;i<sprite.GetAllNonDefaultPoints().size();++i)
        points.Add(sprite.GetAllNonDefaultPoints().at(i).GetName());

    if ( points.IsEmpty() )
    {
        wxLogMessage(_T("Aucun point à éditer. Ajoutez un point avant de pouvoir le positionner."));
        return;
    }

    string name = static_cast<string>(wxGetSingleChoice(_T("Choisissez le point à éditer."), _T("Choisir le point à positionner"), points));
    if ( name == "" ) return;

    sprite.DelPoint(name);

    if (wxMessageBox(_T("Voulez vous supprimer ce point de toutes les images de la direction ?"),
                   _T("Supprimer ce point de toutes les images"), wxYES_NO ) == wxYES)
    {
        for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
        {
            object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).DelPoint(name);
        }
    }
}

void EditorObjet::OnautomaticMaskSelected(wxCommandEvent& event)
{
    if ( !SpriteValid() ) return;

    Sprite & sprite = object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(selectedImage);
    sprite.SetCollisionMaskAutomatic(true);
    std::vector<RotatedRectangle> emptyVector;
    sprite.SetCustomCollisionMask(emptyVector);

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

void EditorObjet::OnimagePanelLeftDown(wxMouseEvent& event)
{
    if ( editingMask && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();
        for (unsigned int i = 0;i<boxes.size();++i)
        {
            if ( spritePosX+boxes[i].center.x-boxes[i].halfSize.x < event.GetX() &&
                             spritePosY+boxes[i].center.y-boxes[i].halfSize.y <  event.GetY() &&
                             spritePosX+boxes[i].center.x+boxes[i].halfSize.x >  event.GetY()&&
                             spritePosY+boxes[i].center.y+boxes[i].halfSize.y >  event.GetY() )
             {
                movingBox = true;
                selectedBox = i;
                xSelectionOffset = boxes[i].center.x-event.GetX()+spritePosX;
                ySelectionOffset = boxes[i].center.y-event.GetY()+spritePosY;
             }
        }
    }
}

void EditorObjet::OnimagePanelMouseMove(wxMouseEvent& event)
{
    if ( editingMask && movingBox && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();
        if ( selectedBox < boxes.size())
        {
            boxes[selectedBox].center.x = event.GetX()-spritePosX-xSelectionOffset;
            boxes[selectedBox].center.y = event.GetY()-spritePosY-ySelectionOffset;
        }
        GetEditedSprite().SetCollisionMaskAutomatic(false);
        GetEditedSprite().SetCustomCollisionMask(boxes);

        if ( applyMaskToAllDirectionSprites->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCollisionMaskAutomatic(false);
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCustomCollisionMask(boxes);
            }
        }

        imagePanel->Refresh();
        imagePanel->Update(); //Immédiatement
    }
}

void EditorObjet::OnDelMaskRectangleSelected(wxCommandEvent& event)
{
    if ( editingMask && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();
        if ( selectedBox < boxes.size())
            boxes.erase(boxes.begin() + selectedBox);

        GetEditedSprite().SetCollisionMaskAutomatic(false);
        GetEditedSprite().SetCustomCollisionMask(boxes);

        if ( applyMaskToAllDirectionSprites->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCollisionMaskAutomatic(false);
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCustomCollisionMask(boxes);
            }
        }

        imagePanel->Refresh();
        imagePanel->Update(); //Immédiatement
    }
}

void EditorObjet::OnAddMaskRectangleSelected(wxCommandEvent& event)
{
    if ( editingMask && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();

        RotatedRectangle newRectangle;
        newRectangle.halfSize.x = ToFloat(string(wxGetTextFromUser(_T("Entrez la largeur du rectangle"), _T("Nouveau rectangle"), "32").mb_str()))/2.0f;
        newRectangle.halfSize.y = ToFloat(string(wxGetTextFromUser(_T("Entrez la hauteur du rectangle"), _T("Nouveau rectangle"), "32").mb_str()))/2.0f;
        newRectangle.angle = 0;//ToFloat(string(wxGetTextFromUser(_T("Angle du rectangle, en degrés."), _T("Nouveau rectangle"), "0").mb_str()))/180.0f*3.14159f;
        boxes.push_back(newRectangle);

        GetEditedSprite().SetCollisionMaskAutomatic(false);
        GetEditedSprite().SetCustomCollisionMask(boxes);

        if ( applyMaskToAllDirectionSprites->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCollisionMaskAutomatic(false);
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCustomCollisionMask(boxes);
            }
        }

        imagePanel->Refresh();
        imagePanel->Update(); //Immédiatement
    }
}

void EditorObjet::OnEditMaskSelected(wxCommandEvent& event)
{
    editingMask = !editingMask;

    if ( editingMask )
    {
        placingPoint = false;

        toolbar->EnableTool(idAddPoint, false);
        toolbar->EnableTool(idDelPoint, false);
        toolbar->EnableTool(ID_MENUITEM8, true);
        toolbar->EnableTool(ID_MENUITEM9, true);
    }
    else
    {
        toolbar->EnableTool(ID_MENUITEM8, false);
        toolbar->EnableTool(ID_MENUITEM9, false);
    }

    imagePanel->Refresh();
    imagePanel->Update(); //Immédiatement
}

void EditorObjet::OnModifyMaskRectangleSelected(wxCommandEvent& event)
{
    if ( editingMask && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();
        if ( selectedBox < boxes.size())
        {
            boxes[selectedBox].halfSize.x = ToFloat(string(wxGetTextFromUser(_T("Entrez la largeur du rectangle"), _T("Edition d'un rectangle"), ToString(boxes[selectedBox].halfSize.x*2.0f)).mb_str()))/2.0f;
            boxes[selectedBox].halfSize.y = ToFloat(string(wxGetTextFromUser(_T("Entrez la hauteur du rectangle"), _T("Edition d'un rectangle"), ToString(boxes[selectedBox].halfSize.y*2.0f)).mb_str()))/2.0f;
            //boxes[selectedBox].angle = ToFloat(string(wxGetTextFromUser(_T("Angle du rectangle, en degrés."), _T("Edition d'un rectangle"), ToString(boxes[selectedBox].angle/3.14159f*180.0f)).mb_str()))/180.0f*3.14159f;
        }
        GetEditedSprite().SetCollisionMaskAutomatic(false);
        GetEditedSprite().SetCustomCollisionMask(boxes);

        if ( applyMaskToAllDirectionSprites->IsChecked() )
        {
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCollisionMaskAutomatic(false);
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCustomCollisionMask(boxes);
            }
        }

        imagePanel->Refresh();
        imagePanel->Update(); //Immédiatement
    }
}


void EditorObjet::OnEnterMaskRectanglePositionSelected(wxCommandEvent& event)
{
    if ( editingMask && SpriteValid())
    {
        std::vector<RotatedRectangle> boxes = GetEditedSprite().GetCollisionMask();
        if ( selectedBox < boxes.size())
        {
            boxes[selectedBox].center.x = ToFloat(string(wxGetTextFromUser(_T("Entrez la position X rectangle"), _T("Edition d'un rectangle"), ToString(boxes[selectedBox].center.x)).mb_str()));
            boxes[selectedBox].center.y = ToFloat(string(wxGetTextFromUser(_T("Entrez la position Y rectangle"), _T("Edition d'un rectangle"), ToString(boxes[selectedBox].center.y)).mb_str()));
        }
        GetEditedSprite().SetCollisionMaskAutomatic(false);
        GetEditedSprite().SetCustomCollisionMask(boxes);

        if ( applyMaskToAllDirectionSprites->IsChecked() )
        {
            cout << "Apply";
            for (unsigned int i =0;i<object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSpritesToModify().size();++i)
            {
                cout << "ApplyToSprite";
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCollisionMaskAutomatic(false);
                object.GetAnimation( animation ).GetDirectionToModify( direction ).GetSprite(i).SetCustomCollisionMask(boxes);
            }
        }

        imagePanel->Refresh();
        imagePanel->Update(); //Immédiatement
    }
}

/**
 * Exit point editing
 */
void EditorObjet::OnEditPointsSelected(wxCommandEvent& event)
{
    placingPoint = false;

    toolbar->EnableTool(idAddPoint, false);
    toolbar->EnableTool(idDelPoint, false);
}

#endif
