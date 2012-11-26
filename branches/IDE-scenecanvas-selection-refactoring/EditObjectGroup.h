#ifndef EDITOBJECTGROUP_H
#define EDITOBJECTGROUP_H

//(*Headers(EditObjectGroup)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/menu.h>
#include <wx/aui/aui.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/toolbar.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#ifdef __WXMSW__
#include <wx/msw/winundef.h>
#endif
#include <string>
#include <vector>

using namespace std;

class EditObjectGroup: public wxDialog
{
	public:

		EditObjectGroup(wxWindow* parent, Game & game_, Scene & scene_, const gd::ObjectGroup & group_);
		virtual ~EditObjectGroup();

		gd::ObjectGroup group;

		//(*Declarations(EditObjectGroup)
		wxAuiManager* AuiManager1;
		wxButton* OkBt;
		wxAuiToolBar* toolbar;
		wxMenuItem* MenuItem2;
		wxStaticBitmap* StaticBitmap1;
		wxMenuItem* MenuItem1;
		wxMenu ContextMenu;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine1;
		wxButton* AnnulerBt;
		wxHyperlinkCtrl* helpBt;
		wxPanel* Panel2;
		//*)

	protected:

		//(*Identifiers(EditObjectGroup)
		static const long ID_AUITOOLBAR1;
		static const long ID_PANEL2;
		static const long ID_TREECTRL1;
		static const long ID_STATICLINE1;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long idAddObjet;
		static const long idDelObjet;
		//*)

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
		void OnhelpBtClick(wxCommandEvent& event);
		//*)
        void Refresh();

        wxTreeItemId itemSelected;

		Game & game;
		Scene & scene;

		unsigned int modificationCount; ///< Track the number of modification. If the user made lots of modifications and wants to cancel, he will be warned.

		DECLARE_EVENT_TABLE()
};

#endif

