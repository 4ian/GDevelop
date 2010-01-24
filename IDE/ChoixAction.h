/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * Permet de choisir une action
 *
 */

#ifndef CHOIXACTION_H
#define CHOIXACTION_H

//(*Headers(ChoixAction)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/checkbox.h>
#include <wx/statline.h>
#include <wx/radiobut.h>
#include <wx/statbmp.h>
#include <wx/button.h>
#include <wx/dialog.h>
//*)
#include <wx/checkbox.h>
#include <wx/imaglist.h>
#include <wx/bmpbuttn.h>
#include "GDL/Scene.h"
#include "GDL/Game.h"

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
        bool Loc;
        Game & game;
        Scene & scene;
        vector < GDExpression > Param;

        unsigned static const int MaxPara = 8;

		//(*Declarations(ChoixAction)
		wxButton* OkBt;
		wxStaticBitmap* ActionImg;
		wxStaticText* NomActionTxt;
		wxFlexGridSizer* GridSizer1;
		wxRadioButton* LocaliseCheck;
		wxStaticLine* StaticLine2;
		wxButton* moreBt;
		wxButton* CancelBt;
		wxStaticLine* StaticLine1;
		wxStaticText* ActionTextTxt;
		wxCheckBox* objSortCheck;
		wxRadioButton* GlobalCheck;
		wxButton* AideBt;
		wxTreeCtrl* ActionsTree;
		//*)

	protected:

		//(*Identifiers(ChoixAction)
		static const long ID_TREECTRL1;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON2;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON4;
		static const long ID_CHECKBOX2;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		//*)
		static const long ID_TEXTARRAY;
		static const long ID_EDITARRAY;
		static const long ID_BUTTONARRAY;
		static const long ID_CHECKARRAY;

	private:

		vector < wxCheckBox * > ParaFac;
		vector < wxStaticText * > ParaText;
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
		//*)
		void OnABtClick(wxCommandEvent& event);
        void OnParamEdit(wxCommandEvent& event);
        void OnFacClicked(wxCommandEvent& event);
        void OnButtonEraseBackground();

		wxImageList * imageList;

		DECLARE_EVENT_TABLE()
};

#endif
