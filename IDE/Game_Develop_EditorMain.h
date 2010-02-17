/***************************************************************
 * Name:      Game_Develop_EditorMain.h
 * Purpose:   Defines Application Frame
 * Author:    Florian "4ian" Rival ()
 * Created:   2008-03-01
 * Copyright: Florian "4ian" Rival ()
 * License:
 **************************************************************/

#ifndef GAME_DEVELOP_EDITORMAIN_H
#define GAME_DEVELOP_EDITORMAIN_H

//(*Headers(Game_Develop_EditorFrame)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/button.h>
#include <wx/frame.h>
//*)
#include "wx/aui/aui.h"
#include <wx/textctrl.h>
#include <wx/toolbar.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>

#include "GDL/EditorImages.h"
#include "EditorObjets.h"
#include "EditorEvents.h"
#include "EditorScene.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif

#include "wxSFMLCanvas.hpp"
#include <iostream>
#include <string>
#include <list>
#include <sstream>
#include <wx/fileconf.h>
#include <wx/artprov.h>
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "GDL/Game.h"
#include "GDL/OpenSaveGame.h"
#include <wx/log.h>
#include "GDL/StdAlgo.h"
#include "RecentList.h"
#include "GDL/needReload.h"
class RuntimeGame;
class ProjectManager;


using namespace std;

class Game_Develop_EditorFrame: public wxFrame
{
    friend class EditorImages;
    public:

        Game_Develop_EditorFrame(wxWindow* parent, const Game & game_, string FileToOpen);
        virtual ~Game_Develop_EditorFrame();

        Game game;
        vector < Game > games;

        void Open(string FichierJeu);

        static void LoadSkin(wxRibbonBar * bar);
        static void LoadSkin(wxAuiManager * auiManager);

        inline wxAuiNotebook * GetEditorsNotebook() { return editorsNotebook; };
        inline const wxAuiNotebook * GetEditorsNotebook() const { return editorsNotebook; };
        inline wxRibbonBar * GetRibbon() { return m_ribbon; };
        inline const wxRibbonBar * GetRibbon() const { return m_ribbon; };

    private:

        //(*Handlers(Game_Develop_EditorFrame)
        void OnQuit(wxCommandEvent& event);
        void OnAbout(wxCommandEvent& event);
        void OnButton4Click(wxCommandEvent& event);
        void OnButton1Click(wxCommandEvent& event);
        void OnUnusedVarLeftDown(wxMouseEvent& event);
        void OnClose(wxCloseEvent& event);
        void OnSaveMenuSelected(wxCommandEvent& event);
        void OnMenuNewSelected(wxCommandEvent& event);
        void OnMenuOpenSelected(wxCommandEvent& event);
        void OnMenuSaveSelected(wxCommandEvent& event);
        void OnMenuSaveAsSelected(wxCommandEvent& event);
        void OnMenuImagesEditorSelected(wxCommandEvent& event);
        void OnMenuObjetsEditorSelected(wxCommandEvent& event);
        void OnMenuEventsEditorSelected(wxCommandEvent& event);
        void OnMenuAideSelected(wxCommandEvent& event);
        void OnSceneTreeItemMenu(wxTreeEvent& event);
        void OnEditSceneBtClick(wxCommandEvent& event);
        void OnSceneTreeSelectionChanged(wxTreeEvent& event);
        void OnAddScene(wxCommandEvent& event);
        void OnDelScene(wxCommandEvent& event);
        void OnModNameScene(wxCommandEvent& event);
        void OnSceneTreeBeginLabelEdit(wxTreeEvent& event);
        void OnSceneTreeEndLabelEdit(wxTreeEvent& event);
        void OnShowTBSelected(wxCommandEvent& event);
        void OnShowTBEditorsSelected(wxCommandEvent& event);
        void OnShowTBSceneSelected(wxCommandEvent& event);
        void OnRefreshBtClick(wxCommandEvent& event);
        void OnStartBtClick(wxCommandEvent& event);
        void OnStopBtClick(wxCommandEvent& event);
        void OnPauseBtClick(wxCommandEvent& event);
        void OnEditionBtClick(wxCommandEvent& event);
        void OnApercuBtClick(wxCommandEvent& event);
        void OnClicGBoxSelect(wxCommandEvent& event);
        void OnClicDBoxSelect(wxCommandEvent& event);
        void OnButton1Click1(wxCommandEvent& event);
        void OnZoomBtClick(wxCommandEvent& event);
        void OnH2BtClick(wxCommandEvent& event);
        void OnH1BtClick(wxCommandEvent& event);
        void OnY0BtClick(wxCommandEvent& event);
        void OnB1BtClick(wxCommandEvent& event);
        void OnB2BtClick(wxCommandEvent& event);
        void OnG2BtClick(wxCommandEvent& event);
        void OnG1BtClick(wxCommandEvent& event);
        void OnX0BtClick(wxCommandEvent& event);
        void OnD1BtClick(wxCommandEvent& event);
        void OnD2BtClick(wxCommandEvent& event);
        void OnAddObjCheckClick(wxCommandEvent& event);
        void OnDeplacerGCheckClick(wxCommandEvent& event);
        void OnDelObjetCheckClick(wxCommandEvent& event);
        void OnDeplacerDCheckClick(wxCommandEvent& event);
        void OnMenuEditPropSceneSelected(wxCommandEvent& event);
        void OnMenuCopySceneSelected(wxCommandEvent& event);
        void OnMenuCutSceneSelected(wxCommandEvent& event);
        void OnMenuPasteSceneSelected(wxCommandEvent& event);
        void OnModParaBtClick(wxCommandEvent& event);
        void OnMenuPrefSelected(wxCommandEvent& event);
        void OnMenuSaveWSSelected(wxCommandEvent& event);
        void OnRefreshAnalyseBtClick(wxCommandEvent& event);
        void OnMenuCompilationSelected(wxCommandEvent& event);
        void OnMenuConvertirJRCSelected(wxCommandEvent& event);
        void OnMenuPortableSelected(wxCommandEvent& event);
        void OnWSDefautSelected(wxCommandEvent& event);
        void OnWSDetacheSelected(wxCommandEvent& event);
        void OnMenuItem27Selected(wxCommandEvent& event);
        void OnWSSimpleSelected1(wxCommandEvent& event);
        void OnWSChronoSelected(wxCommandEvent& event);
        void OnScrollBar1Scroll(wxScrollEvent& event);
        void OnScrollBar2ScrollChanged(wxScrollEvent& event);
        void OnMenuItem23Selected(wxCommandEvent& event);
        void OnGoOrigineBtClick(wxCommandEvent& event);
        void OnGridBtClick(wxCommandEvent& event);
        void OnMenuForumSelected(wxCommandEvent& event);
        void OnMenuSiteSelected(wxCommandEvent& event);
        void OnShowToolBarCGSelected(wxCommandEvent& event);
        void OnShowToolBarAideSelected(wxCommandEvent& event);
        void OnMenuFusionSelected(wxCommandEvent& event);
        void OnMenuItem36Selected(wxCommandEvent& event);
        void OnMenuTutoSelected(wxCommandEvent& event);
        void OnMenuModeSimpleSelected(wxCommandEvent& event);
        void OnDecomposeGIFSelected(wxCommandEvent& event);
        void OnDecomposeRPGSelected(wxCommandEvent& event);
        void OnMenuWikiSelected(wxCommandEvent& event);
        void OnParaPanelPaint(wxPaintEvent& event);
        void OnSceneTreeItemActivated(wxTreeEvent& event);
        void OnextensionsEditBtClick(wxCommandEvent& event);
        void OnDecomposeSSSelected(wxCommandEvent& event);
        void OnNotebook1PageChanged(wxAuiNotebookEvent& event);
        void OnmodVarSceneMenuISelected(wxCommandEvent& event);
        void OnglobalVarBtClick(wxCommandEvent& event);
        //*)
        void OnRibbonNewClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonOpenClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonOpenDropDownClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonSaveClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonSaveDropDownClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonImagesEditorClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonDecomposerDropDownClicked(wxRibbonButtonBarEvent& evt);
        void SaveAs();
        void RefreshListScene();
        void ReloadEditors();
        void CloseAllSceneEditors();
        void RefreshParaJeu();
        void OnRecentClicked(wxCommandEvent& event );
        void UpdateNotebook();
        void MakeImagesEditorRibbon();

        //(*Identifiers(Game_Develop_EditorFrame)
        static const long ID_PANEL3;
        static const long ID_STATICTEXT1;
        static const long ID_STATICTEXT16;
        static const long ID_STATICTEXT2;
        static const long ID_STATICTEXT17;
        static const long ID_STATICTEXT6;
        static const long ID_BUTTON3;
        static const long ID_BUTTON4;
        static const long ID_BUTTON1;
        static const long ID_TREECTRL1;
        static const long ID_STATICTEXT3;
        static const long ID_STATICTEXT4;
        static const long ID_STATICLINE1;
        static const long ID_BUTTON2;
        static const long ID_BUTTON10;
        static const long ID_PANEL2;
        static const long ID_AUINOTEBOOK1;
        static const long ID_PANEL1;
        static const long idMenuNew;
        static const long idMenuOpen;
        static const long idMenuFusion;
        static const long idMenuSave;
        static const long idMenuSaveAs;
        static const long idMenuPortable;
        static const long idMenuCompil;
        static const long idMenuQuit;
        static const long idMenuImgEditor;
        static const long idMenuShowToolBar;
        static const long idMenuShowToolbarEditors;
        static const long idMenuShowToolbarCG;
        static const long IdMenuShowToolbarAide;
        static const long idMenuEncoder;
        static const long idMenuGIF;
        static const long idMenuRPG;
        static const long idMenuSpriteSheet;
        static const long idMenuSimple;
        static const long idMenuPref;
        static const long idMenuWSDef;
        static const long idMenuWSDet;
        static const long idMenuWSSimple;
        static const long idMenuWSChrono;
        static const long ID_MENUITEM1;
        static const long idMenuTuto;
        static const long idMenuHelp;
        static const long idMenuForum;
        static const long idMenuWiki;
        static const long idMenuSite;
        static const long idMenuMAJ;
        static const long idMenuAbout;
        static const long idMenuEditScene;
        static const long idMenuEditPropScene;
        static const long idMenuModVar;
        static const long idMenuModNameScene;
        static const long idMenuAddScene;
        static const long idMenuDelScene;
        static const long idMenuCopyScene;
        static const long idMenuCutScene;
        static const long idMenuPasteScene;
        static const long ID_MENUITEM8;
        static const long ID_MENUITEM2;
        static const long ID_MENUITEM3;
        static const long ID_MENUITEM4;
        static const long ID_MENUITEM5;
        static const long ID_MENUITEM6;
        //*)
        static const long IDM_RECENTS;
        static const long idRibbonNew;
        static const long idRibbonOpen;
        static const long idRibbonSave;
        static const long idRibbonSaveAs;
        static const long idRibbonPortable;
        static const long idRibbonCompil;
        static const long idRibbonImagesEditor;
        static const long idRibbonSimpleMode;
        static const long idRibbonImporter;
        static const long idRibbonEncoder;
        static const long idRibbonOptions;
        static const long idRibbonHelp;
        static const long idRibbonTuto;
        static const long idRibbonWiki;
        static const long idRibbonForum;
        static const long idRibbonUpdate;
        static const long idRibbonWebSite;
        static const long idRibbonCredits;

        //(*Declarations(Game_Develop_EditorFrame)
        wxButton* extensionsEditBt;
        wxStaticText* StaticText9;
        wxMenuItem* MenuItem31;
        wxMenuItem* MenuItem26;
        wxMenuItem* MenuItem7;
        wxButton* globalVarBt;
        wxMenuItem* MenuItem25;
        wxMenuItem* MenuItem40;
        wxMenuItem* MenuItem5;
        wxStaticText* TailleJeuTxt;
        wxStaticText* StaticText2;
        wxMenuItem* MenuItem2;
        wxStaticText* AuteurTxt;
        wxStaticText* NomJeuTxt;
        wxMenu* Menu3;
        wxMenuItem* MenuItem4;
        wxMenuItem* MenuItem36;
        wxMenuItem* MenuItem29;
        wxButton* ModParaBt;
        wxMenuItem* MenuItem22;
        wxPanel* Panel1;
        wxStaticText* StaticText1;
        wxAuiNotebook* editorsNotebook;
        wxMenuItem* modVarSceneMenuI;
        wxMenu ContextMenu;
        wxMenu openContextMenu;
        wxMenuItem* MenuItem10;
        wxMenu decomposerContextMenu;
        wxPanel* ribbonPanel;
        wxMenuItem* MenuItem27;
        wxMenuItem* MenuItem39;
        wxMenuItem* MenuItem38;
        wxMenuItem* MenuItem20;
        wxMenuItem* MenuItem28;
        wxMenuItem* MenuItem6;
        wxMenuItem* MenuItem35;
        wxStaticLine* StaticLine1;
        wxTreeCtrl* SceneTree;
        wxButton* EditPropSceneBt;
        wxMenu* MenuItem24;
        wxPanel* Panel2;
        wxMenuItem* MenuItem21;
        wxMenuItem* MenuItem34;
        wxButton* EditSceneBt;
        wxMenuItem* MenuItem43;
        wxMenuItem* MenuItem9;
        wxMenuItem* MenuItem18;
        wxStaticText* StaticText;
        wxMenu saveContextMenu;
        wxMenuItem* MenuItem19;
        wxMenu* Menu4;
        //*)
        wxRibbonBar * m_ribbon;
        wxRibbonButtonBar * ribbonSceneEditorButtonBar;

        ProjectManager * projectManager;
        vector < EditorScene* > EditorsScene;

        void CloseScene(int nb);
        void UpdateEditorsSceneID();

        //Images pour la liste des scènes
        wxImageList * imageListScene;

        //Toolbars
        wxToolBar* ToolBarDefaut;
        wxToolBar* ToolBarEditors;
        wxToolBar* ToolBarCG;
        wxToolBar* ToolBarAide;
        bool UpdateToolBar();

        //RecentList
        RecentList m_recentlist;

        //Liste des scènes
        wxTreeItemId item;
        string ancienNom;

        //Relatif au jeu geré
        string m_fichierJeu;
        RuntimeGame runtimeGame;

        wxFileConfig* m_config;

        wxAuiManager m_mgr;

        DECLARE_EVENT_TABLE()
};

#endif // GAME_DEVELOP_EDITORMAIN_H
