#if defined(GD_IDE_ONLY)

#ifndef RESOURCESEDITOR_H
#define RESOURCESEDITOR_H

//(*Headers(ResourcesEditor)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/splitter.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
//*)
#include <wx/srchctrl.h>
#include <wx/aui/aui.h>
#include <boost/weak_ptr.hpp>
#include "GDL/ResourcesManager.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "GDL/IDE/MainEditorCommand.h"
#include "GDL/IDE/ImageFilesWatcher.h"
namespace gd { class ResourceLibraryDialog; }

class GD_API ResourcesEditor: public wxPanel
{
	public:

		ResourcesEditor(wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_, bool useRibbon_ = false );
		virtual ~ResourcesEditor();

		Game & game;

		void Refresh();

        /**
         * Ask the resources editor to add the resources contained into \a filenames.
         */
		void AddResources(const std::vector<std::string> & filenames);

        /**
         * Ask the resources editor to add the resources contained into \a filenames.
         * If \a destinationDir is not empty, the resources files are copied into this directory
         * ( which is relative to the project directory ) before being added to the project.
         */
		void CopyAndAddResources(std::vector<std::string> filenames, const std::string & destinationDir);

		//Item sélectionné dans la liste
		wxTreeItemId m_itemSelected;
		boost::weak_ptr<Resource> resourceSelected;

		//(*Declarations(ResourcesEditor)
		wxAuiManager* AuiManager1;
		wxPanel* Core;
		wxMenuItem* MenuItem8;
		wxPanel* toolbarPanel;
		wxAuiToolBar* toolbar;
		wxMenuItem* MenuItem7;
		wxSearchCtrl* searchCtrl;
		wxMenu emptyMenu;
		wxMenuItem* MenuItem5;
		wxMenuItem* MenuItem2;
		wxTreeCtrl* resourcesTree;
		wxPanel* apercuPanel;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem14;
		wxMenuItem* MenuItem11;
		wxMenuItem* MenuItem13;
		wxMenu ContextMenu;
		wxMenuItem* MenuItem10;
		wxMenuItem* MenuItem12;
		wxMenuItem* MenuItem6;
		wxPanel* treePanel;
		wxSplitterWindow* SplitterWindow1;
		wxMenuItem* MenuItem9;
		wxMenu folderMenu;
		//*)

		//static void CreateRibbonPage(wxRibbonPage * page); //Creation is made inside MainFrame.

        /**
         * Can be called by parent so as to refresh ribbon for this editor.
         */
        void ForceRefreshRibbonAndConnect();

		static const long idRibbonModProp;
		static const long idRibbonMod;
		static const long idRibbonModFile;
		static const long idRibbonAdd;
		static const long idRibbonAddFromLibrary;
		static const long idRibbonDel;
		static const long idRibbonAddDossier;
		static const long idRibbonRemoveDossier;
		static const long idRibbonUp;
		static const long idRibbonDown;
		static const long idRibbonDirectories;
		static const long idRibbonPaintProgram;
		static const long idRibbonSearch;
		static const long idRibbonHelp;
		static const long idRibbonRefresh;
		static const long idRibbonDeleteUnused;

	protected:

		//(*Identifiers(ResourcesEditor)
		static const long ID_AUITOOLBAR1;
		static const long ID_PANEL2;
		static const long ID_TREECTRL1;
		static const long ID_TEXTCTRL1;
		static const long ID_PANEL4;
		static const long ID_PANEL3;
		static const long ID_SPLITTERWINDOW1;
		static const long ID_PANEL1;
		static const long idMenuModProp;
		static const long idMenuMod;
		static const long idMenuModFile;
		static const long idMenuAjouter;
		static const long idMenuDel;
		static const long ID_MENUITEM9;
		static const long idMoveUp;
		static const long idMoveDown;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM5;
		static const long ID_MENUITEM6;
		static const long ID_MENUITEM4;
		static const long ID_MENUITEM7;
		static const long ID_MENUITEM8;
		//*)
		static const long ID_BITMAPBUTTON1;
		static const long ID_BITMAPBUTTON5;
		static const long ID_BITMAPBUTTON4;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON3;
		static const long ID_BITMAPBUTTON6;
		static const long idMenuResourcesLibrary;


	private:

		//(*Handlers(ResourcesEditor)
		void OnHautImageBtClick(wxCommandEvent& event);
		void OnDelImageBtClick(wxCommandEvent& event);
		void OnModNameImageBtClick(wxCommandEvent& event);
		void OnAddImageBtClick(wxCommandEvent& event);
		void OnPaint(wxPaintEvent& event);
		void OnBanqueImageListItemMenu(wxTreeEvent& event);
		void OnRefreshBtClick(wxCommandEvent& event);
		void OnBanqueImageListItemActivated(wxTreeEvent& event);
		void OnBanqueImageListSelectionChanged(wxTreeEvent& event);
		void OnBanqueImageListDeleteItem(wxTreeEvent& event);
		void OnBanqueImageListEndLabelEdit(wxTreeEvent& event);
		void OnBanqueImageListBeginLabelEdit(wxTreeEvent& event);
		void OnBanqueImageListBeginDrag(wxTreeEvent& event);
		void OnModFileImage(wxCommandEvent& event);
		void OnChercherBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void DossierBt(wxCommandEvent& event);
		void OnMenuItem5Selected(wxCommandEvent& event);
		void OnMenuItem6Selected(wxCommandEvent& event);
		void OnModPropSelected(wxCommandEvent& event);
		void OnOpenPaintProgramClick(wxCommandEvent& event);
		void OnBanqueImageListItemActivated1(wxTreeEvent& event);
		void OntoolbarPanelResize(wxSizeEvent& event);
		void OnapercuPanelPaint(wxPaintEvent& event);
		void OnMoveUpSelected(wxCommandEvent& event);
		void OnMoveDownSelected(wxCommandEvent& event);
		void OnSetFocus(wxFocusEvent& event);
		void OnResize(wxSizeEvent& event);
		void OnAddFolderSelected(wxCommandEvent& event);
		void OnRemoveFolderSelected(wxCommandEvent& event);
		void OnremoveFolderOnlySelected(wxCommandEvent& event);
		void OnsearchCtrlText(wxCommandEvent& event);
		void OnresourcesTreeBeginLabelEdit(wxTreeEvent& event);
		void OnresourcesTreeEndLabelEdit(wxTreeEvent& event);
		void OnresourcesTreeItemActivated(wxTreeEvent& event);
		void OnresourcesTreeSelectionChanged(wxTreeEvent& event);
		void OnresourcesTreeItemMenu(wxTreeEvent& event);
		void OnapercuPanelResize(wxSizeEvent& event);
		void OnresourcesTreeBeginDrag(wxTreeEvent& event);
		//*)
        void OnMoreOptions( wxCommandEvent& event );
		void OnAddFromLibraryBtClick(wxCommandEvent& event);
        void OnDeleteUnusedFiles( wxCommandEvent& event );
        void CreateToolbar();
        void ConnectEvents();

        void RemoveImageFromTree(wxTreeItemId parent, std::string imageName);
        void RenameInTree(wxTreeItemId parent, std::string oldName, std::string newName, std::string type);
        wxTreeItemId GetSelectedFolderItem();
        void ShiftUpElementOfTree();
        void ShiftDownElementOfTree();

        wxTreeItemId allImagesItem;

        ImageFilesWatcher filesWatcher;

		MainEditorCommand mainEditorCommand;
		bool useRibbon;

		string renamedItemOldName;

        gd::ResourceLibraryDialog * resourceLibraryDialog;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
