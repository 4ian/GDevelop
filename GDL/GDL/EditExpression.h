#if defined(GDE)

#ifndef EDITEXPRESSION_H
#define EDITEXPRESSION_H

//(*Headers(EditExpression)
#include <wx/treectrl.h>
#include <wx/sizer.h>
#include <wx/stattext.h>
#include <wx/bmpbuttn.h>
#include <wx/button.h>
#include <wx/dialog.h>
#include <wx/stc/stc.h>
//*)
#include <wx/imaglist.h>

#include "GDL/Game.h"
#include "GDL/Scene.h"
class ParameterInfo;

#include <string>
#include <vector>

using namespace std;

class GD_API EditExpression: public wxDialog
{
	public:

		EditExpression(wxWindow* parent, string pExpression, Game & game_, Scene & scene_, bool canSelectGroup, const vector < string > & mainObjectsName_);
		virtual ~EditExpression();

		//(*Declarations(EditExpression)
		wxButton* SinBt;
		wxButton* OkBt;
		wxButton* Button4;
		wxButton* DivBt;
		wxStaticText* StaticText2;
		wxButton* AddValBt;
		wxButton* Button1;
		wxTreeCtrl* ValList;
		wxBitmapButton* BitmapButton2;
		wxStaticText* StaticText1;
		wxStaticText* StaticText3;
		wxBitmapButton* BitmapButton1;
		wxTreeCtrl* ObjList;
		wxButton* Button2;
		wxButton* Button6;
		wxButton* CosBt;
		wxButton* POBt;
		wxButton* Button5;
		wxButton* Button3;
		wxButton* Button7;
		wxButton* Button9;
		wxButton* AddPropBt;
		wxButton* intBt;
		wxButton* PlusBt;
		wxStyledTextCtrl* ExpressionEdit;
		wxButton* MinusBt;
		wxButton* MultBt;
		wxStaticText* StaticText4;
		wxButton* PFBt;
		wxButton* Button8;
		wxStaticText* errorTxt;
		//*)

		string expression;
		void RefreshLists();

		//Item sélectionné dans la liste
		wxTreeItemId itemObj;
		wxTreeItemId itemVal;

	protected:

		//(*Identifiers(EditExpression)
		static const long ID_CUSTOM1;
		static const long ID_BUTTON1;
		static const long ID_STATICTEXT5;
		static const long ID_STATICTEXT1;
		static const long ID_BUTTON2;
		static const long ID_BUTTON3;
		static const long ID_BUTTON4;
		static const long ID_BUTTON5;
		static const long ID_STATICTEXT2;
		static const long ID_BUTTON6;
		static const long ID_BUTTON7;
		static const long ID_BUTTON13;
		static const long ID_BUTTON14;
		static const long ID_BITMAPBUTTON2;
		static const long ID_BITMAPBUTTON1;
		static const long ID_BUTTON15;
		static const long ID_BUTTON12;
		static const long ID_BUTTON8;
		static const long ID_BUTTON9;
		static const long ID_BUTTON16;
		static const long ID_BUTTON17;
		static const long ID_BUTTON18;
		static const long ID_BUTTON19;
		static const long ID_BUTTON20;
		static const long ID_BUTTON21;
		static const long ID_STATICTEXT3;
		static const long ID_TREECTRL1;
		static const long ID_BUTTON10;
		static const long ID_STATICTEXT4;
		static const long ID_TREECTRL2;
		static const long ID_BUTTON11;
		//*)

	private:

		//(*Handlers(EditExpression)
		void OnOkBtClick(wxCommandEvent& event);
		void OnPlusBtClick(wxCommandEvent& event);
		void OnMinusBtClick(wxCommandEvent& event);
		void OnMultBtClick(wxCommandEvent& event);
		void OnDivBtClick(wxCommandEvent& event);
		void OnPOBtClick(wxCommandEvent& event);
		void OnPFBtClick(wxCommandEvent& event);
		void OnCosBtClick(wxCommandEvent& event);
		void OnSinBtClick(wxCommandEvent& event);
		void OnAddPropBtClick(wxCommandEvent& event);
		void OnAddValBtClick(wxCommandEvent& event);
		void OnObjListItemActivated(wxTreeEvent& event);
		void OnValListItemActivated(wxTreeEvent& event);
		void OnButton2Click(wxCommandEvent& event);
		void OnButton3Click(wxCommandEvent& event);
		void OnBitmapButton2Click(wxCommandEvent& event);
		void OnBitmapButton1Click(wxCommandEvent& event);
		void OnButton4Click(wxCommandEvent& event);
		void OnButton1Click(wxCommandEvent& event);
		void OnButton5Click(wxCommandEvent& event);
		void OnButton6Click(wxCommandEvent& event);
		void OnButton7Click(wxCommandEvent& event);
		void OnButton8Click(wxCommandEvent& event);
		void OnButton9Click(wxCommandEvent& event);
		void OnintBtClick(wxCommandEvent& event);
		void OnObjListItemDoubleClicked(wxTreeEvent& event);
		void OnValListItemDoubleClicked(wxTreeEvent& event);
		void OnCustom1Paint(wxPaintEvent& event);
		//*)
		void TextModified(wxStyledTextEvent& event);
		void UpdateTextCtrl(wxStyledTextEvent& event);
		std::string ShowParameterDialog(const ParameterInfo & parameter);

		wxImageList * imageListObj;
		wxImageList * imageListVal;

        //Utile pour selectionner un objet
        //( quand on souhaite accéder aux propriétés d'un objet )
		Game & game;
		Scene & scene;
		bool canSelectGroup;
		const vector < string > & mainObjectsName;

		DECLARE_EVENT_TABLE()
};

#endif
#endif
