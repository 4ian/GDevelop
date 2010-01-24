#ifndef EDITOBJECTGROUP_H
#define EDITOBJECTGROUP_H

//(*Headers(EditObjectGroup)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/menu.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/toolbar.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/ObjectGroup.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <string>
#include <vector>

using namespace std;

class EditObjectGroup: public wxDialog
{
	public:

		EditObjectGroup(wxWindow* parent, Game & game_, Scene & scene_, const ObjectGroup & group_);
		virtual ~EditObjectGroup();

		ObjectGroup group;

		//(*Declarations(EditObjectGroup)
		wxButton* OkBt;
		wxMenuItem* MenuItem2;
		wxMenuItem* MenuItem1;
		wxPanel* Panel1;
		wxStaticText* StaticText3;
		wxMenu ContextMenu;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine2;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxPanel* Panel2;
		wxStaticBitmap* StaticBitmap3;
		//*)

	protected:

		//(*Identifiers(EditObjectGroup)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT3;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_PANEL2;
		static const long ID_TREECTRL1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long idAddObjet;
		static const long idDelObjet;
		//*)
		static const long ID_Help;

	private:

		//(*Handlers(EditObjectGroup)
		void OnOkBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnPanel2Resize(wxSizeEvent& event);
		void OnObjetsListBeginLabelEdit(wxTreeEvent& event);
		void OnObjetsListEndLabelEdit(wxTreeEvent& event);
		void OnObjetsListItemActivated(wxTreeEvent& event);
		void OnObjetsListItemRightClick(wxTreeEvent& event);
		void OnAddObjetSelected(wxCommandEvent& event);
		void OnDelObjetSelected(wxCommandEvent& event);
		//*)
		void OnHelp(wxCommandEvent& event);
        void Refresh();

        wxToolBar * toolbar;
        wxTreeItemId itemSelected;

		Game & game;
		Scene & scene;

		DECLARE_EVENT_TABLE()
};

#endif
