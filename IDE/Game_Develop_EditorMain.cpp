/***************************************************************
 * Name:      Game_Develop_EditorMain.cpp
 * Purpose:   Code for Application Frame
 * Author:    Florian "4ian" Rival ()
 * Created:   2008-03-01
 * Copyright: Florian "4ian" Rival ()
 * License:
 **************************************************************/


#ifndef RELEASE
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif
#include "MemTrace.h"
extern MemTrace MemTracer;

#ifdef DEBUG
#include "nommgr.h"
#endif

#include <SFML/Graphics.hpp>

//(*InternalHeaders(Game_Develop_EditorFrame)
#include <wx/bitmap.h>
#include <wx/icon.h>
#include <wx/intl.h>
#include <wx/image.h>
#include <wx/string.h>
//*)
#include "wx/aui/aui.h"
#include <wx/textctrl.h>
#include <wx/toolbar.h>
#include <wx/imaglist.h>
#include <wx/fileconf.h>
#include <wx/filename.h>
#include <wx/config.h>
#include <wx/msgdlg.h>
#include <wx/log.h>
#include <wx/fileconf.h>
#include <wx/artprov.h>

#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>

#include <iostream>
#include <string>
#include <list>
#include <sstream>
#include "wxSFMLCanvas.hpp"
#include "GDAuiTabArt.h"

#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "Game_Develop_EditorMain.h"
#include "GDL/StdAlgo.h"
#include "GDL/ChercherScene.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/EditorImages.h"
#include "ChoixObjet.h"
#include "MyStatusBar.h"
#include "EditorObjets.h"
#include "EditorEvents.h"
#include "EditorScene.h"
#include "EditorObjectList.h"
#include "DnDFileEditor.h"
#include "ConsoleManager.h"
#include "ProjectManager.h"

//(*IdInit(Game_Develop_EditorFrame)
const long Game_Develop_EditorFrame::ID_PANEL3 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT1 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT16 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT2 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT17 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT6 = wxNewId();
const long Game_Develop_EditorFrame::ID_BUTTON3 = wxNewId();
const long Game_Develop_EditorFrame::ID_BUTTON4 = wxNewId();
const long Game_Develop_EditorFrame::ID_BUTTON1 = wxNewId();
const long Game_Develop_EditorFrame::ID_TREECTRL1 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT3 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICTEXT4 = wxNewId();
const long Game_Develop_EditorFrame::ID_STATICLINE1 = wxNewId();
const long Game_Develop_EditorFrame::ID_BUTTON2 = wxNewId();
const long Game_Develop_EditorFrame::ID_BUTTON10 = wxNewId();
const long Game_Develop_EditorFrame::ID_PANEL2 = wxNewId();
const long Game_Develop_EditorFrame::ID_AUINOTEBOOK1 = wxNewId();
const long Game_Develop_EditorFrame::ID_PANEL1 = wxNewId();
const long Game_Develop_EditorFrame::idMenuNew = wxNewId();
const long Game_Develop_EditorFrame::idMenuOpen = wxNewId();
const long Game_Develop_EditorFrame::idMenuFusion = wxNewId();
const long Game_Develop_EditorFrame::idMenuSave = wxNewId();
const long Game_Develop_EditorFrame::idMenuSaveAs = wxNewId();
const long Game_Develop_EditorFrame::idMenuPortable = wxNewId();
const long Game_Develop_EditorFrame::idMenuCompil = wxNewId();
const long Game_Develop_EditorFrame::idMenuQuit = wxNewId();
const long Game_Develop_EditorFrame::idMenuImgEditor = wxNewId();
const long Game_Develop_EditorFrame::idMenuShowToolBar = wxNewId();
const long Game_Develop_EditorFrame::idMenuShowToolbarEditors = wxNewId();
const long Game_Develop_EditorFrame::idMenuShowToolbarCG = wxNewId();
const long Game_Develop_EditorFrame::IdMenuShowToolbarAide = wxNewId();
const long Game_Develop_EditorFrame::idMenuEncoder = wxNewId();
const long Game_Develop_EditorFrame::idMenuGIF = wxNewId();
const long Game_Develop_EditorFrame::idMenuRPG = wxNewId();
const long Game_Develop_EditorFrame::idMenuSpriteSheet = wxNewId();
const long Game_Develop_EditorFrame::idMenuSimple = wxNewId();
const long Game_Develop_EditorFrame::idMenuPref = wxNewId();
const long Game_Develop_EditorFrame::idMenuWSDef = wxNewId();
const long Game_Develop_EditorFrame::idMenuWSDet = wxNewId();
const long Game_Develop_EditorFrame::idMenuWSSimple = wxNewId();
const long Game_Develop_EditorFrame::idMenuWSChrono = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM1 = wxNewId();
const long Game_Develop_EditorFrame::idMenuTuto = wxNewId();
const long Game_Develop_EditorFrame::idMenuHelp = wxNewId();
const long Game_Develop_EditorFrame::idMenuForum = wxNewId();
const long Game_Develop_EditorFrame::idMenuWiki = wxNewId();
const long Game_Develop_EditorFrame::idMenuSite = wxNewId();
const long Game_Develop_EditorFrame::idMenuMAJ = wxNewId();
const long Game_Develop_EditorFrame::idMenuAbout = wxNewId();
const long Game_Develop_EditorFrame::idMenuEditScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuEditPropScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuModVar = wxNewId();
const long Game_Develop_EditorFrame::idMenuModNameScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuAddScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuDelScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuCopyScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuCutScene = wxNewId();
const long Game_Develop_EditorFrame::idMenuPasteScene = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM8 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM2 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM3 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM4 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM5 = wxNewId();
const long Game_Develop_EditorFrame::ID_MENUITEM6 = wxNewId();
//*)
const long Game_Develop_EditorFrame::IDM_RECENTS = wxNewId();
const long Game_Develop_EditorFrame::idRibbonNew = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOpen = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSave = wxNewId();
const long Game_Develop_EditorFrame::idRibbonImagesEditor = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSaveAs = wxNewId();
const long Game_Develop_EditorFrame::idRibbonPortable = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCompil = wxNewId();
const long Game_Develop_EditorFrame::idRibbonSimpleMode = wxNewId();
const long Game_Develop_EditorFrame::idRibbonImporter = wxNewId();
const long Game_Develop_EditorFrame::idRibbonEncoder = wxNewId();
const long Game_Develop_EditorFrame::idRibbonOptions = wxNewId();
const long Game_Develop_EditorFrame::idRibbonHelp = wxNewId();
const long Game_Develop_EditorFrame::idRibbonTuto = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWiki = wxNewId();
const long Game_Develop_EditorFrame::idRibbonForum = wxNewId();
const long Game_Develop_EditorFrame::idRibbonUpdate = wxNewId();
const long Game_Develop_EditorFrame::idRibbonWebSite = wxNewId();
const long Game_Develop_EditorFrame::idRibbonCredits = wxNewId();

BEGIN_EVENT_TABLE( Game_Develop_EditorFrame, wxFrame )
    //(*EventTable(Game_Develop_EditorFrame)
    //*)
END_EVENT_TABLE()


////////////////////////////////////////////////////////////
/// Constructeur
////////////////////////////////////////////////////////////
Game_Develop_EditorFrame::Game_Develop_EditorFrame( wxWindow* parent, const Game & game_, string FileToOpen) :
game(game_),
m_ribbon(NULL),
ribbonSceneEditorButtonBar(NULL),
m_fichierJeu("")
{

    //(*Initialize(Game_Develop_EditorFrame)
    wxStaticBoxSizer* StaticBoxSizer2;
    wxBoxSizer* BoxSizer6;
    wxMenuItem* MenuItem8;
    wxFlexGridSizer* FlexGridSizer4;
    wxMenuItem* MenuItem33;
    wxFlexGridSizer* FlexGridSizer19;
    wxFlexGridSizer* FlexGridSizer3;
    wxMenuItem* MenuItem1;
    wxMenuItem* MenuItem14;
    wxFlexGridSizer* FlexGridSizer5;
    wxMenuItem* MenuItem11;
    wxMenuItem* MenuItem15;
    wxMenuItem* MenuItem37;
    wxFlexGridSizer* FlexGridSizer2;
    wxMenuItem* MenuItem32;
    wxMenuItem* MenuItem17;
    wxMenuItem* MenuItem13;
    wxMenu* Menu1;
    wxFlexGridSizer* FlexGridSizer7;
    wxMenuItem* MenuItem42;
    wxMenuItem* MenuItem12;
    wxMenuItem* MenuItem3;
    wxFlexGridSizer* FlexGridSizer8;
    wxMenuItem* MenuItem23;
    wxMenuItem* MenuItem41;
    wxMenuBar* MenuBar1;
    wxFlexGridSizer* FlexGridSizer6;
    wxMenuItem* editMenuItem;
    wxStaticBoxSizer* StaticBoxSizer1;
    wxFlexGridSizer* FlexGridSizer1;
    wxFlexGridSizer* FlexGridSizer11;
    wxMenuItem* MenuItem16;
    wxBoxSizer* BoxSizer3;
    wxMenu* Menu2;
    wxMenuItem* MenuItem45;
    wxMenuItem* MenuItem30;
    wxFlexGridSizer* ribbonSizer;
    wxMenu* Menu5;

    Create(parent, wxID_ANY, _("Game Develop - Nouveau jeu"), wxDefaultPosition, wxDefaultSize, wxDEFAULT_FRAME_STYLE, _T("wxID_ANY"));
    SetClientSize(wxSize(850,700));
    {
    	wxIcon FrameIcon;
    	FrameIcon.CopyFromBitmap(wxBitmap(wxImage(_T("res/icon16.ico"))));
    	SetIcon(FrameIcon);
    }
    FlexGridSizer1 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer1->AddGrowableCol(0);
    FlexGridSizer1->AddGrowableRow(1);
    FlexGridSizer8 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer8->AddGrowableCol(0);
    FlexGridSizer8->AddGrowableRow(0);
    ribbonPanel = new wxPanel(this, ID_PANEL3, wxDefaultPosition, wxDefaultSize, wxTAB_TRAVERSAL, _T("ID_PANEL3"));
    ribbonSizer = new wxFlexGridSizer(0, 1, 0, 0);
    ribbonSizer->AddGrowableCol(0);
    ribbonSizer->AddGrowableRow(0);
    ribbonPanel->SetSizer(ribbonSizer);
    ribbonSizer->Fit(ribbonPanel);
    ribbonSizer->SetSizeHints(ribbonPanel);
    FlexGridSizer8->Add(ribbonPanel, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer1->Add(FlexGridSizer8, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1 = new wxPanel(this, ID_PANEL1, wxDefaultPosition, wxSize(629,484), wxTAB_TRAVERSAL, _T("ID_PANEL1"));
    FlexGridSizer2 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer2->AddGrowableCol(0);
    FlexGridSizer2->AddGrowableRow(0);
    editorsNotebook = new wxAuiNotebook(Panel1, ID_AUINOTEBOOK1, wxDefaultPosition, wxDefaultSize, wxAUI_NB_TAB_SPLIT|wxAUI_NB_TAB_MOVE|wxAUI_NB_SCROLL_BUTTONS|wxAUI_NB_TOP|wxNO_BORDER);
    Panel2 = new wxPanel(editorsNotebook, ID_PANEL2, wxDefaultPosition, wxSize(700,462), wxTAB_TRAVERSAL, _T("ID_PANEL2"));
    Panel2->SetBackgroundColour(wxColour(255,255,255));
    Panel2->SetToolTip(_("L\'éditeur du jeu permet de régler les principaux paramètres et de créer les scènes."));
    FlexGridSizer3 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer3->AddGrowableCol(0);
    FlexGridSizer3->AddGrowableRow(1);
    BoxSizer3 = new wxBoxSizer(wxHORIZONTAL);
    StaticBoxSizer1 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Paramètres principaux du jeu"));
    FlexGridSizer4 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer4->AddGrowableCol(0);
    FlexGridSizer4->AddGrowableRow(0);
    BoxSizer6 = new wxBoxSizer(wxHORIZONTAL);
    FlexGridSizer5 = new wxFlexGridSizer(0, 2, 0, 0);
    StaticText = new wxStaticText(Panel2, ID_STATICTEXT1, _("Nom :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT1"));
    FlexGridSizer5->Add(StaticText, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    NomJeuTxt = new wxStaticText(Panel2, ID_STATICTEXT16, _("Sans Nom"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT16"));
    FlexGridSizer5->Add(NomJeuTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    StaticText9 = new wxStaticText(Panel2, ID_STATICTEXT2, _("Auteur :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT2"));
    FlexGridSizer5->Add(StaticText9, 1, wxALL|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    AuteurTxt = new wxStaticText(Panel2, ID_STATICTEXT17, wxEmptyString, wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT17"));
    FlexGridSizer5->Add(AuteurTxt, 1, wxALL|wxALIGN_LEFT|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer6->Add(FlexGridSizer5, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer19 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer19->AddGrowableCol(0);
    FlexGridSizer19->AddGrowableRow(0);
    TailleJeuTxt = new wxStaticText(Panel2, ID_STATICTEXT6, _("Taille de la fenêtre du jeu :"), wxDefaultPosition, wxDefaultSize, 0, _T("ID_STATICTEXT6"));
    FlexGridSizer19->Add(TailleJeuTxt, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
    BoxSizer6->Add(FlexGridSizer19, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer4->Add(BoxSizer6, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer11 = new wxFlexGridSizer(0, 3, 0, 0);
    FlexGridSizer11->AddGrowableCol(0);
    FlexGridSizer11->AddGrowableRow(0);
    extensionsEditBt = new wxButton(Panel2, ID_BUTTON3, _("Utiliser des modules d\'extensions"), wxDefaultPosition, wxSize(220,25), 0, wxDefaultValidator, _T("ID_BUTTON3"));
    FlexGridSizer11->Add(extensionsEditBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    globalVarBt = new wxButton(Panel2, ID_BUTTON4, _("Variables globales"), wxDefaultPosition, wxSize(110,25), 0, wxDefaultValidator, _T("ID_BUTTON4"));
    FlexGridSizer11->Add(globalVarBt, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    ModParaBt = new wxButton(Panel2, ID_BUTTON1, _("Modifier les paramètres du jeu"), wxDefaultPosition, wxSize(220,25), 0, wxDefaultValidator, _T("ID_BUTTON1"));
    ModParaBt->SetToolTip(_("Modifier les principaux paramètres du jeu :\nTaille de la fenêtre, nom du jeu et de l\'auteur, écran de chargement..."));
    FlexGridSizer11->Add(ModParaBt, 1, wxALL|wxFIXED_MINSIZE|wxALIGN_RIGHT|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer4->Add(FlexGridSizer11, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer1->Add(FlexGridSizer4, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    BoxSizer3->Add(StaticBoxSizer1, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(BoxSizer3, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    StaticBoxSizer2 = new wxStaticBoxSizer(wxHORIZONTAL, Panel2, _("Scènes du jeu"));
    FlexGridSizer7 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer7->AddGrowableCol(0);
    FlexGridSizer7->AddGrowableRow(0);
    SceneTree = new wxTreeCtrl(Panel2, ID_TREECTRL1, wxDefaultPosition, wxDefaultSize, wxTR_EDIT_LABELS|wxTR_DEFAULT_STYLE, wxDefaultValidator, _T("ID_TREECTRL1"));
    SceneTree->SetToolTip(_("Liste des scènes qui composent le jeu.\nPour commencer, créez une scène."));
    FlexGridSizer7->Add(SceneTree, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer7, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    FlexGridSizer6 = new wxFlexGridSizer(0, 1, 0, 0);
    FlexGridSizer6->AddGrowableCol(0);
    FlexGridSizer6->AddGrowableRow(0);
    StaticText1 = new wxStaticText(Panel2, ID_STATICTEXT3, _("Le jeu commençera par la première \nscène de la liste."), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT3"));
    FlexGridSizer6->Add(StaticText1, 1, wxALL|wxALIGN_TOP|wxALIGN_CENTER_HORIZONTAL, 5);
    StaticText2 = new wxStaticText(Panel2, ID_STATICTEXT4, _("Le jeu ne contient aucune scène,\nil vous faut en ajouter une. Faites un\nclic droit sur \"Toutes les scènes\" et\nchoisissez \"Ajouter une scène\""), wxDefaultPosition, wxDefaultSize, wxALIGN_CENTRE, _T("ID_STATICTEXT4"));
    StaticText2->SetForegroundColour(wxColour(128,0,0));
    FlexGridSizer6->Add(StaticText2, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticLine1 = new wxStaticLine(Panel2, ID_STATICLINE1, wxDefaultPosition, wxSize(10,-1), wxLI_HORIZONTAL, _T("ID_STATICLINE1"));
    FlexGridSizer6->Add(StaticLine1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    EditSceneBt = new wxButton(Panel2, ID_BUTTON2, _("Editer la scène choisie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON2"));
    EditSceneBt->SetToolTip(_("Permet d\'éditer la scène surlignée : Objets, Evenements..."));
    FlexGridSizer6->Add(EditSceneBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    EditPropSceneBt = new wxButton(Panel2, ID_BUTTON10, _("Editer les propriétés de la scène choisie"), wxDefaultPosition, wxDefaultSize, 0, wxDefaultValidator, _T("ID_BUTTON10"));
    EditPropSceneBt->SetToolTip(_("Cliquez pour modifier les principaux paramètres de la scène : Couleur d\'arrière plan, titre..."));
    FlexGridSizer6->Add(EditPropSceneBt, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    StaticBoxSizer2->Add(FlexGridSizer6, 1, wxALL|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    FlexGridSizer3->Add(StaticBoxSizer2, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 5);
    Panel2->SetSizer(FlexGridSizer3);
    FlexGridSizer3->SetSizeHints(Panel2);
    editorsNotebook->AddPage(Panel2, _("Editeur du jeu"));
    FlexGridSizer2->Add(editorsNotebook, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    Panel1->SetSizer(FlexGridSizer2);
    FlexGridSizer2->SetSizeHints(Panel1);
    FlexGridSizer1->Add(Panel1, 1, wxALL|wxEXPAND|wxALIGN_CENTER_HORIZONTAL|wxALIGN_CENTER_VERTICAL, 0);
    SetSizer(FlexGridSizer1);
    MenuBar1 = new wxMenuBar();
    Menu1 = new wxMenu();
    MenuItem7 = new wxMenuItem(Menu1, idMenuNew, _("Nouveau\tCtrl-N"), _("Créer un nouveau jeu vierge"), wxITEM_NORMAL);
    MenuItem7->SetBitmap(wxBitmap(wxImage(_T("res/newicon.png"))));
    Menu1->Append(MenuItem7);
    Menu1->AppendSeparator();
    MenuItem2 = new wxMenuItem(Menu1, idMenuOpen, _("Ouvrir\tCtrl-O"), _("Ouvrir un jeu créé avec Game Develop"), wxITEM_NORMAL);
    MenuItem2->SetBitmap(wxBitmap(wxImage(_T("res/openicon.png"))));
    Menu1->Append(MenuItem2);
    wxMenu *menuRecents=new wxMenu;
    Menu1->Append(IDM_RECENTS,_("Récemment ouvert"),menuRecents);
    MenuItem35 = new wxMenuItem(Menu1, idMenuFusion, _("Importer un jeu"), wxEmptyString, wxITEM_NORMAL);
    MenuItem35->SetBitmap(wxBitmap(wxImage(_T("res/fusionicon.png"))));
    Menu1->Append(MenuItem35);
    Menu1->AppendSeparator();
    MenuItem4 = new wxMenuItem(Menu1, idMenuSave, _("Enregistrer\tCtrl-S"), _("Enregistrer le jeu"), wxITEM_NORMAL);
    MenuItem4->SetBitmap(wxBitmap(wxImage(_T("res/saveicon.png"))));
    Menu1->Append(MenuItem4);
    MenuItem5 = new wxMenuItem(Menu1, idMenuSaveAs, _("Enregistrer sous...\tCtrl-Maj-S"), _("Enregistrer le jeu sous un nouveau fichier"), wxITEM_NORMAL);
    MenuItem5->SetBitmap(wxBitmap(wxImage(_T("res/saveasicon.png"))));
    Menu1->Append(MenuItem5);
    MenuItem30 = new wxMenuItem(Menu1, idMenuPortable, _("Enregistrer le jeu en version portable"), wxEmptyString, wxITEM_NORMAL);
    MenuItem30->SetBitmap(wxBitmap(wxImage(_T("res/portableicon.png"))));
    Menu1->Append(MenuItem30);
    Menu1->AppendSeparator();
    MenuItem28 = new wxMenuItem(Menu1, idMenuCompil, _("Compiler en un jeu exécutable"), wxEmptyString, wxITEM_NORMAL);
    MenuItem28->SetBitmap(wxBitmap(wxImage(_T("res/compil.png"))));
    Menu1->Append(MenuItem28);
    Menu1->AppendSeparator();
    MenuItem1 = new wxMenuItem(Menu1, idMenuQuit, _("Quitter\tAlt-F4"), _("Quitter Game Develop"), wxITEM_NORMAL);
    MenuItem1->SetBitmap(wxBitmap(wxImage(_T("res/quiticon.png"))));
    Menu1->Append(MenuItem1);
    MenuBar1->Append(Menu1, _("&Fichier"));
    Menu3 = new wxMenu();
    MenuItem8 = new wxMenuItem(Menu3, idMenuImgEditor, _("Editeur de la banque d\'image"), _("Ouvrir l\'éditeur de la banque d\'image"), wxITEM_NORMAL);
    MenuItem8->SetBitmap(wxBitmap(wxImage(_T("res/imageicon.png"))));
    Menu3->Append(MenuItem8);
    Menu3->AppendSeparator();
    MenuItem15 = new wxMenuItem(Menu3, idMenuShowToolBar, _("Barre d\'outils commune"), wxEmptyString, wxITEM_NORMAL);
    MenuItem15->SetBitmap(wxBitmap(wxImage(_T("res/toolbaricon.png"))));
    Menu3->Append(MenuItem15);
    MenuItem16 = new wxMenuItem(Menu3, idMenuShowToolbarEditors, _("Barre d\'outils des éditeurs"), wxEmptyString, wxITEM_NORMAL);
    MenuItem16->SetBitmap(wxBitmap(wxImage(_T("res/toolbaricon.png"))));
    Menu3->Append(MenuItem16);
    MenuItem17 = new wxMenuItem(Menu3, idMenuShowToolbarCG, _("Barre d\'outils Compil Games"), wxEmptyString, wxITEM_NORMAL);
    MenuItem17->SetBitmap(wxBitmap(wxImage(_T("res/toolbaricon.png"))));
    Menu3->Append(MenuItem17);
    MenuItem34 = new wxMenuItem(Menu3, IdMenuShowToolbarAide, _("Barre d\'outils d\'aide"), wxEmptyString, wxITEM_NORMAL);
    MenuItem34->SetBitmap(wxBitmap(wxImage(_T("res/toolbaricon.png"))));
    Menu3->Append(MenuItem34);
    MenuBar1->Append(Menu3, _("&Affichage"));
    Menu5 = new wxMenu();
    MenuItem23 = new wxMenuItem(Menu5, idMenuEncoder, _("Encoder un fichier MP3 en OGG"), wxEmptyString, wxITEM_NORMAL);
    Menu5->Append(MenuItem23);
    Menu5->AppendSeparator();
    MenuItem38 = new wxMenuItem(Menu5, idMenuGIF, _("Décomposer un GIF animé"), wxEmptyString, wxITEM_NORMAL);
    MenuItem38->SetBitmap(wxBitmap(wxImage(_T("res/importgif.png"))));
    Menu5->Append(MenuItem38);
    MenuItem39 = new wxMenuItem(Menu5, idMenuRPG, _("Décomposer un personnage RPG Maker"), wxEmptyString, wxITEM_NORMAL);
    MenuItem39->SetBitmap(wxBitmap(wxImage(_T("res/importrpgmaker.png"))));
    Menu5->Append(MenuItem39);
    MenuItem9 = new wxMenuItem(Menu5, idMenuSpriteSheet, _("Décomposer une feuille de sprite"), wxEmptyString, wxITEM_NORMAL);
    MenuItem9->SetBitmap(wxBitmap(wxImage(_T("res/spritesheet16.png"))));
    Menu5->Append(MenuItem9);
    Menu5->AppendSeparator();
    MenuItem37 = new wxMenuItem(Menu5, idMenuSimple, _("Mode Simple"), wxEmptyString, wxITEM_NORMAL);
    MenuItem37->SetBitmap(wxBitmap(wxImage(_T("res/modesimpleicon.png"))));
    Menu5->Append(MenuItem37);
    MenuBar1->Append(Menu5, _("O&utils"));
    Menu4 = new wxMenu();
    MenuItem22 = new wxMenuItem(Menu4, idMenuPref, _("Préférences"), wxEmptyString, wxITEM_NORMAL);
    MenuItem22->SetBitmap(wxBitmap(wxImage(_T("res/preficon.png"))));
    Menu4->Append(MenuItem22);
    Menu4->AppendSeparator();
    MenuItem24 = new wxMenu();
    MenuItem25 = new wxMenuItem(MenuItem24, idMenuWSDef, _("Défaut"), wxEmptyString, wxITEM_NORMAL);
    MenuItem24->Append(MenuItem25);
    MenuItem26 = new wxMenuItem(MenuItem24, idMenuWSDet, _("Detaché"), wxEmptyString, wxITEM_NORMAL);
    MenuItem24->Append(MenuItem26);
    MenuItem27 = new wxMenuItem(MenuItem24, idMenuWSSimple, _("Simple"), wxEmptyString, wxITEM_NORMAL);
    MenuItem24->Append(MenuItem27);
    MenuItem31 = new wxMenuItem(MenuItem24, idMenuWSChrono, _("Chronologique"), wxEmptyString, wxITEM_NORMAL);
    MenuItem24->Append(MenuItem31);
    Menu4->Append(ID_MENUITEM1, _("Espace de travail pré-réglé"), MenuItem24, wxEmptyString);
    MenuBar1->Append(Menu4, _("&Options"));
    Menu2 = new wxMenu();
    MenuItem29 = new wxMenuItem(Menu2, idMenuTuto, _("Tutoriel"), wxEmptyString, wxITEM_NORMAL);
    MenuItem29->SetBitmap(wxBitmap(wxImage(_T("res/tutoicon.png"))));
    Menu2->Append(MenuItem29);
    MenuItem6 = new wxMenuItem(Menu2, idMenuHelp, _("Aide\tF1"), _("Afficher l\'aide de Game Develop"), wxITEM_NORMAL);
    MenuItem6->SetBitmap(wxBitmap(wxImage(_T("res/helpicon.png"))));
    Menu2->Append(MenuItem6);
    Menu2->AppendSeparator();
    MenuItem32 = new wxMenuItem(Menu2, idMenuForum, _("Communauté de Game Develop"), wxEmptyString, wxITEM_NORMAL);
    MenuItem32->SetBitmap(wxBitmap(wxImage(_T("res/forumicon.png"))));
    Menu2->Append(MenuItem32);
    MenuItem40 = new wxMenuItem(Menu2, idMenuWiki, _("Wiki de Game Develop"), wxEmptyString, wxITEM_NORMAL);
    MenuItem40->SetBitmap(wxBitmap(wxImage(_T("res/wikiicon.png"))));
    Menu2->Append(MenuItem40);
    MenuItem33 = new wxMenuItem(Menu2, idMenuSite, _("Site web de Compil Games"), wxEmptyString, wxITEM_NORMAL);
    MenuItem33->SetBitmap(wxBitmap(wxImage(_T("res/siteicon.png"))));
    Menu2->Append(MenuItem33);
    MenuItem36 = new wxMenuItem(Menu2, idMenuMAJ, _("Vérifier les mises à jour"), wxEmptyString, wxITEM_NORMAL);
    Menu2->Append(MenuItem36);
    Menu2->AppendSeparator();
    MenuItem3 = new wxMenuItem(Menu2, idMenuAbout, _("A propos..."), _("Informations sur Game Develop"), wxITEM_NORMAL);
    Menu2->Append(MenuItem3);
    MenuBar1->Append(Menu2, _("A&ide"));
    SetMenuBar(MenuBar1);
    editMenuItem = new wxMenuItem((&ContextMenu), idMenuEditScene, _("Editer cette scène"), wxEmptyString, wxITEM_NORMAL);
    editMenuItem->SetBitmap(wxBitmap(wxImage(_T("res/editicon.png"))));
    ContextMenu.Append(editMenuItem);
    #ifdef __WXMSW__
    ContextMenu.Remove(editMenuItem);
    wxFont boldFont(wxDEFAULT,wxDEFAULT,wxFONTSTYLE_NORMAL,wxBOLD,false,wxEmptyString,wxFONTENCODING_DEFAULT);
    editMenuItem->SetFont(boldFont);
    ContextMenu.Append(editMenuItem);
    #endif
    MenuItem18 = new wxMenuItem((&ContextMenu), idMenuEditPropScene, _("Modifier les propriétés"), wxEmptyString, wxITEM_NORMAL);
    MenuItem18->SetBitmap(wxBitmap(wxImage(_T("res/editpropicon.png"))));
    ContextMenu.Append(MenuItem18);
    modVarSceneMenuI = new wxMenuItem((&ContextMenu), idMenuModVar, _("Modifier les variables initiales"), wxEmptyString, wxITEM_NORMAL);
    modVarSceneMenuI->SetBitmap(wxBitmap(wxImage(_T("res/var.png"))));
    ContextMenu.Append(modVarSceneMenuI);
    MenuItem14 = new wxMenuItem((&ContextMenu), idMenuModNameScene, _("Modifier le nom"), wxEmptyString, wxITEM_NORMAL);
    MenuItem14->SetBitmap(wxBitmap(wxImage(_T("res/editnom.png"))));
    ContextMenu.Append(MenuItem14);
    ContextMenu.AppendSeparator();
    MenuItem12 = new wxMenuItem((&ContextMenu), idMenuAddScene, _("Ajouter une scène"), wxEmptyString, wxITEM_NORMAL);
    MenuItem12->SetBitmap(wxBitmap(wxImage(_T("res/addicon.png"))));
    ContextMenu.Append(MenuItem12);
    MenuItem13 = new wxMenuItem((&ContextMenu), idMenuDelScene, _("Supprimer la scène"), wxEmptyString, wxITEM_NORMAL);
    MenuItem13->SetBitmap(wxBitmap(wxImage(_T("res/deleteicon.png"))));
    ContextMenu.Append(MenuItem13);
    ContextMenu.AppendSeparator();
    MenuItem19 = new wxMenuItem((&ContextMenu), idMenuCopyScene, _("Copier la scène"), wxEmptyString, wxITEM_NORMAL);
    MenuItem19->SetBitmap(wxBitmap(wxImage(_T("res/copyicon.png"))));
    ContextMenu.Append(MenuItem19);
    MenuItem20 = new wxMenuItem((&ContextMenu), idMenuCutScene, _("Couper la scène"), wxEmptyString, wxITEM_NORMAL);
    MenuItem20->SetBitmap(wxBitmap(wxImage(_T("res/cuticon.png"))));
    ContextMenu.Append(MenuItem20);
    MenuItem21 = new wxMenuItem((&ContextMenu), idMenuPasteScene, _("Coller la scène"), wxEmptyString, wxITEM_NORMAL);
    MenuItem21->SetBitmap(wxBitmap(wxImage(_T("res/pasteicon.png"))));
    ContextMenu.Append(MenuItem21);
    MenuItem45 = new wxMenuItem((&openContextMenu), ID_MENUITEM8, _("Importer un jeu"), wxEmptyString, wxITEM_NORMAL);
    MenuItem45->SetBitmap(wxBitmap(wxImage(_T("res/fusionicon.png"))));
    openContextMenu.Append(MenuItem45);
    wxMenu * contextMenuRecents =new wxMenu;
     openContextMenu.Append(IDM_RECENTS,_("Récemment ouvert"), contextMenuRecents);
    MenuItem10 = new wxMenuItem((&saveContextMenu), ID_MENUITEM2, _("Enregistrer sous..."), wxEmptyString, wxITEM_NORMAL);
    MenuItem10->SetBitmap(wxBitmap(wxImage(_T("res/saveasicon.png"))));
    saveContextMenu.Append(MenuItem10);
    MenuItem11 = new wxMenuItem((&saveContextMenu), ID_MENUITEM3, _("Enregistrer en version portable"), wxEmptyString, wxITEM_NORMAL);
    MenuItem11->SetBitmap(wxBitmap(wxImage(_T("res/portableicon.png"))));
    saveContextMenu.Append(MenuItem11);
    MenuItem41 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM4, _("Décomposer un GIF animé"), wxEmptyString, wxITEM_NORMAL);
    MenuItem41->SetBitmap(wxBitmap(wxImage(_T("res/importgif.png"))));
    decomposerContextMenu.Append(MenuItem41);
    MenuItem42 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM5, _("Décomposer un personnage RPG Maker"), wxEmptyString, wxITEM_NORMAL);
    MenuItem42->SetBitmap(wxBitmap(wxImage(_T("res/importrpgmaker.png"))));
    decomposerContextMenu.Append(MenuItem42);
    MenuItem43 = new wxMenuItem((&decomposerContextMenu), ID_MENUITEM6, _("Décomposer une feuille de sprite"), wxEmptyString, wxITEM_NORMAL);
    MenuItem43->SetBitmap(wxBitmap(wxImage(_T("res/spritesheet16.png"))));
    decomposerContextMenu.Append(MenuItem43);
    FlexGridSizer1->SetSizeHints(this);
    Center();

    Connect(ID_BUTTON3,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnextensionsEditBtClick);
    Connect(ID_BUTTON4,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnglobalVarBtClick);
    Connect(ID_BUTTON1,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnModParaBtClick);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_BEGIN_LABEL_EDIT,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeBeginLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_END_LABEL_EDIT,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeEndLabelEdit);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_ACTIVATED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeItemActivated);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_RIGHT_CLICK,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeSelectionChanged);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_SEL_CHANGED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeSelectionChanged);
    Connect(ID_TREECTRL1,wxEVT_COMMAND_TREE_ITEM_MENU,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnSceneTreeItemMenu);
    Connect(ID_BUTTON2,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnEditSceneBtClick);
    Connect(ID_BUTTON10,wxEVT_COMMAND_BUTTON_CLICKED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuEditPropSceneSelected);
    Connect(ID_AUINOTEBOOK1,wxEVT_COMMAND_AUINOTEBOOK_PAGE_CHANGED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnNotebook1PageChanged);
    Connect(idMenuNew,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuNewSelected);
    Connect(idMenuOpen,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuOpenSelected);
    Connect(idMenuFusion,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuFusionSelected);
    Connect(idMenuSave,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveSelected);
    Connect(idMenuSaveAs,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveAsSelected);
    Connect(idMenuPortable,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPortableSelected);
    Connect(idMenuCompil,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuCompilationSelected);
    Connect(idMenuQuit,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnQuit);
    Connect(idMenuImgEditor,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuImagesEditorSelected);
    Connect(idMenuShowToolBar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnShowTBSelected);
    Connect(idMenuShowToolbarEditors,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnShowTBEditorsSelected);
    Connect(idMenuShowToolbarCG,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnShowToolBarCGSelected);
    Connect(IdMenuShowToolbarAide,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnShowToolBarAideSelected);
    Connect(idMenuEncoder,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuItem23Selected);
    Connect(idMenuGIF,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeGIFSelected);
    Connect(idMenuRPG,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeRPGSelected);
    Connect(idMenuSpriteSheet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeSSSelected);
    Connect(idMenuSimple,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuModeSimpleSelected);
    Connect(idMenuPref,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPrefSelected);
    Connect(idMenuWSDef,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnWSDefautSelected);
    Connect(idMenuWSDet,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnWSDetacheSelected);
    Connect(idMenuWSSimple,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnWSSimpleSelected1);
    Connect(idMenuWSChrono,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnWSChronoSelected);
    Connect(idMenuTuto,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuTutoSelected);
    Connect(idMenuHelp,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuAideSelected);
    Connect(idMenuForum,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuForumSelected);
    Connect(idMenuWiki,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuWikiSelected);
    Connect(idMenuSite,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSiteSelected);
    Connect(idMenuMAJ,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuItem36Selected);
    Connect(idMenuAbout,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnAbout);
    Connect(idMenuEditScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnEditSceneBtClick);
    Connect(idMenuEditPropScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuEditPropSceneSelected);
    Connect(idMenuModVar,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnmodVarSceneMenuISelected);
    Connect(idMenuModNameScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnModNameScene);
    Connect(idMenuAddScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnAddScene);
    Connect(idMenuDelScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDelScene);
    Connect(idMenuCopyScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuCopySceneSelected);
    Connect(idMenuCutScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuCutSceneSelected);
    Connect(idMenuPasteScene,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPasteSceneSelected);
    Connect(ID_MENUITEM8,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuFusionSelected);
    Connect(ID_MENUITEM2,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuSaveAsSelected);
    Connect(ID_MENUITEM3,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnMenuPortableSelected);
    Connect(ID_MENUITEM4,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeGIFSelected);
    Connect(ID_MENUITEM5,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeRPGSelected);
    Connect(ID_MENUITEM6,wxEVT_COMMAND_MENU_SELECTED,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnDecomposeSSSelected);
    Connect(wxID_ANY,wxEVT_CLOSE_WINDOW,(wxObjectEventFunction)&Game_Develop_EditorFrame::OnClose);
    //*)
    Connect( wxID_FILE1, wxID_FILE9, wxEVT_COMMAND_MENU_SELECTED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRecentClicked );
    Connect( idRibbonNew, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuNewSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuOpenSelected );
    Connect( idRibbonOpen, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonOpenDropDownClicked );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSaveSelected );
    Connect( idRibbonSave, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonSaveDropDownClicked );
    Connect( idRibbonCompil, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuCompilationSelected );
    Connect( idRibbonImagesEditor, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuImagesEditorSelected );
    Connect( idRibbonEncoder, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem23Selected );
    Connect( idRibbonImporter, wxEVT_COMMAND_RIBBONBUTTON_DROPDOWN_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnRibbonDecomposerDropDownClicked );
    Connect( idRibbonSimpleMode, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuModeSimpleSelected );
    Connect( idRibbonOptions, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuPrefSelected );
    Connect( idRibbonHelp, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuAideSelected );
    Connect( idRibbonTuto, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuTutoSelected );
    Connect( idRibbonWiki, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuWikiSelected );
    Connect( idRibbonForum, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuForumSelected );
    Connect( idRibbonUpdate, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuItem36Selected );
    Connect( idRibbonWebSite, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnMenuSiteSelected );
    Connect( idRibbonCredits, wxEVT_COMMAND_RIBBONBUTTON_CLICKED, ( wxObjectEventFunction )&Game_Develop_EditorFrame::OnAbout );

    SetDropTarget(new DnDFileEditor(*this));

    //Accès à la configuration
    wxConfigBase *pConfig = wxConfigBase::Get();

    //Deactivate menu
    SetMenuBar(NULL);

    m_recentlist.SetMaxEntries( 9 );
    m_recentlist.SetAssociatedMenu( contextMenuRecents );

    //Status bar
    MyStatusBar * myStatusBar = new MyStatusBar(this);

    //Buttons' bitmap
    ModParaBt->SetBitmap(wxBitmap("res/paraJeu16.png", wxBITMAP_TYPE_ANY));
    extensionsEditBt->SetBitmap(wxBitmap("res/extensiononly16.png", wxBITMAP_TYPE_ANY));
    EditPropSceneBt->SetBitmap(wxBitmap("res/editpropicon.png", wxBITMAP_TYPE_ANY));
    EditSceneBt->SetBitmap(wxBitmap("res/editicon.png", wxBITMAP_TYPE_ANY));

    //Ribbon setup
    m_ribbon = new wxRibbonBar(ribbonPanel, wxID_ANY, wxDefaultPosition, wxSize(-1, 75));
    bool hideLabels = false;
    pConfig->Read( _T( "/Skin/HideLabels" ), &hideLabels );
    {

        wxRibbonPage* home = new wxRibbonPage(m_ribbon, wxID_ANY, _("Général"));

        wxRibbonPanel *filePanel = new wxRibbonPanel(home, wxID_ANY, _("Fichier"), wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_EXT_BUTTON);
        wxRibbonButtonBar *file_bar = new wxRibbonButtonBar(filePanel, wxID_ANY);
        file_bar->AddButton(idRibbonNew, !hideLabels ? _("Nouveau") : "", wxBitmap("res/newicon24.png", wxBITMAP_TYPE_ANY));
        file_bar->AddHybridButton(idRibbonOpen, !hideLabels ? _("Ouvrir") : " ", wxBitmap("res/openicon24.png", wxBITMAP_TYPE_ANY));
        file_bar->AddHybridButton(idRibbonSave, !hideLabels ? _("Enregistrer") : " ", wxBitmap("res/saveicon24.png", wxBITMAP_TYPE_ANY));
        file_bar->AddButton(idRibbonCompil, !hideLabels ? _("Compilation") : "", wxBitmap("res/compilicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *affichagePanel = new wxRibbonPanel(home, wxID_ANY, _("Affichage"), wxBitmap("res/imageicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *affichage_bar = new wxRibbonButtonBar(affichagePanel, wxID_ANY);
        affichage_bar->AddButton(idRibbonImagesEditor, !hideLabels ? _("Banque d'image") : "", wxBitmap("res/imageicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *toolsPanel = new wxRibbonPanel(home, wxID_ANY, _("Outils"), wxBitmap("res/tools24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *tools_bar = new wxRibbonButtonBar(toolsPanel, wxID_ANY);
        tools_bar->AddButton(idRibbonEncoder, !hideLabels ? _("Convertisseur") : "", wxBitmap("res/musicicon24.png", wxBITMAP_TYPE_ANY));
        tools_bar->AddDropdownButton(idRibbonImporter, !hideLabels ? _("Décomposeur") : "", wxBitmap("res/strip24.png", wxBITMAP_TYPE_ANY));
        tools_bar->AddButton(idRibbonSimpleMode, !hideLabels ? _("Mode simple") : "", wxBitmap("res/modesimple24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *optionsPanel = new wxRibbonPanel(home, wxID_ANY, _("Options"), wxBitmap("res/pref24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *options_bar = new wxRibbonButtonBar(optionsPanel, wxID_ANY);
        options_bar->AddButton(idRibbonOptions, !hideLabels ? _("Préférences") : "", wxBitmap("res/pref24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *helpPanel = new wxRibbonPanel(home, wxID_ANY, _("Aide et support"), wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *help_bar = new wxRibbonButtonBar(helpPanel, wxID_ANY);
        help_bar->AddButton(idRibbonHelp, !hideLabels ? _("Aide") : "", wxBitmap("res/helpicon24.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonTuto, !hideLabels ? _("Tutoriel") : "", wxBitmap("res/tutoicon24.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonWiki, !hideLabels ? _("Wiki") : "", wxBitmap("res/wiki.png", wxBITMAP_TYPE_ANY));
        help_bar->AddButton(idRibbonForum, !hideLabels ? _("Communauté") : "", wxBitmap("res/forumicon24.png", wxBITMAP_TYPE_ANY));

        wxRibbonPanel *creditsPanel = new wxRibbonPanel(home, wxID_ANY, _("A propos"), wxBitmap("res/icon24.png", wxBITMAP_TYPE_ANY), wxDefaultPosition, wxDefaultSize, wxRIBBON_PANEL_DEFAULT_STYLE);
        wxRibbonButtonBar *credits_bar = new wxRibbonButtonBar(creditsPanel, wxID_ANY);
        credits_bar->AddButton(idRibbonUpdate, !hideLabels ? _("Mise à jour") : "", wxBitmap("res/maj24.png", wxBITMAP_TYPE_ANY));
        credits_bar->AddButton(idRibbonWebSite, !hideLabels ? _("Site officiel") : "", wxBitmap("res/siteicon24.png", wxBITMAP_TYPE_ANY));
        credits_bar->AddButton(idRibbonCredits, !hideLabels ? _("A propos...") : "", wxBitmap("res/icon24.png", wxBITMAP_TYPE_ANY));
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Banque d'images"));
        EditorImages::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Scène"));
        ribbonSceneEditorButtonBar = EditorScene::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Evènements"));
        EditorEvents::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Objets"));
        EditorObjectList::CreateRibbonPage(ribbonEditorPage);
    }
    {
        wxRibbonPage * ribbonEditorPage = new wxRibbonPage(m_ribbon, wxID_ANY, _("Groupes"));
        EditorObjetsGroups::CreateRibbonPage(ribbonEditorPage);
    }
    ribbonSizer->Add(m_ribbon, 0, wxEXPAND);

    //notify wxAUI which frame to use
    m_mgr.SetManagedWindow( this );

    LoadSkin(&m_mgr);
    LoadSkin(m_ribbon);

    bool simpleModeActivated = false;
    pConfig->Read("/ModeSimple", &simpleModeActivated);
    if ( simpleModeActivated )
    {
        SetStatusBar(myStatusBar);
        myStatusBar->SetStatusText(_("Mode simple activé"), 1);
        myStatusBar->SetStatusText( "2008-2010 Compil Games", 2 );
    }
    else
    {
        SetStatusBar(myStatusBar);
        myStatusBar->SetStatusText( "2008-2010 Compil Games", 1 );
    }
    SetStatusBar(myStatusBar);

    //Icones pour la liste des scènes
    imageListScene = new wxImageList( 16, 16 );
    imageListScene->Add(( wxBitmap( "res/jeueditor.png", wxBITMAP_TYPE_ANY ) ) );
    imageListScene->Add(( wxBitmap( "res/sceneeditor.png", wxBITMAP_TYPE_ANY ) ) );
    SceneTree->AssignImageList( imageListScene );

    editorsNotebook->SetArtProvider(new GDAuiTabArt());
    editorsNotebook->SetPageBitmap(0, wxBitmap( "res/jeueditor.png", wxBITMAP_TYPE_ANY ));

    //Pour chaque toolbar : Initialiser la toolbar
    /*ToolBarDefaut = new wxToolBar( this, -1, wxDefaultPosition, wxDefaultSize,
                                   wxTB_FLAT | wxTB_NODIVIDER );
    ToolBarEditors = new wxToolBar( this, -1, wxDefaultPosition, wxDefaultSize,
                                    wxTB_FLAT | wxTB_NODIVIDER );
    ToolBarCG = new wxToolBar( this, -1, wxDefaultPosition, wxDefaultSize,
                                  wxTB_FLAT | wxTB_NODIVIDER );
    ToolBarAide = new wxToolBar( this, -1, wxDefaultPosition, wxDefaultSize,
                                  wxTB_FLAT | wxTB_NODIVIDER );

    //Puis appeler la fonction pour mettre à jour les toolbars :
    if ( !UpdateToolBar() )
        wxMessageBox( _("Erreur lors de la création des barres d'outils"), _("Erreur"), wxICON_EXCLAMATION );*/

    //
    MainEditorCommand imagesMainEditorCommand(nr, -1);
    imagesMainEditorCommand.SetRibbon(m_ribbon);
    imagesMainEditorCommand.SetMainEditor(this);

    projectManager = new ProjectManager(this, *this);


    //Puis ajout des éditeurs
    m_mgr.AddPane( projectManager, wxAuiPaneInfo().Name( wxT( "PM" ) ).Caption( _( "Projets" ) ).Left().MaximizeButton( true ).MinimizeButton( false ).MinSize(200,100) );
    m_mgr.AddPane( Panel1, wxAuiPaneInfo().Name( wxT( "EP" ) ).Caption( _( "Editeur principal" ) ).Center().CaptionVisible(false).CloseButton( false ).MaximizeButton( true ).MinimizeButton( false ) );
    m_mgr.AddPane( ribbonPanel, wxAuiPaneInfo().Name( wxT( "RP" ) ).Caption( _( "Ruban" ) ).Top().PaneBorder(false).CaptionVisible(false).Movable(false).Floatable(false).CloseButton( false ).MaximizeButton( false ).MinimizeButton( false ).MinSize(1, 107).Resizable(false) );

    RefreshListScene();

    wxString result;
    pConfig->Read( _T( "/Workspace/Actuel" ), &result );
    if ( result != "" )
        m_mgr.LoadPerspective( result , true );

    if ( !hideLabels )
        m_mgr.GetPane(ribbonPanel).MinSize(1, 107);
    else
        m_mgr.GetPane(ribbonPanel).MinSize(1, 100);

    for ( int i = 0;i < 9;i++ )
    {
        result = "";
        pConfig->Read( wxString::Format( _T( "/Recent/%d" ), i ), &result );
        m_recentlist.Append( result );
    }

    m_mgr.SetFlags( wxAUI_MGR_ALLOW_FLOATING | wxAUI_MGR_ALLOW_ACTIVE_PANE | wxAUI_MGR_TRANSPARENT_HINT
                    | wxAUI_MGR_TRANSPARENT_DRAG | wxAUI_MGR_HINT_FADE | wxAUI_MGR_NO_VENETIAN_BLINDS_FADE );

    m_mgr.Update();
    UpdateNotebook();
    m_ribbon->Realize();

    SetSize(900,740);
    Center();

    if ( FileToOpen != "" )
        Open(FileToOpen);
}

////////////////////////////////////////////////////////////
/// Destructeur
////////////////////////////////////////////////////////////
Game_Develop_EditorFrame::~Game_Develop_EditorFrame()
{
    //(*Destroy(Game_Develop_EditorFrame)
    //*)

    // deinitialize the frame manager
    m_mgr.UnInit();
}

void Game_Develop_EditorFrame::UpdateNotebook()
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    if ( pConfig->Exists( "/Onglets" ) )
    {
        editorsNotebook->SetWindowStyleFlag(wxAUI_NB_TOP | wxAUI_NB_TAB_SPLIT | wxAUI_NB_TAB_MOVE | wxAUI_NB_SCROLL_BUTTONS | wxNO_BORDER );
    }

}

////////////////////////////////////////////////////////////
/// Mise à jour des toolbars
////////////////////////////////////////////////////////////
bool Game_Develop_EditorFrame::UpdateToolBar()
{
    //Barre d'outils commune
    ToolBarDefaut->SetToolBitmapSize( wxSize( 24, 24 ) );
    ToolBarDefaut->AddTool( idMenuNew, wxT( "Nouveau" ), wxBitmap( wxImage( "res/newicon24.png" ) ), _("Créer un nouveau jeu") );
    ToolBarDefaut->AddTool( idMenuOpen, wxT( "Ouvrir" ), wxBitmap( wxImage( "res/openicon24.png" ) ), _("Ouvrir un jeu créé avec Game Develop") );
    ToolBarDefaut->AddTool( idMenuSave, wxT( "Enregistrer" ), wxBitmap( wxImage( "res/saveicon24.png" ) ), _("Enregistrer le jeu actuel") );
    ToolBarDefaut->AddTool( idMenuCompil, wxT( "Compilation" ), wxBitmap( wxImage( "res/compilicon24.png" ) ), _("Compiler le jeu pour le distribuer") );
    ToolBarDefaut->Realize();

    ToolBarEditors->SetToolBitmapSize( wxSize( 24, 24 ) );
    ToolBarEditors->AddTool( idMenuImgEditor, wxT( "Banque d'images" ), wxBitmap( wxImage( "res/imageicon24.png" ) ), _("Afficher l'éditeur de la banque d'images") );
    ToolBarEditors->Realize();

    ToolBarCG->SetToolBitmapSize( wxSize( 24, 24 ) );
    ToolBarCG->AddTool( idMenuForum, wxT( "Accéder au forum de Game Develop" ), wxBitmap( wxImage( "res/forumicon24.png" ) ), _("Accéder au forum de Game Develop") );
    ToolBarCG->AddTool( idMenuWiki, wxT( "Accéder au wiki de Game Develop" ), wxBitmap( wxImage( "res/wiki.png" ) ), _("Accéder au wiki de Game Develop") );
    ToolBarCG->AddTool( idMenuSite, wxT( "Accéder au site web Compil Games" ), wxBitmap( wxImage( "res/siteicon24.png" ) ), _("Accéder au site web de Compil Games") );
    ToolBarCG->Realize();

    ToolBarAide->SetToolBitmapSize( wxSize( 24, 24 ) );
    ToolBarAide->AddTool( idMenuTuto, wxT( "Tutoriel" ), wxBitmap( wxImage( "res/tutoicon24.png" ) ), _("Lire le tutoriel Pas à Pas : Galaxies War") );
    ToolBarAide->AddTool( idMenuHelp, wxT( "Aide" ), wxBitmap( wxImage( "res/helpicon24.png" ) ), _("Afficher l'aide de Game Develop") );
    ToolBarAide->Realize();

    m_mgr.Update();

    return true;
}


////////////////////////////////////////////////////////////
/// Fonction de fermeture. Placer ici les confirmations de quitter
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::OnClose( wxCloseEvent& event )
{
    if (wxMessageBox(_("Etes-vous sûr de vouloir quitter Game Develop ?"), _("Quitter Game Develop"), wxYES_NO ) == wxNO)
        return;

    wxConfigBase *pConfig = wxConfigBase::Get();

    pConfig->Write( _T( "/Workspace/Actuel" ), m_mgr.SavePerspective() );

    //Close the editor close the program.
    //We have to destroy the other frames.
    ConsoleManager * consoleManager = ConsoleManager::getInstance();
    consoleManager->kill();

    Destroy();
}

////////////////////////////////////////////////////////////
/// Rechargement des éditeurs -> Changement de jeu / images
////////////////////////////////////////////////////////////
void Game_Develop_EditorFrame::ReloadEditors()
{
    runtimeGame.imageManager.LoadImagesFromFile( game );
    nr.SetImagesAreUpToDate();
    nr.SetAllScenesMustBeReloaded();

    RefreshParaJeu();

    return;
}

void Game_Develop_EditorFrame::CloseAllSceneEditors()
{
    for (unsigned int i =0;i<game.m_scenes.size();i++)
        CloseScene(i);
}

void Game_Develop_EditorFrame::LoadSkin(wxRibbonBar * bar)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;
    pConfig->Read( _T( "/Skin/RDefined" ), &result );

    //Ribbon skin
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;
        int r2 = 120, v2 = 120, b2 = 120;

        wxRibbonArtProvider * ribbonArtProvider = NULL;
        pConfig->Read( _T( "/Skin/RibbonStyle" ), &result );

        //Style
        if ( result == "Office" )
            ribbonArtProvider = new wxRibbonMSWArtProvider();
        else if ( result == "AUI" )
            ribbonArtProvider = new wxRibbonAUIArtProvider();
        else
            ribbonArtProvider = new wxRibbonMSWArtProvider();

        bar->SetArtProvider(ribbonArtProvider);

        //Colors
        pConfig->Read( _T( "/Skin/Ribbon1R" ), &r );
        pConfig->Read( _T( "/Skin/Ribbon1G" ), &v );
        pConfig->Read( _T( "/Skin/Ribbon1B" ), &b );

        pConfig->Read( _T( "/Skin/Ribbon2R" ), &r2 );
        pConfig->Read( _T( "/Skin/Ribbon2G" ), &v2 );
        pConfig->Read( _T( "/Skin/Ribbon2B" ), &b2 );

        wxColour colour, secondary, tertiary;
        bar->GetArtProvider()->GetColourScheme(&colour, &secondary, &tertiary);
        bar->GetArtProvider()->SetColourScheme(wxColour(r, v, b), wxColour(r2, v2, b2), wxColour(0, 0, 0));

    }
    else
    {
        bar->SetArtProvider(new wxRibbonMSWArtProvider());
        bar->GetArtProvider()->SetColourScheme(wxColour(244, 245, 247), wxColour(231, 241, 254), wxColour(0, 0, 0));
    }
}

void Game_Develop_EditorFrame::LoadSkin(wxAuiManager * auiManager)
{
    wxConfigBase *pConfig = wxConfigBase::Get();
    wxString result;

    //DockArt skin
    wxAuiDefaultDockArt *dockArt = new wxAuiDefaultDockArt();
    pConfig->Read( _T( "/Skin/Defined" ), &result );
    if ( result == "true" )
    {
        int r = 120, v = 120, b = 120;

        pConfig->Read( _T( "/Skin/PaneA1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA1B" ), &b );
        dockArt->SetColour( 7, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneA2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneA2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneA2B" ), &b );
        dockArt->SetColour( 8, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI1R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI1G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI1B" ), &b );
        dockArt->SetColour( 9, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/PaneI2R" ), &r );
        pConfig->Read( _T( "/Skin/PaneI2G" ), &v );
        pConfig->Read( _T( "/Skin/PaneI2B" ), &b );
        dockArt->SetColour( 10, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BorderR" ), &r );
        pConfig->Read( _T( "/Skin/BorderG" ), &v );
        pConfig->Read( _T( "/Skin/BorderB" ), &b );
        dockArt->SetColour( 13, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/BackR" ), &r );
        pConfig->Read( _T( "/Skin/BackG" ), &v );
        pConfig->Read( _T( "/Skin/BackB" ), &b );
        dockArt->SetColour( 6, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ATextR" ), &r );
        pConfig->Read( _T( "/Skin/ATextG" ), &v );
        pConfig->Read( _T( "/Skin/ATextB" ), &b );
        dockArt->SetColour( 11, wxColour( r, v, b ) );

        pConfig->Read( _T( "/Skin/ITextR" ), &r );
        pConfig->Read( _T( "/Skin/ITextG" ), &v );
        pConfig->Read( _T( "/Skin/ITextB" ), &b );
        dockArt->SetColour( 12, wxColour( r, v, b ) );

    }
    else
    {
        dockArt->SetColour(6, wxColour(211,222,246));
        dockArt->SetColour(13, wxColour(172,183,208));
        dockArt->SetColour(9, wxColour(214,221,233));
        dockArt->SetColour(10, wxColour(214,221,233));
        dockArt->SetColour(7, wxColour(221,229,246));
        dockArt->SetColour(8, wxColour(221,229,246));
        dockArt->SetColour(11, wxColour(104,114,138));
        dockArt->SetColour(12, wxColour(104,114,138));
    }

    auiManager->SetArtProvider(dockArt);
}

////////////////////////////////////////////////////////////
/// Les nouvelles fonctions sont créés par défaut ( par wxSmith ) dans ce fichier.
/// Il faut les classer dans les fichiers appropriées ( MainFichier.cpp ... )
////////////////////////////////////////////////////////////
