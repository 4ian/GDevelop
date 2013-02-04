/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CHOIXACTION_H
#define CHOIXACTION_H

//(*Headers(ChoixAction)
#include <wx/treectrl.h>
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/textctrl.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/panel.h>
#include <wx/hyperlink.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/srchctrl.h>
#include <wx/checkbox.h>
#include <wx/imaglist.h>
#include <wx/bmpbuttn.h>
#include "GDCore/Events/Expression.h"
class Scene;
class Game;

#include <string>
#include <vector>

using namespace std;

class ChoixAction: public wxDialog
{
	public:

		ChoixAction(wxWindow* parent, Game & game_, Scene & scene_);
		virtual ~ChoixAction();
		void RefreshList();
		void RefreshFromAction();

        //Les données de l'action à modifier
        string Type;
        Game & game;
        Scene & scene;
        vector < gd::Expression > Param;

		//(*Declarations(ChoixAction)
		wxButton* OkBt;
		wxSearchCtrl* searchCtrl;
		wxStaticBitmap* ActionImg;
		wxNotebook* Notebook1;
		wxStaticText* NomActionTxt;
		wxTreeCtrl* globalObjectGroups;
		wxStaticBitmap* StaticBitmap1;
		wxFlexGridSizer* GridSizer1;
		wxPanel* Panel1;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine2;
		wxTreeCtrl* objectActionsTree;
		wxButton* moreBt;
		wxButton* CancelBt;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* globalObjectsList;
		wxNotebook* objectsListsNotebook;
		wxSearchCtrl* objectsSearchCtrl;
		wxStaticText* ActionTextTxt;
		wxTreeCtrl* GroupesList;
		wxCheckBox* objSortCheck;
		wxTreeCtrl* ActionsTree;
		//*)

	protected:

		//(*Identifiers(ChoixAction)
		static const long ID_TREECTRL1;
		static const long ID_TREECTRL2;
		static const long ID_TREECTRL3;
		static const long ID_TREECTRL4;
		static const long ID_TREECTRL5;
		static const long ID_NOTEBOOK2;
		static const long ID_TEXTCTRL2;
		static const long ID_TREECTRL6;
		static const long ID_PANEL1;
		static const long ID_NOTEBOOK1;
		static const long ID_TEXTCTRL1;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON4;
		static const long ID_CHECKBOX2;
		static const long ID_STATICBITMAP2;
		static const long ID_HYPERLINKCTRL1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)
		static const long ID_TEXTARRAY;
		static const long ID_EDITARRAY;
		static const long ID_BUTTONARRAY;
		static const long ID_CHECKARRAY;

	private:

		vector < wxCheckBox * > ParaFac;
		vector < wxPanel * > ParaSpacer1;
		vector < wxStaticText * > ParaText;
		vector < wxPanel * > ParaSpacer2;
		vector < wxBitmapButton * > ParaBmpBt;
		vector < wxTextCtrl * > ParaEdit;

		//(*Handlers(ChoixAction)
		void OnOkBtClick(wxCommandEvent& event);
		void OnCancelBtClick(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnActionsTreeSelectionChanged(wxTreeEvent& event);
		void OnextSortCheckClick(wxCommandEvent& event);
		void OnobjSortCheckClick(wxCommandEvent& event);
		void OnmoreBtClick(wxCommandEvent& event);
		void OnObjetsListSelectionChanged(wxTreeEvent& event);
		void OnobjectActionsTreeSelectionChanged(wxTreeEvent& event);
		void OnobjectsSearchCtrlText(wxCommandEvent& event);
		void OnsearchCtrlText(wxCommandEvent& event);
		//*)
		void RefreshAllLists();
		void RefreshObjectsLists();
		void RefreshObjectActionsList();
		void OnABtClick(wxCommandEvent& event);
        void OnFacClicked(wxCommandEvent& event);

		wxImageList * imageList;
		std::string selectedObject;

		DECLARE_EVENT_TABLE()
};

#endif

