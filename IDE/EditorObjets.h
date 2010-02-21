#ifndef EDITOROBJETS_H
#define EDITOROBJETS_H

//(*Headers(EditorObjets)
#include <wx/notebook.h>
#include <wx/panel.h>
#include "EditorObjectList.h"
//*)
#include <wx/aui/aui.h>
#include <wx/imaglist.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/MainEditorCommand.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include "EditorObjetsGroups.h"

class EditorObjets: public wxPanel
{
	public:

		EditorObjets(wxWindow* parent, Game & game_, Scene & scene_, vector < boost::shared_ptr<Object> > * objects_, MainEditorCommand & mainEditorCommand_);
		virtual ~EditorObjets();

		//(*Declarations(EditorObjets)
		wxNotebook* Notebook1;
		EditorObjetsGroups* ObjetsGroups;
		EditorObjectList* sceneObjectsEditor;
		EditorObjectList* globalObjectsEditor;
		//*)

	protected:

		//(*Identifiers(EditorObjets)
		static const long ID_CUSTOM3;
		static const long ID_CUSTOM1;
		static const long ID_CUSTOM2;
		static const long ID_NOTEBOOK1;
		//*)
		static const long ID_BITMAPBUTTON1;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON3;
		static const long ID_BITMAPBUTTON6;
		static const long ID_BITMAPBUTTON7;

	private:

		//(*Handlers(EditorObjets)
		void OnResize(wxSizeEvent& event);
		//*)

		wxImageList* imageList;
		wxImageList* objectsImagesList;
        wxToolBar * toolbar;

        /**
         * Reference to game containing the datas to edit
         */
		Game & game;

        /**
         * Reference to scene edited
         */
		Scene & scene;
		vector < boost::shared_ptr<Object> > * objects;

		MainEditorCommand & mainEditorCommand;

        //Item sélectionné
        wxTreeItemId item;
        string ancienNom;

		DECLARE_EVENT_TABLE()
};

#endif
