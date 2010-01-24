/**
 * Game Develop
 *    Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 * Permet de choisir une condition
 *
 */

#ifndef CHOIXCONDITION_H
#define CHOIXCONDITION_H

#ifdef DEBUG
#define _MEMORY_TRACKER
#include "debugMem.h" //suivi mémoire
#endif

//(*Headers(ChoixCondition)
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
#include <wx/bmpbuttn.h>
#include "GDL/Scene.h"
#include "GDL/Event.h"
#include "GDL/Game.h"

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
        string Type;
        bool Loc;
        bool Contraire;
        Game & game;
        Scene & scene;
        vector < GDExpression > Param;

        unsigned static const int MaxPara = 8;

		//(*Declarations(ChoixCondition)
		wxTreeCtrl* ConditionsTree;
		wxButton* OkBt;
		wxStaticBitmap* ConditionImg;
		wxStaticText* NomConditionTxt;
		wxCheckBox* ContraireCheck;
		wxFlexGridSizer* GridSizer1;
		wxRadioButton* LocaliseCheck;
		wxStaticLine* StaticLine2;
		wxStaticText* ConditionTextTxt;
		wxButton* moreBt;
		wxButton* CancelBt;
		wxStaticLine* StaticLine1;
		wxCheckBox* objSortCheck;
		wxRadioButton* GlobalCheck;
		wxButton* AideBt;
		//*)
		vector < wxCheckBox * > ParaFac;
		vector < wxStaticText * > ParaText;
		vector < wxBitmapButton * > ParaBmpBt;
		vector < wxTextCtrl * > ParaEdit;


	protected:

		//(*Identifiers(ChoixCondition)
		static const long ID_TREECTRL1;
		static const long ID_STATICBITMAP1;
		static const long ID_STATICTEXT1;
		static const long ID_STATICTEXT2;
		static const long ID_STATICLINE1;
		static const long ID_RADIOBUTTON1;
		static const long ID_RADIOBUTTON2;
		static const long ID_CHECKBOX1;
		static const long ID_STATICLINE2;
		static const long ID_BUTTON4;
		static const long ID_CHECKBOX3;
		static const long ID_BUTTON1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
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
		//*)
        void OnABtClick(wxCommandEvent& event);
        void OnParamEdit(wxCommandEvent& event);
        void OnFacClicked(wxCommandEvent& event);

		wxImageList * imageList;

		DECLARE_EVENT_TABLE()
};

#endif
