/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GAME_DEVELOP_EDITORMAIN_H
#define GAME_DEVELOP_EDITORMAIN_H

//(*Headers(Game_Develop_EditorFrame)
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/frame.h>
#include <wx/timer.h>
//*)
#include "wx/aui/aui.h"
#include <wx/textctrl.h>
#include <wx/toolbar.h>
#include <wx/ribbon/bar.h>
#include <wx/ribbon/buttonbar.h>
#include <wx/ribbon/gallery.h>
#include <wx/ribbon/toolbar.h>

#include "GDL/EditorImages.h"
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
#include "GDL/CommonTools.h"
#include "RecentList.h"
class RuntimeGame;
class ProjectManager;
class StartHerePage;
class BuildToolsPnl;

using namespace std;

/**
 * Class representing the main editor
 */
class Game_Develop_EditorFrame: public wxFrame
{
    friend class EditorImages;
    public:

        /**
         * Constructor.
         * \param Parent window
         * \param True to create an initial empty project
         */
        Game_Develop_EditorFrame(wxWindow* parent, bool createEmptyProject);
        virtual ~Game_Develop_EditorFrame();

        vector < boost::shared_ptr<RuntimeGame> > games; ///< All games opened
        unsigned int gameCurrentlyEdited; ///< Index of the current game ( "Current" means choosen in the project manager )

        /**
         * Get a shared pointer to the current game ( "Current" means choosen in the project manager )
         */
        inline boost::shared_ptr<RuntimeGame> GetCurrentGame()
        {
            if ( gameCurrentlyEdited >= games.size()) return boost::shared_ptr<RuntimeGame> ();

            return games[gameCurrentlyEdited];
        }

        /**
         * True if a game is currently edited
         */
        inline bool CurrentGameIsValid()
        {
            if ( gameCurrentlyEdited >= games.size()) return false;

            return true;
        }

        /**
         * Change the current game
         */
        void SetCurrentGame(unsigned int i);

        /**
         * Open a game from its filename
         */
        void Open(string FichierJeu);

        static void LoadSkin(wxRibbonBar * bar);
        static void LoadSkin(wxAuiManager * auiManager);

        /**
         * Get a pointer to notebook containing editors
         */
        inline const wxAuiNotebook * GetEditorsNotebook() const { return editorsNotebook; };
        inline wxAuiNotebook * GetEditorsNotebook() { return editorsNotebook; };

        /**
         * Get a pointer to the ribbon
         */
        inline const wxRibbonBar * GetRibbon() const { return m_ribbon; };
        inline wxRibbonBar * GetRibbon() { return m_ribbon; };

        /**
         * Get a pointer to ribbon bar which can be changed by scene editors
         */
        inline wxRibbonButtonBar * GetRibbonSceneEditorButtonBar() const { return ribbonSceneEditorButtonBar; };

        /**
         * Get a pointer to the build tools panel
         */
        inline BuildToolsPnl * GetBuildToolsPanel() const { return buildToolsPnl; }

        /**
         * Get a pointer to the wxAUI pane manager
         */
        inline const wxAuiManager * GetAUIPaneManger() const { return &m_mgr; }
        /**
         * Get a pointer to the wxAUI pane manager
         */
        inline wxAuiManager * GetAUIPaneManger() { return &m_mgr; }

        /**
         * Get a pointer to scene locking shortcuts list.
         */
        inline std::vector<SceneCanvas*> * GetScenesLockingShortcutsList() { return &scenesLockingShortcuts; };

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
        void OnMenuPrefSelected(wxCommandEvent& event);
        void OnMenuSaveWSSelected(wxCommandEvent& event);
        void OnRefreshAnalyseBtClick(wxCommandEvent& event);
        void OnMenuCompilationSelected(wxCommandEvent& event);
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
        void OneditorsNotebookPageClose(wxAuiNotebookEvent& event);
        void OnOpenExampleSelected(wxCommandEvent& event);
        void OnautoSaveTimerTrigger(wxTimerEvent& event);
        void OnKeyDown(wxKeyEvent& event);
        //*)
        void OnRibbonNewClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonOpenClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonOpenDropDownClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonSaveClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonSaveAllClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonSaveDropDownClicked(wxRibbonButtonBarEvent& evt);
        void OnProjectsManagerClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonDecomposerDropDownClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonStartPageClicked(wxRibbonButtonBarEvent& evt);
        void OnRibbonCppToolsClicked(wxRibbonButtonBarEvent& evt);
        void SaveAs();
        void OnRecentClicked(wxCommandEvent& event );
        void UpdateNotebook();
        void MakeImagesEditorRibbon();
        void PrepareAutosave();

    private:

        //(*Identifiers(Game_Develop_EditorFrame)
        static const long ID_PANEL3;
        static const long ID_AUINOTEBOOK1;
        static const long ID_PANEL1;
        static const long ID_MENUITEM1;
        static const long ID_MENUITEM8;
        static const long ID_MENUITEM2;
        static const long ID_MENUITEM3;
        static const long ID_MENUITEM4;
        static const long ID_MENUITEM5;
        static const long ID_MENUITEM6;
        static const long ID_TIMER1;
        //*)
        static const long IDM_RECENTS;
        static const long idRibbonNew;
        static const long idRibbonOpen;
        static const long idRibbonSave;
        static const long idRibbonSaveAll;
        static const long idRibbonSaveAs;
        static const long idRibbonPortable;
        static const long idRibbonCompil;
        static const long idRibbonProjectsManager;
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
        static const long idRibbonStartPage;
        static const long idRibbonCppTools;

        //(*Declarations(Game_Develop_EditorFrame)
        wxTimer autoSaveTimer;
        wxPanel* Panel1;
        wxAuiNotebook* editorsNotebook;
        wxMenu openContextMenu;
        wxMenuItem* MenuItem10;
        wxMenu decomposerContextMenu;
        wxPanel* ribbonPanel;
        wxMenuItem* MenuItem43;
        wxMenu saveContextMenu;
        //*)
        wxAuiManager m_mgr;
        wxRibbonBar * m_ribbon; ///< Pointer to the ribbon
        wxRibbonButtonBar * ribbonSceneEditorButtonBar; ///Pointer to the ribbon bar which can be changed by scene editors
        BuildToolsPnl * buildToolsPnl;
        std::vector<SceneCanvas*> scenesLockingShortcuts;

        StartHerePage * startPage;
        ProjectManager * projectManager;

        RecentList m_recentlist; ///<Inventory and manage recent files

        DECLARE_EVENT_TABLE()
};

#endif // GAME_DEVELOP_EDITORMAIN_H
