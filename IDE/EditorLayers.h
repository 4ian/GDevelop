/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EDITORLAYERS_H
#define EDITORLAYERS_H

//(*Headers(EditorLayers)
#include <wx/listctrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/panel.h>
#include <wx/imaglist.h>
//*)
#include <wx/toolbar.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/IDE/MainEditorCommand.h"
class SceneCanvas;

class EditorLayers: public wxPanel
{
	public:

		EditorLayers(wxWindow* parent, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_);
		virtual ~EditorLayers();

		//(*Declarations(EditorLayers)
		wxAuiManager* AuiManager1;
		wxAuiToolBar* toolbar;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxListCtrl* layersList;
		wxMenu contextMenu;
		wxPanel* toolBarPanel;
		wxImageList* imageList;
		//*)

        /**
         * Refresh the layers list.
         */
		void Refresh();

		/**
		 * The editor can be linked to a scene canvas to update it according to changes made in the editor.
		 */
		void SetAssociatedSceneCanvas(SceneCanvas * sceneCanvas_) { sceneCanvas = sceneCanvas_; Refresh(); };

		/**
		 * Return the associated scene canvas.
		 * \see EditorLayers::SetAssociatedSceneCanvas
		 */
		SceneCanvas * GetAssociatedSceneCanvas() { return sceneCanvas; };

	protected:

		//(*Identifiers(EditorLayers)
		static const long ID_AUITOOLBAR1;
		static const long ID_PANEL3;
		static const long ID_LISTCTRL1;
		static const long idMenuEdit;
		static const long idMenuAdd;
		static const long idMenuDel;
		static const long idMenuUp;
		static const long idMenuDown;
		//*)
		static const long ID_BITMAPBUTTON1;
		static const long ID_BITMAPBUTTON6;
		static const long ID_BITMAPBUTTON3;

	private:

		//(*Handlers(EditorLayers)
		void OntoolBarPanelResize(wxSizeEvent& event);
		void OnAddSelected(wxCommandEvent& event);
		void OnDelSelected(wxCommandEvent& event);
		void OnUpSelected(wxCommandEvent& event);
		void OnDownSelected(wxCommandEvent& event);
		void OnlayersListItemRClick(wxListEvent& event);
		void OnlayersListItemSelect(wxListEvent& event);
		void OnlayersListItemActivated(wxListEvent& event);
		void OnEditSelected1(wxCommandEvent& event);
		void OnlayersListItemSelect1(wxListEvent& event);
		void OnlayersListItemFocused(wxListEvent& event);
		//*)
		void UpdateSelectedLayerIcon();
        void OnRefresh(wxCommandEvent& event);
        void OnMoreOptions(wxCommandEvent& event);
        void EditSelectedLayer();
        Layer* GetSelectedLayer();
        void OnHelp(wxCommandEvent& event);

		Game & game;
		Scene & scene;

		SceneCanvas * sceneCanvas;

		MainEditorCommand & mainEditorCommand;

        string layerSelected;

		void CreateToolbar();

		DECLARE_EVENT_TABLE()
};

#endif
