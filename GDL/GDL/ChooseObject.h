#if defined(GDE)

#ifndef CHOIXOBJET_H
#define CHOIXOBJET_H

//(*Headers(ChooseObject)
#include <wx/treectrl.h>
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/textctrl.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/imaglist.h>
#include <wx/srchctrl.h>

#include "GDL/Scene.h"
#include "GDL/Game.h"
#include <string>
#include <vector>

using namespace std;

class GD_API ChooseObject: public wxDialog
{
	public:

		ChooseObject(wxWindow* parent, Game & game_, Scene & scene_, bool CanSelectGroup = true, string onlyObjectOfType_ = "", const wxSize& size=wxDefaultSize);
		virtual ~ChooseObject();

		//(*Declarations(ChooseObject)
		wxMenu Menu2;
		wxMenu Menu1;
		wxSearchCtrl* searchCtrl;
		wxNotebook* Notebook1;
		wxTreeCtrl* globalObjectGroups;
		wxMenuItem* MenuItem1;
		wxMenuItem* MenuItem4;
		wxButton* AucunBt;
		wxButton* ChoisirBt;
		wxMenuItem* editGroupMenuItem;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* globalObjectsList;
		wxButton* AnnulerBt;
		wxMenuItem* editMenuItem;
		wxTreeCtrl* GroupesList;
		wxStaticBitmap* StaticBitmap3;
		//*)

        Game & game;
        Scene & scene;

		string objectChosen;

		void Refresh();

		wxTreeItemId item;
		wxTreeItemId itemGroups;
		wxTreeItemId itemGlobal;
		wxTreeItemId itemGlobalGroups;

	protected:

		//(*Identifiers(ChooseObject)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_TREECTRL1;
		static const long ID_TREECTRL2;
		static const long ID_TREECTRL3;
		static const long ID_TREECTRL4;
		static const long ID_NOTEBOOK1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_MENUITEM2;
		static const long ID_MENUITEM1;
		static const long ID_MENUITEM3;
		static const long ID_MENUITEM4;
		//*)

	private:

		//(*Handlers(ChooseObject)
		void OnObjetsListSelectionChanged(wxTreeEvent& event);
		void OnChoisirBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnAucunBtClick(wxCommandEvent& event);
		void OnObjetsListItemRightClick(wxTreeEvent& event);
		void OnGroupesListSelectionChanged(wxTreeEvent& event);
		void OnObjetsListItemActivated(wxTreeEvent& event);
		void OnGroupesListItemRightClick(wxTreeEvent& event);
		void OnGroupesListItemActivated(wxTreeEvent& event);
		void OnglobalObjectsListSelectionChanged(wxTreeEvent& event);
		void OnglobalObjectsListItemRightClick(wxTreeEvent& event);
		void OnglobalObjectsListItemActivated(wxTreeEvent& event);
		void OnglobalObjectGroupsItemActivated(wxTreeEvent& event);
		void OnglobalObjectGroupsSelectionChanged(wxTreeEvent& event);
		void OnglobalObjectGroupsItemRightClick(wxTreeEvent& event);
		void OnsearchCtrlText(wxCommandEvent& event);
		void OnsearchCtrlTextEnter(wxCommandEvent& event);
		//*)

		wxImageList * imageList;
		string onlyObjectOfType;

		DECLARE_EVENT_TABLE()
};

#endif

#endif
