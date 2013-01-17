/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef CHOIXCONDITION_H
#define CHOIXCONDITION_H

//(*Headers(ChoixCondition)
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
#include <wx/bmpbuttn.h>
#include "GDCore/Events/Expression.h"
class Scene;
class Game;

#include <string>
#include <vector>

using namespace std;

class ChoixCondition: public wxDialog
{
	public:

		ChoixCondition(wxWindow* parent, Game & game_, Scene & scene_);
		virtual ~ChoixCondition();
        void RefreshList();
        void RefreshFromCondition();

        //Les données de la condition à modifier
        Game & game;
        Scene & scene;
        string Type;
        bool conditionInverted;
        vector < gd::Expression > Param;

        unsigned static const int MaxPara = 8;

		//(*Declarations(ChoixCondition)
		wxTreeCtrl* ConditionsTree;
		wxButton* OkBt;
		wxStaticBitmap* ConditionImg;
		wxSearchCtrl* searchCtrl;
		wxNotebook* Notebook1;
		wxStaticText* NomConditionTxt;
		wxCheckBox* ContraireCheck;
		wxTreeCtrl* globalObjectGroups;
		wxStaticBitmap* StaticBitmap1;
		wxFlexGridSizer* GridSizer1;
		wxPanel* Panel1;
		wxTreeCtrl* objectConditionsTree;
		wxHyperlinkCtrl* HyperlinkCtrl1;
		wxTreeCtrl* ObjetsList;
		wxStaticLine* StaticLine2;
		wxStaticText* ConditionTextTxt;
		wxButton* moreBt;
		wxButton* CancelBt;
		wxStaticLine* StaticLine1;
		wxTreeCtrl* globalObjectsList;
		wxNotebook* objectsListsNotebook;
		wxSearchCtrl* objectsSearchCtrl;
		wxTreeCtrl* GroupesList;
		wxCheckBox* objSortCheck;
		wxBoxSizer* conditionSizer;
		//*)
		vector < wxCheckBox * > ParaFac;
		vector < wxStaticText * > ParaText;
		vector < wxPanel * > ParaSpacer1;
		vector < wxPanel * > ParaSpacer2;
		vector < wxBitmapButton * > ParaBmpBt;
		vector < wxTextCtrl * > ParaEdit;


	protected:

		//(*Identifiers(ChoixCondition)
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
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON4;
		static const long ID_CHECKBOX3;
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

		//(*Handlers(ChoixCondition)
		void OnConditionsTreeSelectionChanged(wxTreeEvent& event);
		void OnOkBtClick(wxCommandEvent& event);
		void OnCancelBtClick(wxCommandEvent& event);
		void OnLocaliseCheckSelect(wxCommandEvent& event);
		void OnAideBtClick(wxCommandEvent& event);
		void OnextSortCheckClick(wxCommandEvent& event);
		void OnobjSortCheckClick(wxCommandEvent& event);
		void OnmoreBtClick(wxCommandEvent& event);
		void OnGlobalCheckSelect(wxCommandEvent& event);
		void OnsearchCtrlText(wxCommandEvent& event);
		void OnobjectsSearchCtrlText(wxCommandEvent& event);
		void OnObjetsListSelectionChanged(wxTreeEvent& event);
		void OnobjectConditionsTreeSelectionChanged(wxTreeEvent& event);
		void OnResize(wxSizeEvent& event);
		//*)
		void RefreshAllLists();
		void RefreshObjectsLists();
		void RefreshObjectConditionsList();
        void OnABtClick(wxCommandEvent& event);
        void OnFacClicked(wxCommandEvent& event);

		wxImageList * imageList;
		std::string selectedObject;

		DECLARE_EVENT_TABLE()
};

#endif

