#ifndef CHOIXOBJETEXPRESSION_H
#define CHOIXOBJETEXPRESSION_H

//(*Headers(ChoixObjetExpression)
#include <wx/treectrl.h>
#include <wx/notebook.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/panel.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/imaglist.h>
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include <string>
#include <vector>

using namespace std;

class ChoixObjetExpression: public wxDialog
{
	public:

		ChoixObjetExpression(wxWindow* parent, wxString title, Game & game_, Scene & scene_, bool pCanSelectGroup, const vector < string > & mainObjectsName);
		virtual ~ChoixObjetExpression();

		//(*Declarations(ChoixObjetExpression)
		wxRadioButton* Obj1Check;
		wxRadioButton* AutreCheck;
		wxNotebook* Notebook1;
		wxButton* ChoisirBt;
		wxPanel* Panel1;
		wxStaticText* StaticText1;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine2;
		wxRadioButton* Obj2Check;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* globalObjectsList;
		wxButton* AnnulerBt;
		wxTreeCtrl* GroupesList;
		wxStaticBitmap* StaticBitmap3;
		//*)

		string objet;

	protected:

		//(*Identifiers(ChoixObjetExpression)
		static const long ID_STATICBITMAP3;
		static const long ID_STATICTEXT1;
		static const long ID_PANEL1;
		static const long ID_STATICLINE2;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON2;
		static const long ID_RADIOBUTTON3;
		static const long ID_TREECTRL1;
		static const long ID_TREECTRL2;
		static const long ID_TREECTRL3;
		static const long ID_NOTEBOOK1;
		static const long ID_STATICLINE1;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		//*)

	private:

		//(*Handlers(ChoixObjetExpression)
		void OnChoisirBtClick(wxCommandEvent& event);
		void OnAnnulerBtClick(wxCommandEvent& event);
		void OnObjetsListSelectionChanged(wxTreeEvent& event);
		void OnGroupesListSelectionChanged(wxTreeEvent& event);
		void OnObjetsListItemActivated(wxTreeEvent& event);
		void OnGroupesListItemActivated(wxTreeEvent& event);
		void OnglobalObjectsListItemActivated(wxTreeEvent& event);
		void OnglobalObjectsListSelectionChanged(wxTreeEvent& event);
		//*)
		void Refresh();

        //Utile pour selectionner un objet
        //( quand on souhaite accéder aux propriétés d'un objet )
		Game & game;
		Scene & scene;
		bool canSelectGroup;
		const vector < string > & mainObjectsName;

		wxImageList * imageList;

		wxTreeItemId item;
		wxTreeItemId itemGroups;
		wxTreeItemId itemGlobal;

		DECLARE_EVENT_TABLE()
};

#endif
