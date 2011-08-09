#if defined(GD_IDE_ONLY)

#ifndef EDITORIMAGES_H
#define EDITORIMAGES_H

//(*Headers(EditorImages)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/splitter.h>
#include <wx/panel.h>
//*)
#include <wx/aui/aui.h>
#include "GDL/RuntimeGame.h"
#include "GDL/ImageManager.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/ImageFilesWatcher.h"

class GD_API EditorImages: public wxPanel
{
	public:

		EditorImages(wxWindow* parent, Game & game_, MainEditorCommand & mainEditorCommand_, bool useRibbon_ = false );
		virtual ~EditorImages();

		Game & game;

		void Refresh();

		//Item sélectionné dans la liste
		wxTreeItemId m_itemSelected;
		string fileImageSelected;

		//(*Declarations(EditorImages)
		wxPanel* Core;
		wxMenuItem* MenuItem8;
		wxPanel* toolbarPanel;
		wxMenuItem* MenuItem7;
		wxMenu emptyMenu;
		wxMenuItem* MenuItem5;
		wxMenuItem* MenuItem2;
		wxPanel* apercuPanel;
		wxMenuItem* MenuItem4;
		wxMenuItem* MenuItem14;
		wxMenuItem* MenuItem11;
		wxMenuItem* MenuItem13;
		wxMenu ContextMenu;
		wxMenuItem* MenuItem10;
		wxMenuItem* MenuItem12;
		wxMenuItem* MenuItem6;
		wxTreeCtrl* BanqueImageList;
		wxSplitterWindow* SplitterWindow1;
		wxMenuItem* MenuItem9;
		wxMenu folderMenu;
		//*)

		//static void CreateRibbonPage(wxRibbonPage * page); //Creation is made inside Game_Develop_EditorMain.

        /**
         * Can be called by parent so as to refresh ribbon for this editor.
         */
        void ForceRefreshRibbonAndConnect();

		static const long idRibbonModProp;
		static const long idRibbonMod;
		static const long idRibbonModFile;
		static const long idRibbonAdd;
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

	protected:

		//(*Identifiers(EditorImages)
		static const long ID_PANEL2;
		static const long ID_TREECTRL1;
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


	private:

		//(*Handlers(EditorImages)
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
		//*)
        void OnMoreOptions( wxCommandEvent& event );
        void CreateToolbar();
        void ConnectEvents();

        void RemoveImageFromTree(wxTreeItemId parent, std::string imageName);
        void RenameInTree(wxTreeItemId parent, std::string oldName, std::string newName, std::string type);
        wxTreeItemId GetSelectedFolderItem();
        void ShiftUpElementOfTree();
        void ShiftDownElementOfTree();

        wxTreeItemId allImagesItem;

#if defined(DESACTIVATED_FOR_WX290)
        ImageFilesWatcher filesWatcher;
#endif

		MainEditorCommand mainEditorCommand;
		bool useRibbon;

		string renamedItemOldName;

		wxToolBar * toolbar;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
